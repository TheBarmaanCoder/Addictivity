import React, { useState } from 'react';
import { AppState, BoosterShopItem, Skill } from '../types';
import { BOOSTER_SHOP_ITEMS } from '../constants';
import Logo from '../components/Logo';
import { impactMedium, selectionChanged } from '../lib/haptics';

interface ShopScreenProps {
  state: AppState;
  onPurchaseBooster: (item: BoosterShopItem, options?: { skillId?: string }) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  multiplier: 'Multipliers',
  streak: 'Streak',
  session: 'Session',
  challenge: 'Challenges',
};

/** Returns true if the user already has this booster active/owned and should not buy again until used/expired */
function isBoosterAlreadyActive(state: AppState, itemId: string): boolean {
  const b = state.activeBoosters;
  const now = new Date();
  const xpActive = b.xpMultiplier && new Date(b.xpMultiplier.expiresAt) > now;
  const skillFocusActive = b.skillFocus && new Date(b.skillFocus.expiresAt) > now;
  const weeklyActive = b.weeklyChallenge && new Date(b.weeklyChallenge.expiresAt) > now;

  switch (itemId) {
    case 'double_gems_1x':
    case 'gem_doubler_3x':
      return b.gemDoublerRemaining > 0;
    case 'focus_burst':
    case 'xp_boost_1h':
    case 'power_hour':
    case 'xp_boost_24h':
      return xpActive;
    case 'deep_work':
      return b.deepWorkUsesRemaining > 0;
    case 'first_win':
      return b.firstWinOwned;
    case 'weekly_challenge':
      return weeklyActive;
    case 'momentum':
      return b.momentumOwned;
    case 'skill_focus_7d':
      return skillFocusActive;
    case 'gem_rush':
      return b.gemRushRemaining > 0;
    case 'second_chance':
      return b.secondChanceAvailable;
    default:
      return false;
  }
}

