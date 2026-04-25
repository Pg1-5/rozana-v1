import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function CalendarCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'working' | 'success' | 'error'>('working');
  const [message, setMessage] = useState('Connecting your Google Calendar...');

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const error = params.get('error');

      if (error) {
        setStatus('error');
        setMessage(`Authorization cancelled: ${error}`);
        setTimeout(() => navigate('/'), 2500);
        return;
      }
      if (!code) {
        setStatus('error');
        setMessage('Missing authorization code.');
        setTimeout(() => navigate('/'), 2500);
        return;
      }

      try {
        const redirectUri = `${window.location.origin}/calendar-callback`;
        const { data, error: fnErr } = await supabase.functions.invoke('google-calendar-oauth', {
          body: { action: 'exchange_code', code, redirect_uri: redirectUri },
        });
        if (fnErr || data?.error) throw new Error(fnErr?.message || data?.error);
        setStatus('success');
        setMessage(`Connected ${data?.email ?? 'Google Calendar'} ✓`);
        setTimeout(() => navigate('/'), 1500);
      } catch (e) {
        console.error(e);
        setStatus('error');
        setMessage('Could not connect calendar. Please try again.');
        setTimeout(() => navigate('/'), 2500);
      }
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="card-surface p-8 max-w-sm text-center">
        <p className="text-2xl mb-3">
          {status === 'working' ? '🔄' : status === 'success' ? '✅' : '⚠️'}
        </p>
        <p className="text-sm font-body text-foreground">{message}</p>
      </div>
    </div>
  );
}
