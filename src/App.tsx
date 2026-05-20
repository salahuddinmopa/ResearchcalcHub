import { BrowserRouter, Link, Routes, Route, ScrollRestoration } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/Home';
import { CalculatorsPage } from './pages/Calculators';
import { AboutPage } from './pages/About';
import {
  ContactPage,
  DisclaimerPage,
  PrivacyPolicyPage,
  ReportErrorPage,
  SuggestCalculatorPage,
  TermsOfUsePage,
} from './pages/InfoPages';
import { CategoryPage } from './pages/Category';
import ResearchToolkitPage from './pages/ResearchToolkit';
import QualitativeThematicAnalysisPage from './pages/tools/QualitativeThematicAnalysis';
import { FutureToolsPage } from './pages/FutureTools';
import { PlaceholderCalculatorPage } from './pages/PlaceholderCalculator';

// Calculator pages
import { SampleSizePage } from './pages/calculators/SampleSize';
import { MarginOfErrorPage } from './pages/calculators/MarginOfError';
import { SurveyResponseRatePage } from './pages/calculators/SurveyResponseRate';
import { LikertScalePage } from './pages/calculators/LikertScale';
import { WeightedScoringPage } from './pages/calculators/WeightedScoring';
import { CohensKappaPage } from './pages/calculators/CohensKappa';
import { FleissKappaPage } from './pages/calculators/FleissKappa';
import { CronbachAlphaPage } from './pages/calculators/CronbachAlpha';
import { InterCoderAgreementPage } from './pages/calculators/InterCoderAgreement';
import { MeanMedianModePage } from './pages/calculators/MeanMedianMode';
import { StandardDeviationPage } from './pages/calculators/StandardDeviation';
import { VariancePage } from './pages/calculators/Variance';
import { ZScorePage } from './pages/calculators/ZScore';
import { ConfidenceIntervalPage } from './pages/calculators/ConfidenceInterval';
import { CorrelationPage } from './pages/calculators/Correlation';
import { RiskMatrixPage } from './pages/calculators/RiskMatrix';
import { StakeholderMatrixPage } from './pages/calculators/StakeholderMatrix';
import { AHPWeightPage } from './pages/calculators/AHPWeight';
import { DelphiConsensusPage } from './pages/calculators/DelphiConsensus';
import { MaturityModelPage } from './pages/calculators/MaturityModel';
import { DecisionMatrixPage } from './pages/calculators/DecisionMatrix';
import { CapabilityScorePage } from './pages/calculators/CapabilityScore';
import { GovernanceReadinessPage } from './pages/calculators/GovernanceReadiness';
import { CybersecurityMaturityMiniPage } from './pages/calculators/CybersecurityMaturityMini';
import { AIGovernanceReadinessPage } from './pages/calculators/AIGovernanceReadiness';
import { StemCalculatorPage } from './pages/calculators/StemCalculator';
import { stemCalculators } from './utils/stemCalculators';
import { PracticalCalculatorPage } from './pages/calculators/PracticalCalculator';
import { practicalCalculators } from './utils/practicalCalculators';
import { CybersecurityCalculatorPage } from './pages/calculators/CybersecurityCalculator';
import { cybersecurityCalculators } from './utils/cybersecurity';

