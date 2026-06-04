export const answerValues = [1, 2, 3, 4] as const;

export type AnswerValue = (typeof answerValues)[number];

export type ToolAnswers = Partial<Record<string, AnswerValue>>;

export type ToolOption = {
  value: AnswerValue;
  label: string;
  description: string;
};

export type ToolQuestion = {
  id: string;
  dimension: string;
  prompt: string;
  helpText: string;
  options: readonly ToolOption[];
  actions: Record<AnswerValue, string>;
};

export type ToolTier = {
  minScore: number;
  label: string;
  summary: string;
};

export type BlogSync = {
  title: string;
  href: `/blog/${string}`;
};

export type ServiceCta = {
  label: string;
  href: "/services";
};

export type PractitionerToolDefinition = {
  slug: string;
  title: string;
  category: string;
  kicker: string;
  description: string;
  artifactLabel: string;
  blogSync: BlogSync;
  serviceCta: ServiceCta;
  tiers: readonly ToolTier[];
  strongResultActions: readonly string[];
  questions: readonly ToolQuestion[];
};

export type ToolQuestionResult = {
  id: string;
  dimension: string;
  score: number;
  answerValue: AnswerValue | null;
  answerLabel: string | null;
  action: string;
};

export type PractitionerToolResult = {
  score: number;
  tier: ToolTier;
  questionResults: ToolQuestionResult[];
  gaps: ToolQuestionResult[];
  strengths: ToolQuestionResult[];
  priorityActions: string[];
};
