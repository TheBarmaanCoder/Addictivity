import React from 'react';

interface PlaceholderScreenProps {
  title: string;
  icon: string;
  message: string;
}

const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({ title, icon, message }) => {
  return (
    <div className="flex flex-col w-full h-full pb-24 items-center justify-center px-6">
      <div className="w-24 h-24 rounded-full bg-forest-green/5 flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-5xl text-forest-green">{icon}</span>
      </div>
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold text-forest-green tracking-tight">{title}</h1>
        <p className="text-slate-500 font-medium text-lg max-w-xs mx-auto">{message}</p>
        <span className="inline-block px-4 py-2 bg-slate-100 text-slate-500 text-xs font-bold rounded-full uppercase tracking-widest mt-4">Coming Soon</span>
      </div>
    </div>
  );
};

export default PlaceholderScreen;