const ShopScreen: React.FC<ShopScreenProps> = ({ state, onPurchaseBooster }) => {
  const [skillFocusPickerFor, setSkillFocusPickerFor] = useState<BoosterShopItem | null>(null);
  const [confirmPurchase, setConfirmPurchase] = useState<BoosterShopItem | null>(null);

  const globalLevel = Math.floor(Math.sqrt(state.skills.reduce((acc, s) => acc + s.totalPoints, 0) / 40)) + 1;
  const categories = Array.from(new Set(BOOSTER_SHOP_ITEMS.map(i => i.category)));

  const handleBuyClick = (item: BoosterShopItem) => {
    if (state.totalGems < item.cost) return;
    if (isBoosterAlreadyActive(state, item.id)) return;
    if (item.id === 'skill_focus_7d') {
      setSkillFocusPickerFor(item);
      return;
    }
    setConfirmPurchase(item);
  };

  const handleConfirmPurchase = () => {
    if (!confirmPurchase) return;
    impactMedium();
    onPurchaseBooster(confirmPurchase);
    setConfirmPurchase(null);
  };

  const handleBuy = (item: BoosterShopItem) => {
    handleBuyClick(item);
  };

  const handleSkillSelect = (skill: Skill) => {
    if (!skillFocusPickerFor) return;
    impactMedium();
    onPurchaseBooster(skillFocusPickerFor, { skillId: skill.id });
    setSkillFocusPickerFor(null);
  };

  const activeBoosters = state.activeBoosters;
  const daysLeft = (exp: string) => Math.max(0, Math.ceil((new Date(exp).getTime() - Date.now()) / (24 * 60 * 60 * 1000)));

  return (
    <div className="flex flex-col w-full pb-32">
      <header className="relative px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-6 pr-14 flex items-center sticky top-0 bg-background/80 backdrop-blur-md z-20">
        <h1 className="text-3xl font-bold text-main shrink-0">Shop</h1>
        <div className="flex-1 flex justify-center min-w-0">
          <div className="bg-surface border-2 border-border shadow-card px-4 py-2 rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-interactive font-bold">diamond</span>
            <span className="text-xl font-black text-textPrimary">{state.totalGems}</span>
          </div>
        </div>
        <div className="absolute top-[max(1rem,env(safe-area-inset-top))] right-6 w-10 h-10 flex items-center justify-center">
          <Logo className="w-10 h-10 opacity-80" />
        </div>
      </header>

      {/* Active boosters summary */}
      {(activeBoosters.weeklyChallenge || activeBoosters.skillFocus || activeBoosters.xpMultiplier || activeBoosters.gemDoublerRemaining > 0 || activeBoosters.gemRushRemaining > 0) && (
        <div className="px-6 mb-6 space-y-2">
          <h2 className="text-sm font-bold text-txt-secondary uppercase tracking-wider">Active</h2>
          {activeBoosters.weeklyChallenge && (
            <div className="bg-main/10 border-2 border-main/20 rounded-xl p-3">
              <div className="flex items-center gap-2 text-main font-semibold text-sm">
                <span className="material-symbols-outlined text-lg">flag</span>
                {activeBoosters.weeklyChallenge.description}
              </div>
              <p className="text-xs text-subtitle mt-1">
                Progress: {activeBoosters.weeklyChallenge.progress}/{activeBoosters.weeklyChallenge.target} · {daysLeft(activeBoosters.weeklyChallenge.expiresAt)}d left
              </p>
            </div>
          )}
          {activeBoosters.skillFocus && (
            <div className="bg-surface border-2 border-border rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-textPrimary">Skill Focus 1.2×</span>
              <span className="text-xs text-subtitle">
                {state.skills.find(s => s.id === activeBoosters.skillFocus!.skillId)?.name ?? 'Skill'} · {daysLeft(activeBoosters.skillFocus.expiresAt)}d left
              </span>
            </div>
          )}
          {activeBoosters.xpMultiplier && (
            <div className="bg-surface border-2 border-border rounded-xl p-3 text-sm text-textPrimary">
              <span className="font-semibold">{activeBoosters.xpMultiplier.multiplier}× XP</span>
              <span className="text-subtitle ml-1">until {new Date(activeBoosters.xpMultiplier.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
          {activeBoosters.gemDoublerRemaining > 0 && (
            <div className="bg-surface border-2 border-border rounded-xl p-3 text-sm text-textPrimary">
              <span className="font-semibold">2× Gems</span>
              <span className="text-subtitle"> on next {activeBoosters.gemDoublerRemaining} completion(s)</span>
            </div>
          )}
          {activeBoosters.gemRushRemaining > 0 && (
            <div className="bg-surface border-2 border-border rounded-xl p-3 text-sm text-textPrimary">
              <span className="font-semibold">Gem Rush</span>
              <span className="text-subtitle"> +5 gems on next {activeBoosters.gemRushRemaining} completion(s)</span>
            </div>
          )}
        </div>
      )}

      <main className="px-6 space-y-10">
        {categories.map(cat => (
          <section key={cat}>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-main">
                {cat === 'multiplier' ? 'trending_up' : cat === 'streak' ? 'local_fire_department' : cat === 'session' ? 'bolt' : 'flag'}
              </span>
              <h2 className="text-lg font-bold text-main uppercase tracking-widest">{CATEGORY_LABELS[cat] ?? cat}</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {BOOSTER_SHOP_ITEMS.filter(i => i.category === cat).map(item => {
                const isLocked = globalLevel < item.minLevel;
                const alreadyActive = isBoosterAlreadyActive(state, item.id);
                const canAfford = state.totalGems >= item.cost;
                const canBuy = !isLocked && !alreadyActive && canAfford;
                return (
                  <div
                    key={item.id}
                    className={`bg-surface rounded-xl p-4 border-2 transition-all flex items-center gap-4 ${
                      isLocked ? 'opacity-60 border-border' : 'border-border shadow-card'
                    }`}
                  >
                    <div
                      className="size-14 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${item.color}18`, color: item.color }}
                    >
                      <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-[15px] text-textPrimary truncate">{item.name}</h3>
                        {isLocked && (
                          <span className="text-[10px] font-black text-subtitle bg-border px-2 py-0.5 rounded-full whitespace-nowrap">
                            LVL {item.minLevel}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-subtitle mb-2">{item.description}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-interactive text-sm font-bold">diamond</span>
                        <span className={`text-sm font-black ${canAfford ? 'text-textPrimary' : 'text-red-500'}`}>{item.cost}</span>
                      </div>
                    </div>
                    {isLocked ? (
                      <div className="flex items-center gap-1.5 px-5 py-2.5 min-h-[44px] rounded-xl font-semibold text-sm bg-border text-subtitle">
                        <span className="material-symbols-outlined text-base">lock</span>
                        Locked
                      </div>
                    ) : (
                      <button
                        onClick={() => handleBuyClick(item)}
                        disabled={!canBuy}
                        className={`px-5 py-2.5 min-h-[44px] rounded-xl font-semibold text-sm transition-all active:scale-[0.97] active:opacity-80 ${
                          canBuy ? 'bg-main text-textOnMain' : 'bg-background text-subtitle cursor-not-allowed'
                        }`}
                      >
                        {alreadyActive ? 'Active' : 'Buy'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      {/* Purchase confirmation modal */}
      {confirmPurchase && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmPurchase(null)} />
          <div className="relative bg-surface w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-soft p-6 animate-in slide-in-from-bottom-10 duration-300">
            <h3 className="text-lg font-semibold text-textPrimary mb-2">Confirm purchase?</h3>
            <p className="text-sm text-subtitle mb-4">
              Spend <strong>{confirmPurchase.cost} gems</strong> on {confirmPurchase.name}?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmPurchase(null)}
                className="flex-1 py-3 rounded-xl border-2 border-border text-subtitle font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPurchase}
                className="flex-1 py-3 rounded-xl bg-main text-textOnMain font-semibold"
              >
                Buy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skill Focus picker modal */}
      {skillFocusPickerFor && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSkillFocusPickerFor(null)} />
          <div className="relative bg-surface w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-soft flex flex-col animate-in slide-in-from-bottom-10 duration-300 max-h-[80vh]">
            <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-2" />
            <h3 className="text-lg font-semibold text-main px-6 pb-2">Choose skill for 1.2× XP (7 days)</h3>
            <p className="text-sm text-subtitle px-6 pb-4">{skillFocusPickerFor.description}</p>
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2">
              {state.skills.map(skill => (
                <button
                  key={skill.id}
                  onClick={() => handleSkillSelect(skill)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border bg-background active:bg-main/10 transition-colors text-left"
                >
                  <div
                    className="size-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${skill.color}20`, color: skill.color }}
                  >
                    <span className="material-symbols-outlined text-2xl">{skill.icon}</span>
                  </div>
                  <span className="font-semibold text-textPrimary">{skill.name}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setSkillFocusPickerFor(null)}
              className="mx-6 mb-6 py-3 rounded-xl border-2 border-border text-subtitle font-semibold active:bg-background"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopScreen;
