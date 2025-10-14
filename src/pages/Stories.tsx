import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useStories } from '@/hooks/useStories';
import { useNotification } from '@/contexts/NotificationContext';

export default function Stories() {
  const { isAuthenticated, user } = useAuth();
  const { stories, loading, addStory, deleteStory } = useStories();
  const { success, error: showError } = useNotification();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [viewingStory, setViewingStory] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Camera className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Stories</h2>
        <p className="text-muted-foreground mb-6 text-center">
          Share moments with photos that disappear after 24 hours
        </p>
        <Button onClick={() => navigate('/auth')} variant="gradient">
          Login to View Stories
        </Button>
      </div>
    );
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      await addStory(file);
      success('Story posted successfully!');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      showError('Failed to post story');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    try {
      await deleteStory(storyId);
      success('Story deleted');
      setViewingStory(false);
    } catch (err) {
      showError('Failed to delete story');
    }
  };

  const nextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    }
  };

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

  const currentStory = stories[currentStoryIndex];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Stories</h1>
            <p className="text-muted-foreground mt-1">
              Share moments that last 24 hours
            </p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="gradient"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Add Story
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Stories Grid */}
        {!viewingStory && (
          <div>
            {stories.length === 0 ? (
              <Card className="p-12 text-center">
                <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No stories yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to share a moment!
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Add Your First Story
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {stories.map((story, index) => (
                  <Card
                    key={story.id}
                    className="relative aspect-[9/16] cursor-pointer overflow-hidden group hover:ring-2 hover:ring-primary transition-all"
                    onClick={() => {
                      setCurrentStoryIndex(index);
                      setViewingStory(true);
                    }}
                  >
                    <img
                      src={story.imageUrl}
                      alt="Story"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white font-semibold">
                        {story.userNickname}
                      </p>
                      <p className="text-white/80 text-sm">
                        {new Date(story.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Story Viewer */}
        {viewingStory && currentStory && (
          <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
              onClick={() => setViewingStory(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation */}
            {currentStoryIndex > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 text-white hover:bg-white/20 z-10"
                onClick={prevStory}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
            )}
            {currentStoryIndex < stories.length - 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 text-white hover:bg-white/20 z-10"
                onClick={nextStory}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            )}

            {/* Story Content */}
            <div className="max-w-lg w-full aspect-[9/16] relative">
              <img
                src={currentStory.imageUrl}
                alt="Story"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">
                      {currentStory.userNickname}
                    </p>
                    <p className="text-white/80 text-sm">
                      {new Date(currentStory.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {currentStory.userId === user?.id && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteStory(currentStory.id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
