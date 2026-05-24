import { Shield, X } from 'lucide-react';

interface Props {
  onDismiss: () => void;
}

export default function DataPrivacyNotice({ onDismiss }: Props) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-blue-900 mb-1">Privacy & Data Notice</p>
          <p className="text-sm text-blue-800 leading-relaxed">
            Please do not upload confidential, sensitive, personally identifiable, or restricted data
            unless you have permission to do so. This tool processes data locally in your browser.
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Uploaded data is used only for local analysis in your browser. No data is sent to any server.
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-blue-400 hover:text-blue-700 transition-colors"
          aria-label="Dismiss notice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
