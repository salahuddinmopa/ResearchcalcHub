import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SearchX } from 'lucide-react';
import { calculators, categories, searchCalculators } from '../data/calculators';
import { CalculatorCard } from '../components/ui/CalculatorCard';
import { SearchBar } from '../components/ui/SearchBar';
import type { Calculator, Difficulty, UserType } from '../types';
import { useSEO } from '../utils/seo';

type StatusFilter = 'active' | '';

const activeSections = [
  {
    id: 'research-methodology',
    title: 'Research Methodology Calculators',
    description: 'Survey planning, sample design, response analysis, and questionnaire tools.',
    match: (calculator: Calculator) => calculator.categoryId === 'research-methodology',
  },
  {
    id: 'statistics',
    title: 'Statistics Calculators',
    description: 'Descriptive statistics, standardisation, intervals, and relationship analysis.',
    match: (calculator: Calculator) => calculator.categoryId === 'statistics',
  },
  {
    id: 'reliability-validity',
    title: 'Reliability & Validity Calculators',
    description: 'Agreement, reliability, internal consistency, and coding quality checks.',
    match: (calculator: Calculator) => calculator.categoryId === 'reliability-validity',
  },
  {
    id: 'social-science',
    title: 'Social Science Calculators',
    description: 'Tools for social research, expert consensus, stakeholders, and qualitative workflows.',
    match: (calculator: Calculator) => calculator.categoryId === 'social-science-decision',
  },
  {
    id: 'math',
    title: 'Math Calculators',
    description: 'Percentages, fractions, ratios, averages, geometry, equations, and unit conversion.',
    match: (calculator: Calculator) => calculator.categoryId === 'math',
  },
  {
    id: 'physics',
    title: 'Physics Calculators',
    description: 'Speed, force, work, power, energy, density, electricity, and pressure formulas.',
    match: (calculator: Calculator) => calculator.categoryId === 'physics',
  },
  {
    id: 'chemistry',
    title: 'Chemistry Calculators',
    description: 'Moles, molar mass, dilution, pH, concentration, and gas law calculations.',
    match: (calculator: Calculator) => calculator.categoryId === 'chemistry',
  },
  {
    id: 'finance',
    title: 'Finance Calculators',
    description: 'Interest, loans, EMI, ROI, profit margin, and break-even calculators.',
    match: (calculator: Calculator) => calculator.categoryId === 'finance',
  },
  {
    id: 'education',
    title: 'Education Calculators',
    description: 'GPA, CGPA, exam percentage, attendance, grades, and study planning tools.',
    match: (calculator: Calculator) => calculator.categoryId === 'education',
  },
  {
    id: 'biology',
    title: 'Biology & Health Calculators',
    description: 'BMI, BMR, calories, and hydration calculators for simple wellness estimates.',
    match: (calculator: Calculator) => calculator.categoryId === 'biology',
  },
  {
    id: 'everyday',
    title: 'Everyday Life Calculators',
    description: 'Age, dates, time, fuel cost, discounts, tips, and cooking conversions.',
    match: (calculator: Calculator) => calculator.categoryId === 'everyday',
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity & AI Governance Calculators',
    description: 'Cyber risk, incident severity, control compliance, AI risk, governance readiness, and password strength.',
    match: (calculator: Calculator) => calculator.categoryId === 'cybersecurity',
  },
];

const futureSections: { id: string; title: string }[] = [];

