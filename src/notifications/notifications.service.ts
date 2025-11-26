import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

export interface Notification {
  id: string;
  user_id: string;
  agreement_id?: string;
  type: string;
  title: string;
  message: string;
  read_status: boolean;
  delivery_method: string;
  scheduled_time?: Date;
  sent_time?: Date;
  escalation_level: number;
  created_at: Date;
}

@Injectable()
export class NotificationsService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Key must be provided');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const { data, error } = await this.supabase
      .from('notifications')
      .insert([createNotificationDto])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as unknown as Notification;
  }

  async findAll(): Promise<Notification[]> {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data as unknown as Notification[];
  }

  async findByUser(userId: string): Promise<Notification[]> {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data as unknown as Notification[];
  }

  async findByAgreement(agreementId: string): Promise<Notification[]> {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('agreement_id', agreementId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data as unknown as Notification[];
  }

  async findOne(id: string): Promise<Notification> {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Notification not found');
    }

    return data as unknown as Notification;
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const { data, error } = await this.supabase
      .from('notifications')
      .update({ ...updateNotificationDto, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as unknown as Notification;
  }

  async markAsRead(id: string): Promise<Notification> {
    const { data, error } = await this.supabase
      .from('notifications')
      .update({ read_status: true })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as unknown as Notification;
  }

  async markAsUnread(id: string): Promise<Notification> {
    const { data, error } = await this.supabase
      .from('notifications')
      .update({ read_status: false })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as unknown as Notification;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  // Method for scheduling automated reminders
  async scheduleAgreementReminders(agreementId: string, dueDate: Date) {
    // Schedule a reminder 3 days before due date
    const threeDaysBefore = new Date(dueDate);
    threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);

    await this.create({
      user_id: '', // This will be populated when we know the borrower's ID
      agreement_id: agreementId,
      type: 'reminder',
      title: 'Pengingat Pembayaran Utang',
      message: 'Pembayaran utang Anda akan jatuh tempo dalam 3 hari. Harap siapkan dana Anda.',
      delivery_method: 'push',
      scheduled_time: threeDaysBefore.toISOString(),
      escalation_level: 0
    });

    // Schedule a reminder 1 day before due date
    const oneDayBefore = new Date(dueDate);
    oneDayBefore.setDate(oneDayBefore.getDate() - 1);

    await this.create({
      user_id: '', // This will be populated when we know the borrower's ID
      agreement_id: agreementId,
      type: 'reminder',
      title: 'Pengingat Pembayaran Utang',
      message: 'Pembayaran utang Anda akan jatuh tempo besok. Harap siapkan dana Anda.',
      delivery_method: 'push',
      scheduled_time: oneDayBefore.toISOString(),
      escalation_level: 0
    });

    // Schedule overdue notification after due date
    const afterDueDate = new Date(dueDate);
    afterDueDate.setDate(afterDueDate.getDate() + 1);

    await this.create({
      user_id: '', // This will be populated when we know the borrower's ID
      agreement_id: agreementId,
      type: 'reminder',
      title: 'Pembayaran Terlambat',
      message: 'Pembayaran utang Anda telah melewati batas waktu jatuh tempo.',
      delivery_method: 'push',
      scheduled_time: afterDueDate.toISOString(),
      escalation_level: 0
    });
  }
}
