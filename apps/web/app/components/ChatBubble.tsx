'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, User } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext'; // Assuming AuthContext exists to get current user

export default function ChatBubble({ receiverId, bookingId, roomTitle }: { receiverId: number, bookingId?: number, roomTitle?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [msgInput, setMsgInput] = useState('');
  const { messages, sendMessage, joinChat } = useChat();
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) joinChat(user.id);
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (msgInput.trim() && user?.id) {
      sendMessage(receiverId, msgInput, bookingId);
      setMsgInput('');
    }
  };

  if (!user) return null;

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>
      {/* Bubble Toggle */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary)',
            boxShadow: '0 10px 25px rgba(46, 196, 182, 0.4)', border: 'none', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            transition: 'transform 0.2s ease'
          }}
          className="hover-scale"
        >
          <MessageSquare size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          width: '350px', height: '500px', background: 'white', borderRadius: '24px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column',
          overflow: 'hidden', border: '1px solid #E2E8F0'
        }} className="animate-in">
          
          {/* Header */}
          <div style={{ background: 'var(--primary)', padding: '1.25rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={18} />
              </div>
              <div>
                <p style={{ fontWeight: 800, fontSize: '0.9rem' }}>Soporte Hotel Capanaparo</p>
                <p style={{ fontSize: '0.7rem', opacity: 0.8 }}>Respuesta en tiempo real</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', background: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', marginTop: '4rem', opacity: 0.5 }}>
                 <p style={{ fontSize: '0.8rem' }}>Hola! ¿Tienes alguna duda sobre {roomTitle || 'tu reserva'}?</p>
              </div>
            )}
            {messages.map((m, i) => {
              const isMe = m.senderId === user.id;
              return (
                <div key={i} style={{
                  maxWidth: '80%', padding: '0.75rem 1rem', borderRadius: '16px',
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  background: isMe ? 'var(--primary)' : 'white',
                  color: isMe ? 'white' : 'var(--foreground)',
                  boxShadow: isMe ? 'none' : '0 2px 5px rgba(0,0,0,0.05)',
                  fontSize: '0.85rem', fontWeight: 600, border: isMe ? 'none' : '1px solid #E2E8F0'
                }}>
                  {m.content}
                </div>
              );
            })}
          </div>

          {/* Input Area */}
          <div style={{ padding: '1rem', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              value={msgInput}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              onChange={(e) => setMsgInput(e.target.value)}
              placeholder="Escribe un mensaje..."
              style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '0.85rem' }}
            />
            <button 
              onClick={handleSend}
              style={{ padding: '0.75rem', borderRadius: '12px', background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              <Send size={18} />
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
