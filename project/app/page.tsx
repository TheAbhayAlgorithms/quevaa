import type { Metadata } from 'next';
import Link from 'next/link';
import { ALL_DOCTORS_DIRECTORY } from '@/lib/doctors-data';
import { DoctorPortrait } from '@/components/DoctorSelect';

export const metadata: Metadata = {
  title: 'Quevaa — Smart Hospital OPD Queue',
  description:
    'Skip the chaos. Scan a QR code, get your token, and track your OPD queue position in real-time. No more waiting in crowded lobbies.',
};

export default function HomePage() {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <div className="nav-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span className="nav-title">Quevaa</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <a href="#specialists" className="btn btn-ghost btn-sm">
              Doctors
            </a>
            <Link href="/staff/login" className="btn btn-secondary btn-sm">
              Staff Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-gradient-1" />
          <div className="hero-gradient-2" />
          <div className="hero-grid-pattern" />
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Digital OPD Queue Management
          </div>

          <h1 className="hero-title">
            Skip the Chaos.
            <br />
            <span className="hero-title-accent">Track Your Turn</span>
            <br />
            in Real-Time.
          </h1>

          <p className="hero-subtitle">
            Scan a QR code, get your token instantly, and track your queue position
            live from your phone. No more crowded waiting rooms.
          </p>

          <div className="hero-actions">
            <Link href="/staff/login" className="btn btn-primary btn-lg">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Staff Login
            </Link>
            <a href="#specialists" className="btn btn-secondary btn-lg">
              Browse OPD Doctors ({ALL_DOCTORS_DIRECTORY.length})
            </a>
          </div>
        </div>
      </section>

      {/* OPD Doctors & Specialities Showcase */}
      <section id="specialists" style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="hero-badge" style={{ display: 'inline-flex', marginBottom: 12 }}>
            <span className="hero-badge-dot" />
            Quevaa General Hospital
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.5px', margin: 0 }}>
            Available Specialists & Doctors
          </h2>
          <p style={{ color: 'var(--gray-600)', fontSize: '15px', maxWidth: 640, margin: '10px auto 0', lineHeight: 1.6 }}>
            Each doctor room is equipped with an instant QR check-in point. Tap below to simulate scanning a room&apos;s QR code and receive your live queue token.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '20px' }}>
          {ALL_DOCTORS_DIRECTORY.map((doc) => (
            <div
              key={doc.id}
              className="glass-card"
              style={{
                padding: '24px',
                borderRadius: '20px',
                border: '1.5px solid var(--gray-200)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all var(--transition-base)',
                background: '#ffffff',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <DoctorPortrait
                    name={doc.name}
                    imageUrl={doc.image_url}
                    department={doc.department}
                    size={58}
                  />
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--gray-900)', margin: 0 }}>
                      {doc.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <span className="room-pill" style={{ fontSize: '11px', padding: '1px 7px' }}>
                        Room {doc.room_number}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: 500 }}>
                        ~{doc.avg_consultation_minutes} min
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-700)', marginBottom: 8 }}>
                  {doc.specialization}
                </div>

                <p style={{ fontSize: '12.5px', color: 'var(--gray-600)', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                  {doc.description}
                </p>
              </div>

              <div style={{ paddingTop: 14, borderTop: '1px dashed var(--gray-200)', display: 'flex', gap: 8 }}>
                <Link
                  href={`/check-in/${doc.id}`}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  Scan & Check In
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
