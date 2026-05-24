import React, { ReactNode } from 'react';

interface ModalProps {
  title?: string;
  children?: ReactNode;
  onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6 relative">
        {title && (
          <h2 className="text-xl font-semibold mb-4">{title}</h2>
        )}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          aria-label="Close modal"
        >
          ✕
        </button>
        <div>{children}</div>
      </div>
    </div>
  );
};
