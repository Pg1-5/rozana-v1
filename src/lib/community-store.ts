// Community posts store (localStorage-based demo)

export interface CommunityPost {
  id: string;
  userName: string;
  avatar: string;
  reflection: 'on_track' | 'almost' | 'not_today';
  message: string;
  steps: number;
  kmWalked: number;
  caloriesBurned: number;
  kudos: number;
  timestamp: number;
  isOwn?: boolean;
}

const COMMUNITY_KEY = 'vitale_community';

const DEMO_NAMES = ['Priya', 'Arjun', 'Neha', 'Rohan', 'Ananya', 'Vikram', 'Sneha', 'Karan', 'Divya', 'Aditya'];
const DEMO_AVATARS = ['🧘‍♀️', '🏃‍♂️', '💃', '🚴', '🧘', '🏋️', '🤸‍♀️', '⚽', '🏊‍♀️', '🎯'];
const DEMO_MESSAGES: Record<string, string[]> = {
  on_track: [
    'Ate clean, moved well, feeling great today! 💪',
    'Finished all meals within target — small wins matter!',
    'Walked after every meal. Energy levels are amazing!',
    'Rajma chawal for lunch, salad for dinner — balanced day ✨',
    'Hit my step goal and stuck to the meal plan!',
  ],
  almost: [
    'Missed evening walk but ate really well today 🌱',
    'Almost hit the target — tomorrow I'll nail it!',
    'Had a small extra snack but otherwise great day',
    '3 out of 4 meals on plan — getting better each day!',
  ],
  not_today: [
    'Rest day — listening to my body. Back at it tomorrow 🌙',
    'Wasn't my best day, but showing up matters',
    'Skipped workout, but ate mindfully. Progress not perfection.',
  ],
};

function generateDemoPosts(): CommunityPost[] {
  const posts: CommunityPost[] = [];
  const now = Date.now();
  for (let i = 0; i < 8; i++) {
    const reflection = (['on_track', 'almost', 'on_track', 'almost', 'on_track', 'not_today', 'on_track', 'almost'] as const)[i];
    const msgs = DEMO_MESSAGES[reflection];
    posts.push({
      id: `demo-${i}`,
      userName: DEMO_NAMES[i],
      avatar: DEMO_AVATARS[i],
      reflection,
      message: msgs[Math.floor(Math.random() * msgs.length)],
      steps: 5000 + Math.round(Math.random() * 5000),
      kmWalked: Math.round((5000 + Math.random() * 5000) / 1300 * 10) / 10,
      caloriesBurned: Math.round((5000 + Math.random() * 5000) * 0.04),
      kudos: Math.floor(Math.random() * 15) + 1,
      timestamp: now - i * 3600 * 1000 * (1 + Math.random() * 2),
    });
  }
  return posts;
}

export function getCommunityPosts(): CommunityPost[] {
  const stored = localStorage.getItem(COMMUNITY_KEY);
  if (stored) return JSON.parse(stored);
  // Seed demo posts
  const demo = generateDemoPosts();
  localStorage.setItem(COMMUNITY_KEY, JSON.stringify(demo));
  return demo;
}

export function addCommunityPost(post: Omit<CommunityPost, 'id' | 'kudos' | 'timestamp'>): CommunityPost {
  const posts = getCommunityPosts();
  const newPost: CommunityPost = {
    ...post,
    id: `post-${Date.now()}`,
    kudos: 0,
    timestamp: Date.now(),
    isOwn: true,
  };
  posts.unshift(newPost);
  localStorage.setItem(COMMUNITY_KEY, JSON.stringify(posts));
  return newPost;
}

export function giveKudos(postId: string): void {
  const posts = getCommunityPosts();
  const post = posts.find(p => p.id === postId);
  if (post) {
    post.kudos += 1;
    localStorage.setItem(COMMUNITY_KEY, JSON.stringify(posts));
  }
}

export function getReflectionLabel(r: string) {
  if (r === 'on_track') return { emoji: '✨', label: 'On track' };
  if (r === 'almost') return { emoji: '🌱', label: 'Almost there' };
  return { emoji: '🌙', label: 'Rest day' };
}
