import React from 'react';
import { clsx } from 'clsx';

const variantStyles = {
  primary: 'bg-primary text-white shadow-[0_4px_12px_rgba(200,75,49,0.3)] hover:bg-primary-dark hover:shadow-[0_6px_16px_rgba(200,75,49,0.4)] hover:-translate-y-0.5',
  secondary: 'bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white',
  tertiary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
  ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100',
  success: 'bg-success text-white hover:bg-[#1f4129]',
  danger: 'bg-error text-white hover:bg-primary-dark',
};

const sizeStyles = {
  small: 'px-4 py-2 text-sm',
  medium: 'px-6 py-3 text-base',
  large: 'px-8 py-4 text-lg',
};

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  fullWidth = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  ...props 
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center gap-2',
        'font-display font-semibold rounded-md',
        'relative overflow-hidden transition-all duration-250',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:to-white/10 before:opacity-0 before:transition-opacity before:duration-250',
        'hover:before:opacity-100',
        'active:scale-[0.98]',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="flex items-center">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="flex items-center">{icon}</span>}
    </button>
  );
};

export default Button;