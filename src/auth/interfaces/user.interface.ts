export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  ktp_number?: string;
  ktp_verified: boolean;
  selfie_verified: boolean;
  profile_picture?: string;
  address?: string;
  emergency_contacts?: Record<string, any>;
  reputation_score: number;
  balance: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}