function ScrollToTop() {
  // React Router v6 doesn't have ScrollRestoration outside data routers
  // Use a simple approach in Layout
  return null;
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-sm text-amber-900 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-center gap-1 sm:gap-2 text-center">
          <span>
            ResearchCalcHub is currently in beta. Please verify important results before academic or professional use.
          </span>
          <span className="hidden sm:inline text-amber-700">·</span>
          <span>
            You can <Link to="/report-error" className="font-semibold underline underline-offset-2 hover:text-amber-700">report errors</Link> or{' '}
            <Link to="/suggest-calculator" className="font-semibold underline underline-offset-2 hover:text-amber-700">suggest new calculators</Link>.
          </span>
        </div>
      </div>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/calculators" element={<CalculatorsPage />} />
          <Route path="/categories/:categoryId" element={<CategoryPage />} />
          <Route path="/research-toolkit" element={<ResearchToolkitPage />} />
          <Route path="/future-tools" element={<FutureToolsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfUsePage />} />
          <Route path="/disclaimer" element={<DisclaimerPage />} />
          <Route path="/suggest-calculator" element={<SuggestCalculatorPage />} />
          <Route path="/report-error" element={<ReportErrorPage />} />

          {/* Research Methodology */}
          <Route path="/calculators/sample-size" element={<SampleSizePage />} />
          <Route path="/calculators/margin-of-error" element={<MarginOfErrorPage />} />
          <Route path="/calculators/survey-response-rate" element={<SurveyResponseRatePage />} />
          <Route path="/calculators/likert-scale" element={<LikertScalePage />} />
          <Route path="/calculators/weighted-scoring" element={<WeightedScoringPage />} />

          {/* Reliability & Validity */}
          <Route path="/calculators/cohens-kappa" element={<CohensKappaPage />} />
          <Route path="/calculators/fleiss-kappa" element={<FleissKappaPage />} />
          <Route path="/calculators/cronbach-alpha" element={<CronbachAlphaPage />} />
          <Route path="/calculators/inter-coder-agreement" element={<InterCoderAgreementPage />} />

          {/* Statistics */}
          <Route path="/calculators/mean-median-mode" element={<MeanMedianModePage />} />
          <Route path="/calculators/standard-deviation" element={<StandardDeviationPage />} />
          <Route path="/calculators/variance" element={<VariancePage />} />
          <Route path="/calculators/z-score" element={<ZScorePage />} />
          <Route path="/calculators/confidence-interval" element={<ConfidenceIntervalPage />} />
          <Route path="/calculators/correlation" element={<CorrelationPage />} />

          {/* Social Science & Decision */}
          <Route path="/calculators/risk-matrix" element={<RiskMatrixPage />} />
          <Route path="/calculators/stakeholder-matrix" element={<StakeholderMatrixPage />} />
          <Route path="/calculators/ahp-weight" element={<AHPWeightPage />} />
          <Route path="/calculators/delphi-consensus" element={<DelphiConsensusPage />} />
          <Route path="/calculators/decision-matrix" element={<DecisionMatrixPage />} />
          <Route path="/calculators/maturity-model" element={<MaturityModelPage />} />
          <Route path="/calculators/capability-score" element={<CapabilityScorePage />} />
          <Route path="/calculators/governance-readiness" element={<GovernanceReadinessPage />} />
          <Route path="/calculators/cybersecurity-maturity-mini" element={<CybersecurityMaturityMiniPage />} />
          <Route path="/calculators/ai-governance-readiness" element={<AIGovernanceReadinessPage />} />

          {/* Math, Physics & Chemistry */}
          {stemCalculators.map(calculator => (
            <Route key={calculator.id} path={`/calculators/${calculator.id}`} element={<StemCalculatorPage calculatorId={calculator.id} />} />
          ))}

          {/* Finance, Education, Health & Everyday Life */}
          {practicalCalculators.map(calculator => (
            <Route key={calculator.id} path={`/calculators/${calculator.id}`} element={<PracticalCalculatorPage calculatorId={calculator.id} />} />
          ))}

          {/* Cybersecurity & AI Governance */}
          {cybersecurityCalculators.map(calculator => (
            <Route key={calculator.id} path={`/calculators/${calculator.id}`} element={<CybersecurityCalculatorPage calculatorId={calculator.id} />} />
          ))}
          <Route path="/calculators/:slug" element={<PlaceholderCalculatorPage />} />

          {/* 404 */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <div className="text-6xl font-bold text-slate-200 mb-4">404</div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Page not found</h1>
                <p className="text-slate-600 mb-6">The page you're looking for doesn't exist.</p>
                <a href="/" className="btn-primary">Go Home</a>
              </div>
            </div>
          } />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
