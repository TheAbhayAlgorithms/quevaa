'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { ALL_DOCTORS_DIRECTORY, DoctorProfile } from '@/lib/doctors-data';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

interface DoctorWithSession extends DoctorProfile {
  todaySession?: {
    id: string;
    current_token: number;
    total_tokens: number;
    status: string;
  } | null;
}

export default function SelectDoctorPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<DoctorWithSession[]>(ALL_DOCTORS_DIRECTORY);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Selected doctor for QR Code modal
  const [modalDoctor, setModalDoctor] = useState<DoctorWithSession | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Authentication gating
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [staffEmail, setStaffEmail] = useState<string>('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setAuthenticated(true);
          setStaffEmail(session.user.email || 'Staff');
          setAuthChecking(false);
          return;
        }
      } catch {
        // Ignore Supabase error and check mock session
      }

      const mock = localStorage.getItem('quevaa_mock_staff');
      if (mock) {
        try {
          const parsed = JSON.parse(mock);
          setAuthenticated(true);
          setStaffEmail(parsed.email || 'Staff');
          setAuthChecking(false);
          return;
        } catch {
          router.push('/staff/login');
        }
      } else {
        router.push('/staff/login');
      }
      setAuthChecking(false);
    };
    checkAuth();
  }, [router]);

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

  // Fetch doctors and live sessions
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch('/api/doctors');
        const data = await res.json();
        if (data.success && data.doctors && data.doctors.length > 0) {
          setDoctors(data.doctors);
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Department filter chips
  const departments = useMemo(() => {
    const set = new Set<string>();
    doctors.forEach((d) => {
      if (d.department) set.add(d.department);
    });
    return ['All', ...Array.from(set)];
  }, [doctors]);

  // Filtered doctors list
  const filteredDoctors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return doctors.filter((doc) => {
      if (selectedDeptFilter !== 'All' && doc.department !== selectedDeptFilter) {
        return false;
      }
      if (!q) return true;
      return (
        doc.name.toLowerCase().includes(q) ||
        doc.department.toLowerCase().includes(q) ||
        doc.specialization.toLowerCase().includes(q) ||
        doc.description.toLowerCase().includes(q) ||
        doc.room_number.toLowerCase().includes(q)
      );
    });
  }, [doctors, searchQuery, selectedDeptFilter]);

  // Generate QR code when a doctor is selected in the modal
  useEffect(() => {
    if (!modalDoctor) {
      setQrDataUrl('');
      return;
    }

    const checkInUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/check-in/${modalDoctor.id}`
        : `https://quevaa.vercel.app/check-in/${modalDoctor.id}`;

    QRCode.toDataURL(checkInUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#1a1a2e',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, [modalDoctor]);

  const handleSelectDoctor = (doctor: DoctorWithSession) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('quevaa_selected_doctor_id', doctor.id);
    }
    setModalDoctor(doctor);
  };

  const handleCopyLink = () => {
    if (!modalDoctor) return;
    const checkInUrl = `${window.location.origin}/check-in/${modalDoctor.id}`;
    navigator.clipboard.writeText(checkInUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handlePrint = () => {
    if (!modalDoctor || !qrDataUrl) return;
    const checkInUrl = `${window.location.origin}/check-in/${modalDoctor.id}`;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>OPD Check-In QR Poster — ${modalDoctor.name}</title>
        <style>
          body {
            display: flex; flex-direction: column; align-items: center;
            justify-content: center; min-height: 100vh; font-family: 'Inter', system-ui, sans-serif;
            margin: 0; padding: 40px; background: #fff; color: #1e293b;
          }
          .hospital-tag { font-size: 14px; font-weight: 700; color: #16a34a; text-transform: uppercase; letter-spacing: 2px; }
          .title { font-size: 32px; font-weight: 800; color: #0f172a; margin: 8px 0 4px; }
          .specialty { font-size: 18px; color: #475569; margin: 0 0 8px; font-weight: 600; }
          .room-badge { display: inline-block; padding: 6px 16px; background: #f1f5f9; border-radius: 9999px; font-size: 15px; font-weight: 700; color: #334155; margin-bottom: 24px; }
          .qr-box { padding: 24px; border: 3px solid #0f172a; border-radius: 24px; background: #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
          .scan-banner { font-size: 20px; font-weight: 700; color: #16a34a; margin-top: 24px; }
          .instructions { font-size: 14px; color: #64748b; max-width: 380px; text-align: center; line-height: 1.5; margin-top: 8px; }
          .url-hint { font-size: 12px; color: #94a3b8; margin-top: 16px; font-family: monospace; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="hospital-tag">Quevaa General Hospital • OPD</div>
        <h1 class="title">${modalDoctor.name}</h1>
        <p class="specialty">${modalDoctor.department} · ${modalDoctor.specialization}</p>
        <div class="room-badge">Consultation Room ${modalDoctor.room_number}</div>
        <div class="qr-box">
          <img src="${qrDataUrl}" alt="Check-in QR Code" width="280" height="280" />
        </div>
        <p class="scan-banner">📱 Scan with Phone Camera to Check In</p>
        <p class="instructions">
          No application download required. Scan the code to verify your mobile number, receive your digital token, and track your turn live.
        </p>
        <p class="url-hint">${checkInUrl}</p>
        <script>window.onload = () => window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleProceedToDashboard = (doctorId: string) => {
    router.push(`/staff/dashboard?doctorId=${doctorId}&showQR=true`);
  };

  const handleProceedToDoctorView = (doctorId: string) => {
    router.push(`/staff/doctor?doctorId=${doctorId}`);
  };

  if (authChecking) {
    return (
      <div className="page-container">
        <div className="queue-status-loading">
          <div className="pulse-ring" />
          <p>Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) return null;

  return (
    <div className="page-container select-doctor-page" style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      {/* Navigation Bar */}
      <nav className="dashboard-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <Link href="/staff/dashboard" className="nav-brand-link">
              <div className="nav-logo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <span className="nav-title">Quevaa</span>
            </Link>
            <span className="nav-badge">Select Doctor</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {staffEmail && (
              <span style={{ fontSize: '13px', color: 'var(--gray-600)', fontWeight: 500 }}>
                {staffEmail}
              </span>
            )}
            <Link href="/staff/dashboard" className="btn btn-secondary btn-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Dashboard
            </Link>
            <Link href="/staff/doctor" className="btn btn-ghost btn-sm">
              Doctor Room View
            </Link>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm" title="Log out">
              Log Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Page Content */}
      <div className="dashboard-content" style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 20px 80px' }}>
        {/* Header Hero */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div className="hero-badge" style={{ display: 'inline-flex', marginBottom: 12 }}>
            <span className="hero-badge-dot" />
            Hospital OPD Directory
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.5px', margin: 0 }}>
            Select a Doctor
          </h1>
          <p style={{ color: 'var(--gray-600)', fontSize: '15px', maxWidth: 660, margin: '10px auto 0', lineHeight: 1.6 }}>
            Select any specialist below to view and print their room QR code poster, test mobile check-ins, or manage today&apos;s patient queue.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div
          className="glass-card"
          style={{
            padding: '16px 20px',
            borderRadius: '16px',
            marginBottom: '30px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            background: '#ffffff',
            border: '1.5px solid var(--gray-200)',
          }}
        >
          {/* Search Input */}
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
              type="text"
              placeholder="Search doctors by name, department, specialization, room, or symptoms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="dropdown-search-input"
              style={{ fontSize: '15px', padding: '12px 38px 12px 42px' }}
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

          {/* Department Filter Chips */}
          <div className="dept-filter-chips" style={{ padding: '4px 0 2px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
            {departments.map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDeptFilter(dept)}
                className={`dept-chip ${selectedDeptFilter === dept ? 'dept-chip-active' : ''}`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Doctors Grid */}
        {filteredDoctors.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', background: '#fff' }}>
            <p style={{ fontSize: '16px', color: 'var(--gray-600)', margin: 0 }}>
              No doctors found matching &ldquo;{searchQuery}&rdquo;
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDeptFilter('All');
              }}
              className="btn btn-secondary btn-sm"
              style={{ marginTop: 16 }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="doctor-info-card"
                onClick={() => handleSelectDoctor(doc)}
              >
                {/* Header Information: Name, Room, Specialization, Department */}
                <div className="doc-info-header">
                  <div className="doc-info-title-row">
                    <h3 className="doc-info-name">{doc.name}</h3>
                    <span className="doc-info-room-badge">
                      Room {doc.room_number || 'N/A'}
                    </span>
                  </div>

                  <div className="doc-info-spec">
                    {doc.specialization || 'Clinical Specialist'}
                  </div>

                  <div className="doc-info-dept-badge">
                    {doc.department || 'GENERAL MEDICINE'}
                  </div>
                </div>

                {/* Professional Doctor Bio / Description */}
                <p className="doc-info-desc">
                  {doc.description || `Specialist in ${doc.department} providing dedicated patient consultation and clinical care.`}
                </p>

                {/* Dotted Divider */}
                <div className="doc-info-divider" />

                {/* Metadata Row: Consultation Duration & Queue Availability */}
                <div className="doc-info-meta-row">
                  <span className="doc-info-consultation">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13" style={{ display: 'inline', verticalAlign: '-1px', marginRight: 5 }}>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    ~{doc.avg_consultation_minutes || 10} min consultation
                  </span>

                  <span className="doc-info-status">
                    <span className="doc-info-status-dot" />
                    {doc.todaySession
                      ? `Token #${doc.todaySession.current_token || 0} / ${doc.todaySession.total_tokens || 0}`
                      : 'Queue Open'}
                  </span>
                </div>

                {/* Action Buttons: Clean Green QR Action + Dashboard Secondary */}
                <div className="doc-info-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => handleSelectDoctor(doc)}
                    className="btn-doc-qr"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="15" height="15">
                      <rect x="3" y="3" width="7" height="7" rx="1.5" />
                      <rect x="14" y="3" width="7" height="7" rx="1.5" />
                      <rect x="14" y="14" width="7" height="7" rx="1.5" />
                      <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    </svg>
                    Select & View QR
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem('quevaa_selected_doctor_id', doc.id);
                      handleProceedToDashboard(doc.id);
                    }}
                    className="btn-doc-dashboard"
                    title="Directly manage this doctor's queue on dashboard"
                  >
                    Dashboard →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===========================================
          QR Code Option Modal (Shown After Selection)
          =========================================== */}
      {modalDoctor && (
        <div
          className="qr-modal-overlay"
          onClick={() => setModalDoctor(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            animation: 'fadeIn 180ms ease-out',
          }}
        >
          <div
            className="qr-modal-dialog glass-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              maxWidth: 500,
              width: '100%',
              padding: '30px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
              position: 'relative',
              animation: 'modalPop 220ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setModalDoctor(null)}
              className="modal-close-btn"
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--gray-100)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gray-600)',
              }}
              title="Close modal"
            >
              ✕
            </button>

            {/* Modal Header: Clean text information with room, department, and specialization */}
            <div style={{ marginBottom: 20, paddingRight: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                <span className="doc-info-dept-badge" style={{ margin: 0 }}>
                  {modalDoctor.department || 'GENERAL MEDICINE'}
                </span>
                <span className="doc-info-room-badge">
                  Room {modalDoctor.room_number || 'N/A'}
                </span>
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--gray-900)', margin: '0 0 4px 0' }}>
                {modalDoctor.name}
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#16a34a', fontWeight: 600 }}>
                {modalDoctor.specialization || 'Clinical Specialist'}
              </p>
              {modalDoctor.description && (
                <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: 'var(--gray-600)', lineHeight: '1.5' }}>
                  {modalDoctor.description}
                </p>
              )}
            </div>

            {/* QR Code Presentation Box */}
            <div
              style={{
                background: 'var(--gray-50)',
                border: '2px dashed var(--gray-300)',
                borderRadius: '20px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Code for ${modalDoctor.name}`}
                  style={{
                    width: 220,
                    height: 220,
                    borderRadius: 12,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    background: '#fff',
                    padding: 8,
                  }}
                />
              ) : (
                <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="spinner" />
                </div>
              )}

              <p style={{ margin: '14px 0 0', fontSize: '13px', fontWeight: 600, color: 'var(--gray-700)' }}>
                📱 Scan with camera to join OPD queue
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--gray-500)', textAlign: 'center' }}>
                Display outside Room {modalDoctor.room_number} for instant patient registration
              </p>
            </div>

            {/* Quick Actions (Print, Copy, Test) */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <button
                type="button"
                onClick={handlePrint}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, justifyContent: 'center', gap: 6 }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Print Poster
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, justifyContent: 'center', gap: 6 }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                {copySuccess ? 'Copied ✓' : 'Copy URL'}
              </button>

              <a
                href={`/check-in/${modalDoctor.id}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost btn-sm"
                title="Open patient check-in page in new tab"
                style={{ padding: '8px 12px' }}
              >
                Test ↗
              </a>
            </div>

            {/* Forward to Queue Dashboard or Room View */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                onClick={() => handleProceedToDashboard(modalDoctor.id)}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', fontSize: '15px', padding: '12px' }}
              >
                Manage Queue on Staff Dashboard →
              </button>

              <button
                type="button"
                onClick={() => handleProceedToDoctorView(modalDoctor.id)}
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Open in Doctor Consultation Room View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

