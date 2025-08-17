import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
  const { signOut } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-primary rounded-full">
            <img 
              src="/consistent.svg" 
              alt="Consistency Logo" 
              className="w-5 h-5"
            />
          </div>
          <div>
            <h1 className="text-xl font-bebas font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent tracking-wider">
              CONSISTENCY
            </h1>
            <p className="text-xs text-muted-foreground">WE DECIDED</p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-center hidden sm:block">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatTime(currentTime)}</span>
            </div>
            <div className="text-xs font-medium">{formatDate(currentTime)}</div>
          </div>
          
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}