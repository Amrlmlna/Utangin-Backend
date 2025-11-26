import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from '../notifications/notifications.service';
import { AgreementsService } from '../agreements/agreements.service';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

@Injectable()
export class NotificationSchedulerService {
  private supabase: SupabaseClient;

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly agreementsService: AgreementsService,
  ) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Key must be provided');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM) // Run every day at 8:00 AM
  async handleDailyReminderCheck() {
    console.log('Running daily reminder check...');
    
    try {
      // Get agreements that are due in the next 24 hours or are overdue
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const { data: agreements, error } = await this.supabase
        .from('agreements')
        .select('*')
        .gte('due_date', new Date().toISOString().split('T')[0]) // Today or later
        .lte('due_date', tomorrow.toISOString().split('T')[0]); // Tomorrow or earlier

      if (error) {
        console.error('Error fetching agreements:', error);
        return;
      }

      for (const agreement of agreements) {
        // Check if due date is tomorrow (for upcoming due notification)
        const agreementDueDate = new Date(agreement.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrowDate = new Date(today);
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        
        if (agreementDueDate.getTime() === tomorrowDate.getTime()) {
          // Send reminder notification for tomorrow's due date
          await this.notificationsService.create({
            user_id: agreement.borrower_id, // Notify the borrower
            agreement_id: agreement.id,
            type: 'reminder',
            title: 'Pengingat Pembayaran Utang',
            message: `Pembayaran utang Anda dengan nominal Rp ${agreement.amount?.toLocaleString()} akan jatuh tempo besok.`,
            delivery_method: 'push',
            escalation_level: 0,
          });
        }
      }
    } catch (error) {
      console.error('Error in daily reminder check:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM) // Run every day at 9:00 AM
  async handleOverdueAlert() {
    console.log('Running overdue alert check...');
    
    try {
      // Get agreements that are overdue (due date is in the past)
      const today = new Date();
      
      const { data: overdueAgreements, error } = await this.supabase
        .from('agreements')
        .select('*')
        .lt('due_date', today.toISOString().split('T')[0]) // Due date is before today
        .neq('status', 'paid'); // Not already marked as paid

      if (error) {
        console.error('Error fetching overdue agreements:', error);
        return;
      }

      for (const agreement of overdueAgreements) {
        // Check if we've already sent an overdue notification today for this agreement
        const { data: existingNotification } = await this.supabase
          .from('notifications')
          .select('*')
          .eq('agreement_id', agreement.id)
          .eq('type', 'reminder')
          .gte('created_at', today.toISOString()) // Created today
          .single();

        if (!existingNotification) {
          // Send overdue notification
          await this.notificationsService.create({
            user_id: agreement.borrower_id, // Notify the borrower
            agreement_id: agreement.id,
            type: 'reminder',
            title: 'Pembayaran Terlambat',
            message: `Pembayaran utang Anda dengan nominal Rp ${agreement.amount?.toLocaleString()} telah melewati batas waktu jatuh tempo.`,
            delivery_method: 'push',
            escalation_level: 1,
          });
        }
      }
    } catch (error) {
      console.error('Error in overdue alert check:', error);
    }
  }

  @Cron(CronExpression.EVERY_WEEK_ON_SUNDAY_AT_NOON) // Run every Sunday at 10:00 AM
  async handleWeeklySummary() {
    console.log('Running weekly summary...');
    
    try {
      // This would generate and send weekly summaries to users
      // For now, we'll just log the action
      const { data: users, error } = await this.supabase
        .from('users')
        .select('id, email, name');
      
      if (error) {
        console.error('Error fetching users for weekly summary:', error);
        return;
      }
      
      // For each user, we would calculate their weekly summary
      // This is a simplified version - in production, you'd want to calculate actual summaries
      for (const user of users) {
        console.log(`Weekly summary would be sent to user: ${user.name} (${user.email})`);
      }
    } catch (error) {
      console.error('Error in weekly summary:', error);
    }
  }
}