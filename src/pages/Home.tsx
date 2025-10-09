import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Briefcase, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const features = [
    {
      icon: MessageSquare,
      title: 'Confessions',
      description: 'Share your thoughts anonymously or publicly. Get support from fellow students.',
      path: '/confessions',
      gradient: 'from-orange-500 to-pink-500',
    },
    {
      icon: Briefcase,
      title: 'Hustle Board',
      description: 'Find opportunities, post jobs, connect with ambitious peers.',
      path: '/hustles',
      gradient: 'from-pink-500 to-purple-500',
    },
    {
      icon: Calendar,
      title: 'Events',
      description: 'Discover campus events, parties, and gatherings. Never miss out!',
      path: '/events',
      gradient: 'from-purple-500 to-blue-500',
    },
    {
      icon: Users,
      title: 'Comrade Connect',
      description: 'Meet new friends, find study buddies, or maybe something more...',
      path: '/connect',
      gradient: 'from-blue-500 to-teal-500',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-subtle py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 flex justify-center">
              <Heart className="h-16 w-16 md:h-20 md:w-20 text-accent animate-pulse" fill="currentColor" />
            </div>
            <h1 className="mb-6 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Laugh. Confess. <br />
              <span className="gradient-text">Hustle. Connect.</span>
            </h1>
            <p className="mb-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              The ultimate student community where you can be yourself, find opportunities, and make real connections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" asChild>
                <Link to="/auth">Get Started Free</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/confessions">Explore Confessions</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need in <span className="gradient-text">One Place</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Connect with your fellow students in ways that matter
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.title} 
                  className="hover-scale card-shadow hover:card-shadow-hover cursor-pointer group"
                  onClick={() => window.location.href = feature.path}
                >
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-smooth`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Join Your <span className="gradient-text">Comrade Circle</span>?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Thousands of students are already connecting, sharing, and growing together.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/auth">Join the Community</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
