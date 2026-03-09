// ML-like prediction engine for project cost and timeline estimation

interface ProjectInput {
  project_type: string;
  team_size: number;
  complexity: string;
  experience_level: string;
  tech_stack: string;
  estimated_requirements: number;
  location: string;
}

interface RiskDetail {
  factor: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  impact: number; // 0-100
  suggestion: string;
}

interface PredictionResult {
  estimated_cost: number;
  estimated_duration_months: number;
  delay_risk_score: number;
  risk_factors: string[];
  risk_details: RiskDetail[];
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  timeline_phases: { phase: string; weeks: number }[];
  monte_carlo: { best_case: number; worst_case: number; average: number };
  team_productivity: number;
}

const TYPE_WEIGHTS: Record<string, { costMultiplier: number; durationMultiplier: number }> = {
  'Software': { costMultiplier: 1.0, durationMultiplier: 1.0 },
  'Construction': { costMultiplier: 2.5, durationMultiplier: 1.8 },
  'AI': { costMultiplier: 1.8, durationMultiplier: 1.4 },
  'Website': { costMultiplier: 0.6, durationMultiplier: 0.7 },
  'Mobile App': { costMultiplier: 1.2, durationMultiplier: 1.1 },
};

const COMPLEXITY_WEIGHTS: Record<string, { cost: number; duration: number; risk: number }> = {
  'Low': { cost: 0.7, duration: 0.8, risk: 0.6 },
  'Medium': { cost: 1.0, duration: 1.0, risk: 1.0 },
  'High': { cost: 1.6, duration: 1.4, risk: 1.5 },
};

const EXPERIENCE_WEIGHTS: Record<string, { efficiency: number; risk: number }> = {
  'Junior': { efficiency: 0.6, risk: 1.4 },
  'Mid': { efficiency: 0.85, risk: 1.0 },
  'Senior': { efficiency: 1.2, risk: 0.6 },
};

