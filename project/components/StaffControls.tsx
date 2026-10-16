'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import QRCodeDisplay from './QRCodeDisplay';

// ===========================================
// StaffControls Component
// Full staff dashboard with queue management
// ===========================================

interface Doctor {
  id: string;
  name: string;
  department: string | null;
  room_number: string | null;
  avg_consultation_minutes: number;
  todaySession: {
    id: string;
    current_token: number;
    total_tokens: number;
    status: string;
  } | null;
}

interface QueueEntry {
  id: string;
  token_number: number;
  status: string;
  priority: boolean;
  tracking_token: string;
  created_at: string;
  called_at: string | null;
  completed_at: string | null;
  patient: {
    id: string;
    name: string;
    phone: string;
  };
}

interface DashboardData {
  session: {
    id: string;
    current_token: number;
    total_tokens: number;
    status: string;
    doctor: Doctor;
  };
  entries: QueueEntry[];
  waitingCount: number;
  completedCount: number;
  totalCount: number;
}

export default function StaffControls() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Refs to avoid dependency cycles in callbacks
  const doctorsRef = useRef<Doctor[]>([]);
  const selectedDoctorRef = useRef<string>('');
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasFetchedOnce = useRef(false);

  useEffect(() => {
    doctorsRef.current = doctors;
  }, [doctors]);

  useEffect(() => {
    selectedDoctorRef.current = selectedDoctorId;
  }, [selectedDoctorId]);

  // Fetch fresh doctors list from API
  const fetchDoctors = useCallback(async (): Promise<Doctor[]> => {
    try {
      const res = await fetch('/api/doctors');
      const data = await res.json();
      if (data.success && data.doctors) {
        setDoctors(data.doctors);
        return data.doctors as Doctor[];
      }
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    }
    return doctorsRef.current;
  }, []);

  // Fetch dashboard entries for the current doctor — subtle (no loading spinner)
  const refreshDashboard = useCallback(async () => {
    const docId = selectedDoctorRef.current;
    if (!docId) return;

    // Always re-fetch doctors to pick up new sessions
    const freshDoctors = await fetchDoctors();
    const doctor = freshDoctors.find((d) => d.id === docId);

    if (!doctor?.todaySession) {
      setDashboard(null);
      setInitialLoading(false);
      return;
    }

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: entries } = await supabase
        .from('queue_entries')
        .select('*, patient:patients!inner(*)')
        .eq('session_id', doctor.todaySession.id)
        .order('token_number', { ascending: true });

      const allEntries = (entries || []) as unknown as QueueEntry[];

      setDashboard({
        session: {
          ...doctor.todaySession,
          doctor: doctor,
        },
        entries: allEntries,
        waitingCount: allEntries.filter((e) => e.status === 'waiting').length,
        completedCount: allEntries.filter((e) => e.status === 'completed').length,
        totalCount: allEntries.length,
      });
    } catch (err) {
      console.error('Dashboard refresh error:', err);
    } finally {
      setInitialLoading(false);
      hasFetchedOnce.current = true;
    }
  }, [fetchDoctors]);

  // Debounced refresh — prevents rapid-fire updates from realtime
  const debouncedRefresh = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => {
      refreshDashboard();
    }, 300);
  }, [refreshDashboard]);

  // Initial load: fetch doctors and select first one
  useEffect(() => {
    const init = async () => {
      const docs = await fetchDoctors();
      if (docs.length > 0 && !selectedDoctorRef.current) {
        setSelectedDoctorId(docs[0].id);
      }
      setInitialLoading(false);
    };
    init();
  }, [fetchDoctors]);

  // Re-fetch dashboard when selected doctor changes
  useEffect(() => {
    if (selectedDoctorId) {
      setInitialLoading(!hasFetchedOnce.current);
      refreshDashboard();
    }
  }, [selectedDoctorId, refreshDashboard]);

  // Realtime: listen for session changes for the selected doctor
  useEffect(() => {
    if (!selectedDoctorId) return;

    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel(`staff-doctor-${selectedDoctorId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_sessions',
          filter: `doctor_id=eq.${selectedDoctorId}`,
        },
        () => debouncedRefresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDoctorId, debouncedRefresh]);

  // Realtime: listen for queue entry changes when session exists
  useEffect(() => {
    const sessionId = dashboard?.session?.id;
    if (!sessionId) return;

    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel(`staff-entries-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_entries',
          filter: `session_id=eq.${sessionId}`,
        },
        () => debouncedRefresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dashboard?.session?.id, debouncedRefresh]);

  const showNotif = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Staff actions
  const performAction = async (action: string, extraBody?: Record<string, unknown>) => {
    if (!dashboard?.session?.id) return;
    setActionLoading(action);

    try {
      const response = await fetch(`/api/queue/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: dashboard.session.id,
          ...extraBody,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (action === 'next' && data.isTerminated) {
          showNotif('success', 'All patients have been visited! The queue is now terminated.');
        } else {
          showNotif('success', `${action.charAt(0).toUpperCase() + action.slice(1)} successful`);
        }
        refreshDashboard();
      } else {
        showNotif('error', data.error || `Failed to ${action}`);
      }
    } catch {
      showNotif('error', `Network error during ${action}`);
    } finally {
      setActionLoading(null);
    }
  };

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  const allVisited = Boolean(
    dashboard &&
    dashboard.totalCount > 0 &&
    dashboard.waitingCount === 0 &&
    !dashboard.entries.some((e) => e.status === 'called')
  );

  const isTerminated = Boolean(
    dashboard && (dashboard.session.status === 'closed' || allVisited)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'badge-waiting';
      case 'called': return 'badge-called';
      case 'completed': return 'badge-completed';
      case 'skipped': return 'badge-skipped';
      default: return 'badge-default';
    }
  };

  return (
    <div className="staff-controls">
      {/* Notification Toast */}
      {notification && (
        <div className={`toast toast-${notification.type}`}>
          {notification.type === 'success' ? '✓' : '✕'} {notification.message}
        </div>
      )}

      {/* Doctor Selector */}
      <div className="staff-header">
        <div className="doctor-select-wrapper">
          <label htmlFor="doctor-select" className="form-label">
            Select Doctor
          </label>
          <select
            id="doctor-select"
            className="form-select"
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
          >
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} — {doc.department || 'General'} (Room {doc.room_number || 'N/A'})
              </option>
            ))}
          </select>
        </div>

        <div className="staff-header-actions">
          <button
            onClick={() => setShowQR(!showQR)}
            className="btn btn-secondary btn-sm"
          >
            {showQR ? 'Hide QR' : 'Show QR Code'}
          </button>
        </div>
      </div>

      {/* QR Code Panel */}
      {showQR && selectedDoctor && (
        <QRCodeDisplay
          doctorId={selectedDoctor.id}
          doctorName={selectedDoctor.name}
          department={selectedDoctor.department || 'General'}
          roomNumber={selectedDoctor.room_number || 'N/A'}
        />
      )}

      {/* Loading State */}
      {initialLoading && (
        <div className="staff-loading">
          <div className="spinner" />
          <p>Loading dashboard...</p>
        </div>
      )}

      {/* No Session */}
      {!initialLoading && !dashboard && selectedDoctor && (
        <div className="no-session-card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <h3>No Queue Session Today</h3>
          <p>A queue session will be automatically created when the first patient checks in.</p>
        </div>
      )}

      {/* Dashboard */}
      {dashboard && (
        <>
          {/* Stats Row */}
          <div className="stats-grid">
            <div className="stat-card stat-current">
              <span className="stat-label">Current Token</span>
              <span className="stat-value">#{dashboard.session.current_token || '—'}</span>
            </div>
            <div className="stat-card stat-next">
              <span className="stat-label">Next Token</span>
              <span className="stat-value">
                #{(dashboard.session.current_token || 0) + 1 <= dashboard.session.total_tokens
                  ? (dashboard.session.current_token || 0) + 1
                  : '—'}
              </span>
            </div>
            <div className="stat-card stat-waiting">
              <span className="stat-label">Waiting</span>
              <span className="stat-value">{dashboard.waitingCount}</span>
            </div>
            <div className="stat-card stat-completed">
              <span className="stat-label">Completed</span>
              <span className="stat-value">{dashboard.completedCount}</span>
            </div>
            <div className="stat-card stat-total">
              <span className="stat-label">Total</span>
              <span className="stat-value">{dashboard.totalCount}</span>
            </div>
            <div className={`stat-card stat-status queue-${isTerminated ? 'closed' : dashboard.session.status}`}>
              <span className="stat-label">Queue Status</span>
              <span className="stat-value capitalize">{isTerminated ? 'Terminated' : dashboard.session.status}</span>
              {isTerminated && (
                <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                  All patients visited
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              onClick={() => performAction('next')}
              disabled={actionLoading !== null || isTerminated || dashboard.session.status !== 'open'}
              className="btn btn-primary btn-action"
            >
              {actionLoading === 'next' ? (
                <span className="spinner-sm" />
              ) : isTerminated ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <polygon points="5 4 15 12 5 20 5 4" />
                  <line x1="19" y1="5" x2="19" y2="19" />
                </svg>
              )}
              {isTerminated ? 'All Patients Visited' : 'Next Patient'}
            </button>

            {!isTerminated && dashboard.session.status === 'open' ? (
              <button
                onClick={() => performAction('pause')}
                disabled={actionLoading !== null}
                className="btn btn-warning btn-action"
              >
                {actionLoading === 'pause' ? <span className="spinner-sm" /> : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                )}
                Pause Queue
              </button>
            ) : !isTerminated && dashboard.session.status === 'paused' ? (
              <button
                onClick={() => performAction('resume')}
                disabled={actionLoading !== null}
                className="btn btn-success btn-action"
              >
                {actionLoading === 'resume' ? <span className="spinner-sm" /> : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
                Resume Queue
              </button>
            ) : null}

            <button
              onClick={() => performAction('recall')}
              disabled={actionLoading !== null}
              className="btn btn-secondary btn-action"
            >
              {actionLoading === 'recall' ? <span className="spinner-sm" /> : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
              )}
              Recall
            </button>
          </div>

          {/* Queue List */}
          <div className="queue-list-section">
            <h3 className="section-title">Patient Queue</h3>

            {/* Terminated & All Patients Visited Alert */}
            {isTerminated && dashboard.entries.length > 0 && (
              <div
                className="all-patients-visited-banner"
                style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                  border: '1px solid #86efac',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  color: '#166534',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#22c55e',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '18px',
                    flexShrink: 0,
                  }}
                >
                  ✓
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#14532d' }}>
                    All Patients Have Been Visited
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#166534' }}>
                    The OPD queue has successfully completed and is automatically terminated.
                  </p>
                </div>
              </div>
            )}

            {dashboard.entries.length === 0 ? (
              <p className="empty-queue">No patients in queue yet.</p>
            ) : (
              <div className="queue-table-wrapper">
                <table className="queue-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Patient</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Time</th>
                      <th>Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.entries.map((entry) => (
                      <tr
                        key={entry.id}
                        className={`queue-row ${entry.status === 'called' ? 'row-active' : ''} ${entry.priority ? 'row-priority' : ''}`}
                      >
                        <td className="token-cell">#{entry.token_number}</td>
                        <td>{entry.patient.name}</td>
                        <td className="phone-cell">{entry.patient.phone}</td>
                        <td>
                          <span className={`badge ${getStatusColor(entry.status)}`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="time-cell">
                          {new Date(entry.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td>
                          {entry.priority && (
                            <span className="badge badge-priority">⭐ Priority</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
