import React from 'react';
import { ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'destructive';
  title?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function Alert({ 
  variant = 'info', 
  title, 
  description, 
  className = '',
  children 
}: AlertProps) {
  const variants = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-900 dark:text-blue-100',
      icon: InformationCircleIcon,
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-900 dark:text-green-100',
      icon: CheckCircleIcon,
      iconColor: 'text-green-600 dark:text-green-400'
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-900 dark:text-yellow-100',
      icon: ExclamationTriangleIcon,
      iconColor: 'text-yellow-600 dark:text-yellow-400'
    },
    destructive: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-900 dark:text-red-100',
      icon: XCircleIcon,
      iconColor: 'text-red-600 dark:text-red-400'
    }
  };

  const style = variants[variant];
  const Icon = style.icon;

  return (
    <div className={`${style.bg} ${style.border} ${style.text} border rounded-lg p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${style.iconColor}`} aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          {title && <h3 className="text-sm font-medium">{title}</h3>}
          {description && <div className="mt-1 text-sm">{description}</div>}
          {children}
        </div>
      </div>
    </div>
  );
}