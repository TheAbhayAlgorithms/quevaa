'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DoctorPortrait } from '@/components/DoctorSelect';

// ===========================================
// Doctor Queue Page
// Simple, focused view for doctors to manage their queue
// ===========================================

interface Doctor {
  id: string;
  name: string;
  department: string | null;
  room_number: string | null;
  specialization?: string | null;
  description?: string | null;
  image_url?: string | null;
  avg_consultation_minutes?: number;
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
  patient: {
    name: string;
  };
}

export default function DoctorQueuePage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [currentToken, setCurrentToken] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [queueStatus, setQueueStatus] = useState('open');
  const [waitingEntries, setWaitingEntries] = useState<QueueEntry[]>([]);
  const [currentPatient, setCurrentPatient] = useState<QueueEntry | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const selectedDoctorRef = useRef('');
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    selectedDoctorRef.current = selectedDoctorId;
  }, [selectedDoctorId]);

  const router = useRouter();

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setAuthenticated(true);
          setLoading(false);
          return;
        }
      } catch {
        // Ignore Supabase error and check mock session
      }

      const mockSession = localStorage.getItem('quevaa_mock_staff');
      if (mockSession) {
        try {
          JSON.parse(mockSession);
          setAuthenticated(true);
        } catch {
          router.push('/staff/login');
        }
      } else {
        router.push('/staff/login');
      }
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  // Fetch doctors
  const fetchDoctors = useCallback(async () => {
    try {
      const res = await fetch('/api/doctors');
      const data = await res.json();
      if (data.success) {
        setDoctors(data.doctors);
        if (data.doctors.length > 0 && !selectedDoctorRef.current) {
          let targetId = '';
          if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const urlDocId = params.get('doctorId');
            if (urlDocId && data.doctors.some((d: Doctor) => d.id === urlDocId)) {
              targetId = urlDocId;
            } else {
              const stored = localStorage.getItem('quevaa_selected_doctor_id');
              if (stored && data.doctors.some((d: Doctor) => d.id === stored)) {
                targetId = stored;
              }
            }
          }
          setSelectedDoctorId(targetId || data.doctors[0].id);
        }
        return data.doctors as Doctor[];
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
    return [];
  }, []);

  // Refresh queue data
  const refreshQueue = useCallback(async () => {
    const docId = selectedDoctorRef.current;
    if (!docId) return;

    const freshDocs = await fetchDoctors();
    const doctor = freshDocs.find((d) => d.id === docId);
    if (!doctor?.todaySession) {
      setCurrentToken(0);
      setTotalTokens(0);
      setWaitingEntries([]);
      setCurrentPatient(null);
      return;
    }

    setCurrentToken(doctor.todaySession.current_token);
    setTotalTokens(doctor.todaySession.total_tokens);
    setQueueStatus(doctor.todaySession.status);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: entries } = await supabase
        .from('queue_entries')
        .select('*, patient:patients!inner(name)')
        .eq('session_id', doctor.todaySession.id)
        .order('token_number', { ascending: true });

      const all = (entries || []) as unknown as QueueEntry[];
      setWaitingEntries(all.filter((e) => e.status === 'waiting'));
      setCurrentPatient(all.find((e) => e.status === 'called') || null);
    } catch (err) {
      console.error('Error fetching entries:', err);
    }
  }, [fetchDoctors]);

  const debouncedRefresh = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => refreshQueue(), 300);
  }, [refreshQueue]);

  // Initial load
  useEffect(() => {
    if (authenticated) {
      fetchDoctors();
    }
  }, [authenticated, fetchDoctors]);

  useEffect(() => {
    if (selectedDoctorId) refreshQueue();
  }, [selectedDoctorId, refreshQueue]);

  // Realtime subscriptions
  useEffect(() => {
    if (!selectedDoctorId) return;
    const supabase = getSupabaseBrowserClient();

    const sessionChannel = supabase
      .channel(`doc-sessions-${selectedDoctorId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'queue_sessions',
        filter: `doctor_id=eq.${selectedDoctorId}`,
      }, () => debouncedRefresh())
      .subscribe();

    return () => { supabase.removeChannel(sessionChannel); };
  }, [selectedDoctorId, debouncedRefresh]);

  useEffect(() => {
    const doctor = doctors.find((d) => d.id === selectedDoctorId);
    const sessionId = doctor?.todaySession?.id;
    if (!sessionId) return;

    const supabase = getSupabaseBrowserClient();
    const entryChannel = supabase
      .channel(`doc-entries-${sessionId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'queue_entries',
        filter: `session_id=eq.${sessionId}`,
      }, () => debouncedRefresh())
      .subscribe();

    return () => { supabase.removeChannel(entryChannel); };
  }, [doctors, selectedDoctorId, debouncedRefresh]);

  const showNotif = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAction = async (action: string) => {
    const doctor = doctors.find((d) => d.id === selectedDoctorId);
    if (!doctor?.todaySession) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/queue/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: doctor.todaySession.id }),
      });
      const data = await res.json();
      if (data.success) {
        showNotif('success', action === 'next' ? 'Next patient called' : `${action} successful`);
        refreshQueue();
      } else {
        showNotif('error', data.error || `Failed: ${action}`);
      }
    } catch {
      showNotif('error', 'Network error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
    localStorage.removeItem('quevaa_mock_staff');
    router.push('/staff/login');
  };

  if (loading || !authenticated) {
    return (
      <div className="page-container">
        <div className="queue-status-loading">
          <div className="pulse-ring" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);
  const waitingCount = waitingEntries.length;

  return (
    <div className="page-container dashboard-page">
      {/* Nav */}
      <nav className="dashboard-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <Link href="/" className="nav-brand-link">
              <div className="nav-logo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <span className="nav-title">Quevaa</span>
            </Link>
            <span className="nav-divider" />
            <span className="nav-subtitle">Doctor View</span>
          </div>
          <div className="nav-right">
            <Link href="/staff/select-doctor" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Select Doctor
            </Link>
            <Link href="/staff/dashboard" className="btn btn-ghost btn-sm">
              Full Dashboard
            </Link>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Toast */}
      {notification && (
        <div className={`toast toast-${notification.type}`}>
          {notification.type === 'success' ? '✓' : '✕'} {notification.message}
        </div>
      )}

      <div className="dashboard-content">
        {/* Doctor Selection / Switch Option */}
        <div style={{ maxWidth: 640, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: '#fff', borderRadius: '16px', border: '1.5px solid var(--gray-200)', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-600)' }}>Active Doctor:</span>
            <strong style={{ fontSize: '14px', color: 'var(--gray-900)' }}>{selectedDoctor?.name || 'Loading...'}</strong>
            <span className="room-pill">Room {selectedDoctor?.room_number || 'N/A'}</span>
          </div>
          <Link
            href="/staff/select-doctor"
            className="btn btn-secondary btn-xs"
            style={{ gap: 4 }}
          >
            Change Doctor / View All →
          </Link>
        </div>

        {/* Hero: Current Token */}
        <div className="doctor-queue-hero">
          <div className="doctor-queue-info" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            {selectedDoctor && (
              <DoctorPortrait
                name={selectedDoctor.name}
                imageUrl={selectedDoctor.image_url}
                department={selectedDoctor.department}
                size={52}
              />
            )}
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>{selectedDoctor?.name}</h2>
              <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: 'var(--gray-600)' }}>
                {selectedDoctor?.department} · Room {selectedDoctor?.room_number || 'N/A'}
                {selectedDoctor?.specialization && ` · ${selectedDoctor.specialization}`}
              </p>
            </div>
          </div>

          <div className="doctor-queue-current">
            <span className="doctor-queue-label">Now Serving</span>
            <span className="doctor-queue-token">
              {currentToken > 0 ? `#${currentToken}` : '—'}
            </span>
            {currentPatient && (
              <span className="doctor-queue-patient-name">{currentPatient.patient.name}</span>
            )}
            <span className={`queue-status-badge queue-${queueStatus}`}>
              {queueStatus.charAt(0).toUpperCase() + queueStatus.slice(1)}
            </span>
          </div>

          <div className="doctor-queue-stats">
            <div className="doctor-stat">
              <span className="doctor-stat-value">{waitingCount}</span>
              <span className="doctor-stat-label">Waiting</span>
            </div>
            <div className="doctor-stat">
              <span className="doctor-stat-value">{totalTokens}</span>
              <span className="doctor-stat-label">Total Today</span>
            </div>
          </div>
        </div>

        {/* Main Action: Next Patient */}
        <div className="doctor-actions">
          <button
            onClick={() => handleAction('next')}
            disabled={actionLoading || queueStatus !== 'open' || waitingCount === 0}
            className="btn btn-primary btn-next-patient"
          >
            {actionLoading ? (
              <span className="spinner" />
            ) : queueStatus === 'closed' || (totalTokens > 0 && waitingCount === 0 && currentToken === 0) ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="28" height="28">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="28" height="28">
                <polygon points="5 4 15 12 5 20 5 4" />
                <line x1="19" y1="5" x2="19" y2="19" />
              </svg>
            )}
            {queueStatus === 'closed' || (totalTokens > 0 && waitingCount === 0 && currentToken === 0)
              ? 'All Patients Visited'
              : 'Next Patient'}
          </button>

          <div className="doctor-secondary-actions">
            <button
              onClick={() => handleAction('recall')}
              disabled={actionLoading || currentToken === 0}
              className="btn btn-secondary"
            >
              Recall
            </button>
            {queueStatus === 'open' ? (
              <button
                onClick={() => handleAction('pause')}
                disabled={actionLoading}
                className="btn btn-warning"
              >
                Pause
              </button>
            ) : queueStatus === 'paused' ? (
              <button
                onClick={() => handleAction('resume')}
                disabled={actionLoading}
                className="btn btn-success"
              >
                Resume
              </button>
            ) : null}
          </div>
        </div>

        {/* Waiting List */}
        {waitingEntries.length > 0 && (
          <div className="doctor-waiting-list">
            <h3 className="section-title">Up Next</h3>
            <div className="waiting-chips">
              {waitingEntries.slice(0, 10).map((entry) => (
                <div
                  key={entry.id}
                  className={`waiting-chip ${entry.priority ? 'waiting-chip-priority' : ''}`}
                >
                  <span className="waiting-chip-token">#{entry.token_number}</span>
                  <span className="waiting-chip-name">{entry.patient.name}</span>
                  {entry.priority && <span className="badge badge-priority">⭐</span>}
                </div>
              ))}
              {waitingEntries.length > 10 && (
                <div className="waiting-chip waiting-chip-more">
                  +{waitingEntries.length - 10} more
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
