'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';

export default function FloatingConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { user } = useAuth();
  const { socket, messages, sendMessage, joinChat, typingUsers, loadUserHistory } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Guest ID management & History loading
  useEffect(() => {
    let activeId = user?.id;
    if (!activeId) {
      const savedGuestId = localStorage.getItem('capabot_guest_id');
      if (savedGuestId) {
        activeId = parseInt(savedGuestId);
      } else {
        activeId = Math.floor(Math.random() * 1000000) * -1; // Negative ID for guests
        localStorage.setItem('capabot_guest_id', activeId.toString());
      }
    }
    
    if (activeId) {
      joinChat(activeId);
      // Load history with support (1) and bot (2)
      loadUserHistory(1); 
      loadUserHistory(2);
    }
  }, [user, socket?.connected]); // Re-load if user changes or socket reconnects

  // Also load history when opening the concierge to be sure
  useEffect(() => {
    if (isOpen) {
      loadUserHistory(1);
      loadUserHistory(2);
    }
  }, [isOpen]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUsers]);

  const handleSend = () => {
    console.log('🔘 Concierge: Botón enviar presionado. Input:', input);
    if (!input.trim()) return;
    
    if (!socket) {
      console.error('❌ Concierge: Socket no conectado');
      return;
    }

    console.log('📤 Concierge: Enviando mensaje a CapaBot (ID 2)...');
    sendMessage(2, input); // Send to ID 2 (CapaBot)
    setInput('');
  };

  const isBotTyping = typingUsers.has(2);

  // Filter messages for this specific conversation (the current user's room)
  // The server already only sends messages relevant to this user, so we show all.
  // We can filter by activeId just to be safe if multiple identities are used.
  const activeId = user?.id || (typeof window !== 'undefined' ? parseInt(localStorage.getItem('capabot_guest_id') || '0') : 0);
  const relevantMessages = messages.filter(m => m.senderId === activeId || m.receiverId === activeId);
  
  useEffect(() => {
    if (messages.length > 0) {
      console.log('📋 Concierge: Lista de mensajes actualizada. Count:', messages.length);
    }
  }, [messages]);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem',
          width: '64px', height: '64px', borderRadius: '32px',
          background: 'linear-gradient(135deg, #2ec4b6, #1a9e93)',
          color: 'white', border: 'none', cursor: 'pointer',
          boxShadow: '0 12px 24px -8px rgba(46, 196, 182, 0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          zIndex: 9999
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <div style={{ position: 'relative' }}>
            <MessageCircle size={30} />
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#FF3366', width: '20px', height: '20px', borderRadius: '10px', fontSize: '10px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>AI</div>
        </div>
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: '2rem', right: '2rem',
      width: '400px', height: '600px', backgroundColor: 'white',
      borderRadius: '32px', boxShadow: '0 24px 48px -12px rgba(0,0,0,0.15)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      zIndex: 9999, border: '1px solid #E2E8F0',
      animation: 'slideIn 0.3s ease-out'
    }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #2ec4b6, #1a9e93)', 
        padding: '1.5rem', color: 'white',
        display: 'flex', alignItems: 'center', gap: '1rem'
      }}>
        <div style={{ width: '48px', height: '48px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={28} />
        </div>
        <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.1rem' }}>CapaBot & Soporte</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, opacity: 0.9 }}>
                <div style={{ width: '8px', height: '8px', background: '#4ADE80', borderRadius: '4px' }} />
                Atención 24/7 disponible
            </div>
        </div>
        <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
            <X size={24} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#F8FAFC' }}>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase' }}>Hoy</span>
        </div>
        
        {relevantMessages.length === 0 && (
            <div style={{ background: 'white', padding: '1.25rem', borderRadius: '20px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                <Sparkles size={24} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>¡Hola! Soy CapaBot. ¿En qué puedo ayudarte hoy?</p>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#94A3B8' }}>Un agente humano también podrá responderte pronto.</p>
            </div>
        )}

        {relevantMessages.map((msg, i) => (
            <div key={i} style={{ 
                alignSelf: msg.senderId === activeId ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                display: 'flex',
                gap: '0.75rem',
                flexDirection: msg.senderId === activeId ? 'row-reverse' : 'row'
            }}>
                <div style={{ 
                    width: '32px', height: '32px', borderRadius: '12px', flexShrink: 0,
                    background: msg.senderId === activeId ? '#E2E8F0' : (msg.senderId === 2 ? 'var(--primary)' : '#0F172A'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                }}>
                    {msg.senderId === 2 ? <Bot size={18} /> : (msg.senderId === activeId ? <User size={18} color="#64748B" /> : <Sparkles size={18} />)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: msg.senderId === activeId ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                        backgroundColor: msg.senderId === activeId ? 'var(--primary)' : 'white',
                        color: msg.senderId === activeId ? 'white' : '#1E293B',
                        padding: '1rem 1.25rem',
                        borderRadius: msg.senderId === activeId ? '20px 0 20px 20px' : '0 20px 20px 20px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                        whiteSpace: 'pre-wrap'
                    }}>
                        {msg.content}
                    </div>
                    {msg.senderId !== activeId && (
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', marginTop: '0.3rem', marginLeft: '0.2rem' }}>
                            {msg.senderId === 2 ? 'CapaBot (AI)' : (msg.sender?.firstName || 'Staff Capanaparo')}
                        </span>
                    )}
                </div>
            </div>
        ))}

        {isBotTyping && (
            <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <Bot size={18} />
                </div>
                <div style={{ padding: '0.75rem 1.25rem', background: 'white', borderRadius: '0 20px 20px 20px', display: 'flex', gap: '4px' }}>
                    <div className="typing-dot" style={{ width: '6px', height: '6px', background: '#CBD5E1', borderRadius: '3px' }} />
                    <div className="typing-dot" style={{ width: '6px', height: '6px', background: '#CBD5E1', borderRadius: '3px', animationDelay: '0.2s' }} />
                    <div className="typing-dot" style={{ width: '6px', height: '6px', background: '#CBD5E1', borderRadius: '3px', animationDelay: '0.4s' }} />
                </div>
            </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: '1.5rem', background: 'white', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', gap: '0.75rem', background: '#F1F5F9', padding: '0.5rem', borderRadius: '16px' }}>
            <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Escribe tu consulta..."
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '0.5rem 0.75rem', fontWeight: 600, fontSize: '0.9rem' }}
            />
            <button 
                onClick={handleSend}
                style={{ background: 'var(--primary)', border: 'none', color: 'white', borderRadius: '12px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Send size={18} />
            </button>
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.65rem', color: '#94A3B8', marginTop: '1rem', fontWeight: 700 }}>Hotel Capanaparo — Powered by AI</p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideIn {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .typing-dot {
            animation: blink 1.4s infinite both;
        }
        @keyframes blink {
            0% { opacity: 0.2; }
            20% { opacity: 1; }
            100% { opacity: 0.2; }
        }
      `}} />
    </div>
  );
}
