import { Resend } from 'resend';

// Email is optional — only sends if RESEND_API_KEY is configured
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendAuditEmail(
  to: string,
  flowName: string,
  flowId: string,
  auditId: string,
  score: number,
  version: number,
  previousScore: number | null
): Promise<void> {
  const baseUrl = process.env.AUTH0_BASE_URL ?? 'http://localhost:3000';
  const link = `${baseUrl}/flows/${flowId}?v=${version}`;

  let scoreLine = `Score: ${score}/100`;
  if (previousScore !== null) {
    const delta = score - previousScore;
    const sign = delta >= 0 ? '+' : '';
    scoreLine += ` (${sign}${delta} from last version)`;
  }

  if (!resend) return; // Email not configured

  await resend.emails.send({
    from: process.env.RESEND_FROM ?? 'Loupe <noreply@loupe.design>',
    to,
    subject: `Critique ready: "${flowName}" — ${score}/100`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; color: #0D0D0D;">
        <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">
          Your critique is ready
        </h2>
        <p style="color: #505050; margin-bottom: 24px;">
          <strong>${flowName}</strong> — Version ${version}
        </p>
        <div style="background: #F5F5F5; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <span style="font-size: 32px; font-weight: 700;">${score}</span>
          <span style="color: #505050;">/100</span>
          ${previousScore !== null ? `
          <p style="margin: 8px 0 0; font-size: 14px; color: #505050;">
            ${score >= previousScore ? '↑' : '↓'} ${Math.abs(score - previousScore)} from version ${version - 1}
          </p>` : ''}
        </div>
        <a href="${link}" style="
          display: inline-block;
          background: #6B5CE7;
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
        ">Read the full critique →</a>
      </div>
    `,
  });
}
