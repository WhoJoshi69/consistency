import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import AuthForm from "@/components/auth/AuthForm";
import Dashboard from "@/components/dashboard/Dashboard";

const Index = () => {
  const { user, loading } = useAuth();
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // Show intro animation for 2 seconds
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full animate-pulse">
            <img
              src="/consistent.svg"
              alt="Consistency Logo"
              className="w-8 h-8"
            />
          </div>
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted animate-pulse rounded mx-auto"></div>
            <div className="h-4 w-32 bg-muted animate-pulse rounded mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 animate-scale-in">
            <img src="/consistent.svg" alt="Consistency Logo" />
          </div>
          <div className="space-y-2 animate-fade-in">
            <h1 className="text-4xl font-bebas font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent tracking-wider">
              CONSISTENCY
            </h1>
            <p className="text-lg text-muted-foreground font-medium tracking-wider">
              WE DECIDED
            </p>
          </div>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthForm />;
};

export default Index;
