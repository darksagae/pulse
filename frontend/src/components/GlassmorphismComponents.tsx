/**
 * Glassmorphism Components Library for PublicPulse
 * Modern glass-like UI components with backdrop blur effects
 */

import React from 'react';
import './styles/glassmorphism.css';

// Base Glass Container Component
interface GlassContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  onClick?: () => void;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  className = '',
  size = 'md',
  variant = 'default',
  onClick
}) => {
  const sizeClass = `glass-card${size !== 'md' ? `-${size}` : ''}`;
  const variantClass = variant !== 'default' ? `glass-${variant}` : '';
  
  return (
    <div 
      className={`${sizeClass} ${variantClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Glass Button Component
interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button'
}) => {
  const variantClass = `glass-btn-${variant}`;
  const sizeClass = size !== 'md' ? `glass-btn-${size}` : 'glass-btn';
  
  return (
    <button
      type={type}
      className={`${sizeClass} ${variantClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Glass Input Component
interface GlassInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  disabled = false,
  required = false,
  name,
  id
}) => {
  return (
    <input
      type={type}
      className={`glass-input ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      name={name}
      id={id}
    />
  );
};

// Glass Select Component
interface GlassSelectProps {
  children: React.ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
}

export const GlassSelect: React.FC<GlassSelectProps> = ({
  children,
  value,
  onChange,
  className = '',
  disabled = false,
  name,
  id
}) => {
  return (
    <select
      className={`glass-select ${className}`}
      value={value}
      onChange={onChange}
      disabled={disabled}
      name={name}
      id={id}
    >
      {children}
    </select>
  );
};

// Glass Textarea Component
interface GlassTextareaProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  rows?: number;
}

export const GlassTextarea: React.FC<GlassTextareaProps> = ({
  placeholder,
  value,
  onChange,
  className = '',
  disabled = false,
  required = false,
  name,
  id,
  rows = 4
}) => {
  return (
    <textarea
      className={`glass-textarea ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      name={name}
      id={id}
      rows={rows}
    />
  );
};

// Glass Modal Component
interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const GlassModal: React.FC<GlassModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md'
}) => {
  if (!isOpen) return null;

  return (
    <div className="glass-modal" onClick={onClose}>
      <div 
        className={`glass-modal-content glass-modal-${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="glass-modal-header">
            <h3>{title}</h3>
            <button className="glass-btn-close" onClick={onClose}>
              ×
            </button>
          </div>
        )}
        <div className="glass-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

// Glass Navigation Component
interface GlassNavProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassNav: React.FC<GlassNavProps> = ({
  children,
  className = ''
}) => {
  return (
    <nav className={`glass-nav ${className}`}>
      {children}
    </nav>
  );
};

// Glass Nav Item Component
interface GlassNavItemProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export const GlassNavItem: React.FC<GlassNavItemProps> = ({
  children,
  active = false,
  onClick,
  className = ''
}) => {
  return (
    <button
      className={`glass-nav-item ${active ? 'active' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Glass Tabs Component
interface GlassTabsProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassTabs: React.FC<GlassTabsProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`glass-tabs ${className}`}>
      {children}
    </div>
  );
};

// Glass Tab Component
interface GlassTabProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export const GlassTab: React.FC<GlassTabProps> = ({
  children,
  active = false,
  onClick,
  className = ''
}) => {
  return (
    <button
      className={`glass-tab ${active ? 'active' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Glass Progress Bar Component
interface GlassProgressProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
}

export const GlassProgress: React.FC<GlassProgressProps> = ({
  value,
  max = 100,
  className = '',
  showLabel = false
}) => {
  const percentage = (value / max) * 100;

  return (
    <div className={`glass-progress-container ${className}`}>
      {showLabel && (
        <div className="glass-progress-label">
          {Math.round(percentage)}%
        </div>
      )}
      <div className="glass-progress">
        <div 
          className="glass-progress-bar"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Glass Badge Component
interface GlassBadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  className?: string;
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  children,
  variant = 'primary',
  className = ''
}) => {
  return (
    <span className={`glass-badge glass-badge-${variant} ${className}`}>
      {children}
    </span>
  );
};

// Glass Alert Component
interface GlassAlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
  onClose?: () => void;
}

export const GlassAlert: React.FC<GlassAlertProps> = ({
  children,
  variant = 'info',
  className = '',
  onClose
}) => {
  return (
    <div className={`glass-alert glass-alert-${variant} ${className}`}>
      {children}
      {onClose && (
        <button className="glass-alert-close" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
};

// Glass Table Component
interface GlassTableProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassTable: React.FC<GlassTableProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`glass-table ${className}`}>
      {children}
    </div>
  );
};

// Glass Table Header Component
interface GlassTableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassTableHeader: React.FC<GlassTableHeaderProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`glass-table-header ${className}`}>
      {children}
    </div>
  );
};

// Glass Table Row Component
interface GlassTableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassTableRow: React.FC<GlassTableRowProps> = ({
  children,
  className = '',
  onClick
}) => {
  return (
    <div 
      className={`glass-table-row ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Glass Table Cell Component
interface GlassTableCellProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassTableCell: React.FC<GlassTableCellProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`glass-table-cell ${className}`}>
      {children}
    </div>
  );
};

// Glass Stats Card Component
interface GlassStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export const GlassStatsCard: React.FC<GlassStatsCardProps> = ({
  title,
  value,
  subtitle,
  trend = 'neutral',
  className = ''
}) => {
  return (
    <div className={`glass-stats-card ${className}`}>
      <div className="glass-stats-number">{value}</div>
      <div className="glass-stats-label">{title}</div>
      {subtitle && (
        <div className={`glass-stats-trend glass-stats-trend-${trend}`}>
          {subtitle}
        </div>
      )}
    </div>
  );
};

// Glass Loading Spinner Component
interface GlassSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GlassSpinner: React.FC<GlassSpinnerProps> = ({
  size = 'md',
  className = ''
}) => {
  const sizeClass = size === 'lg' ? 'glass-spinner-lg' : 'glass-spinner';
  
  return (
    <div className={`${sizeClass} ${className}`} />
  );
};

// Glass Notification Component
interface GlassNotificationProps {
  children: React.ReactNode;
  type?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
  onClose?: () => void;
}

export const GlassNotification: React.FC<GlassNotificationProps> = ({
  children,
  type = 'info',
  className = '',
  onClose
}) => {
  return (
    <div className={`glass-notification glass-notification-${type} ${className}`}>
      {children}
      {onClose && (
        <button className="glass-notification-close" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
};

// Glass Form Group Component
interface GlassFormGroupProps {
  children: React.ReactNode;
  label?: string;
  error?: string;
  className?: string;
}

export const GlassFormGroup: React.FC<GlassFormGroupProps> = ({
  children,
  label,
  error,
  className = ''
}) => {
  return (
    <div className={`glass-form-group ${className}`}>
      {label && <label className="glass-form-label">{label}</label>}
      {children}
      {error && <div className="glass-form-error">{error}</div>}
    </div>
  );
};

// Glass Dropdown Component
interface GlassDropdownProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export const GlassDropdown: React.FC<GlassDropdownProps> = ({
  children,
  trigger,
  isOpen,
  onToggle,
  className = ''
}) => {
  return (
    <div className={`glass-dropdown ${className}`}>
      <div onClick={onToggle}>
        {trigger}
      </div>
      {isOpen && (
        <div className="glass-dropdown-content">
          {children}
        </div>
      )}
    </div>
  );
};

// Glass Dropdown Item Component
interface GlassDropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const GlassDropdownItem: React.FC<GlassDropdownItemProps> = ({
  children,
  onClick,
  className = ''
}) => {
  return (
    <div 
      className={`glass-dropdown-item ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Glass Tooltip Component
interface GlassTooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const GlassTooltip: React.FC<GlassTooltipProps> = ({
  children,
  content,
  position = 'top',
  className = ''
}) => {
  return (
    <div className={`glass-tooltip glass-tooltip-${position} ${className}`}>
      {children}
      <div className="glass-tooltip-content">
        {content}
      </div>
    </div>
  );
};

// All components are already exported above with their declarations
