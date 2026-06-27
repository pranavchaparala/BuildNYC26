'use server';

import Anthropic from '@anthropic-ai/sdk';
import { createSupabaseClient } from '@/lib/supabase';
import { sendAuditEmail } from '@/lib/email';
import type { ObservationType, DesignLanguage } from '@/lib/types';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

async function buildImageBlocks(screens: { image_url: string; order_index: number }[]) {
  const sorted = [...screens].sort((a, b) => a.order_index - b.order_index);
  const total = sorted.length;

  const blocks = await Promise.all(
    sorted.map(async (screen, i) => {
      const res = await fetch(screen.image_url);
      const buf = await res.arrayBuffer();
      const b64 = Buffer.from(buf).toString('base64');
      const rawMime = res.headers.get('content-type') ?? 'image/png';
      const mime = (['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(rawMime)
        ? rawMime
        : 'image/png') as ImageMediaType;

      return [
        {
          type: 'image' as const,
          source: { type: 'base64' as const, media_type: mime, data: b64 },
        },
        { type: 'text' as const, text: `Screen ${i + 1} of ${total}` },
      ];
    })
  );

  return blocks.flat();
}

/**
 * Run a tool-use turn and return the validated input of the first tool call.
 * Forcing tool_choice guarantees Claude returns structured data — no fragile
 * JSON-in-prose parsing, no markdown-fence breakage on truncation.
 */
async function callStructured<T>(params: {
  system?: string;
  content: Anthropic.ContentBlockParam[];
  toolName: string;
  toolDescription: string;
  schema: Anthropic.Tool.InputSchema;
  maxTokens: number;
}): Promise<T> {
  const res = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: params.maxTokens,
    ...(params.system ? { system: params.system } : {}),
    tools: [
      {
        name: params.toolName,
        description: params.toolDescription,
        input_schema: params.schema,
      },
    ],
    tool_choice: { type: 'tool', name: params.toolName },
    messages: [{ role: 'user', content: params.content }],
  });

  const toolUse = res.content.find(b => b.type === 'tool_use') as
    | Anthropic.ToolUseBlock
    | undefined;

  if (!toolUse) {
    throw new Error(`Claude did not return structured output (stop: ${res.stop_reason})`);
  }

  return toolUse.input as T;
}

async function extractDesignLanguage(
  imageBlocks: Anthropic.ContentBlockParam[]
): Promise<DesignLanguage> {
  return callStructured<DesignLanguage>({
    toolName: 'record_design_language',
    toolDescription:
      'Record the visual design language observed across the screens. If the same component appears with different values across screens (e.g. two button radii), include ALL observed values — those disagreements are the most important signal.',
    maxTokens: 2048,
    schema: {
      type: 'object',
      properties: {
        colors: {
          type: 'object',
          properties: {
            backgrounds: { type: 'array', items: { type: 'string' } },
            text: { type: 'array', items: { type: 'string' } },
            interactive: { type: 'array', items: { type: 'string' } },
            semantic: { type: 'object', additionalProperties: { type: 'string' } },
          },
          required: ['backgrounds', 'text', 'interactive', 'semantic'],
        },
        typography: {
          type: 'object',
          properties: {
            families: { type: 'array', items: { type: 'string' } },
            sizes: { type: 'array', items: { type: 'string' } },
            weights: { type: 'array', items: { type: 'string' } },
          },
          required: ['families', 'sizes', 'weights'],
        },
        spacing: { type: 'array', items: { type: 'string' } },
        borderRadius: { type: 'array', items: { type: 'string' } },
        components: {
          type: 'object',
          additionalProperties: { type: 'object', additionalProperties: { type: 'string' } },
        },
        iconStyle: { type: 'string' },
        elevation: { type: 'string' },
      },
      required: [
        'colors',
        'typography',
        'spacing',
        'borderRadius',
        'components',
        'iconStyle',
        'elevation',
      ],
    },
    content: [
      ...imageBlocks,
      { type: 'text', text: 'Extract the design language from these screens.' },
    ],
  });
}

