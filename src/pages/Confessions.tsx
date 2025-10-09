import { useState } from 'react';
import { ThumbsUp, MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConfessions } from '@/hooks/useConfessions';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function Confessions() {
  const { confessions, loading, addConfession, toggleUpvote, filter, setFilter } = useConfessions();
  const { isAuthenticated } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      await addConfession(content, isAnonymous);
      setContent('');
      setIsAnonymous(true);
      setDialogOpen(false);
    } catch (error) {
      // Error handled by hook
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Confessions</span>
          </h1>
          <p className="text-muted-foreground">
            Share your thoughts, secrets, and stories with fellow students
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as 'trending' | 'newest')}>
            <TabsList>
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="newest">Newest</TabsTrigger>
            </TabsList>
          </Tabs>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" disabled={!isAuthenticated}>
                <Plus className="h-4 w-4" />
                New Confession
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share a Confession</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea
                  placeholder="What's on your mind? Be honest, be real..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  maxLength={500}
                  required
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="anonymous"
                      checked={isAnonymous}
                      onCheckedChange={setIsAnonymous}
                    />
                    <Label htmlFor="anonymous">Post anonymously</Label>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {content.length}/500
                  </span>
                </div>
                <Button type="submit" variant="gradient" className="w-full" disabled={submitting}>
                  {submitting ? 'Posting...' : 'Post Confession'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Confessions List */}
        <div className="space-y-4">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-20 w-full mb-4" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))
          ) : confessions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No confessions yet. Be the first to share!</p>
              </CardContent>
            </Card>
          ) : (
            confessions.map((confession) => (
              <Card key={confession.id} className="hover-scale card-shadow hover:card-shadow-hover">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {confession.isAnonymous ? (
                        <Badge variant="secondary">Anonymous</Badge>
                      ) : (
                        <span className="text-sm font-medium">{confession.author}</span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(confession.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-foreground mb-4 leading-relaxed">
                    {confession.content}
                  </p>

                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleUpvote(confession.id)}
                      disabled={!isAuthenticated}
                      className={confession.hasUpvoted ? 'text-primary' : ''}
                    >
                      <ThumbsUp className={`h-4 w-4 ${confession.hasUpvoted ? 'fill-current' : ''}`} />
                      <span className="ml-1">{confession.upvotes}</span>
                    </Button>
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
                Want to post confessions and interact? Join the community!
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
