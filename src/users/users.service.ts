import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { User } from '../auth/interfaces/user.interface';

@Injectable()
export class UsersService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Key must be provided');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as User;
  }

  async findAll(): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .is('deleted_at', null); // Only get non-deleted users

    if (error) {
      throw new Error(error.message);
    }

    return data as User[];
  }

  async findOne(id: string): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null) // Only get non-deleted users
      .single();

    if (error || !data) {
      throw new NotFoundException('User not found');
    }

    return data as User;
  }

  async findByEmail(email: string): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .is('deleted_at', null) // Only get non-deleted users
      .single();

    if (error || !data) {
      throw new NotFoundException('User not found');
    }

    return data as User;
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .update({ ...userData, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as User;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .update({ deleted_at: new Date() })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  async updateReputation(userId: string, newReputation: number): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .update({ reputation_score: newReputation })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as User;
  }
}