export async function runAudit(flowId: string): Promise<{ auditId: string; score: number }> {
  const db = createSupabaseClient();

  const { data: lastAudit } = await db
    .from('audits')
    .select('version, score')
    .eq('flow_id', flowId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = (lastAudit?.version ?? 0) + 1;
  const previousScore: number | null = lastAudit?.score ?? null;

  const { data: audit, error: auditError } = await db
    .from('audits')
    .insert({ flow_id: flowId, version: nextVersion, status: 'processing' })
    .select()
    .single();

  if (auditError) throw new Error(`Audit creation failed: ${auditError.message}`);

  try {
    const { data: screens } = await db
      .from('screens')
      .select('*')
      .eq('flow_id', flowId)
      .order('order_index');

    if (!screens || screens.length === 0) throw new Error('No screens found for this flow');

    const { data: flow } = await db.from('flows').select('context, name').eq('id', flowId).single();
    const imageBlocks = (await buildImageBlocks(screens)) as Anthropic.ContentBlockParam[];
    const contextText = flow?.context
      ? `Flow context: ${flow.context}`
      : 'No additional context provided.';

    // --- Pass 1: Design language (best-effort; persistence is optional) ---
    let designLanguageSummary = 'Not available.';
    try {
      const designLanguage = await extractDesignLanguage(imageBlocks);
      designLanguageSummary = JSON.stringify(designLanguage, null, 2);
      // Persist only if the column exists — never fatal.
      await db.from('audits').update({ design_language: designLanguage }).eq('id', audit.id);
    } catch {
      // design_language column may not exist yet, or extraction failed — continue.
    }

    // --- Pass 2: Critique + consistency (structured tool output) ---
    const critique = await callStructured<{
      summary: string;
      observations: { type: string; screen_index: number; body: string; action: string }[];
    }>({
      system: `You are a senior product designer with 20 years of experience shipping products people love deeply. You have a strong point of view and high standards. You are not looking for broken things — you are looking for where care ran out.

The design language extracted from this flow is:
${designLanguageSummary}

Review this product flow. Look for:
- Moments that are functional but forgettable
- Transitions between screens that assume too much or explain too little
- Copy that is correct but unconsidered
- Rhythm and breathing room — does the pacing feel right across the flow?
- Where the user is trusted and where they are not
- What is strong and should be protected
- Cross-screen consistency: any screen that deviates from the established design language above (mismatched radii, off-system colors, inconsistent spacing, typography that breaks the scale, components styled differently than their pattern).

For EVERY observation, write two things:
1. body — the observation itself, 3-5 sentences. Describe exactly what you see, why it matters, and the impact on the person using this. Reference specific elements, copy, colors, or values on the screen. Be concrete, not abstract.
2. action — a specific, do-it-now next step the designer can act on this week. Not a vague principle. Name the exact change: the copy to write, the value to set, the element to add or remove. For STRONG observations, the action is how to protect or extend that strength to the rest of the flow. Make it specific enough that the designer knows they are done when they have done it.

Be specific. Be direct. Have a point of view. Never say 'consider' or 'perhaps'. Say what you mean. Write like you are talking to a peer, not writing a report. For INCONSISTENT observations, name the screen, the element, the observed value, and what the established value is — and make the action the exact value to change it to.`,
      toolName: 'record_critique',
      toolDescription:
        'Record an overall summary (3-4 sentences) and 5-8 specific observations, each tied to a screen index, each with a detailed body and a concrete action step.',
      maxTokens: 6000,
      schema: {
        type: 'object',
        properties: {
          summary: {
            type: 'string',
            description: '3-4 sentence overall summary of the flow’s craft and intention.',
          },
          observations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['WASTED_MOMENT', 'UNCONSIDERED', 'STRONG', 'INCONSISTENT'],
                  description:
                    'WASTED_MOMENT = functional but earns nothing; UNCONSIDERED = no evidence of thought; STRONG = working well, protect it; INCONSISTENT = a specific deviation from the design language.',
                },
                screen_index: {
                  type: 'integer',
                  description: '0-based index of the screen this observation refers to.',
                },
                body: {
                  type: 'string',
                  description:
                    'The observation, 3-5 sentences. What you see, why it matters, and the impact on the user. Reference specific elements. Written directly to a peer.',
                },
                action: {
                  type: 'string',
                  description:
                    'A specific, actionable next step the designer can do now. Name the exact change — the copy, the value, the element. For STRONG, how to protect or extend the strength.',
                },
              },
              required: ['type', 'screen_index', 'body', 'action'],
            },
          },
        },
        required: ['summary', 'observations'],
      },
      content: [...imageBlocks, { type: 'text', text: contextText }],
    });

    // --- Pass 3: Score (structured tool output) ---
    const scoreResult = await callStructured<{ score: number; rationale: string }>({
      toolName: 'record_score',
      toolDescription:
        'Score the flow 0-100 on how intentional and considered the design feels (including cross-screen consistency). 100 = every moment is intentional, consistent, earns its place. 0 = functional but no evidence of care. This is not a bug count.',
      maxTokens: 512,
      schema: {
        type: 'object',
        properties: {
          score: { type: 'integer', minimum: 0, maximum: 100 },
          rationale: { type: 'string' },
        },
        required: ['score', 'rationale'],
      },
      content: [
        ...imageBlocks,
        {
          type: 'text',
          text: 'Based on your critique, score this flow now.',
        },
      ],
    });

    const obsInserts = critique.observations.map(obs => ({
      audit_id: audit.id,
      screen_id: screens[obs.screen_index]?.id ?? null,
      type: obs.type.toLowerCase() as ObservationType,
      body: obs.body,
      action: obs.action ?? null,
      screen_index: obs.screen_index,
    }));

    if (obsInserts.length > 0) {
      const { error: obsError } = await db.from('observations').insert(obsInserts);
      // The `action` column may not exist yet (migration 002 not run) — retry without it.
      if (obsError) {
        const fallback = obsInserts.map(({ action, ...rest }) => rest);
        const { error: retryError } = await db.from('observations').insert(fallback);
        if (retryError) throw new Error(`Observation insert failed: ${retryError.message}`);
      }
    }

    const finalScore = Math.max(0, Math.min(100, Math.round(scoreResult.score)));

    const { error: updateError } = await db
      .from('audits')
      .update({ status: 'complete', score: finalScore, summary: critique.summary })
      .eq('id', audit.id);
    if (updateError) throw new Error(`Audit update failed: ${updateError.message}`);

    if (process.env.RESEND_API_KEY && flow?.name) {
      await sendAuditEmail(
        'designer@loupe.design',
        flow.name,
        flowId,
        audit.id,
        finalScore,
        nextVersion,
        previousScore
      ).catch(() => {});
    }

    return { auditId: audit.id, score: finalScore };
  } catch (err) {
    await db
      .from('audits')
      .update({
        status: 'error',
        error_message: err instanceof Error ? err.message : String(err),
      })
      .eq('id', audit.id);
    throw err;
  }
}

