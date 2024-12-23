import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive';
}

export const Alert = ({ children, variant = 'default' }: AlertProps) => {
  const alertStyles =
    variant === 'destructive'
      ? 'bg-red-50 border-red-500 text-red-700'
      : 'bg-blue-50 border-blue-500 text-blue-700';

  return (
    <div className={`border-l-4 p-4 ${alertStyles}`}>
      {children}
    </div>
  );
};

interface AlertDescriptionProps {
  children: React.ReactNode;
}

export const AlertDescription = ({ children }: AlertDescriptionProps) => {
  return <p>{children}</p>;
};