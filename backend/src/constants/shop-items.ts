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
  { id: 'tree_basic', name: 'Basic Oak', type: 'tree', icon: 'park', cost: 0, minLevel: 1, color: '#4ade80', description: 'A sturdy oak tree.' },
  { id: 'tree_pine', name: 'Pine Tree', type: 'tree', icon: 'forest', cost: 100, minLevel: 4, color: '#14532d', description: 'Evergreen pine.' },
  { id: 'tree_birch', name: 'Birch Tree', type: 'tree', icon: 'nature', cost: 300, minLevel: 7, color: '#fef3c7', description: 'White bark birch.' },
  { id: 'tree_maple', name: 'Maple Tree', type: 'tree', icon: 'nature', cost: 400, minLevel: 9, color: '#ef4444', description: 'Vibrant autumn colors.' },
  { id: 'tree_apple', name: 'Apple Tree', type: 'tree', icon: 'nutrition', cost: 600, minLevel: 14, color: '#84cc16', description: 'Fruit bearing tree.' },
  { id: 'tree_cherry', name: 'Cherry Blossom', type: 'tree', icon: 'filter_vintage', cost: 900, minLevel: 16, color: '#f472b6', description: 'Pink sakura petals.' },
  { id: 'tree_sakura_ancient', name: 'Ancient Sakura', type: 'tree', icon: 'local_florist', cost: 1500, minLevel: 19, color: '#db2777', description: 'A massive, old cherry tree.' },
  { id: 'path_dirt', name: 'Dirt Path', type: 'path', icon: 'edit_road', cost: 200, minLevel: 6, color: '#a16207', description: 'A simple worn path.' },
  { id: 'path_pebble', name: 'Pebble Path', type: 'path', icon: 'grain', cost: 400, minLevel: 10, color: '#94a3b8', description: 'Crunchy stone path.' },
  { id: 'bench_wood', name: 'Wood Bench', type: 'decoration', icon: 'chair', cost: 50, minLevel: 2, color: '#78350f', description: 'A place to rest.' },
  { id: 'bush_small', name: 'Small Bush', type: 'decoration', icon: 'grass', cost: 60, minLevel: 3, color: '#16a34a', description: 'Low lying shrubbery.' },
  { id: 'density_high', name: 'Dense Foliage', type: 'decoration', icon: 'grid_view', cost: 150, minLevel: 5, color: '#065f46', description: 'More trees in the park.' },
  { id: 'feeder', name: 'Bird Feeder', type: 'decoration', icon: 'inventory_2', cost: 150, minLevel: 6, color: '#b45309', description: 'Attracts local birds.' },
  { id: 'rock_decor', name: 'Decorative Rock', type: 'decoration', icon: 'landscape', cost: 200, minLevel: 8, color: '#57534e', description: 'A mossy boulder.' },
  { id: 'structure_chalet', name: 'Small Chalet', type: 'structure', icon: 'chalet', cost: 800, minLevel: 11, color: '#7c2d12', description: 'A cozy retreat.' },
  { id: 'lantern', name: 'Lantern Post', type: 'decoration', icon: 'light', cost: 400, minLevel: 12, color: '#fbbf24', description: 'Lights up the night.' },
  { id: 'pond', name: 'Koi Pond', type: 'structure', icon: 'water_drop', cost: 1000, minLevel: 13, color: '#3b82f6', description: 'Calm waters.' },
  { id: 'fireflies', name: 'Fireflies', type: 'decoration', icon: 'bug_report', cost: 500, minLevel: 13, color: '#facc15', description: 'Glowing insects.' },
  { id: 'lilypads', name: 'Lily Pads', type: 'decoration', icon: 'spa', cost: 300, minLevel: 14, color: '#22c55e', description: 'Greenery on water.' },
  { id: 'bench_stone', name: 'Stone Bench', type: 'decoration', icon: 'chair_alt', cost: 500, minLevel: 15, color: '#525252', description: 'Durable seating.' },
  { id: 'mat_sleeping', name: 'Sleeping Mat', type: 'decoration', icon: 'bed', cost: 400, minLevel: 16, color: '#fdba74', description: 'For outdoor naps.' },
  { id: 'structure_gazebo', name: 'Open Gazebo', type: 'structure', icon: 'deck', cost: 1200, minLevel: 17, color: '#fff7ed', description: 'Shelter from rain.' },
  { id: 'bridge', name: 'Wooden Bridge', type: 'decoration', icon: 'bridge', cost: 600, minLevel: 18, color: '#451a03', description: 'Cross the pond.' },
  { id: 'campfire', name: 'Campfire', type: 'decoration', icon: 'local_fire_department', cost: 1000, minLevel: 20, color: '#ef4444', description: 'Warm gathering spot.' },
  { id: 'companion_bird', name: 'Bird', type: 'pet', icon: 'nest_eco', cost: 80, minLevel: 5, color: '#0ea5e9', description: 'A friendly bird companion.' },
  { id: 'companion_bunny', name: 'Bunny', type: 'pet', icon: 'cruelty_free', cost: 150, minLevel: 10, color: '#a78bfa', description: 'A soft bunny companion.' },
  { id: 'companion_cat', name: 'Cat', type: 'pet', icon: 'pets', cost: 250, minLevel: 15, color: '#f97316', description: 'A cozy cat companion.' },
  { id: 'companion_dog', name: 'Dog', type: 'pet', icon: 'pets', cost: 400, minLevel: 20, color: '#b45309', description: 'A loyal dog companion.' },
];
