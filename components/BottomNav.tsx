import React from 'react';
import { ViewType } from '../types';
import { selectionChanged, impactLight } from '../lib/haptics';

interface BottomNavProps {
  currentView: ViewType;
  onChangeView: (view: ViewType) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onChangeView }) => {
  const navItems: { view: ViewType; icon: string; label: string }[] = [
    { view: 'home', icon: 'home', label: 'Home' },
    { view: 'profile', icon: 'person', label: 'Profile' },
    { view: 'addTask', icon: 'add', label: 'Add' },
    { view: 'shop', icon: 'shopping_bag', label: 'Shop' },
    { view: 'settings', icon: 'settings', label: 'Settings' },
  ];

  return (
    <div className="w-full px-5 pointer-events-auto">
      <nav className="w-full bg-title h-[70px] bottom-nav-curve flex items-center justify-around px-2 shadow-nav relative">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          const isCenter = item.view === 'addTask';

          if (isCenter) {
            return (
              <button 
                key={item.view} 
                onClick={() => {
                  impactLight();
                  selectionChanged();
                  onChangeView(item.view);
                }}
                className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] relative active:opacity-70 transition-opacity"
              >
                <div className={`size-9 rounded-full border-2 ${isActive ? 'bg-interactive border-interactive' : 'bg-background/20 border-transparent'} flex items-center justify-center`}>
                  <span className="material-symbols-outlined text-textOnMain text-[22px]">add</span>
                </div>
              </button>
            );
          }

          return (
            <button 
              key={item.view} 
              onClick={() => {
                selectionChanged();
                impactLight();
                onChangeView(item.view);
              }}
              className="flex flex-col items-center gap-0.5 relative min-w-[44px] min-h-[44px] justify-center active:opacity-70 transition-opacity"
            >
              <span 
                className={`material-symbols-outlined text-[24px] transition-colors ${
                  isActive ? 'text-interactive' : 'text-background'
                }`}
              >
                {item.icon}
              </span>
              <span className={`text-overline font-medium transition-colors ${isActive ? 'text-interactive' : 'text-background'}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;