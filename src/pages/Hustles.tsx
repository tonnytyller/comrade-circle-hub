import { useState } from 'react';
import { Briefcase, Plus, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHustles } from '@/hooks/useHustles';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'job', label: 'Jobs' },
  { value: 'internship', label: 'Internships' },
  { value: 'project', label: 'Projects' },
  { value: 'tutoring', label: 'Tutoring' },
  { value: 'other', label: 'Other' },
];

const categoryColors: Record<string, string> = {
  job: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  internship: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  project: 'bg-green-500/10 text-green-500 border-green-500/20',
  tutoring: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  other: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export default function Hustles() {
  const { hustles, loading, addHustle, categoryFilter, setCategoryFilter } = useHustles();
  const { isAuthenticated, user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'job' as 'job' | 'internship' | 'project' | 'tutoring' | 'other',
    contactEmail: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addHustle({
        ...formData,
        postedBy: user?.nickname || user?.email || 'Anonymous',
      });
      setFormData({
        title: '',
        description: '',
        category: 'job',
        contactEmail: '',
      });
      setDialogOpen(false);
    } catch (error) {
      // Error handled by hook
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeAgo = (date: string) => {
    const days = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Hustle Board</span>
          </h1>
          <p className="text-muted-foreground">
            Discover opportunities, post gigs, and connect with ambitious students
          </p>
        </div>

        {/* Filter & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" disabled={!isAuthenticated}>
                <Plus className="h-4 w-4" />
                Post Opportunity
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Post an Opportunity</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Frontend Developer Needed"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    maxLength={100}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.slice(1).map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the opportunity, requirements, compensation..."
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

                <div>
                  <Label htmlFor="email">Contact Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  />
                </div>

                <Button type="submit" variant="gradient" className="w-full" disabled={submitting}>
                  {submitting ? 'Posting...' : 'Post Opportunity'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Hustles Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          ) : hustles.length === 0 ? (
            <Card className="md:col-span-2">
              <CardContent className="p-12 text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {categoryFilter === 'all' 
                    ? 'No opportunities posted yet. Be the first!'
                    : 'No opportunities in this category.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            hustles.map((hustle) => (
              <Card key={hustle.id} className="hover-scale card-shadow hover:card-shadow-hover">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-xl">{hustle.title}</CardTitle>
                    <Badge className={categoryColors[hustle.category]} variant="outline">
                      {hustle.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>by {hustle.postedBy}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(hustle.createdAt)}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {hustle.description}
                  </p>
                  {hustle.contactEmail && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`mailto:${hustle.contactEmail}`}>
                        <Mail className="h-4 w-4" />
                        Contact
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {!isAuthenticated && (
          <Card className="mt-8 bg-gradient-subtle">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">
                Ready to post opportunities or apply? Join now!
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
