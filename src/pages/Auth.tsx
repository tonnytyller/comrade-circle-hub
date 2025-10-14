import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';

export default function Auth() {
  const navigate = useNavigate();
  const { login, signup, isAuthenticated, loading } = useAuth();
  const { success, error: showError } = useNotification();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ email: '', password: '', nickname: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      showError('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      await login(loginData.email, loginData.password);
      success('Welcome back!');
      navigate('/');
    } catch (err) {
      showError('Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupData.email || !signupData.password) {
      showError('Please fill in all required fields');
      return;
    }

    if (signupData.password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      await signup(signupData.email, signupData.password, signupData.nickname);
      success('Welcome to Comrade Circle!');
      navigate('/');
    } catch (err) {
      showError('Signup failed. Email might already be in use.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-subtle">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <Heart className="h-12 w-12 text-accent mx-auto mb-4 animate-pulse" fill="currentColor" />
          <h1 className="text-3xl font-bold">
            <span className="gradient-text">Comrade Circle</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Join the ultimate student community
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" variant="gradient" className="w-full" disabled={submitting}>
                    {submitting ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Signup Tab */}
          <TabsContent value="signup">
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Join thousands of students connecting every day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-nickname">Nickname (optional)</Label>
                    <Input
                      id="signup-nickname"
                      type="text"
                      placeholder="CoolStudent123"
                      value={signupData.nickname}
                      onChange={(e) => setSignupData({ ...signupData, nickname: e.target.value })}
                      maxLength={30}
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Must be at least 6 characters
                    </p>
                  </div>
                  <Button type="submit" variant="gradient" className="w-full" disabled={submitting}>
                    {submitting ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Note */}
        <Card className="mt-4 bg-muted/50">
          <CardContent className="p-4 text-center text-sm text-muted-foreground">
            <p>
              Create an account to get started or login with your existing credentials.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
