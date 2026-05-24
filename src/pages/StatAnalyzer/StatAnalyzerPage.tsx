import React, { useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { DataView } from '../../components/StatAnalyzer/DataView';
import { VariableView } from '../../components/StatAnalyzer/VariableView';
import { OutputViewer } from '../../components/StatAnalyzer/OutputViewer';
import { AnalysisSidebar } from '../../components/StatAnalyzer/AnalysisSidebar';
import { AnalysisModal } from '../../components/StatAnalyzer/AnalysisModal';

export default function StatAnalyzerPage() {
  const [activeTab, setActiveTab] = useState<'data' | 'variable' | 'output'>('data');
  const [data, setData] = useState<any[]>([]);
  const [variables, setVariables] = useState<string[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>('');
  const [resultBlocks, setResultBlocks] = useState<React.ReactNode[]>([]);

  const tabs = [
    { id: 'data', label: 'Data View' },
    { id: 'variable', label: 'Variable View' },
    { id: 'output', label: 'Output' },
  ];

  const handleAnalysisSelect = (analysis: string) => {
    setSelectedAnalysis(analysis);
    setShowAnalysis(true);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <AnalysisSidebar onSelect={handleAnalysisSelect} selected={selectedAnalysis} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">StatAnalyzer Pro</h1>
          <Badge variant="beta">Beta</Badge>
        </header>

        {/* Tabs */}
        <nav className="flex space-x-4 border-b pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-sm font-medium ${activeTab === tab.id ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab Panels */}
        <section>
          {activeTab === 'data' && <DataView onDataLoaded={setData} />}
          {activeTab === 'variable' && (
            <VariableView data={data} onVariablesSelected={setVariables} onRunAnalysis={() => setShowAnalysis(true)} />
          )}
          {activeTab === 'output' && <OutputViewer data={data} variables={variables} />}
        </section>

        {/* Result blocks */}
        <section className="mt-6 space-y-4">
          {resultBlocks.map((b, i) => (
            <div key={i}>{b}</div>
          ))}
        </section>
      </div>

      {/* Analysis Modal */}
      {showAnalysis && selectedAnalysis === 'Frequencies' && (
        <AnalysisModal
          data={data}
          variables={variables}
          onClose={() => setShowAnalysis(false)}
          onAddResult={block => setResultBlocks(prev => [block, ...prev])}
        />
      )}
    </div>
  );
}
