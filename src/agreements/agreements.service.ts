import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { CreateAgreementDto } from './dto/create-agreement.dto';
import { UpdateAgreementDto } from './dto/update-agreement.dto';

export interface Agreement {
  id: string;
  lender_id: string;
  borrower_id: string;
  amount: number;
  interest_rate: number;
  due_date: Date;
  status: string;
  qr_code?: string;
  lender_confirmed: boolean;
  borrower_confirmed: boolean;
  repayment_schedule?: Record<string, any>;
  escalation_settings?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class AgreementsService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Key must be provided');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async create(createAgreementDto: CreateAgreementDto): Promise<Agreement> {
    const { data, error } = await this.supabase
      .from('agreements')
      .insert([{
        ...createAgreementDto,
        status: 'pending',
        lender_confirmed: false,
        borrower_confirmed: false,
      }])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as unknown as Agreement;
  }

  async findAll(): Promise<Agreement[]> {
    const { data, error } = await this.supabase
      .from('agreements')
      .select('*');

    if (error) {
      throw new Error(error.message);
    }

    return data as unknown as Agreement[];
  }

  async findOne(id: string): Promise<Agreement> {
    const { data, error } = await this.supabase
      .from('agreements')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Agreement not found');
    }

    return data as unknown as Agreement;
  }

  async findByUser(userId: string): Promise<Agreement[]> {
    const { data, error } = await this.supabase
      .from('agreements')
      .select('*')
      .or(`lender_id.eq.${userId},borrower_id.eq.${userId}`);

    if (error) {
      throw new Error(error.message);
    }

    return data as unknown as Agreement[];
  }

  async update(id: string, updateAgreementDto: UpdateAgreementDto): Promise<Agreement> {
    const { data, error } = await this.supabase
      .from('agreements')
      .update({ ...updateAgreementDto, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as unknown as Agreement;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('agreements')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  async confirmAgreement(id: string, confirmedBy: 'lender' | 'borrower'): Promise<Agreement> {
    const fieldToUpdate = confirmedBy === 'lender' ? 'lender_confirmed' : 'borrower_confirmed';

    const { data, error } = await this.supabase
      .from('agreements')
      .update({
        [fieldToUpdate]: true,
        status: 'active',
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as unknown as Agreement;
  }

  async markAsPaid(id: string): Promise<Agreement> {
    const { data, error } = await this.supabase
      .from('agreements')
      .update({
        status: 'paid',
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as unknown as Agreement;
  }
}
