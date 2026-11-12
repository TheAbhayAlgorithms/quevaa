'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Doctor } from '@/types/database';

interface DoctorWithSession extends Doctor {
  todaySession?: {
    id: string;
    current_token: number;
    total_tokens: number;
    status: string;
  } | null;
}

interface DoctorSelectProps {
  doctors: DoctorWithSession[];
  selectedDoctorId: string;
  onSelectDoctor: (doctorId: string) => void;
  disabled?: boolean;
  label?: string;
}

// Department color theme mapping
function getDepartmentTheme(dept: string | null = '') {
  const d = (dept || '').toLowerCase();
  if (d.includes('cardio')) {
    return { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca', dot: '#ef4444' };
  }
  if (d.includes('ortho')) {
    return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', dot: '#3b82f6' };
  }
  if (d.includes('pediat')) {
    return { bg: '#fffbeb', text: '#b45309', border: '#fde68a', dot: '#f59e0b' };
  }
  if (d.includes('derma')) {
    return { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff', dot: '#a855f7' };
  }
  if (d.includes('neuro')) {
    return { bg: '#f5f3ff', text: '#4338ca', border: '#ddd6fe', dot: '#6366f1' };
  }
  if (d.includes('gynec') || d.includes('obste')) {
    return { bg: '#fdf2f8', text: '#be185d', border: '#fbcfe8', dot: '#ec4899' };
  }
  if (d.includes('ent')) {
    return { bg: '#ecfeff', text: '#0e7490', border: '#a5f3fc', dot: '#06b6d4' };
  }
  return { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', dot: '#22c55e' };
}

// Resilient doctor portrait avatar (omits photos as requested)
export function DoctorPortrait({
  name,
  imageUrl,
  department,
  size = 54,
}: {
  name: string;
  imageUrl?: string | null;
  department?: string | null;
  size?: number;
}) {
  return null;
}

export default function DoctorSelect({
  doctors,
  selectedDoctorId,
  onSelectDoctor,
  disabled = false,
  label = 'Select Doctor',
}: DoctorSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedDoctor = useMemo(() => {
    return doctors.find((d) => d.id === selectedDoctorId) || doctors[0] || null;
  }, [doctors, selectedDoctorId]);

  // Unique departments for filter pills
  const departments = useMemo(() => {
    const set = new Set<string>();
    doctors.forEach((d) => {
      if (d.department) set.add(d.department);
    });
    return ['All', ...Array.from(set)];
  }, [doctors]);

  // Filtered doctors based on search & department
  const filteredDoctors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return doctors.filter((doc) => {
      // Dept pill filter
      if (selectedDeptFilter !== 'All' && doc.department !== selectedDeptFilter) {
        return false;
      }
      if (!q) return true;
      return (
        doc.name.toLowerCase().includes(q) ||
        (doc.department && doc.department.toLowerCase().includes(q)) ||
        (doc.specialization && doc.specialization.toLowerCase().includes(q)) ||
        (doc.description && doc.description.toLowerCase().includes(q)) ||
        (doc.room_number && doc.room_number.toLowerCase().includes(q))
      );
    });
  }, [doctors, searchQuery, selectedDeptFilter]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (doctorId: string) => {
    onSelectDoctor(doctorId);
    setIsOpen(false);
  };

  const selectedTheme = getDepartmentTheme(selectedDoctor?.department || '');

  return (
    <div className="doctor-select-component" ref={containerRef}>
      {/* Label */}
      {label && (
        <div className="doctor-select-label-row">
          <label className="form-label" htmlFor="doctor-dropdown-button">
            {label}
          </label>
          <span className="doctor-count-badge">
            {doctors.length} Doctors Available
          </span>
        </div>
      )}

      {/* Main Trigger Card */}
      <button
        id="doctor-dropdown-button"
        type="button"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`doctor-select-trigger ${isOpen ? 'trigger-open' : ''} ${
          disabled ? 'trigger-disabled' : ''
        }`}
      >
        {selectedDoctor ? (
          <div className="trigger-content">
            <div className="trigger-info" style={{ width: '100%' }}>
              <div className="trigger-title-row">
                <span className="trigger-name">{selectedDoctor.name}</span>
                <span
                  className="dept-pill"
                  style={{
                    backgroundColor: selectedTheme.bg,
                    color: selectedTheme.text,
                    borderColor: selectedTheme.border,
                  }}
                >
                  {selectedDoctor.department || 'General'}
                </span>
                <span className="room-pill">
                  Room {selectedDoctor.room_number || 'N/A'}
                </span>
              </div>

              <div className="trigger-speciality">
                {selectedDoctor.specialization || 'Medical Specialist'}
              </div>

              {selectedDoctor.description && (
                <p className="trigger-description-snippet">
                  {selectedDoctor.description}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="trigger-placeholder">
            <span>Select a Doctor to view queue...</span>
          </div>
        )}

        <div className="trigger-actions">
          {selectedDoctor?.todaySession && (
            <div className="trigger-queue-badge">
              <span className="pulse-indicator" />
              <span>Token #{selectedDoctor.todaySession.current_token || 0}</span>
            </div>
          )}

          <div className={`trigger-chevron ${isOpen ? 'chevron-up' : ''}`}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              width="20"
              height="20"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </button>

      {/* Dropdown Menu Panel */}
      {isOpen && (
        <div className="doctor-dropdown-panel" role="listbox">
          {/* Search Box Header */}
          <div className="dropdown-search-box">
            <div className="search-input-wrapper">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="18"
                height="18"
                className="search-icon"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by name, specialty, department, or room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="dropdown-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="search-clear-btn"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Department Quick Filter Chips */}
            {departments.length > 2 && (
              <div className="dept-filter-chips">
                {departments.map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setSelectedDeptFilter(dept)}
                    className={`dept-chip ${
                      selectedDeptFilter === dept ? 'dept-chip-active' : ''
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Doctors Option Cards List */}
          <div className="dropdown-options-list">
            {filteredDoctors.length === 0 ? (
              <div className="dropdown-no-results">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  width="36"
                  height="36"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
                <p>No doctors found matching &ldquo;{searchQuery}&rdquo;</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDeptFilter('All');
                  }}
                  className="btn btn-secondary btn-xs"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredDoctors.map((doc) => {
                const isSelected = doc.id === selectedDoctorId;
                const theme = getDepartmentTheme(doc.department);

                return (
                  <div
                    key={doc.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(doc.id)}
                    className={`doctor-option-card ${
                      isSelected ? 'option-selected' : ''
                    }`}
                  >
                    {/* Doctor Details */}
                    <div className="option-details-col" style={{ width: '100%' }}>
                      <div className="option-header-line">
                        <div className="option-name-badges">
                          <h4 className="option-doctor-name">{doc.name}</h4>
                          <span
                            className="dept-pill"
                            style={{
                              backgroundColor: theme.bg,
                              color: theme.text,
                              borderColor: theme.border,
                            }}
                          >
                            {doc.department || 'General'}
                          </span>
                          <span className="room-pill">
                            Room {doc.room_number || 'N/A'}
                          </span>
                        </div>

                        {isSelected && (
                          <div className="selected-check-pill">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              width="14"
                              height="14"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>Active</span>
                          </div>
                        )}
                      </div>

                      {/* Specialization */}
                      <div className="option-specialization">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          width="14"
                          height="14"
                        >
                          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                        <span>{doc.specialization || 'Clinical Specialist'}</span>
                      </div>

                      {/* Doctor Clinical Description */}
                      {doc.description && (
                        <p className="option-description">{doc.description}</p>
                      )}

                      {/* Meta Footer */}
                      <div className="option-footer-meta">
                        <span className="consult-time-tag">
                          ⏱ ~{doc.avg_consultation_minutes || 10} min / patient
                        </span>

                        {doc.todaySession ? (
                          <span className="session-token-tag">
                            Currently Serving #{doc.todaySession.current_token || 0}
                            {' · '}
                            {doc.todaySession.total_tokens || 0} registered
                          </span>
                        ) : (
                          <span className="session-token-tag session-ready">
                            ● Queue Ready
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Hidden Native Select for automated form testing & browser accessibility */}
      <select
        value={selectedDoctorId}
        onChange={(e) => onSelectDoctor(e.target.value)}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      >
        {doctors.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name} — {d.department}
          </option>
        ))}
      </select>
    </div>
  );
}