export function predictProject(input: ProjectInput): PredictionResult {
  const typeWeight = TYPE_WEIGHTS[input.project_type] || TYPE_WEIGHTS['Software'];
  const complexityWeight = COMPLEXITY_WEIGHTS[input.complexity] || COMPLEXITY_WEIGHTS['Medium'];
  const experienceWeight = EXPERIENCE_WEIGHTS[input.experience_level] || EXPERIENCE_WEIGHTS['Mid'];

  // Base cost per requirement (₹)
  const baseCostPerReq = 15000;
  const baseDurationPerReq = 0.12; // months

  // Cost prediction with non-linear team size effect (Brooks' law)
  const teamEfficiency = input.team_size <= 5 ? 1.0 : 1.0 - (input.team_size - 5) * 0.03;
  const effectiveTeamSize = input.team_size * teamEfficiency;

  const rawCost = input.estimated_requirements * baseCostPerReq * typeWeight.costMultiplier * complexityWeight.cost / experienceWeight.efficiency;
  const estimated_cost = Math.round(rawCost + (input.team_size * 50000 * complexityWeight.cost));

  const rawDuration = (input.estimated_requirements * baseDurationPerReq * typeWeight.durationMultiplier * complexityWeight.duration) / (effectiveTeamSize * 0.2 * experienceWeight.efficiency);
  const estimated_duration_months = Math.round(Math.max(rawDuration, 1) * 10) / 10;

  // Risk analysis
  const risk_factors: string[] = [];
  let riskScore = 0;

  const risk_details: RiskDetail[] = [];

  if (input.complexity === 'High') {
    risk_factors.push('High complexity project');
    risk_details.push({ factor: 'High complexity project', severity: 'High', impact: 25, suggestion: 'Break the project into smaller, well-defined modules. Use iterative development with frequent milestones to manage complexity incrementally.' });
    riskScore += 25;
  }
  if (input.team_size > 10) {
    risk_factors.push('Large team coordination overhead');
    risk_details.push({ factor: 'Large team coordination overhead', severity: 'Medium', impact: 15, suggestion: 'Organize the team into small cross-functional squads (3-5 people). Appoint tech leads per squad and use daily standups to reduce communication overhead.' });
    riskScore += 15;
  }
  if (input.experience_level === 'Junior') {
    risk_factors.push('Junior team experience level');
    risk_details.push({ factor: 'Junior team experience level', severity: 'High', impact: 20, suggestion: 'Pair junior developers with senior mentors. Invest in upfront training on the tech stack and enforce mandatory code reviews.' });
    riskScore += 20;
  }
  if (input.estimated_requirements > 50) {
    risk_factors.push('Large feature scope');
    risk_details.push({ factor: 'Large feature scope', severity: 'Medium', impact: 15, suggestion: 'Prioritize features using MoSCoW method. Release an MVP first and defer nice-to-have features to later iterations.' });
    riskScore += 15;
  }
  if (input.team_size < 3 && input.estimated_requirements > 20) {
    risk_factors.push('Understaffed for scope');
    risk_details.push({ factor: 'Understaffed for scope', severity: 'High', impact: 20, suggestion: 'Either reduce scope significantly or add 2-3 more team members. Consider outsourcing non-core modules to balance workload.' });
    riskScore += 20;
  }
  if (input.project_type === 'AI') {
    risk_factors.push('AI projects have high uncertainty');
    risk_details.push({ factor: 'AI projects have high uncertainty', severity: 'Medium', impact: 10, suggestion: 'Allocate dedicated time for data exploration and model experimentation. Use pre-trained models where possible and set clear success metrics early.' });
    riskScore += 10;
  }
  if (input.complexity === 'Medium' && input.estimated_requirements > 30) {
    risk_details.push({ factor: 'Moderate scope with medium complexity', severity: 'Low', impact: 8, suggestion: 'Ensure thorough requirements gathering upfront. Use automated testing to catch regressions early as the codebase grows.' });
  }
  if (input.experience_level === 'Mid' && input.complexity === 'High') {
    risk_details.push({ factor: 'Mid-level team on high complexity work', severity: 'Medium', impact: 12, suggestion: 'Bring in at least one senior architect for design reviews. Provide targeted training on complex areas of the project.' });
  }

  riskScore = Math.min(riskScore * complexityWeight.risk * experienceWeight.risk, 95);
  const delay_risk_score = Math.round(riskScore);
  const risk_level = delay_risk_score < 25 ? 'Low' : delay_risk_score < 50 ? 'Medium' : delay_risk_score < 75 ? 'High' : 'Critical';

  // Timeline phases
  const totalWeeks = estimated_duration_months * 4.33;
  const timeline_phases = [
    { phase: 'Planning & Requirements', weeks: Math.round(totalWeeks * 0.12 * 10) / 10 },
    { phase: 'System Design', weeks: Math.round(totalWeeks * 0.15 * 10) / 10 },
    { phase: 'Development', weeks: Math.round(totalWeeks * 0.45 * 10) / 10 },
    { phase: 'Testing & QA', weeks: Math.round(totalWeeks * 0.18 * 10) / 10 },
    { phase: 'Deployment & Launch', weeks: Math.round(totalWeeks * 0.10 * 10) / 10 },
  ];

  // Monte Carlo simulation (simplified)
  const variance = 0.15 + (delay_risk_score / 100) * 0.3;
  const monte_carlo = {
    best_case: Math.round(estimated_cost * (1 - variance * 0.8)),
    worst_case: Math.round(estimated_cost * (1 + variance * 1.5)),
    average: estimated_cost,
  };

  const team_productivity = Math.round((experienceWeight.efficiency * teamEfficiency) * 100);

  return {
    estimated_cost,
    estimated_duration_months,
    delay_risk_score,
    risk_factors,
    risk_details,
    risk_level,
    timeline_phases,
    monte_carlo,
    team_productivity,
  };
}
