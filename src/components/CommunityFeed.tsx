import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Sparkles } from 'lucide-react';
import ScreenNav from '@/components/ScreenNav';
import { getCommunityPosts, giveKudos, getReflectionLabel, CommunityPost } from '@/lib/community-store';

interface Props {
  onBack?: () => void;
}

function timeAgo(ts: number): string {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default function CommunityFeed({ onBack }: Props) {
  const [posts, setPosts] = useState<CommunityPost[]>(getCommunityPosts);
  const [kudosGiven, setKudosGiven] = useState<Set<string>>(new Set());

  const handleKudos = (postId: string) => {
    if (kudosGiven.has(postId)) return;
    giveKudos(postId);
    setKudosGiven(prev => new Set(prev).add(postId));
    setPosts(getCommunityPosts());
  };

  return (
    <div className="min-h-screen bg-background vitale-gradient px-6 py-12">
      <div className="w-full max-w-[520px] mx-auto">
        <ScreenNav onBack={onBack} title="Community" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h1 className="font-heading text-2xl font-semibold">Community</h1>
          </div>
          <p className="text-muted-foreground font-body text-sm mb-8">
            See what others achieved today. Cheer them on!
          </p>
        </motion.div>

        <div className="space-y-4">
          <AnimatePresence>
            {posts.map((post, i) => {
              const { emoji, label } = getReflectionLabel(post.reflection);
              const hasGivenKudos = kudosGiven.has(post.id);

              return (
                <motion.div
                  key={post.id}
                  className={`card-surface p-5 rounded-lg ${post.isOwn ? 'ring-1 ring-primary/30' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{post.avatar}</span>
                      <div>
                        <p className="font-body font-medium text-foreground text-sm">
                          {post.userName}
                          {post.isOwn && <span className="text-xs text-primary ml-2">You</span>}
                        </p>
                        <p className="text-xs text-muted-foreground font-body">{timeAgo(post.timestamp)}</p>
                      </div>
                    </div>
                    <span className="text-xs font-body text-muted-foreground px-2 py-1 rounded-full bg-muted/50">
                      {emoji} {label}
                    </span>
                  </div>

                  <p className="font-body text-foreground text-sm leading-relaxed mb-3">{post.message}</p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground font-body mb-3">
                    <span>{post.steps.toLocaleString()} steps</span>
                    <span>{post.kmWalked} km</span>
                    <span>{post.caloriesBurned} kcal burned</span>
                  </div>

                  <button
                    onClick={() => handleKudos(post.id)}
                    className={`flex items-center gap-1.5 text-sm font-body transition-all ${
                      hasGivenKudos
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${hasGivenKudos ? 'fill-primary' : ''}`} />
                    <span>{post.kudos} kudos</span>
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
