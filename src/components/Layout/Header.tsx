import { Link, useLocation } from 'react-router-dom';
import { Heart, Menu, X, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/confessions', label: 'Confessions' },
    { path: '/hustles', label: 'Hustle Board' },
    { path: '/events', label: 'Events' },
    { path: '/connect', label: 'Connect' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Heart className="h-6 w-6 text-accent" fill="currentColor" />
            <span className="gradient-text">Comrade Circle</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-smooth hover:text-primary ${
                  isActive(link.path) ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            {isAuthenticated ? (
              <Button variant="outline" size="sm" onClick={logout} className="hidden md:flex">
                Logout
              </Button>
            ) : (
              <Button variant="gradient" size="sm" asChild className="hidden md:flex">
                <Link to="/auth">Get Started</Link>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 text-sm font-medium transition-smooth ${
                  isActive(link.path) ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border">
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full"
                >
                  Logout
                </Button>
              ) : (
                <Button variant="gradient" size="sm" asChild className="w-full">
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
