'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Paperclip, MoreVertical, User, MessageSquare, Check, CheckCheck } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import api from '@/lib/api';
import Cookies from 'js-cookie';

export default function MessagesPage() {
  const { messages, sendMessage, sendTyping, joinChat, markAsRead, typingUsers, loadHistory } = useChat();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeChat) {
      loadHistory(activeChat.lastMessage?.bookingId || 0); // Load history based on booking or general (0)
      if (activeChat.otherUser.id !== 2) {
        markAsRead(activeChat.otherUser.id);
      }
    }
  }, [activeChat]);

  useEffect(() => {
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      joinChat(user.id);
      fetchConversations(user.id);
    }
  }, []);

  useEffect(() => {
    if (activeChat && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.senderId === activeChat.otherUser.id && !lastMsg.isRead) {
        markAsRead(activeChat.otherUser.id);
      }
    }
  }, [messages, activeChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async (userId: number) => {
    try {
      const { data } = await api.get(`/chat/conversations/${userId}`);
      
      // Add CapaBot manually as the first conversation if not present
      const hasBot = data.find((c: any) => c.otherUser.id === 2);
      const enrichedData = hasBot ? data : [
        {
          otherUser: { id: 2, firstName: 'CapaBot', avatarUrl: null, roles: ['ai'] },
          lastMessage: { content: '¡Hola! Soy tu asistente virtual.', createdAt: new Date().toISOString() },
          unreadCount: 0
        },
        ...data
      ];
      
      setConversations(enrichedData);
    } catch (err) {
      console.error('Error fetching conversations', err);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !currentUser) return;

    sendMessage(activeChat.otherUser.id, newMessage);
    setNewMessage('');
    sendTyping(activeChat.otherUser.id, false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (activeChat) {
      sendTyping(activeChat.otherUser.id, e.target.value.length > 0);
    }
  };

  return (
    <div className="animate-in" style={{ 
      height: 'calc(100vh - 160px)', 
      display: 'grid', 
      gridTemplateColumns: '350px 1fr', 
      background: 'white', 
      borderRadius: '30px', 
      border: '1px solid #E2E8F0', 
      overflow: 'hidden' 
    }}>
      
      {/* Sidebar: Conv List */}
      <div style={{ borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1rem' }}>Mensajes</h2>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} size={16} />
            <input 
              type="text" 
              placeholder="Buscar chats..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.2rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', outline: 'none', fontSize: '0.9rem' }}
            />
          </div>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.map((conv) => (
            <div 
              key={conv.otherUser.id}
              onClick={() => setActiveChat(conv)}
              style={{ 
                padding: '1rem 1.5rem', 
                display: 'flex', 
                gap: '1rem', 
                cursor: 'pointer',
                background: activeChat?.otherUser.id === conv.otherUser.id ? 'var(--dominant)' : 'transparent',
                borderLeft: activeChat?.otherUser.id === conv.otherUser.id ? '4px solid var(--primary)' : '4px solid transparent',
                transition: 'background 0.2s'
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {conv.otherUser.avatarUrl ? <img src={conv.otherUser.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={24} style={{ color: 'var(--secondary)' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{conv.otherUser.firstName}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}>{new Date(conv.lastMessage.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                  <p style={{ fontSize: '0.8rem', color: conv.unreadCount > 0 ? 'black' : 'var(--secondary)', fontWeight: conv.unreadCount > 0 ? 800 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                    {conv.lastMessage.content}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span style={{ background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {conversations.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--secondary)' }}>
              No hay conversaciones activas
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div style={{ display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
        {activeChat ? (
          <>
            <div style={{ padding: '1rem 2rem', background: 'white', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#E2E8F0', overflow: 'hidden' }}>
                  {activeChat.otherUser.avatarUrl ? <img src={activeChat.otherUser.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={20} style={{ color: 'var(--secondary)', display: 'block', margin: '10px auto' }} />}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontWeight: 800, fontSize: '1rem' }}>{activeChat.otherUser.firstName}</h3>
                    {activeChat.otherUser.id === 2 && <span style={{ background: 'var(--primary)', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 900 }}>IA</span>}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: typingUsers.has(activeChat.otherUser.id) ? 'var(--primary)' : 'var(--secondary)', fontWeight: 700 }}>
                    {typingUsers.has(activeChat.otherUser.id) ? 'Escribiendo...' : 'En línea'}
                  </span>
                </div>
              </div>
              <MoreVertical size={20} style={{ color: 'var(--secondary)', cursor: 'pointer' }} />
            </div>

            <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Messages would be loaded here. For now using global messages filtered? 
                  Actually the context handles messages. We should load history on activeChat change.
              */}
              {messages.map((msg, idx) => (
                <div 
                  key={msg.id || idx} 
                  style={{ 
                    alignSelf: msg.senderId === currentUser.id ? 'flex-end' : 'flex-start',
                    maxWidth: '70%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.senderId === currentUser.id ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{ 
                    padding: '0.75rem 1rem', 
                    borderRadius: '20px', 
                    background: msg.senderId === currentUser.id ? 'var(--primary)' : 'white',
                    color: msg.senderId === currentUser.id ? 'white' : 'black',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    borderTopRightRadius: msg.senderId === currentUser.id ? '4px' : '20px',
                    borderTopLeftRadius: msg.senderId === currentUser.id ? '20px' : '4px'
                  }}>
                    {msg.content}
                    {msg.attachmentUrl && (
                       <div style={{ marginTop: '0.5rem', borderRadius: '12px', overflow: 'hidden' }}>
                          <img src={msg.attachmentUrl} alt="Adjunto" style={{ maxWidth: '100%', height: 'auto' }} />
                       </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.3rem' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--secondary)' }}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {msg.senderId === currentUser.id && (
                      msg.isRead ? <CheckCheck size={14} style={{ color: 'var(--primary)' }} /> : <Check size={14} style={{ color: 'var(--secondary)' }} />
                    )}
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            <form onSubmit={handleSendMessage} style={{ padding: '1.5rem 2rem', background: 'white', borderTop: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button type="button" style={{ background: 'transparent', border: 'none', color: 'var(--secondary)', cursor: 'pointer' }}>
                  <Paperclip size={20} />
                </button>
                <input 
                  type="text" 
                  placeholder="Escribe un mensaje..." 
                  value={newMessage}
                  onChange={handleInputChange}
                  style={{ flex: 1, padding: '0.8rem 1.2rem', borderRadius: '14px', border: '1px solid #E2E8F0', background: '#F8FAFC', outline: 'none', fontSize: '0.9rem' }}
                />
                <button type="submit" style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Send size={20} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', gap: '1.5rem' }}>
            <div style={{ padding: '2.5rem', borderRadius: '50%', background: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
              <MessageSquare size={48} style={{ color: 'var(--primary)' }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontWeight: 900, color: 'black', fontSize: '1.25rem' }}>Bandeja de Entrada</h3>
              <p style={{ fontWeight: 600 }}>Selecciona una conversación para comenzar a chatear</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
