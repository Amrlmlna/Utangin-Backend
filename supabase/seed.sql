-- Seed data for UTANGIN database

-- Insert sample users first (referenced by other tables)
INSERT INTO users (id, email, phone, name, ktp_number, ktp_verified, selfie_verified, reputation_score, balance, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'lender@example.com', '+6281234567890', 'Lender Example', '1111111111111111', true, true, 95, 5000000, NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'borrower@example.com', '+6281234567891', 'Borrower Example', '2222222222222222', true, true, 85, 1000000, NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'admin@example.com', '+6281234567892', 'Admin User', '3333333333333333', true, true, 100, 10000000, NOW(), NOW());

-- Insert sample agreements
INSERT INTO agreements (id, lender_id, borrower_id, amount, interest_rate, due_date, status, lender_confirmed, borrower_confirmed, created_at, updated_at) VALUES
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 2500000, 5.0, '2025-12-31', 'active', true, true, NOW(), NOW()),
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 1500000, 3.5, '2025-11-30', 'pending', false, false, NOW(), NOW()),
('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 3000000, 7.0, '2026-01-15', 'overdue', true, true, NOW() - INTERVAL '10 days', NOW());

-- Insert sample obligations
INSERT INTO obligations (id, agreement_id, amount, due_date, status, created_at, updated_at) VALUES
('77777777-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444', 1250000, '2025-06-30', 'paid', NOW() - INTERVAL '6 months', NOW() - INTERVAL '6 months'),
('88888888-8888-8888-8888-888888888888', '44444444-4444-4444-4444-444444444444', 1250000, '2025-12-31', 'pending', NOW() - INTERVAL '6 months', NOW() - INTERVAL '6 months'),
('99999999-9999-9999-9999-999999999999', '55555555-5555-5555-5555-555555555555', 1500000, '2025-11-30', 'pending', NOW(), NOW());

-- Insert sample identity verifications
INSERT INTO identity_verifications (id, user_id, document_type, document_number, verification_status, created_at) VALUES
('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', 'KTP', '1111111111111111', 'approved', NOW() - INTERVAL '1 year'),
('10000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'KTP', '2222222222222222', 'approved', NOW() - INTERVAL '1 year');

-- Insert sample ratings
INSERT INTO ratings (id, user_id, rater_id, agreement_id, rating, review, created_at) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 5, 'Peminjam sangat bertanggung jawab dan membayar tepat waktu', NOW() - INTERVAL '6 months'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 5, 'Pemberi pinjaman sangat membantu dan profesional', NOW() - INTERVAL '6 months');

-- Insert sample notifications
INSERT INTO notifications (id, user_id, agreement_id, type, title, message, delivery_method, created_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'payment', 'Pembayaran Diterima', 'Terima kasih telah melakukan pembayaran. Sisa pembayaran: Rp. 1.250.000', 'push', NOW() - INTERVAL '6 months'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'reminder', 'Pengingat Pembayaran', 'Pembayaran utang Anda akan jatuh tempo dalam 3 hari.', 'push', NOW()),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'reminder', 'Pembayaran Terlambat', 'Pembayaran utang Anda telah melewati batas waktu jatuh tempo.', 'push', NOW() - INTERVAL '5 days');