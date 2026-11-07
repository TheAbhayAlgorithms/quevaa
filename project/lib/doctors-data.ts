// ===========================================
// Quevaa — Comprehensive Doctors Directory & Metadata
// Rich clinical descriptions, specialisations, room numbers, and portrait images
// ===========================================

export interface DoctorProfile {
  id: string;
  hospital_id: string;
  name: string;
  department: string;
  room_number: string;
  specialization: string;
  avg_consultation_minutes: number;
  description: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

export const DEFAULT_HOSPITAL_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

export const ALL_DOCTORS_DIRECTORY: DoctorProfile[] = [
  {
    id: 'd1000001-0000-0000-0000-000000000001',
    hospital_id: DEFAULT_HOSPITAL_ID,
    name: 'Dr. Priya Sharma',
    department: 'General Medicine',
    room_number: '101',
    specialization: 'Internal Medicine & Preventive Health',
    avg_consultation_minutes: 8,
    description:
      'Senior Consultant in Internal Medicine with 14+ years of clinical practice managing chronic adult conditions, metabolic disorders, hypertension, and preventive primary care.',
    image_url:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
    is_active: true,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'd1000001-0000-0000-0000-000000000002',
    hospital_id: DEFAULT_HOSPITAL_ID,
    name: 'Dr. Rajesh Patel',
    department: 'Orthopedics',
    room_number: '205',
    specialization: 'Joint Replacement & Sports Injury',
    avg_consultation_minutes: 12,
    description:
      'Orthopedic & Joint Surgeon with extensive expertise in complex trauma management, sports injuries, knee & hip arthritis care, and spine mobility rehabilitation.',
    image_url:
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    is_active: true,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'd1000001-0000-0000-0000-000000000003',
    hospital_id: DEFAULT_HOSPITAL_ID,
    name: 'Dr. Ananya Gupta',
    department: 'Pediatrics',
    room_number: '310',
    specialization: 'Child Healthcare & Neonatology',
    avg_consultation_minutes: 10,
    description:
      'Dedicated Pediatrician committed to gentle child healthcare, routine immunizations, developmental milestones, pediatric infectious diseases, and newborn wellness.',
    image_url:
      'https://images.unsplash.com/photo-1594824813973-8b8981c2f213?auto=format&fit=crop&w=400&q=80',
    is_active: true,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'd1000001-0000-0000-0000-000000000004',
    hospital_id: DEFAULT_HOSPITAL_ID,
    name: 'Dr. Vikram Malhotra',
    department: 'Cardiology',
    room_number: '304',
    specialization: 'Interventional Cardiology & Heart Health',
    avg_consultation_minutes: 15,
    description:
      'Senior Interventional Cardiologist specializing in coronary artery disorders, heart failure management, arrhythmia screening, Echo/ECG diagnostics, and cardiovascular prevention.',
    image_url:
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
    is_active: true,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'd1000001-0000-0000-0000-000000000005',
    hospital_id: DEFAULT_HOSPITAL_ID,
    name: 'Dr. Sunita Rao',
    department: 'Dermatology',
    room_number: '112',
    specialization: 'Clinical Dermatology & Trichology',
    avg_consultation_minutes: 10,
    description:
      'Consultant Dermatologist with specialized training in clinical dermatology, stubborn acne management, eczema, psoriasis, autoimmune skin disorders, and hair restoration therapies.',
    image_url:
      'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=400&q=80',
    is_active: true,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'd1000001-0000-0000-0000-000000000006',
    hospital_id: DEFAULT_HOSPITAL_ID,
    name: 'Dr. Arvind Swaminathan',
    department: 'Neurology',
    room_number: '415',
    specialization: 'Neurology & Neuro-Rehabilitation',
    avg_consultation_minutes: 20,
    description:
      'Distinguished Neurologist with 16+ years of hospital experience treating chronic migraines, neuropathies, stroke recovery, epilepsy syndromes, Parkinson’s, and neuromuscular diseases.',
    image_url:
      'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
    is_active: true,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'd1000001-0000-0000-0000-000000000007',
    hospital_id: DEFAULT_HOSPITAL_ID,
    name: 'Dr. Meera Nambiar',
    department: 'Gynecology & Obstetrics',
    room_number: '218',
    specialization: 'Women’s Health & Maternal-Fetal Care',
    avg_consultation_minutes: 12,
    description:
      'Consultant Obstetrician & Gynecologist dedicated to high-risk pregnancy monitoring, adolescent gynecological wellness, PCOS/PCOD therapy, and comprehensive maternal care.',
    image_url:
      'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=400&q=80',
    is_active: true,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'd1000001-0000-0000-0000-000000000008',
    hospital_id: DEFAULT_HOSPITAL_ID,
    name: 'Dr. Rohan Das',
    department: 'ENT (Otolaryngology)',
    room_number: '108',
    specialization: 'Ear, Nose, Throat & Sinus Surgeon',
    avg_consultation_minutes: 8,
    description:
      'Senior ENT Surgeon providing diagnostic endoscopy for chronic sinusitis, allergic rhinitis, vertigo, hearing loss, pediatric adenoids, and throat infections.',
    image_url:
      'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=400&q=80',
    is_active: true,
    created_at: '2026-01-01T00:00:00.000Z',
  },
];

/**
 * Enriches a doctor object with fallback image and description if missing
 */
export function enrichDoctorProfile<T extends { id: string; name: string }>(
  doctor: T
): T & {
  description: string;
  image_url: string;
  specialization: string;
  room_number: string;
  department: string;
} {
  const match = ALL_DOCTORS_DIRECTORY.find((d) => d.id === doctor.id);
  const fallback = ALL_DOCTORS_DIRECTORY[0];

  return {
    ...doctor,
    department: (doctor as unknown as { department?: string }).department || match?.department || fallback.department,
    specialization:
      (doctor as unknown as { specialization?: string }).specialization || match?.specialization || fallback.specialization,
    room_number: (doctor as unknown as { room_number?: string }).room_number || match?.room_number || fallback.room_number,
    description: (doctor as unknown as { description?: string }).description || match?.description || fallback.description,
    image_url: (doctor as unknown as { image_url?: string }).image_url || match?.image_url || fallback.image_url,
  };
}
