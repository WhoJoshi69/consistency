import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto py-6 border-t border-border bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center space-x-1">
            <span>Proudly built in India</span>
            <Heart className="h-4 w-4 text-destructive" fill="currentColor" />
            <span>by</span>
            <a
              href="https://darshit-joshi.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:text-primary-glow transition-colors duration-200"
            >
              Darshit
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}