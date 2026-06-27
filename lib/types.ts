export type ObservationType = 'wasted_moment' | 'unconsidered' | 'strong' | 'inconsistent';

export interface DesignLanguage {
  colors: {
    backgrounds: string[];
    text: string[];
    interactive: string[];
    semantic: Record<string, string>;
  };
  typography: {
    families: string[];
    sizes: string[];
    weights: string[];
  };
  spacing: string[];
  borderRadius: string[];
  components: Record<string, Record<string, string>>;
  iconStyle: string;
  elevation: string;
}
export type AuditStatus = 'pending' | 'processing' | 'complete' | 'error';
export type UserRole = 'designer' | 'viewer';

export interface DbUser {
  id: string;
  team_id: string | null;
  auth0_id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Screen {
  id: string;
  flow_id: string;
  order_index: number;
  image_url: string;
  storage_path: string;
  created_at: string;
}

export interface Observation {
  id: string;
  audit_id: string;
  screen_id: string | null;
  type: ObservationType;
  body: string;
  action: string | null;
  screen_index: number | null;
}

export interface Audit {
  id: string;
  flow_id: string;
  version: number;
  score: number | null;
  summary: string | null;
  roast: string | null;
  design_language: DesignLanguage | null;
  status: AuditStatus;
  error_message: string | null;
  email_sent_at: string | null;
  created_at: string;
  observations?: Observation[];
}

export interface Flow {
  id: string;
  team_id: string | null;
  user_id: string;
  name: string;
  context: string | null;
  created_at: string;
  screens?: Screen[];
  audits?: Audit[];
}

export interface Share {
  id: string;
  audit_id: string;
  slug: string;
  created_at: string;
}

export interface FlowWithStats extends Flow {
  latestScore: number | null;
  previousScore: number | null;
  scoreDelta: number | null;
  screenCount: number;
  auditCount: number;
}

export const OBSERVATION_ORDER: ObservationType[] = ['strong', 'inconsistent', 'unconsidered', 'wasted_moment'];

export const OBSERVATION_LABELS: Record<ObservationType, string> = {
  strong: 'Strong',
  inconsistent: 'Inconsistent',
  unconsidered: 'Unconsidered',
  wasted_moment: 'Wasted Moment',
};
