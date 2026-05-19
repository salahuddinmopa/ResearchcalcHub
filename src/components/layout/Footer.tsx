import { Link } from 'react-router-dom';
import { Calculator } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Calculator className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">ResearchCalcHub</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Academic calculators for PhD researchers, university students, and social science professionals.
            </p>
          </div>

          {/* Active categories */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Research Tools</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/calculators?cat=research-methodology" className="hover:text-white transition-colors">Research Methodology</Link></li>
              <li><Link to="/calculators?cat=reliability-validity" className="hover:text-white transition-colors">Reliability & Validity</Link></li>
              <li><Link to="/calculators?cat=statistics" className="hover:text-white transition-colors">Statistics</Link></li>
              <li><Link to="/calculators?cat=social-science-decision" className="hover:text-white transition-colors">Social Science Tools</Link></li>
            </ul>
          </div>

          {/* Featured calculators */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Popular Calculators</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/calculators/sample-size" className="hover:text-white transition-colors">Sample Size</Link></li>
              <li><Link to="/calculators/cohens-kappa" className="hover:text-white transition-colors">Cohen's Kappa</Link></li>
              <li><Link to="/calculators/cronbach-alpha" className="hover:text-white transition-colors">Cronbach's Alpha</Link></li>
              <li><Link to="/calculators/maturity-model" className="hover:text-white transition-colors">Maturity Model Score</Link></li>
              <li><Link to="/calculators/ahp-weight" className="hover:text-white transition-colors">AHP Weight Calculator</Link></li>
            </ul>
          </div>

          {/* More tools */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">More Tools</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/calculators?cat=math" className="hover:text-white transition-colors">Math Calculators</Link></li>
              <li><Link to="/calculators?cat=physics" className="hover:text-white transition-colors">Physics Calculators</Link></li>
              <li><Link to="/calculators?cat=finance" className="hover:text-white transition-colors">Finance Calculators</Link></li>
              <li><Link to="/calculators?cat=cybersecurity" className="hover:text-white transition-colors">Cybersecurity Tools</Link></li>
              <li><Link to="/calculators?cat=education" className="hover:text-white transition-colors">Education Calculators</Link></li>
            </ul>
          </div>

          {/* Site information */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Site Information</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Use</Link></li>
              <li><Link to="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link></li>
              <li><Link to="/suggest-calculator" className="hover:text-white transition-colors">Suggest a Calculator</Link></li>
              <li><Link to="/report-error" className="hover:text-white transition-colors">Report an Error</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} ResearchCalcHub. Built for researchers, students, and academics.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
            <span>·</span>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/calculators" className="hover:text-white transition-colors">All Calculators</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
