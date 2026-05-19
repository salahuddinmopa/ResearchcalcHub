export interface MaturityFactor {
  name: string;
  score: number;
  weight: number;
}

export interface MaturityDomain {
  name: string;
  weight: number;
  factors: MaturityFactor[];
}

export interface MaturityDomainResult extends MaturityDomain {
  score: number;
  level: number;
  levelName: string;
}

export const maturityLevelNames = ['Non-existent', 'Initial', 'Developing', 'Managed', 'Optimised'];

export function maturityLevel(score: number) {
  const level = Math.max(0, Math.min(4, Math.round(score)));
  return { level, levelName: maturityLevelNames[level] };
}

function weightedAverage(items: Array<{ value: number; weight: number }>, normalise: boolean) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight <= 0) throw new Error('Weights must total more than 0.');
  if (!normalise && Math.abs(totalWeight - 100) > 0.001) throw new Error('Weights must total 100%, or enable automatic normalisation.');
  const divisor = normalise ? totalWeight : 100;
  // Weighted maturity score: sum(score x normalized weight), on the same 0-4 scale as the inputs.
  return items.reduce((sum, item) => sum + item.value * (item.weight / divisor), 0);
}

export function validateScore(score: number, max = 4) {
  return Number.isFinite(score) && score >= 0 && score <= max;
}

export function calculateMaturityModel(domains: MaturityDomain[], normaliseWeights = true) {
  if (domains.length === 0) throw new Error('Add at least one domain.');
  const domainResults: MaturityDomainResult[] = domains.map(domain => {
    if (!domain.name.trim()) throw new Error('Every domain needs a name.');
    if (domain.factors.length === 0) throw new Error(`Domain "${domain.name}" needs at least one factor.`);
    const factorInputs = domain.factors.map(factor => {
      if (!factor.name.trim()) throw new Error(`Every factor in "${domain.name}" needs a name.`);
      if (!validateScore(factor.score)) throw new Error(`Factor scores must be between 0 and 4.`);
      if (!Number.isFinite(factor.weight) || factor.weight <= 0) throw new Error('Factor weights must be positive.');
      return { value: factor.score, weight: factor.weight };
    });
    // Domain maturity is the weighted average of factor scores inside that domain.
    const score = weightedAverage(factorInputs, normaliseWeights);
    return { ...domain, score, ...maturityLevel(score) };
  });

  const overallScore = weightedAverage(
    domainResults.map(domain => {
      if (!Number.isFinite(domain.weight) || domain.weight <= 0) throw new Error('Domain weights must be positive.');
      return { value: domain.score, weight: domain.weight };
    }),
    normaliseWeights
  );
  const overall = maturityLevel(overallScore);
  const weakestDomains = [...domainResults].sort((a, b) => a.score - b.score).slice(0, 3);
  const strongestDomains = [...domainResults].sort((a, b) => b.score - a.score).slice(0, 3);
  const steps = [
    'Factor scores are weighted within each domain.',
    ...domainResults.map(domain => `${domain.name}: ${domain.score.toFixed(3)} -> Level ${domain.level} (${domain.levelName})`),
    `Overall maturity score = weighted average of domain scores = ${overallScore.toFixed(3)}`,
  ];
  const academicText = `A maturity model assessment was conducted across ${domains.length} domain(s). The overall maturity score was ${overallScore.toFixed(2)} out of 4.00, corresponding to Level ${overall.level} (${overall.levelName}). The lowest scoring domain was ${weakestDomains[0]?.name || 'N/A'}.`;
  return { domains: domainResults, overallScore, ...overall, weakestDomains, strongestDomains, steps, academicText };
}

export interface CapabilityArea {
  name: string;
  score: number;
  weight: number;
}

