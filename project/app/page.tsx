import type { Metadata } from 'next';
import Link from 'next/link';

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
          </div>
        </div>
      </section>
    </div>
  );
}
