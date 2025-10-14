import { useState } from 'react';
import { Heart, X, ChevronRight, Sparkles, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useConnectProfiles } from '@/hooks/useConnectProfiles';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import ChatWindow from '@/components/Chat/ChatWindow';
import { useNotification } from '@/contexts/NotificationContext';

export default function Connect() {
  const { profiles, loading, likeProfile, currentProfileIndex, nextProfile } = useConnectProfiles();
  const { isAuthenticated } = useAuth();
  const { success } = useNotification();
  const [chatWith, setChatWith] = useState<{ id: string; nickname: string } | null>(null);

  const currentProfile = profiles[currentProfileIndex];
  const hasMoreProfiles = currentProfileIndex < profiles.length - 1;

  const handleLike = async () => {
    if (!currentProfile) return;
    
    const isMatch = await likeProfile(currentProfile.id);
    if (isMatch) {
      success(`It's a match with ${currentProfile.nickname}! 🎉`);
      setTimeout(() => {
        setChatWith({ id: currentProfile.id, nickname: currentProfile.nickname });
      }, 1500);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8">
        <div className="container mx-auto px-4 max-w-md text-center">
          <Heart className="h-16 w-16 text-accent mx-auto mb-4" fill="currentColor" />
          <h2 className="text-2xl font-bold mb-2">
            <span className="gradient-text">Find Your Comrades</span>
          </h2>
          <p className="text-muted-foreground mb-6">
            Sign in to start connecting with fellow students
          </p>
          <Button variant="gradient" size="lg" asChild>
            <a href="/auth">Get Started</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">
              <span className="gradient-text">Comrade Connect</span>
            </h1>
            <p className="text-muted-foreground">
              Find study buddies, friends, or maybe something more...
            </p>
          </div>

          {loading ? (
            <Card className="max-w-md mx-auto">
              <CardContent className="p-8">
                <Skeleton className="h-64 w-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ) : !currentProfile ? (
            <Card className="max-w-md mx-auto">
              <CardContent className="p-12 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">You've seen everyone!</h3>
                <p className="text-muted-foreground">
                  Check back later for new comrades to connect with.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="max-w-md mx-auto">
              <Card className="card-shadow-hover overflow-hidden">
                {/* Profile Image Placeholder */}
                <div className="h-64 bg-gradient-primary relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="relative z-10 text-white text-center">
                    <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                      <span className="text-6xl">
                        {currentProfile.nickname.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold mb-2">{currentProfile.nickname}</h2>
                    {currentProfile.bio && (
                      <p className="text-muted-foreground mb-4">{currentProfile.bio}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {currentProfile.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {currentProfile.isMatched ? (
                    <div className="space-y-3">
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                        <Heart className="h-8 w-8 text-green-500 mx-auto mb-2" fill="currentColor" />
                        <p className="font-semibold text-green-500">It's a Match! 🎉</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          You can now connect with {currentProfile.nickname}
                        </p>
                      </div>
                      <Button
                        variant="gradient"
                        size="lg"
                        className="w-full"
                        onClick={() => setChatWith({ id: currentProfile.id, nickname: currentProfile.nickname })}
                      >
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Start Chat
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        size="lg"
                        className="flex-1"
                        onClick={nextProfile}
                        disabled={!hasMoreProfiles}
                      >
                        <X className="h-5 w-5" />
                        Pass
                      </Button>
                      <Button
                        variant="gradient"
                        size="lg"
                        className="flex-1"
                        onClick={handleLike}
                        disabled={currentProfile.isLiked}
                      >
                        <Heart className={`h-5 w-5 ${currentProfile.isLiked ? 'fill-current' : ''}`} />
                        {currentProfile.isLiked ? 'Liked' : 'Like'}
                      </Button>
                    </div>
                  )}

                  {hasMoreProfiles && !currentProfile.isMatched && (
                    <Button
                      variant="ghost"
                      className="w-full mt-3"
                      onClick={nextProfile}
                    >
                      Next Profile
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="mt-4 bg-gradient-subtle">
                <CardContent className="p-4">
                  <p className="text-sm text-center text-muted-foreground">
                    <span className="font-medium">Pro tip:</span> When you both like each other, it's a match! 
                    You'll be notified and can start chatting.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      {chatWith && (
        <ChatWindow
          otherUserId={chatWith.id}
          otherUserNickname={chatWith.nickname}
          onClose={() => setChatWith(null)}
        />
      )}
    </>
  );
}
