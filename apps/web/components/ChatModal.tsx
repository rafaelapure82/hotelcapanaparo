'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';

interface ChatModalProps {
  bookingId: number;
  onClose: () => void;
  toUser: number;
  receiverName: string;
}

export default function ChatModal({ bookingId, onClose, toUser, receiverName }: ChatModalProps) {
  const { user } = useAuth();
  const { messages, sendMessage, joinChat, loadHistory, clearMessages } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (user?.id) {
      joinChat(user.id);
      loadHistory(bookingId).finally(() => setLoading(false));
    }
    return () => clearMessages();
  }, [bookingId, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    sendMessage(toUser, newMessage, bookingId);
    setNewMessage('');
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'white', width: '400px', height: '600px', borderRadius: '24px',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem', background: 'var(--primary)', color: 'white',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '12px' }}>
              <User size={20} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontWeight: 800 }}>{receiverName}</h4>
              <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.8 }}>Reserva #{bookingId}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#F8FAFC' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--secondary)' }}>Cargando mensajes...</p>
          ) : messages.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--secondary)', marginTop: '2rem' }}>No hay mensajes aún. Inicia la conversación sobre los comprobantes.</p>
          ) : (
            messages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.senderId === user?.id ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                background: msg.senderId === user?.id ? 'var(--primary)' : 'white',
                color: msg.senderId === user?.id ? 'white' : 'var(--foreground)',
                padding: '0.8rem 1rem',
                borderRadius: msg.senderId === user?.id ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                fontSize: '0.9rem',
                fontWeight: 500
              }}>
                {msg.content}
                <div style={{ fontSize: '0.6rem', opacity: 0.7, marginTop: '0.25rem', textAlign: 'right' }}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} style={{ padding: '1.5rem', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            style={{
              flex: 1, padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #E2E8F0',
              outline: 'none', fontSize: '0.9rem'
            }}
          />
          <button type="submit" style={{
            background: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem',
            borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
