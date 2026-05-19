import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const close = (actual, expected, tolerance = 1e-6, label = 'value') => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: expected ${expected}, got ${actual}`);
};

// Research methodology
{
  const z = 1.96, p = 0.5, e = 0.05, population = 1000;
  const n0 = (z ** 2 * p * (1 - p)) / e ** 2;
  close(Math.ceil(n0), 385, 0, 'sample size infinite population');
  close(Math.ceil(n0 / (1 + (n0 - 1) / population)), 278, 0, 'sample size finite correction');
}

// Reliability and validity
{
  const matrix = [[20, 5], [10, 15]];
  const total = 50;
  const po = (20 + 15) / total;
  const pe = ((25 * 30) + (25 * 20)) / total ** 2;
  close((po - pe) / (1 - pe), 0.4, 1e-9, "Cohen's kappa");
}

{
  const data = [
    [1, 2, 3],
    [2, 3, 4],
    [1, 2, 2],
    [3, 4, 5],
  ];
  const itemCount = 3;
  const respondents = 4;
  const rowMeans = data.map(row => row.reduce((a, b) => a + b, 0) / row.length);
  const totalScores = data.map(row => row.reduce((a, b) => a + b, 0));
  const variance = values => {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1);
  };
  const itemVariances = Array.from({ length: itemCount }, (_, col) => variance(data.map(row => row[col])));
  const alpha = (itemCount / (itemCount - 1)) * (1 - itemVariances.reduce((a, b) => a + b, 0) / variance(totalScores));
  assert.equal(respondents, 4);
  assert.equal(rowMeans.length, 4);
  close(alpha, 0.9750000000000001, 1e-9, "Cronbach's alpha");
}

// Statistics
{
  const values = [2, 4, 4, 4, 5, 5, 7, 9];
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sumSquares = values.reduce((sum, value) => sum + (value - mean) ** 2, 0);
  close(mean, 5, 0, 'mean');
  close(sumSquares / values.length, 4, 0, 'population variance');
  close(Math.sqrt(sumSquares / values.length), 2, 0, 'population standard deviation');
}

{
  const sampleMean = 50, sd = 10, n = 100, z = 1.96;
  const margin = z * sd / Math.sqrt(n);
  close(margin, 1.96, 1e-9, 'confidence interval margin');
  close(sampleMean - margin, 48.04, 1e-9, 'confidence interval lower');
  close(sampleMean + margin, 51.96, 1e-9, 'confidence interval upper');
}

// Decision and governance
{
  const matrix = [
    [1, 3, 5],
    [1 / 3, 1, 2],
    [1 / 5, 1 / 2, 1],
  ];
  const colSums = [0, 1, 2].map(col => matrix.reduce((sum, row) => sum + row[col], 0));
  const normalised = matrix.map(row => row.map((value, col) => value / colSums[col]));
  const weights = normalised.map(row => row.reduce((sum, value) => sum + value, 0) / 3);
  close(weights.reduce((sum, value) => sum + value, 0), 1, 1e-9, 'AHP weights sum');
  assert.ok(weights[0] > weights[1] && weights[1] > weights[2], 'AHP ranking should follow comparison strengths');
}

{
  const ratings = [4, 4, 5, 4, 5];
  const sorted = [...ratings].sort((a, b) => a - b);
  const percentile = p => {
    const pos = (sorted.length - 1) * p;
    const low = Math.floor(pos);
    const high = Math.ceil(pos);
    return sorted[low] + (pos - low) * (sorted[high] - sorted[low]);
  };
  close(percentile(0.75) - percentile(0.25), 1, 0, 'Delphi IQR');
}

{
  const riskScore = 4 * 5;
  assert.equal(riskScore, 20);
  assert.equal(riskScore >= 17 ? 'Critical' : 'Other', 'Critical');
}

{
  const maturity = ((3 * 50 + 2 * 50) / 100 + (4 * 100) / 100) / 2;
  close(maturity, 3.25, 1e-9, 'maturity score');
}

// Practical STEM and real-life calculators
{
  close(1000 * 5 * 3 / 100, 150, 0, 'simple interest');
  close(1000 * (1 + 0.06 / 12) ** 60, 1348.8501525493075, 1e-9, 'compound interest');
  close((45 / 180) * 100, 25, 0, 'percentage');
  close(100 / 20, 5, 0, 'speed');
  close(10 * 9.8, 98, 0, 'force');
  close(18 / 18.015, 0.9991673605328893, 1e-12, 'moles');
  close(-Math.log10(0.000001), 6, 0, 'pH');
}

console.log('Accuracy checks passed for representative calculator formulas.');

const tempDir = await mkdtemp(join(tmpdir(), 'rch-accuracy-'));
const entry = join(tempDir, 'entry.ts');
const outfile = join(tempDir, 'bundle.mjs');

await writeFile(entry, `
  import {
    calculateSampleSize,
    calculateCohensKappa,
    calculateFleissKappa,
    calculateCronbachAlpha
  } from ${JSON.stringify(join(process.cwd(), 'src/utils/calculations.ts'))};
  import {
    calculateSpread,
    calculateMeanConfidenceInterval,
    calculatePearsonCorrelation
  } from ${JSON.stringify(join(process.cwd(), 'src/utils/statistics.ts'))};
  import {
    calculateAHPWeights,
    calculateDelphiConsensus
  } from ${JSON.stringify(join(process.cwd(), 'src/utils/decisionTools.ts'))};
  import { calculateMaturityModel } from ${JSON.stringify(join(process.cwd(), 'src/utils/maturityScoring.ts'))};
  import { calculators, categories, searchCalculators } from ${JSON.stringify(join(process.cwd(), 'src/data/calculators.ts'))};
  import { stemCalculators } from ${JSON.stringify(join(process.cwd(), 'src/utils/stemCalculators.ts'))};
  import { practicalCalculators } from ${JSON.stringify(join(process.cwd(), 'src/utils/practicalCalculators.ts'))};
  import { cybersecurityCalculators } from ${JSON.stringify(join(process.cwd(), 'src/utils/cybersecurity.ts'))};

  export function runFormulaExamples() {
    return {
      sampleSize: calculateSampleSize(95, 5, 50, 1000),
      cohensKappa: calculateCohensKappa([[20, 5], [10, 15]]),
      fleissKappa: calculateFleissKappa([[3, 0], [3, 0], [0, 3], [0, 3]], 3),
      cronbachAlpha: calculateCronbachAlpha([[1, 2, 3], [2, 3, 4], [1, 2, 2], [3, 4, 5]]),
      populationSpread: calculateSpread([2, 4, 4, 4, 5, 5, 7, 9], 'population'),
      sampleSpread: calculateSpread([2, 4, 4, 4, 5, 5, 7, 9], 'sample'),
      confidenceInterval: calculateMeanConfidenceInterval(50, 10, 100, 95),
      correlation: calculatePearsonCorrelation([1, 2, 3, 4, 5], [2, 4, 5, 4, 5]),
      ahp: calculateAHPWeights(['Quality', 'Cost', 'Speed'], [[1, 3, 5], [1 / 3, 1, 2], [1 / 5, 1 / 2, 1]]),
      delphi: calculateDelphiConsensus([{ label: 'Adopt framework', ratings: [4, 4, 5, 4, 5] }], 5, 1),
      maturity: calculateMaturityModel([
        { name: 'Governance', weight: 50, factors: [{ name: 'Policy', score: 3, weight: 50 }, { name: 'Training', score: 2, weight: 50 }] },
        { name: 'Operations', weight: 50, factors: [{ name: 'Monitoring', score: 4, weight: 100 }] }
      ])
    };
  }

  export function runConfigExamples() {
    const all = [...stemCalculators, ...practicalCalculators, ...cybersecurityCalculators];
    const failures = [];
    for (const calculator of all) {
      try {
        const result = calculator.calculate(calculator.example);
        if (!result.summary?.length || !result.interpretation || !result.steps || !result.academicText) {
          failures.push(calculator.id + ': incomplete result payload');
        }
      } catch (error) {
        failures.push(calculator.id + ': ' + (error instanceof Error ? error.message : String(error)));
      }
    }
    return { total: all.length, failures };
  }

  export function runMetadataChecks() {
    const ids = new Set(calculators.map(calculator => calculator.id));
    const categoryIds = new Set(categories.map(category => category.id));
    const failures = [];

    for (const category of categories) {
      for (const calculatorId of category.calculatorIds) {
        if (!ids.has(calculatorId)) failures.push('Category ' + category.id + ' references missing calculator ' + calculatorId);
      }
    }

    for (const calculator of calculators) {
      if (!calculator.path.startsWith('/calculators/')) failures.push(calculator.id + ': invalid calculator path ' + calculator.path);
      if (!categoryIds.has(calculator.categoryId)) failures.push(calculator.id + ': missing category ' + calculator.categoryId);
      if (!calculator.formula.trim()) failures.push(calculator.id + ': missing formula');
      if (!calculator.description.trim() || !calculator.longDescription.trim()) failures.push(calculator.id + ': missing description text');
      for (const relatedId of calculator.relatedCalculators) {
        if (!ids.has(relatedId)) failures.push(calculator.id + ': related calculator not found: ' + relatedId);
      }
    }

    const searchExpectations = [
      ['kappa', 'cohens-kappa'],
      ['sample size', 'sample-size'],
      ['cyber risk', 'cyber-risk-score'],
      ['compound interest', 'compound-interest'],
      ['physics force', 'force-calculator']
    ];
    for (const [query, expectedId] of searchExpectations) {
      if (!searchCalculators(query).some(calculator => calculator.id === expectedId)) {
        failures.push('Search query "' + query + '" did not return ' + expectedId);
      }
    }

    return { total: calculators.length, failures };
  }
