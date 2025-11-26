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

  async register(email: string, password: string, name: string): Promise<{ user?: User; token?: string; message?: string; requiresConfirmation: boolean }> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
        emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/confirm`, // Optional: redirect after confirmation
      }
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    // Check if session is available (it might not be if email confirmation is required)
    if (!data.session || !data.session.access_token) {
      // This means email confirmation is required
      // The user has been created but needs to confirm their email

      // Create user profile in our users table only if the user was actually created
      if (data.user) {
        try {
          await this.supabase
            .from('users')
            .insert([{
              id: data.user.id,
              email,
              name,
            }]);
          // We don't need to return the user data in this case since email confirmation is required
        } catch (profileError) {
          // If user already exists in our table (due to duplicate request), just continue
          // This might happen if the user tries to register again after receiving the email
        }
      }

      return {
        message: 'Please check your email to confirm your account',
        requiresConfirmation: true
      };
    } else {
      // Session is available from signUp (email confirmation not required or auto-confirmed)
      // Create user profile in our users table
      const { data: userProfile, error: profileError } = await this.supabase
        .from('users')
        .insert([{
          id: data.user!.id,
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
        requiresConfirmation: false
      };
    }
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Check if it's an email not confirmed error
      if (error.message.includes('email') && error.message.includes('confirm')) {
        throw new UnauthorizedException('Please confirm your email address before logging in');
      }
      throw new UnauthorizedException(error.message);
    }

    // Ensure session exists and has access token
    if (!data.session || !data.session.access_token) {
      throw new UnauthorizedException('Failed to obtain access token');
    }

    // Fetch user profile from our users table
    const { data: userProfile, error: profileError } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', data.user!.id)
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
      .eq('id', data.user!.id)
      .single();

    if (profileError) {
      throw new UnauthorizedException('User profile not found');
    }

    return userProfile;
  }

  async logout(token: string): Promise<void> {
    // Supabase signOut() signs out the current session
    // We don't need to pass the token since Supabase manages the session internally
    const { error } = await this.supabase.auth.signOut();

    if (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
