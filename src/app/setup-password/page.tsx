"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { syncSessionToServer } from '@/lib/syncSession';

export default function SetupPasswordPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weddingDetails, setWeddingDetails] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Get wedding details from localStorage or fetch from Supabase
    const storedDetails = localStorage.getItem('pendingWeddingDetails');
    if (storedDetails) {
      const details = JSON.parse(storedDetails);
      setWeddingDetails(details);
      setEmail(details.contactemail || '');
    } else {
      // If no stored details, redirect back to chat
      router.push('/chat');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      
      console.log('Attempting to sign up user:', email);
      
      // Sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/tasks`,
          data: {
            partner1_name: weddingDetails?.partner1name,
            partner2_name: weddingDetails?.partner2name,
          }
        }
      });

      console.log('Signup response:', { data, error: signUpError });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user) {
        console.log('User created:', {
          id: data.user.id,
          email: data.user.email,
          emailConfirmed: data.user.email_confirmed_at,
          sessionExists: !!data.session
        });

        if (weddingDetails) {
          try {
            console.log('Attempting to save wedding details for new user:', data.user.id);
            
            // Separate tasks from the main details
            const { tasks, ...mainDetails } = weddingDetails;

            // 1. Insert the main wedding record
            const { data: wedding, error: weddingError } = await supabase
              .from('weddings')
              .insert({
                ...mainDetails,
                user_id: data.user.id,
                contactemail: email, // ensure email is up-to-date
              })
              .select()
              .single();

            if (weddingError) {
              console.error('Failed to save wedding details:', weddingError);
              throw weddingError; // Abort if the main record fails
            }

            console.log('Successfully saved main wedding details:', wedding.id);

            // 2. If there are tasks, insert them
            if (tasks && Array.isArray(tasks) && tasks.length > 0) {
              console.log(`Attempting to save ${tasks.length} tasks...`);
              const tasksToInsert = tasks.map((task: any) => ({
                title: task.title,
                description: task.description || '',
                user_id: data.user.id,
                status: 'todo',
              }));

              const { error: tasksError } = await supabase
                .from('tasks')
                .insert(tasksToInsert);

              if (tasksError) {
                console.error('Failed to save tasks:', tasksError);
                // Note: In a real-world scenario, you might want to handle this
                // by deleting the wedding record in a transaction.
              } else {
                console.log('Successfully saved tasks.');
              }
            }
          } catch (saveError) {
            console.error('Caught error saving wedding/task details:', saveError);
          }
        }

        // Clear stored wedding details regardless of session state
        localStorage.removeItem('pendingWeddingDetails');

        // Check if we have a session (user is immediately logged in)
        if (data.session) {
          console.log('User has immediate session, attempting to sync and redirect');
          
          // Sync session with server to set cookies
          const syncSuccess = await syncSessionToServer();
          
          if (syncSuccess) {
            console.log('Session sync successful, redirecting to /tasks');
            window.location.href = '/tasks';
          } else {
            // Fallback for safety, though it might still cause a redirect loop
            console.error('Session sync failed, redirecting anyway.');
            window.location.href = '/tasks';
          }
          return;
        } else {
          // No immediate session - check if email confirmation is required
          console.log('No immediate session - may need email confirmation');
          
          // Try to sign in immediately (in case email confirmation is disabled)
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          console.log('Immediate sign-in attempt:', { signInData, signInError });

          if (signInData.session) {
            console.log('Immediate sign-in successful, syncing session and redirecting');
            const syncSuccess = await syncSessionToServer();
            if (syncSuccess) {
              window.location.href = '/tasks';
            } else {
              console.error('Session sync failed after sign-in, redirecting anyway.');
              window.location.href = '/tasks';
            }
            return;
          } else {
            // Sign-in failed, likely need email confirmation
            let errorMessage = 'Account created! Please check your email and click the confirmation link to complete your account setup.';
            if (signInError) {
              errorMessage += ` (Error: ${signInError.message})`;
            }
            setError(errorMessage);
            return;
          }
        }
      }
    } catch (err: any) {
      console.error('Setup password error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!weddingDetails) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-center">
            <Lock className="w-12 h-12 text-white mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white">Secure Your Account</h1>
            <p className="text-blue-100 mt-2">
              Create a password to access your wedding planning dashboard
            </p>
          </div>

          {/* Form */}
          <div className="p-6">
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">
                Hey {weddingDetails.partner1name}! Thanks for sharing your wedding details.
              </p>
              <p className="text-sm text-gray-600">
                Now let's secure your account so you can access your personalized planning tools.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Create a strong password"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm your password"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? 'Creating Account...' : 'Create Account & Continue'}
              </button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-4">
              By creating an account, you agree to our terms and privacy policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 