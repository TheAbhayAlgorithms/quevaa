-- ===========================================
-- Quevaa — Seed Data
-- Run this after schema.sql in your Supabase SQL Editor
-- ===========================================

-- Insert a sample hospital
insert into hospitals (id, name, address, phone) values
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Quevaa General Hospital', '123 Medical Avenue, New Delhi, India 110001', '+91-11-2345-6789');

-- Insert sample doctors with rich specialisations, descriptions, and portrait images
insert into doctors (id, hospital_id, name, department, room_number, specialization, avg_consultation_minutes, description, image_url) values
  (
    'd1000001-0000-0000-0000-000000000001',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Dr. Priya Sharma',
    'General Medicine',
    '101',
    'Internal Medicine & Preventive Health',
    8,
    'Senior Consultant in Internal Medicine with 14+ years of clinical practice managing chronic adult conditions, metabolic disorders, hypertension, and preventive primary care.',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80'
  ),
  (
    'd1000001-0000-0000-0000-000000000002',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Dr. Rajesh Patel',
    'Orthopedics',
    '205',
    'Joint Replacement & Sports Injury',
    12,
    'Orthopedic & Joint Surgeon with extensive expertise in complex trauma management, sports injuries, knee & hip arthritis care, and spine mobility rehabilitation.',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80'
  ),
  (
    'd1000001-0000-0000-0000-000000000003',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Dr. Ananya Gupta',
    'Pediatrics',
    '310',
    'Child Healthcare & Neonatology',
    10,
    'Dedicated Pediatrician committed to gentle child healthcare, routine immunizations, developmental milestones, pediatric infectious diseases, and newborn wellness.',
    'https://images.unsplash.com/photo-1594824813973-8b8981c2f213?auto=format&fit=crop&w=400&q=80'
  ),
  (
    'd1000001-0000-0000-0000-000000000004',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Dr. Vikram Malhotra',
    'Cardiology',
    '304',
    'Interventional Cardiology & Heart Health',
    15,
    'Senior Interventional Cardiologist specializing in coronary artery disorders, heart failure management, arrhythmia screening, Echo/ECG diagnostics, and cardiovascular prevention.',
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80'
  ),
  (
    'd1000001-0000-0000-0000-000000000005',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Dr. Sunita Rao',
    'Dermatology',
    '112',
    'Clinical Dermatology & Trichology',
    10,
    'Consultant Dermatologist with specialized training in clinical dermatology, stubborn acne management, eczema, psoriasis, autoimmune skin disorders, and hair restoration therapies.',
    'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=400&q=80'
  ),
  (
    'd1000001-0000-0000-0000-000000000006',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Dr. Arvind Swaminathan',
    'Neurology',
    '415',
    'Neurology & Neuro-Rehabilitation',
    20,
    'Distinguished Neurologist with 16+ years of hospital experience treating chronic migraines, neuropathies, stroke recovery, epilepsy syndromes, Parkinson’s, and neuromuscular diseases.',
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80'
  ),
  (
    'd1000001-0000-0000-0000-000000000007',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Dr. Meera Nambiar',
    'Gynecology & Obstetrics',
    '218',
    'Women’s Health & Maternal-Fetal Care',
    12,
    'Consultant Obstetrician & Gynecologist dedicated to high-risk pregnancy monitoring, adolescent gynecological wellness, PCOS/PCOD therapy, and comprehensive maternal care.',
    'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=400&q=80'
  ),
  (
    'd1000001-0000-0000-0000-000000000008',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Dr. Rohan Das',
    'ENT (Otolaryngology)',
    '108',
    'Ear, Nose, Throat & Sinus Surgeon',
    8,
    'Senior ENT Surgeon providing diagnostic endoscopy for chronic sinusitis, allergic rhinitis, vertigo, hearing loss, pediatric adenoids, and throat infections.',
    'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=400&q=80'
  );

-- Note: Staff users must be created after the user signs up via Supabase Auth.
-- After creating a user in Supabase Auth, insert a corresponding staff_users record:
--
-- insert into staff_users (auth_user_id, email, name, role, hospital_id) values
--   ('<auth-user-uuid>', 'admin@quevaa.com', 'Admin User', 'admin', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');