export function CalculatorsPage() {
  useSEO(
    'All Academic Calculators | ResearchCalcHub',
    'Browse free calculators for research methods, statistics, reliability, decision tools, STEM, finance, education, everyday life, and cybersecurity.'
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCat, setSelectedCat] = useState(searchParams.get('cat') || '');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | ''>('');
  const [selectedUserType, setSelectedUserType] = useState<UserType | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('');
  const [showFilters, setShowFilters] = useState(false);

  const activeCount = calculators.length;

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams);
    if (value.trim()) params.set('q', value.trim()); else params.delete('q');
    setSearchParams(params);
  };

  const handleCatFilter = (categoryId: string) => {
    const nextCategory = selectedCat === categoryId ? '' : categoryId;
    setSelectedCat(nextCategory);
    const params = new URLSearchParams(searchParams);
    if (nextCategory) params.set('cat', nextCategory); else params.delete('cat');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCat('');
    setSelectedDifficulty('');
    setSelectedUserType('');
    setSelectedStatus('');
    setSearchParams({});
  };

  const filteredCalcs = useMemo(() => {
    const baseResults = search.trim() ? searchCalculators(search) : calculators;

    return baseResults.filter(calculator => {
      if (selectedCat && calculator.categoryId !== selectedCat) return false;
      if (selectedDifficulty && calculator.difficulty !== selectedDifficulty) return false;
      if (selectedUserType && !calculator.userTypes.includes(selectedUserType)) return false;
      if (selectedStatus && calculator.status !== selectedStatus) return false;
      return true;
    });
  }, [search, selectedCat, selectedDifficulty, selectedUserType, selectedStatus]);

  const hasFilters = Boolean(search || selectedCat || selectedDifficulty || selectedUserType || selectedStatus);
  const selectedCategoryName = categories.find(category => category.id === selectedCat)?.name;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-6">
            <div>
              <span className="badge bg-indigo-100 text-indigo-700 mb-3">Smart Calculator Finder</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">All Calculators</h1>
              <p className="text-slate-600">
                {activeCount} calculators across research methods, statistics, STEM, finance, education, and more.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:flex">
              <div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3">
                <div className="text-xl font-bold text-slate-900">{activeCount}</div>
                <div className="text-xs text-slate-500">Calculators</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 flex-col sm:flex-row">
            <SearchBar
              value={search}
              onChange={handleSearch}
              placeholder="Search name, category, tags, method, use case, or user type..."
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex items-center justify-center gap-2 text-sm ${showFilters ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : ''}`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {(selectedCat || selectedDifficulty || selectedUserType || selectedStatus) && (
                <span className="w-2 h-2 bg-indigo-500 rounded-full inline-block" />
              )}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {['reliability', 'survey', 'maturity', 'decision', 'statistics'].map(term => (
              <button
                key={term}
                type="button"
                onClick={() => handleSearch(term)}
                className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:border-indigo-300 hover:text-indigo-700 transition-colors shadow-sm"
              >
                {term}
              </button>
            ))}
          </div>

          {showFilters && (
            <div className="mt-5 p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-5 animate-fade-in">
              <div>
                <label className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleCatFilter('')}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selectedCat === '' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                  >
                    All Categories
                  </button>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleCatFilter(category.id)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selectedCat === category.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div>
                  <label className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2 block">Difficulty</label>
                  <div className="flex flex-wrap gap-2">
                    {(['', 'Basic', 'Intermediate', 'Advanced'] as const).map(difficulty => (
                      <button
                        key={difficulty || 'all-difficulty'}
                        type="button"
                        onClick={() => setSelectedDifficulty(difficulty)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selectedDifficulty === difficulty ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                      >
                        {difficulty || 'All'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2 block">User Type</label>
                  <div className="flex flex-wrap gap-2">
                    {(['', 'Student', 'Researcher', 'Teacher', 'Professional'] as const).map(userType => (
                      <button
                        key={userType || 'all-users'}
                        type="button"
                        onClick={() => setSelectedUserType(userType)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selectedUserType === userType ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                      >
                        {userType || 'All'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-2 block">Status</label>
                  <div className="flex flex-wrap gap-2">
                    {([
                      { value: '', label: 'All' },
                      { value: 'active', label: 'Active' },
                    ] as const).map(status => (
                      <button
                        key={status.label}
                        type="button"
                        onClick={() => setSelectedStatus(status.value)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selectedStatus === status.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {hasFilters && (
                <button type="button" onClick={clearFilters} className="text-xs text-red-600 hover:underline">
                  Clear all search and filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!search && !selectedDifficulty && !selectedUserType && !selectedStatus && (
          <div className="flex gap-2 flex-wrap mb-8">
            <button
              type="button"
              onClick={() => handleCatFilter('')}
              className={`text-sm px-4 py-2 rounded-xl border font-medium transition-colors ${selectedCat === '' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCatFilter(category.id)}
                className={`text-sm px-4 py-2 rounded-xl border font-medium transition-colors ${selectedCat === category.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {hasFilters && (
          <div className="mb-5">
            <p className="text-sm text-slate-600">
              {filteredCalcs.length} calculator{filteredCalcs.length !== 1 ? 's' : ''} found
              {search ? ` for "${search}"` : ''}
              {selectedCategoryName ? ` in "${selectedCategoryName}"` : ''}
            </p>
          </div>
        )}

        {hasFilters ? (
          <CalculatorResults calculators={filteredCalcs} onClear={clearFilters} />
        ) : selectedCat ? (
          <CalculatorResults calculators={filteredCalcs} onClear={clearFilters} />
        ) : (
          <>
            {activeSections.map(section => {
              const sectionCalculators = calculators.filter(calculator => calculator.status === 'active' && section.match(calculator));
              if (sectionCalculators.length === 0) return null;
              return (
                <CalculatorSection
                  key={section.id}
                  title={section.title}
                  description={section.description}
                  calculators={sectionCalculators}
                />
              );
            })}

            {futureSections.length > 0 && (
              <div className="mt-12 pt-10 border-t border-slate-200">
                <div className="mb-6">
                  <span className="badge bg-slate-200 text-slate-600 mb-3">Future Expansion</span>
                  <h2 className="text-2xl font-bold text-slate-900">Future Category Sections</h2>
                  <p className="text-slate-600 mt-2">Coming-soon calculators are visible for planning, but disabled until their logic is implemented.</p>
                </div>
                {futureSections.map(section => {
                  const sectionCalculators = calculators.filter(
                    calculator => calculator.status === 'coming-soon' && calculator.categoryId === section.id
                  );
                  if (sectionCalculators.length === 0) return null;
                  return (
                    <CalculatorSection
                      key={section.id}
                      title={section.title}
                      description="Planned calculators for future ResearchCalcHub releases."
                      calculators={sectionCalculators}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CalculatorSection({
  title,
  description,
  calculators,
}: {
  title: string;
  description: string;
  calculators: Calculator[];
}) {
  return (
    <section className="mb-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
        <span className="text-sm text-slate-400">{calculators.length} calculator{calculators.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {calculators.map(calculator => (
          <CalculatorCard key={calculator.id} calculator={calculator} />
        ))}
      </div>
    </section>
  );
}

function CalculatorResults({ calculators, onClear }: { calculators: Calculator[]; onClear: () => void }) {
  if (calculators.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <SearchX className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h3 className="font-semibold text-slate-900 mb-1">No calculator found</h3>
        <p className="text-slate-500 text-sm mb-4">Try a different search term or clear your filters.</p>
        <button type="button" onClick={onClear} className="btn-primary text-sm">
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {calculators.map(calculator => (
        <CalculatorCard key={calculator.id} calculator={calculator} />
      ))}
    </div>
  );
}
