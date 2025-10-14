import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  read: boolean;
  senderNickname?: string;
}

export interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: string;
  updatedAt: string;
  otherUserNickname?: string;
  lastMessage?: string;
}

export function useChat(otherUserId?: string) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Fetch or create conversation with another user
  const getOrCreateConversation = async (targetUserId: string) => {
    if (!user) return null;

    try {
      // Check if conversation exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${user.id})`)
        .single();

      if (existing) {
        return existing.id;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          user1_id: user.id,
          user2_id: targetUserId,
        })
        .select()
        .single();

      if (error) throw error;
      return newConv.id;
    } catch (error) {
      console.error('Error getting/creating conversation:', error);
      return null;
    }
  };

  // Fetch all conversations for current user
  const fetchConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          user1:profiles!conversations_user1_id_fkey(nickname),
          user2:profiles!conversations_user2_id_fkey(nickname),
          messages(content, created_at)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const formatted = data?.map((conv: any) => ({
        id: conv.id,
        user1Id: conv.user1_id,
        user2Id: conv.user2_id,
        createdAt: conv.created_at,
        updatedAt: conv.updated_at,
        otherUserNickname: conv.user1_id === user.id ? conv.user2?.nickname : conv.user1?.nickname,
        lastMessage: conv.messages?.[0]?.content,
      })) || [];

      setConversations(formatted);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(nickname)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formatted = data?.map((msg: any) => ({
        id: msg.id,
        conversationId: msg.conversation_id,
        senderId: msg.sender_id,
        content: msg.content,
        createdAt: msg.created_at,
        read: msg.read,
        senderNickname: msg.sender?.nickname,
      })) || [];

      setMessages(formatted);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Send a message
  const sendMessage = async (conversationId: string, content: string) => {
    if (!user || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  // Subscribe to realtime messages
  useEffect(() => {
    if (!currentConversationId) return;

    const channel = supabase
      .channel(`messages:${currentConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${currentConversationId}`,
        },
        async (payload) => {
          // Fetch sender info
          const { data: sender } = await supabase
            .from('profiles')
            .select('nickname')
            .eq('id', payload.new.sender_id)
            .single();

          const newMessage: Message = {
            id: payload.new.id,
            conversationId: payload.new.conversation_id,
            senderId: payload.new.sender_id,
            content: payload.new.content,
            createdAt: payload.new.created_at,
            read: payload.new.read,
            senderNickname: sender?.nickname,
          };

          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentConversationId]);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [user]);

  // If otherUserId is provided, get or create conversation with them
  useEffect(() => {
    if (otherUserId && user) {
      getOrCreateConversation(otherUserId).then((convId) => {
        if (convId) {
          setCurrentConversationId(convId);
          fetchMessages(convId);
        }
      });
    }
  }, [otherUserId, user]);

  return {
    conversations,
    messages,
    loading,
    currentConversationId,
    setCurrentConversationId,
    getOrCreateConversation,
    sendMessage,
    fetchMessages,
  };
}
