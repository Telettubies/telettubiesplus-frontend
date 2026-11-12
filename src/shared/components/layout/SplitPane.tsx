import React from 'react';

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  leftWidthClass?: string;
  rightWidthClass?: string;
  className?: string;
}

export const SplitPane: React.FC<SplitPaneProps> = ({
  left,
  right,
  leftWidthClass = 'lg:col-span-6',
  rightWidthClass = 'lg:col-span-6',
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-5 items-start ${className}`}>
      <div className={`${leftWidthClass} w-full min-w-0`}>{left}</div>
      <div className={`${rightWidthClass} w-full min-w-0`}>{right}</div>
    </div>
  );
};

