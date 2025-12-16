export type PrimaryCategory =
  | "Background and experience"
  | "Technical or role-specific skills"
  | "Soft skills and ways of working"
  | "Culture and values alignment"
  | "Motivation and career goals"
  | "Practical details and deal breakers";

export type SecondTierCompetency =
  | "Problem solving and decision making"
  | "Learning ability and adaptability"
  | "Strategic thinking and business impact"
  | "Data literacy and analytical thinking"
  | "Product thinking (value vs effort, impact)"
  | "Quality, process and attention to detail"
  | "Attention to security and privacy"
  | "Process improvement and optimisation"
  | "Cross-cultural communication"
  | "Negotiation and influence"
  | "Conflict resolution"
  | "Change management"
  | "Planning, organisation and execution"
  | "Collaboration in cross-functional squads"
  | "Stakeholder and client management"
  | "Remote or distributed work readiness"
  | "Documentation and knowledge sharing"
  | "Initiative and proactiveness"
  | "Resilience and stress management"
  | "Ethics, compliance and professionalism"
  | "Ownership and accountability"
  | "Risk awareness and mitigation"
  | "Environmental and social responsibility mindset"
  | "Customer focus and service mindset"
  | "Commercial awareness and business acumen"
  | "Innovation and creative thinking"
  | "Leadership and people management"
  | "Coaching and mentoring"
  | "Ownership of end-to-end outcomes";

export interface Question {
  id: string;
  text: string;
  primaryCategory: PrimaryCategory;
  secondTierCompetencies: SecondTierCompetency[];
  options: string[];
  whatItMeasures: string;
  maxAnswerTime: number; // in seconds
  scoringGuide: {
    [key: number]: string; // 1-5 scoring guide
  };
}