`);

await build({
  entryPoints: [entry],
  outfile,
  bundle: true,
  platform: 'node',
  format: 'esm',
  logLevel: 'silent',
});

try {
  const { runFormulaExamples, runConfigExamples, runMetadataChecks } = await import(pathToFileURL(outfile).href);
  const formulas = runFormulaExamples();
  assert.equal(formulas.sampleSize.sampleSize, 385, 'sample size unadjusted expected output');
  assert.equal(formulas.sampleSize.adjustedSampleSize, 278, 'sample size finite correction expected output');
  close(formulas.cohensKappa.kappa, 0.4, 1e-9, "Cohen's Kappa function output");
  close(formulas.fleissKappa.kappa, 1, 1e-9, "Fleiss' Kappa perfect agreement output");
  close(formulas.cronbachAlpha.alpha, 0.975, 1e-9, "Cronbach's Alpha function output");
  close(formulas.populationSpread.standardDeviation, 2, 1e-9, 'population standard deviation function output');
  close(formulas.sampleSpread.variance, 32 / 7, 1e-9, 'sample variance function output');
  assert.equal(formulas.confidenceInterval.distribution, 't', 'confidence interval should use t distribution for sample SD');
  close(formulas.confidenceInterval.criticalValue, 1.9843, 1e-6, '95% t critical value, df=99');
  close(formulas.confidenceInterval.marginOfError, 1.9843, 1e-6, 'confidence interval margin with n=100 and SD=10');
  close(formulas.correlation.r, 0.7745966692414834, 1e-9, 'Pearson correlation function output');
  close(formulas.ahp.weights.reduce((sum, value) => sum + value, 0), 1, 1e-9, 'AHP weights sum to 1');
  assert.equal(formulas.ahp.isConsistent, true, 'AHP example should be acceptably consistent');
  assert.equal(formulas.delphi.items[0].consensus, true, 'Delphi example should meet IQR consensus threshold');
  close(formulas.delphi.items[0].iqr, 1, 1e-9, 'Delphi IQR function output');
  close(formulas.maturity.overallScore, 3.25, 1e-9, 'maturity score function output');
  console.log('Direct formula examples passed for priority calculators.');

  const { total, failures } = runConfigExamples();
  assert.deepEqual(failures, [], `Config example failures:\n${failures.join('\n')}`);
  console.log(`Example-data execution passed for ${total} config-driven calculators.`);
  const metadata = runMetadataChecks();
  assert.deepEqual(metadata.failures, [], `Metadata/link/search failures:\n${metadata.failures.join('\n')}`);
  console.log(`Metadata, related-link, and search checks passed for ${metadata.total} calculators.`);
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