export function calculateCapabilityScore(areas: CapabilityArea[], normaliseWeights = true) {
  if (areas.length === 0) throw new Error('Add at least one capability area.');
  areas.forEach(area => {
    if (!area.name.trim()) throw new Error('Every capability area needs a name.');
    if (!validateScore(area.score)) throw new Error('Capability scores must be between 0 and 4.');
    if (!Number.isFinite(area.weight) || area.weight <= 0) throw new Error('Capability weights must be positive.');
  });
  const overallScore = weightedAverage(areas.map(area => ({ value: area.score, weight: area.weight })), normaliseWeights);
  const category = maturityLevel(overallScore);
  const strengths = [...areas].sort((a, b) => b.score - a.score).slice(0, 3);
  const weakAreas = [...areas].sort((a, b) => a.score - b.score).slice(0, 3);
  const steps = areas.map(area => `${area.name}: score ${area.score}, weight ${area.weight}`);
  const academicText = `Capability scoring produced an overall capability score of ${overallScore.toFixed(2)} out of 4.00, corresponding to ${category.levelName}. Key strengths included ${strengths.map(area => area.name).join(', ')}. Improvement areas included ${weakAreas.map(area => area.name).join(', ')}.`;
  return { overallScore, category: category.levelName, level: category.level, strengths, weakAreas, steps, academicText };
}

export interface GovernanceDomain {
  name: string;
  policy: number;
  leadership: number;
  resources: number;
  monitoring: number;
  accountability: number;
}

export function readinessLevel(percentage: number) {
  if (percentage >= 80) return 'Advanced readiness';
  if (percentage >= 60) return 'Moderate readiness';
  if (percentage >= 40) return 'Developing readiness';
  return 'Low readiness';
}

export function calculateGovernanceReadiness(domains: GovernanceDomain[]) {
  if (domains.length === 0) throw new Error('Add at least one governance domain.');
  const domainResults = domains.map(domain => {
    if (!domain.name.trim()) throw new Error('Every governance domain needs a name.');
    const scores = [domain.policy, domain.leadership, domain.resources, domain.monitoring, domain.accountability];
    if (scores.some(score => !validateScore(score))) throw new Error('Governance readiness scores must be between 0 and 4.');
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return { ...domain, average, percentage: (average / 4) * 100 };
  });
  const percentage = domainResults.reduce((sum, domain) => sum + domain.percentage, 0) / domainResults.length;
  const level = readinessLevel(percentage);
  const steps = domainResults.map(domain => `${domain.name}: average ${domain.average.toFixed(2)} (${domain.percentage.toFixed(1)}%)`);
  const academicText = `Governance readiness was assessed across ${domains.length} domain(s), producing an overall readiness score of ${percentage.toFixed(1)}%. This corresponds to ${level}.`;
  return { domains: domainResults, percentage, level, steps, academicText };
}

export interface SimpleMaturityDomain {
  name: string;
  score: number;
}

export function calculateMiniMaturity(domains: SimpleMaturityDomain[], label: string) {
  if (domains.length === 0) throw new Error('Add at least one domain.');
  domains.forEach(domain => {
    if (!domain.name.trim()) throw new Error('Every domain needs a name.');
    if (!validateScore(domain.score)) throw new Error('Scores must be between 0 and 4.');
  });
  const overallScore = domains.reduce((sum, domain) => sum + domain.score, 0) / domains.length;
  const level = maturityLevel(overallScore);
  const improvementAreas = [...domains].sort((a, b) => a.score - b.score).filter(domain => domain.score < 3).slice(0, 4);
  const percentage = (overallScore / 4) * 100;
  const steps = domains.map(domain => `${domain.name}: ${domain.score}/4`);
  const academicText = `${label} readiness/maturity was assessed across ${domains.length} domain(s). The overall score was ${overallScore.toFixed(2)} out of 4.00 (${percentage.toFixed(1)}%), corresponding to Level ${level.level} (${level.levelName}).`;
  return { domains, overallScore, percentage, ...level, improvementAreas, steps, academicText };
}
