/**
 * Park shop items catalog (aligned with frontend constants.ts).
 */
export interface ShopItem {
  id: string;
  name: string;
  type: string;
  icon: string;
  cost: number;
  minLevel: number;
  color: string;
  description?: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'tree_basic', name: 'Basic Oak', type: 'tree', icon: 'park', cost: 0, minLevel: 1, color: '#4ade80', description: 'Your first tree — sturdy and green.' },
  { id: 'tree_maple', name: 'Maple Tree', type: 'tree', icon: 'nature', cost: 450, minLevel: 8, color: '#ef4444', description: 'Bold color — a real park centerpiece.' },
  { id: 'path_dirt', name: 'Dirt Path', type: 'path', icon: 'edit_road', cost: 220, minLevel: 5, color: '#a16207', description: 'A worn trail through your space.' },
  { id: 'bench_wood', name: 'Wood Bench', type: 'decoration', icon: 'chair', cost: 120, minLevel: 3, color: '#78350f', description: 'Somewhere to pause and reflect.' },
  { id: 'pond', name: 'Koi Pond', type: 'structure', icon: 'water_drop', cost: 950, minLevel: 12, color: '#3b82f6', description: 'Still water and calm vibes.' },
  { id: 'companion_bird', name: 'Songbird', type: 'pet', icon: 'nest_eco', cost: 280, minLevel: 6, color: '#0ea5e9', description: 'A small companion that visits often.' },
];
