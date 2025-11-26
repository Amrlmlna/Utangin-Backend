import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { SupabaseConfig } from './interfaces/supabase-config.interface';
import { User } from './interfaces/user.interface';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Key must be provided');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async register(email: string, password: string, name: string): Promise<{ user: User; token: string }> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        }
      }
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    // Create user profile in our users table
    const { data: userProfile, error: profileError } = await this.supabase
      .from('users')
      .insert([{
        id: data.user.id,
        email,
        name,
      }])
      .select()
      .single();

    if (profileError) {
      throw new UnauthorizedException(profileError.message);
    }

    return {
      user: userProfile,
      token: data.session.access_token,
    };
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    // Fetch user profile from our users table
    const { data: userProfile, error: profileError } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      throw new UnauthorizedException('User profile not found');
    }

    return {
      user: userProfile,
      token: data.session.access_token,
    };
  }

  async verifyToken(token: string): Promise<User> {
    const { data, error } = await this.supabase.auth.getUser(token);

    if (error) {
      throw new UnauthorizedException('Invalid token');
    }

    // Fetch user profile from our users table
    const { data: userProfile, error: profileError } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      throw new UnauthorizedException('User profile not found');
    }

    return userProfile;
  }

  async logout(token: string): Promise<void> {
    const { error } = await this.supabase.auth.signOut();

    if (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
