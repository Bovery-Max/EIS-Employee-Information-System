'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export type Option = {
  value: string;
  label: string;
};

type CustomSelectProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  className?: string;
  placeholder?: string;
  disabled?: boolean;
};

export default function CustomSelect({
  id,
  value,
  onChange,
  options,
  className = '',
  placeholder = 'Select an option',
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <div 
      className={`custom-select-container ${className} ${disabled ? 'disabled' : ''}`} 
      ref={containerRef}
      id={id}
    >
      <div 
        className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled) setIsOpen(!isOpen);
          }
        }}
      >
        <span className="custom-select-value">{displayLabel}</span>
        <ChevronDown size={16} className={`custom-select-icon ${isOpen ? 'rotate' : ''}`} />
      </div>

      {isOpen && (
        <div className="custom-select-dropdown">
          <ul className="custom-select-list">
            {options.map(opt => (
              <li
                key={opt.value}
                className={`custom-select-option ${opt.value === value ? 'selected' : ''}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
