import type { Metadata } from 'next';
import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase-server';
import { mockStore } from '@/lib/mock-store';
import type { Doctor } from '@/types/database';

export const metadata: Metadata = {
  title: 'Patient OPD Check-In | Quevaa',
  description: 'Select your doctor to check in and join the OPD queue in real-time.',
};

export default async function CheckInDirectoryPage() {
  let doctors: Doctor[] = [];

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (!error && data && data.length > 0) {
      doctors = data;
    }
  } catch (e) {
    console.warn('Supabase query error in check-in directory:', e);
  }

  if (doctors.length === 0) {
    doctors = mockStore.getDoctors();
  }

  return (
    <div className="page-container checkin-page">
      <div className="checkin-wrapper" style={{ maxWidth: '800px' }}>
        {/* Header */}
        <div className="checkin-header">
          <Link href="/" className="back-link" title="Back to Home">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </Link>
          <div className="checkin-header-text">
            <p className="hospital-label">Quevaa OPD</p>
            <h1>Select Doctor for Check-In</h1>
          </div>
        </div>

        <p style={{ color: 'var(--gray-600)', marginBottom: '24px', fontSize: '15px' }}>
          Select your OPD doctor below to check in via 6-digit Mobile OTP and receive your live queue token.
        </p>

        <div className="doctor-cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {doctors.map((doc) => (
            <div key={doc.id} className="doctor-checkin-card">
              <div className="doc-avatar-circle">
                {doc.department?.toLowerCase().includes('pediatric')
                  ? '👶'
                  : doc.department?.toLowerCase().includes('ortho')
                  ? '🦴'
                  : '🩺'}
              </div>
              <h3>{doc.name}</h3>
              <p className="doc-dept-badge">
                {doc.department || 'OPD'} · Room {doc.room_number || '101'}
              </p>
              <p className="doc-note">{doc.specialization || 'Consultant'}</p>
              <Link href={`/check-in/${doc.id}`} className="btn btn-primary btn-sm btn-full">
                Scan / Check-in via OTP
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
