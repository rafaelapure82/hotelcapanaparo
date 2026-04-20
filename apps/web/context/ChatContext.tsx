'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '@/lib/api';

interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  bookingId?: number;
  isRead: boolean;
  attachmentUrl?: string;
  createdAt: string;
  sender: { firstName: string; avatarUrl?: string };
}

interface ChatContextType {
  socket: Socket | null;
  messages: Message[];
  sendMessage: (receiverId: number, content: string, bookingId?: number, attachmentUrl?: string) => void;
  sendTyping: (receiverId: number, isTyping: boolean) => void;
  joinChat: (userId: number) => void;
  loadHistory: (bookingId: number) => Promise<void>;
  loadUserHistory: (otherUserId: number) => Promise<void>;
  markAsRead: (fromUserId: number) => Promise<void>;
  clearMessages: () => void;
  typingUsers: Set<number>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const loadHistory = async (bookingId: number) => {
    try {
      const { data } = await api.get(`/chat/history?bookingId=${bookingId}`);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load chat history', err);
    }
  };

  const loadUserHistory = async (otherUserId: number) => {
    if (!currentUserId) return;
    try {
      const { data } = await api.get(`/chat/history/${currentUserId}/${otherUserId}`);
      setMessages(prev => {
        // Merge without duplicates
        const existingIds = new Set(prev.map(m => m.id));
        const newMessages = data.filter((m: Message) => !existingIds.has(m.id));
        return [...prev, ...newMessages].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
    } catch (err) {
      console.error('Failed to load user chat history', err);
    }
  };

  const markAsRead = async (fromUserId: number) => {
    if (!currentUserId) return;
    try {
      await api.post('/chat/read', { userId: currentUserId, fromUserId });
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const clearMessages = () => setMessages([]);

  const joinChat = (userId: number) => {
    if (socket && currentUserId === userId) return;
    setCurrentUserId(userId);
    
    // In dev, use localhost:3000
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      query: { userId: userId.toString() }
    });

    newSocket.on('connect', () => {
      console.log('Chat Socket Connected');
    });

    newSocket.on('new_message', (msg: Message) => {
      console.log('📩 New message received via Socket:', msg);
      setMessages((prev) => {
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    newSocket.on('user_typing', (data: { userId: number, isTyping: boolean }) => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        if (data.isTyping) next.add(data.userId);
        else next.delete(data.userId);
        return next;
      });
    });

    setSocket(newSocket);
  };

  const sendMessage = (receiverId: number, content: string, bookingId?: number, attachmentUrl?: string) => {
    if (socket && currentUserId) {
      console.log('📤 Sending message...', { receiverId, content });
      
      // Optimistic update
      const tempMsg: Message = {
        id: Date.now() * -1, // Use negative ID to distinguish from server IDs
        content,
        senderId: currentUserId,
        receiverId,
        bookingId,
        isRead: false,
        attachmentUrl,
        createdAt: new Date().toISOString(),
        sender: { firstName: 'Tú', avatarUrl: undefined }
      };
      
      setMessages(prev => [...prev, tempMsg]);

      socket.emit('send_message', {
        senderId: currentUserId,
        receiverId,
        content,
        bookingId,
        attachmentUrl
      });
    } else {
      console.error('❌ Cannot send message: Socket or CurrentUserId missing', { socket: !!socket, currentUserId });
    }
  };

  const sendTyping = (receiverId: number, isTyping: boolean) => {
    if (socket && currentUserId) {
      socket.emit('typing', {
        senderId: currentUserId,
        receiverId,
        isTyping
      });
    }
  };

  useEffect(() => {
    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  return (
    <ChatContext.Provider value={{ 
      socket, 
      messages, 
      sendMessage, 
      sendTyping, 
      joinChat, 
      loadHistory, 
      loadUserHistory,
      markAsRead, 
      clearMessages,
      typingUsers
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
