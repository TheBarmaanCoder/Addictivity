import React, { useState } from 'react';
import Logo from '../components/Logo';
import { signInWithGoogle, logOut } from '../lib/firebaseAuth';
import { isFirebaseConfigured } from '../lib/firebase';

const AuthScreen: React.FC = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const user = await signInWithGoogle();
      // Only allow @gmail.com accounts
      if (!user.email?.toLowerCase().endsWith('@gmail.com')) {
        await logOut();
        setError('Only Gmail accounts are allowed. Please sign in with a @gmail.com address.');
        return;
      }
      // Auth state change is handled by App.tsx via onAuthStateChanged
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'code' in err
          ? getFirebaseAuthErrorMessage((err as { code: string }).code)
          : err instanceof Error
            ? err.message
            : 'Failed to sign in with Google.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isFirebaseConfigured()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-off-white px-6 w-full max-w-md mx-auto">
        <Logo className="w-24 h-24 text-forest-green mb-4" />
        <h1 className="text-2xl font-bold text-forest-green text-center mb-4">Firebase Setup Required</h1>
        <p className="text-txt-secondary text-center text-sm leading-relaxed mb-6">
          Add your Firebase config to <code className="bg-surface px-2 py-1 rounded">.env.local</code>. See{' '}
          <code className="bg-surface px-2 py-1 rounded">docs/FIREBASE_SETUP.md</code> for step-by-step instructions.
        </p>
        <p className="text-xs text-txt-secondary text-center">
          Required: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-off-white px-6 w-full max-w-md mx-auto relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-forest-green/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-warm-orange/10 rounded-full blur-3xl"></div>

      <div className="w-full flex flex-col items-center z-10">
        <div className="mb-8 flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-700">
          <Logo className="w-24 h-24 text-forest-green mb-4" />
          <h1 className="text-4xl font-bold text-forest-green text-center tracking-tight">Addictivity</h1>
          <p className="text-txt-secondary text-center font-medium mt-2">Gamify your life.</p>
        </div>

        <div className="w-full bg-surface p-6 rounded-xl shadow-soft border border-txt-secondary/20 animate-in fade-in zoom-in duration-500">
          <h2 className="text-xl font-semibold text-txt mb-6 text-center">Sign in with Google</h2>

          <p className="text-sm text-txt-secondary text-center mb-6">
            Only Gmail accounts are allowed to use Addictivity.
          </p>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-white border border-txt-secondary/30 text-txt font-semibold min-h-[48px] h-12 rounded-xl active:opacity-80 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isLoading ? 'Please wait...' : 'Continue with Google'}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-500 text-sm font-semibold rounded-xl text-center animate-in slide-in-from-top-1">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function getFirebaseAuthErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered. Please log in.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'Google sign-in is not enabled. Enable it in Firebase Console → Authentication → Sign-in method.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Invalid password.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/popup-blocked': 'Popup was blocked. Please allow popups for this site.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled.',
    'auth/unauthorized-domain': 'This domain is not authorized for sign-in. Add it in Firebase Console → Authentication → Settings → Authorized domains.',
    'auth/network-request-failed': 'Network error. Check your connection and try again.',
    'auth/internal-error': 'Something went wrong. Please try again.',
    'auth/account-exists-with-different-credential': 'An account already exists with this email. Try signing in with email/password.',
  };
  return messages[code] || 'Authentication failed. Please try again.';
}

export default AuthScreen;
