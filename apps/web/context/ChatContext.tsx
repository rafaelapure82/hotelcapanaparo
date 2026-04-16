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
  createdAt: string;
  sender: { firstName: string; avatar?: string };
}

interface ChatContextType {
  socket: Socket | null;
  messages: Message[];
  sendMessage: (receiverId: number, content: string, bookingId?: number) => void;
  joinChat: (userId: number) => void;
  loadHistory: (bookingId: number) => Promise<void>;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const loadHistory = async (bookingId: number) => {
    try {
      const { data } = await api.get(`/chat/history?bookingId=${bookingId}`);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load chat history', err);
    }
  };

  const clearMessages = () => setMessages([]);

  const joinChat = (userId: number) => {
    if (socket) return;
    const newSocket = io('http://localhost:3000', {
      query: { userId: userId.toString() }
    });

    newSocket.on('connect', () => {
      console.log('Chat Socket Connected');
    });

    newSocket.on('new_message', (msg: Message) => {
      setMessages((prev) => {
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    setSocket(newSocket);
  };

  const sendMessage = (receiverId: number, content: string, bookingId?: number) => {
    if (socket) {
      socket.emit('send_message', {
        senderId: parseInt(socket.io.opts.query?.userId as string),
        receiverId,
        content,
        bookingId
      });
    }
  };

  useEffect(() => {
    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  return (
    <ChatContext.Provider value={{ socket, messages, sendMessage, joinChat, loadHistory, clearMessages }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
