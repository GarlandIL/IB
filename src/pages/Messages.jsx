import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Send, Paperclip, Video, Calendar, Phone, Search,
  MoreVertical, FileText, Download, Eye, CheckCheck, Check,
  Smile, Image as ImageIcon, X, Users, Star, Archive, Trash2,
  Clock, MapPin, Briefcase, AlertCircle
} from 'lucide-react';
import { conversationsAPI, projectsAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import { clsx } from 'clsx';

const Messages = () => {
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showMeetingScheduler, setShowMeetingScheduler] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const { user, isCreator, isInvestor } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchConversations();
    const projectId = searchParams.get('project');
    if (projectId) {
      startNewConversation(projectId);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  useEffect(() => {
    // Simulate typing indicator
    if (activeConversation) {
      const interval = setInterval(() => {
        setIsTyping(Math.random() > 0.7);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeConversation]);

  const fetchConversations = async () => {
    try {
      const response = await conversationsAPI.getByUser(user.id);
      const conversationsWithDetails = await Promise.all(
        response.data.map(async (conv) => {
          const otherUserId = isCreator ? conv.investorId : conv.creatorId;
          const userResponse = await usersAPI.getById(otherUserId);
          const projectResponse = await projectsAPI.getById(conv.projectId);
          
          return {
            ...conv,
            otherUser: userResponse.data,
            project: projectResponse.data
          };
        })
      );
      setConversations(conversationsWithDetails);
      
      if (conversationsWithDetails.length > 0 && !activeConversation) {
        setActiveConversation(conversationsWithDetails[0]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const startNewConversation = async (projectId) => {
    try {
      const projectResponse = await projectsAPI.getById(projectId);
      const creatorResponse = await usersAPI.getById(projectResponse.data.creatorId);
      
      const existingConv = conversations.find(
        c => c.projectId === projectId && c.investorId === user.id
      );
      
      if (existingConv) {
        setActiveConversation(existingConv);
      } else {
        const newConversation = {
          id: `conv_${Date.now()}`,
          projectId: projectId,
          creatorId: projectResponse.data.creatorId,
          investorId: user.id,
          status: 'active',
          messages: [],
          lastMessage: null,
          lastMessageAt: new Date().toISOString(),
          unreadCount: 0,
          createdAt: new Date().toISOString(),
          otherUser: creatorResponse.data,
          project: projectResponse.data
        };
        
        await conversationsAPI.create(newConversation);
        setConversations([newConversation, ...conversations]);
        setActiveConversation(newConversation);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!message.trim() && attachments.length === 0) return;

    const newMessage = {
      id: `msg_${Date.now()}`,
      senderId: user.id,
      content: message,
      attachments: attachments.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file)
      })),
      timestamp: new Date().toISOString(),
      read: false,
      delivered: true
    };

    try {
      await conversationsAPI.addMessage(activeConversation.id, newMessage);
      
      const updatedConversation = {
        ...activeConversation,
        messages: [...(activeConversation.messages || []), newMessage],
        lastMessage: message,
        lastMessageAt: new Date().toISOString()
      };
      
      setActiveConversation(updatedConversation);
      setConversations(conversations.map(c => 
        c.id === activeConversation.id ? updatedConversation : c
      ));
      
      setMessage('');
      setAttachments([]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileAttach = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const scheduleMeeting = async (meetingData) => {
    const meeting = {
      id: `meeting_${Date.now()}`,
      conversationId: activeConversation.id,
      title: meetingData.title,
      scheduledFor: meetingData.dateTime,
      duration: meetingData.duration,
      meetingLink: `https://meet.kairon.app/${activeConversation.id}`,
      createdBy: user.id,
      createdAt: new Date().toISOString()
    };

    const systemMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'system',
      content: `📅 Meeting scheduled: ${meetingData.title} on ${new Date(meetingData.dateTime).toLocaleString()}`,
      timestamp: new Date().toISOString(),
      type: 'system',
      meetingData: meeting
    };

    try {
      await conversationsAPI.addMessage(activeConversation.id, systemMessage);
      
      const updatedConversation = {
        ...activeConversation,
        messages: [...(activeConversation.messages || []), systemMessage],
        meetings: [...(activeConversation.meetings || []), meeting]
      };
      
      setActiveConversation(updatedConversation);
      setShowMeetingScheduler(false);
    } catch (error) {
      console.error('Error scheduling meeting:', error);
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await conversationsAPI.update(conversationId, { unreadCount: 0 });
      setConversations(conversations.map(c => 
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const archiveConversation = async (conversationId) => {
    try {
      await conversationsAPI.update(conversationId, { status: 'archived' });
      setConversations(conversations.filter(c => c.id !== conversationId));
      if (activeConversation?.id === conversationId) {
        setActiveConversation(conversations[0] || null);
      }
    } catch (error) {
      console.error('Error archiving conversation:', error);
    }
  };

  const filteredConversations = conversations
    .filter(c => {
      if (filter === 'unread') return c.unreadCount > 0;
      if (filter === 'starred') return c.starred;
      return c.status === 'active';
    })
    .filter(c => {
      if (!searchQuery) return true;
      return (
        c.otherUser.profile.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.project.elevatorPitch.tagline.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (diff < 604800000) return date.toLocaleDateString('en-US', { weekday: 'short' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="pt-[72px] min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="spinner w-12 h-12 border-4 border-neutral-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-[72px] min-h-screen bg-neutral-50">
      <div className="h-[calc(100vh-72px)] flex">
        {/* Conversations Sidebar */}
        <div className="w-80 bg-white border-r border-neutral-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-bold">Messages</h2>
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-neutral-100 rounded-md transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-md focus:outline-none focus:border-primary text-sm"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 mt-3">
              {['all', 'unread', 'starred'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={clsx(
                    'px-3 py-1 text-xs font-semibold rounded-full transition-all',
                    filter === f
                      ? 'bg-primary text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  )}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-4 text-center">
                <Users size={48} className="text-neutral-300 mb-3" />
                <p className="text-sm text-neutral-500">No conversations yet</p>
                <p className="text-xs text-neutral-400 mt-1">
                  Start by discovering projects
                </p>
              </div>
            ) : (
              filteredConversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setActiveConversation(conv);
                    markAsRead(conv.id);
                  }}
                  className={clsx(
                    'w-full p-4 border-b border-neutral-100 hover:bg-neutral-50 transition-colors text-left',
                    activeConversation?.id === conv.id && 'bg-primary/5 border-l-4 border-l-primary'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={conv.otherUser.profile.photo || 'https://i.pravatar.cc/40'}
                      alt={conv.otherUser.profile.fullName}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-display font-bold text-sm truncate">
                          {conv.otherUser.profile.fullName}
                        </h4>
                        <span className="text-xs text-neutral-400 flex-shrink-0 ml-2">
                          {formatTime(conv.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 mb-1 truncate">
                        {conv.project.elevatorPitch.tagline}
                      </p>
                      <p className={clsx(
                        'text-xs truncate',
                        conv.unreadCount > 0 ? 'text-neutral-900 font-semibold' : 'text-neutral-500'
                      )}>
                        {conv.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        {activeConversation ? (
          <div className="flex-1 flex flex-col bg-white">
            {/* Chat Header */}
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={activeConversation.otherUser.profile.photo || 'https://i.pravatar.cc/40'}
                  alt={activeConversation.otherUser.profile.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-display font-bold text-sm">
                    {activeConversation.otherUser.profile.fullName}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {activeConversation.project.elevatorPitch.tagline}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMeetingScheduler(true)}
                  className="p-2 hover:bg-neutral-100 rounded-md transition-colors"
                  title="Schedule meeting"
                >
                  <Calendar size={20} className="text-neutral-600" />
                </button>
                <button
                  onClick={() => window.open(`https://meet.kairon.app/${activeConversation.id}`, '_blank')}
                  className="p-2 hover:bg-neutral-100 rounded-md transition-colors"
                  title="Start video call"
                >
                  <Video size={20} className="text-neutral-600" />
                </button>
                <button
                  className="p-2 hover:bg-neutral-100 rounded-md transition-colors"
                >
                  <MoreVertical size={20} className="text-neutral-600" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-neutral-50">
              {activeConversation.messages?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Send size={28} className="text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2">Start the conversation</h3>
                  <p className="text-sm text-neutral-500 max-w-sm">
                    Introduce yourself and discuss the project details
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={clsx(
                        'flex',
                        msg.senderId === 'system' ? 'justify-center' : msg.senderId === user.id ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {msg.senderId === 'system' ? (
                        <div className="bg-neutral-100 text-neutral-600 px-4 py-2 rounded-full text-xs max-w-md text-center">
                          {msg.content}
                        </div>
                      ) : (
                        <div
                          className={clsx(
                            'max-w-md px-4 py-2 rounded-lg',
                            msg.senderId === user.id
                              ? 'bg-primary text-white rounded-br-none'
                              : 'bg-white border border-neutral-200 rounded-bl-none'
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          
                          {msg.attachments?.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {msg.attachments.map((att, idx) => (
                                <div
                                  key={idx}
                                  className={clsx(
                                    'flex items-center gap-2 p-2 rounded',
                                    msg.senderId === user.id ? 'bg-primary-dark' : 'bg-neutral-50'
                                  )}
                                >
                                  <FileText size={16} />
                                  <span className="text-xs flex-1 truncate">{att.name}</span>
                                  <Download size={14} className="cursor-pointer" />
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className={clsx(
                            'flex items-center gap-1 mt-1 text-xs',
                            msg.senderId === user.id ? 'text-white/70 justify-end' : 'text-neutral-400'
                          )}>
                            <span>{formatTime(msg.timestamp)}</span>
                            {msg.senderId === user.id && (
                              msg.read ? <CheckCheck size={14} /> : <Check size={14} />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-neutral-200 px-4 py-3 rounded-lg rounded-bl-none">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="px-4 py-2 border-t border-neutral-200 bg-neutral-50">
                <div className="flex gap-2 overflow-x-auto">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="relative flex items-center gap-2 bg-white border border-neutral-200 rounded px-3 py-2 min-w-fit">
                      <FileText size={16} className="text-neutral-600" />
                      <span className="text-xs truncate max-w-[150px]">{file.name}</span>
                      <button
                        onClick={() => removeAttachment(idx)}
                        className="p-0.5 hover:bg-neutral-100 rounded"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t border-neutral-200 bg-white">
              <div className="flex items-end gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileAttach}
                  multiple
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-neutral-100 rounded-md transition-colors flex-shrink-0"
                >
                  <Paperclip size={20} className="text-neutral-600" />
                </button>
                
                <div className="flex-1 relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    rows={1}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary resize-none"
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
                </div>

                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() && attachments.length === 0}
                  icon={<Send size={18} />}
                  className="flex-shrink-0"
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-neutral-50">
            <div className="text-center">
              <Users size={64} className="mx-auto text-neutral-300 mb-4" />
              <h3 className="text-xl font-display font-bold text-neutral-700 mb-2">
                No conversation selected
              </h3>
              <p className="text-neutral-500">
                Select a conversation to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Meeting Scheduler Modal */}
      {showMeetingScheduler && (
        <MeetingScheduler
          onClose={() => setShowMeetingScheduler(false)}
          onSchedule={scheduleMeeting}
        />
      )}
    </div>
  );
};

const MeetingScheduler = ({ onClose, onSchedule }) => {
  const [formData, setFormData] = useState({
    title: '',
    dateTime: '',
    duration: '30',
    agenda: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSchedule(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
      <div className="bg-white p-8 rounded-xl max-w-md w-full shadow-xl">
        <h2 className="text-2xl font-display font-bold mb-6">Schedule Meeting</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
              Meeting Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Project Discussion"
              required
              className="w-full px-4 py-2 border border-neutral-200 rounded-md focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={formData.dateTime}
              onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
              required
              className="w-full px-4 py-2 border border-neutral-200 rounded-md focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
              Duration (minutes)
            </label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-200 rounded-md focus:outline-none focus:border-primary"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
            </select>
          </div>

          <div>
            <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
              Agenda (Optional)
            </label>
            <textarea
              value={formData.agenda}
              onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
              placeholder="What will you discuss?"
              rows={3}
              className="w-full px-4 py-2 border border-neutral-200 rounded-md focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Schedule Meeting
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Messages;