import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-accent" fill="currentColor" />
            <span className="font-semibold gradient-text">Comrade Circle</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            Connect, confess, hustle, and find your comrades. Built for students, by students.
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Comrade Circle. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
