import React from 'react';
import Logo from '../components/Logo';
import { impactLight } from '../lib/haptics';

interface ContactScreenProps {
  onBack: () => void;
}

const ContactScreen: React.FC<ContactScreenProps> = ({ onBack }) => {
  const handleCopy = (text: string, label: string) => {
    impactLight();
    navigator.clipboard?.writeText(text).catch(() => {});
  };

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
          <h1 className="text-2xl font-semibold text-textOnMain">Contact Us</h1>
        </div>
        <div className="absolute top-[max(1rem,env(safe-area-inset-top))] right-6 w-10 h-10 flex items-center justify-center">
          <Logo className="w-10 h-10 text-textOnMain opacity-80" />
        </div>
      </div>

      <main className="flex-1 flex flex-col w-full px-6 max-w-4xl mx-auto mt-8 overflow-y-auto">
        <p className="text-subtitle mb-6 font-medium">Reach out to us for support, feedback, or questions.</p>

        <div className="flex flex-col gap-4">
          <div className="bg-surface border-2 border-border rounded-xl p-4 shadow-card">
            <span className="text-xs font-semibold text-subtitle uppercase tracking-wide">Instagram</span>
            <div className="flex items-center justify-between gap-2 mt-2">
              <a
                href="https://instagram.com/Get.Addictivity"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[17px] font-semibold text-main active:opacity-80"
              >
                @Get.Addictivity
              </a>
              <button
                onClick={() => handleCopy('@Get.Addictivity', 'Instagram')}
                className="text-subtitle p-2 rounded-lg active:bg-border transition-colors"
                aria-label="Copy Instagram"
              >
                <span className="material-symbols-outlined text-xl">content_copy</span>
              </button>
            </div>
          </div>

          <div className="bg-surface border-2 border-border rounded-xl p-4 shadow-card">
            <span className="text-xs font-semibold text-subtitle uppercase tracking-wide">Email</span>
            <div className="flex items-center justify-between gap-2 mt-2">
              <a
                href="mailto:Management.addictivity@gmail.com"
                className="text-[17px] font-semibold text-main active:opacity-80 break-all"
              >
                Management.addictivity@gmail.com
              </a>
              <button
                onClick={() => handleCopy('Management.addictivity@gmail.com', 'Email')}
                className="text-subtitle p-2 rounded-lg active:bg-border transition-colors shrink-0"
                aria-label="Copy email"
              >
                <span className="material-symbols-outlined text-xl">content_copy</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactScreen;
