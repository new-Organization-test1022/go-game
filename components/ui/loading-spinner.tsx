'use client';

import React, { memo } from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  variant?: 'default' | 'dots' | 'pulse';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const LoadingSpinnerComponent = ({ 
  size = 'md', 
  className, 
  text,
  variant = 'default'
}: LoadingSpinnerProps) => {
  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center justify-center space-x-1', className)}>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        {text && <span className="ml-2 text-gray-600">{text}</span>}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <div className={cn('rounded-full bg-gray-400 animate-pulse', sizeClasses[size])}></div>
        {text && <span className="ml-2 text-gray-600">{text}</span>}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-gray-900',
        sizeClasses[size]
      )}></div>
      {text && <span className="ml-2 text-gray-600">{text}</span>}
    </div>
  );
};

export const LoadingSpinner = memo(LoadingSpinnerComponent);

// 页面级加载组件
interface PageLoadingProps {
  text?: string;
  fullScreen?: boolean;
}

export const PageLoading = memo(({ text = '加载中...', fullScreen = true }: PageLoadingProps) => {
  const containerClass = fullScreen 
    ? 'min-h-screen bg-gray-50 flex items-center justify-center' 
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClass}>
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-gray-600">{text}</p>
      </div>
    </div>
  );
});

// 内联加载组件
interface InlineLoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const InlineLoading = memo(({ text, size = 'md', className }: InlineLoadingProps) => {
  return (
    <div className={cn('flex items-center justify-center py-4', className)}>
      <LoadingSpinner size={size} text={text} />
    </div>
  );
});

// 按钮加载状态
interface ButtonLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

export const ButtonLoading = memo(({ 
  isLoading, 
  children, 
  disabled, 
  className,
  onClick 
}: ButtonLoadingProps) => {
  return (
    <button 
      className={cn(
        'inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-md',
        'transition-colors duration-200',
        isLoading || disabled 
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
          : 'bg-blue-600 text-white hover:bg-blue-700',
        className
      )}
      disabled={isLoading || disabled}
      onClick={onClick}
    >
      {isLoading && <LoadingSpinner size="sm" />}
      <span>{children}</span>
    </button>
  );
});