export async function generateRoast(auditId: string): Promise<string> {
  const db = createSupabaseClient();

  const { data: audit } = await db
    .from('audits')
    .select('*, flows(context)')
    .eq('id', auditId)
    .single();

  if (!audit) throw new Error('Audit not found');
  if (audit.score === null || audit.score >= 40) throw new Error('Not eligible for roast');
  if (audit.roast) return audit.roast;

  const { data: screens } = await db
    .from('screens')
    .select('*')
    .eq('flow_id', audit.flow_id)
    .order('order_index');

  if (!screens || screens.length === 0) throw new Error('No screens found');

  const imageBlocks = (await buildImageBlocks(screens)) as Anthropic.ContentBlockParam[];

  const roastRes = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: [
          ...imageBlocks,
          {
            type: 'text',
            text: 'The same flow scored below 40. Now write a brutal, funny, specific roast of this flow. 3-4 sentences. Be ruthless but accurate — no cheap shots, only earned ones. This will be shared. Make it quotable.',
          },
        ],
      },
    ],
  });

  const roast = roastRes.content
    .filter(b => b.type === 'text')
    .map(b => (b as { type: 'text'; text: string }).text)
    .join('');

  await db.from('audits').update({ roast }).eq('id', auditId);
  return roast;
}

export async function pollAuditStatus(auditId: string) {
  const db = createSupabaseClient();
  const { data } = await db
    .from('audits')
    .select('id, status, score, summary, version, error_message, observations(*)')
    .eq('id', auditId)
    .single();
  return data;
}
