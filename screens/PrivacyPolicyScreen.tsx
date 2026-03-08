import React from 'react';
import Logo from '../components/Logo';
import { impactLight } from '../lib/haptics';

interface PrivacyPolicyScreenProps {
  onBack: () => void;
}

const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col w-full h-full bg-background pb-24">
      <div className="relative w-full bg-main pt-[max(1rem,env(safe-area-inset-top))] pb-8 px-6 pr-14 transition-colors duration-300">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => { impactLight(); onBack(); }}
            className="size-11 flex items-center justify-center text-textOnMain rounded-full active:bg-white/20 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <h1 className="text-2xl font-semibold text-textOnMain">Privacy Policy</h1>
        </div>
        <div className="absolute top-[max(1rem,env(safe-area-inset-top))] right-6 w-10 h-10 flex items-center justify-center">
          <Logo className="w-10 h-10 text-textOnMain opacity-80" />
        </div>
      </div>

      <main className="flex-1 flex flex-col w-full px-6 max-w-4xl mx-auto mt-6 overflow-y-auto">
        <div className="prose prose-sm max-w-none text-textPrimary space-y-4">
          <p className="text-subtitle font-semibold">Last updated: February 2026</p>

          <section>
            <h2 className="text-lg font-bold text-title mt-6 mb-2">Overview</h2>
            <p>
              Addictivity (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This policy describes how we collect, use, and store your information when you use our app.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-title mt-6 mb-2">Information We Collect</h2>
            <p>
              We collect information you provide directly and data generated through your use of the app:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Account information:</strong> When you sign in with Google, we receive your email address and display name from your Google account.</li>
              <li><strong>App data:</strong> Your tasks, skills, progress, achievements, and preferences are stored to provide the app&apos;s functionality.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-title mt-6 mb-2">How We Use Your Information</h2>
            <p>
              We use your information to:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Provide, maintain, and improve the Addictivity app</li>
              <li>Sync your data across your devices</li>
              <li>Personalize your experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-title mt-6 mb-2">Data Storage</h2>
            <p>
              Your data is stored using Google Firebase (Firestore and Authentication). Firebase is a secure, industry-standard platform. We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-title mt-6 mb-2">Contact</h2>
            <p>
              For questions about this privacy policy, contact us at{' '}
              <a href="mailto:Management.addictivity@gmail.com" className="text-main font-semibold underline">
                Management.addictivity@gmail.com
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicyScreen;
