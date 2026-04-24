import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import WelcomeScreen from '@/components/WelcomeScreen';
import { useAuth } from '@/hooks/use-auth';

export default function Welcome() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  // If already signed in, skip welcome and go straight to the app
  useEffect(() => {
    if (!loading && session) navigate('/', { replace: true });
  }, [session, loading, navigate]);

  return <WelcomeScreen onStart={() => navigate('/auth')} />;
}
