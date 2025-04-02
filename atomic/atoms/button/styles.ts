import { ButtonSize, ButtonVariant } from './types';

export const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-gray-900 hover:bg-gray-800 text-white',
  secondary: 'bg-red-600 hover:bg-red-700 text-white',
  ghost: 'hover:bg-gray-900/10 text-gray-900 dark:text-white',
  link: 'text-gray-900 hover:underline dark:text-white',
};

export const buttonSizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const baseButtonStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:pointer-events-none'; 