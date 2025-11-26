import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

export interface QRCodePayload {
  agreement_id: string;
  lender_id: string;
  borrower_id: string;
  timestamp: number;
  verification_code: string;
}

@Injectable()
export class QrService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Key must be provided');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async generateQRCode(agreementId: string): Promise<{ qr_code_url: string; qr_code_data: string }> {
    // Fetch agreement details to include in QR payload
    const { data: agreement, error } = await this.supabase
      .from('agreements')
      .select('*')
      .eq('id', agreementId)
      .single();

    if (error || !agreement) {
      throw new Error('Agreement not found');
    }

    // Create QR payload
    const payload: QRCodePayload = {
      agreement_id: agreement.id,
      lender_id: agreement.lender_id,
      borrower_id: agreement.borrower_id,
      timestamp: Date.now(),
      verification_code: this.generateVerificationCode(agreement.id),
    };

    // Convert payload to JSON string
    const qrData = JSON.stringify(payload);

    // Generate QR code image
    const qrCodeUrl = await QRCode.toDataURL(qrData);

    // Update agreement with QR code reference
    await this.supabase
      .from('agreements')
      .update({ qr_code: `qr_${agreementId}` })
      .eq('id', agreementId);

    return {
      qr_code_url: qrCodeUrl,
      qr_code_data: qrData,
    };
  }

  async verifyQRCode(qrData: string): Promise<QRCodePayload> {
    try {
      const payload: QRCodePayload = JSON.parse(qrData);

      // Verify the payload is valid
      if (!payload.agreement_id || !payload.lender_id || !payload.borrower_id) {
        throw new Error('Invalid QR code payload');
      }

      // Check if agreement exists
      const { data: agreement, error } = await this.supabase
        .from('agreements')
        .select('*')
        .eq('id', payload.agreement_id)
        .single();

      if (error || !agreement) {
        throw new Error('Agreement not found');
      }

      // Check if the verification code matches
      const expectedVerificationCode = this.generateVerificationCode(payload.agreement_id);
      if (payload.verification_code !== expectedVerificationCode) {
        throw new Error('Invalid verification code');
      }

      // Check if QR code has expired (valid for 1 hour)
      const now = Date.now();
      const qrTimestamp = payload.timestamp;
      if (now - qrTimestamp > 3600000) { // 1 hour in milliseconds
        throw new Error('QR code has expired');
      }

      return payload;
    } catch (error) {
      throw new Error(`QR code verification failed: ${error.message}`);
    }
  }

  async validateAndConfirmAgreement(qrData: string, confirmedBy: 'lender' | 'borrower'): Promise<boolean> {
    try {
      const payload = await this.verifyQRCode(qrData);

      // Check if agreement already confirmed by the same party
      const { data: agreement, error: fetchError } = await this.supabase
        .from('agreements')
        .select('*')
        .eq('id', payload.agreement_id)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (confirmedBy === 'lender' && agreement.lender_confirmed) {
        throw new Error('Agreement already confirmed by lender');
      }

      if (confirmedBy === 'borrower' && agreement.borrower_confirmed) {
        throw new Error('Agreement already confirmed by borrower');
      }

      // Update the agreement to mark it as confirmed by the appropriate party
      const updateField = confirmedBy === 'lender' ? 'lender_confirmed' : 'borrower_confirmed';

      const { error: updateError } = await this.supabase
        .from('agreements')
        .update({
          [updateField]: true,
          status: agreement.lender_confirmed || agreement.borrower_confirmed ? 'active' : 'pending'
        })
        .eq('id', payload.agreement_id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      return true;
    } catch (error) {
      throw new Error(`Agreement confirmation failed: ${error.message}`);
    }
  }

  private generateVerificationCode(agreementId: string): string {
    // Create a simple verification code based on the agreement ID and timestamp
    const timestamp = Date.now().toString();
    const baseString = agreementId + timestamp;

    // Simple hash function to create a verification code
    let hash = 0;
    for (let i = 0; i < baseString.length; i++) {
      const char = baseString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }

    return Math.abs(hash).toString(36).toUpperCase().substring(0, 8);
  }
}
