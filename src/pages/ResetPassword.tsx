import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const schema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters').max(72),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validLink, setValidLink] = useState<boolean | null>(null);

  useEffect(() => {
    // Supabase auto-handles the recovery token from URL hash.
    // Listen for PASSWORD_RECOVERY event to confirm the link is valid.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setValidLink(true);
      }
    });

    // Fallback: check if there's a recovery hash in URL
    if (window.location.hash.includes('type=recovery') || window.location.hash.includes('access_token')) {
      setValidLink(true);
    } else {
      // Give the listener a moment, then check session
      setTimeout(async () => {
        const { data } = await supabase.auth.getSession();
        if (data.session) setValidLink(true);
        else setValidLink(false);
      }, 800);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ password, confirm });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Password updated! You are now logged in.');
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background vitale-gradient flex flex-col items-center justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[440px]"
      >
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl font-bold tracking-widest text-primary mb-2">ROZANA</h1>
          <p className="text-muted-foreground font-body text-sm">Set a new password</p>
        </div>

        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-lg">
          {validLink === false ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Button onClick={() => navigate('/auth')} className="w-full">
                Back to login
              </Button>
            </div>
          ) : validLink === null ? (
            <p className="text-center text-sm text-muted-foreground">Verifying link...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-pwd">New password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="new-pwd"
                    type={showPwd ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-pwd">Confirm password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-pwd"
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    className="pl-10"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update password'}
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
