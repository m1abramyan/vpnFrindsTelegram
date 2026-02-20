"use client";

import { useEffect, type ReactNode, type FC } from "react";

interface LegalDocumentProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

export const LegalDocument: FC<LegalDocumentProps> = ({
  title,
  lastUpdated,
  children,
}) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
      <a
        href="#"
        className="inline-flex items-center text-brandGreen hover:text-brandGreenHover mb-8 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Вернуться на главную
      </a>

      <div className="bg-panelBg border border-panelBorder rounded-2xl p-6 md:p-10 shadow-xl">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {title}
        </h1>
        <p className="text-gray-500 mb-8 pb-8 border-b border-panelBorder">
          Последнее обновление: {lastUpdated}
        </p>

        <div className="prose prose-invert prose-green max-w-none text-gray-300 leading-relaxed space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
};
