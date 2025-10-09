import { useState } from 'react';
import { Calendar as CalendarIcon, MapPin, Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function Events() {
  const { events, loading, addEvent } = useEvents();
  const { isAuthenticated, user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    campus: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addEvent({
        ...formData,
        organizer: user?.nickname || user?.email || 'Anonymous',
      });
      setFormData({
        title: '',
        description: '',
        date: '',
        location: '',
        campus: '',
      });
      setDialogOpen(false);
    } catch (error) {
      // Error handled by hook
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) >= new Date();
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Campus Events</span>
          </h1>
          <p className="text-muted-foreground">
            Discover what's happening around campus and never miss out
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end mb-6">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" disabled={!isAuthenticated}>
                <Plus className="h-4 w-4" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create an Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Tech Career Fair"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    maxLength={100}
                  />
                </div>

                <div>
                  <Label htmlFor="date">Date & Time</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Student Center, Hall A"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="campus">Campus (optional)</Label>
                  <Input
                    id="campus"
                    placeholder="e.g., Main Campus"
                    value={formData.campus}
                    onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What's this event about?"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                    maxLength={500}
                  />
                  <span className="text-xs text-muted-foreground">
                    {formData.description.length}/500
                  </span>
                </div>

                <Button type="submit" variant="gradient" className="w-full" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Event'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          ) : events.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No events scheduled yet. Create one!</p>
              </CardContent>
            </Card>
          ) : (
            events.map((event) => (
              <Card 
                key={event.id} 
                className={`hover-scale card-shadow hover:card-shadow-hover ${
                  isUpcoming(event.date) ? '' : 'opacity-60'
                }`}
              >
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="flex flex-col items-center justify-center bg-gradient-primary text-white rounded-lg p-3 min-w-[60px]">
                          <span className="text-xs font-medium uppercase">
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-2xl font-bold">
                            {new Date(event.date).getDate()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-1">{event.title}</CardTitle>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              <span>{formatDate(event.date)} at {formatTime(event.date)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {isUpcoming(event.date) && (
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20" variant="outline">
                        Upcoming
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">{event.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    {event.campus && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span>•</span>
                        <span>{event.campus}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>by {event.organizer}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {!isAuthenticated && (
          <Card className="mt-8 bg-gradient-subtle">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                Want to create and RSVP to events? Join the community!
              </p>
              <Button variant="gradient" asChild>
                <a href="/auth">Sign Up Free</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
