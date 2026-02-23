import React from 'react';

interface AdminFormFieldProps {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

export default function AdminFormField({
  label,
  hint,
  required = false,
  error,
  children
}: AdminFormFieldProps) {
  return (
    <div className="admin-form-group">
      <label className={`admin-form-label ${required ? 'admin-form-label-required' : ''}`}>
        {label}
      </label>
      {hint && (
        <div className="admin-form-hint">
          {hint}
        </div>
      )}
      {children}
      {error && (
        <div style={{
          color: 'var(--neon-pink)',
          marginTop: '8px',
          fontSize: '12px',
          padding: '8px 12px',
          background: 'rgba(255, 0, 110, 0.1)',
          borderLeft: '2px solid var(--neon-pink)',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
