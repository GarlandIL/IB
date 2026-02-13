import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
 Send, Paperclip, Video, Calendar, Search,
 FileText, Download, Check, CheckCheck,
  X, Users, Clock, Image, MessageSquare, CornerDownRight, File,
  FileSpreadsheet, FileArchive, Loader,
  AlertCircle, ExternalLink, Flag, Bell, TrendingUp, Shield, CheckCircle2,
   Info, LayoutDashboard, 
} from 'lucide-react';
import { conversationsAPI, projectsAPI, usersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import EnhancedMeetingScheduler from '../../components/meetings/EnhancedMeetingScheduler';
import DocumentSharing from '../../components/messages/DocumentSharing';
import MessageSearch from '../../components/messages/MessageSearch';
import { clsx } from 'clsx';

const CreatorMessages = () => {
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showMeetingScheduler, setShowMeetingScheduler] = useState(false);
  const [showDocumentSharing, setShowDocumentSharing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [meetingDetails, setMeetingDetails] = useState({
    title: '',
    dateTime: '',
    duration: '30',
    agenda: ''
  });
  const [documentDetails, setDocumentDetails] = useState({
    name: '',
    type: '',
    file: null
  });
  const [ndaRequests, setNdaRequests] = useState({});
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageInputRef = useRef(null);
  const documentInputRef = useRef(null);
  
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated or not creator
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user?.type !== 'creator') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (isAuthenticated && user?.type === 'creator') {
      fetchConversations();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const projectId = searchParams.get('project');
    if (projectId && conversations.length > 0) {
      // Find conversation by project ID
      const existing = conversations.find(c => c.projectId === projectId);
      if (existing) {
        setActiveConversation(existing);
        markAsRead(existing.id);
        navigate(`/creator/messages?conversation=${existing.id}`, { replace: true });
      }
    }
  }, [searchParams, conversations]);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  // Simulate typing indicator
  useEffect(() => {
    if (activeConversation) {
      const interval = setInterval(() => {
        setIsTyping(Math.random() > 0.7);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [activeConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await conversationsAPI.getByUser(user.id);
      
      const conversationsWithDetails = await Promise.all(
        response.data.map(async (conv) => {
          const otherUserId = conv.investorId;
          try {
            const userResponse = await usersAPI.getById(otherUserId);
            const projectResponse = await projectsAPI.getById(conv.projectId);
            
            return {
              ...conv,
              otherUser: userResponse.data,
              project: projectResponse.data,
              messages: conv.messages || []
            };
          } catch (err) {
            console.error('Error fetching conversation details:', err);
            return {
              ...conv,
              otherUser: { profile: { fullName: 'Unknown Investor', photo: null } },
              project: { elevatorPitch: { tagline: 'Unknown Project' } },
              messages: []
            };
          }
        })
      );
      
      // Sort by most recent message
      conversationsWithDetails.sort((a, b) => {
        const aTime = a.lastMessageAt || a.createdAt;
        const bTime = b.lastMessageAt || b.createdAt;
        return new Date(bTime) - new Date(aTime);
      });
      
      setConversations(conversationsWithDetails);
      
      // Calculate unread counts
      const counts = {};
      const ndaStatus = {};
      
      conversationsWithDetails.forEach(conv => {
        const unread = conv.messages?.filter(
          m => m.senderId !== user.id && !m.read
        ).length || 0;
        counts[conv.id] = unread;
        ndaStatus[conv.id] = conv.ndaSigned || false;
      });
      
      setUnreadCounts(counts);
      setNdaRequests(ndaStatus);
      
      // Set active conversation from URL param or first in list
      const conversationId = searchParams.get('conversation');
      if (conversationId) {
        const target = conversationsWithDetails.find(c => c.id === conversationId);
        if (target) {
          setActiveConversation(target);
          markAsRead(target.id);
        }
      } else if (conversationsWithDetails.length > 0 && !activeConversation) {
        setActiveConversation(conversationsWithDetails[0]);
        markAsRead(conversationsWithDetails[0].id);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  const handleSendMessage = async () => {
    if ((!message.trim() && attachments.length === 0) || !activeConversation) return;

    setSendingMessage(true);
    const messageId = `msg_${Date.now()}`;
    const tempMessage = {
      id: messageId,
      senderId: user.id,
      senderName: user.profile?.fullName || 'You',
      content: message,
      attachments: attachments.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      })),
      timestamp: new Date().toISOString(),
      read: false,
      delivered: true,
      status: 'sending'
    };

    // Optimistic update
    const updatedMessages = [...(activeConversation.messages || []), tempMessage];
    const updatedConversation = {
      ...activeConversation,
      messages: updatedMessages,
      lastMessage: message || 'Attachment',
      lastMessageAt: new Date().toISOString()
    };
    
    setActiveConversation(updatedConversation);
    setConversations(conversations.map(c => 
      c.id === activeConversation.id ? updatedConversation : c
    ));
    
    setMessage('');
    setAttachments([]);

    try {
      await conversationsAPI.addMessage(activeConversation.id, {
        ...tempMessage,
        status: 'sent'
      });
      
      const finalMessages = updatedMessages.map(m => 
        m.id === messageId ? { ...m, status: 'sent' } : m
      );
      
      const finalConversation = {
        ...updatedConversation,
        messages: finalMessages
      };
      
      setActiveConversation(finalConversation);
      setConversations(conversations.map(c => 
        c.id === activeConversation.id ? finalConversation : c
      ));
      
    } catch (error) {
      console.error('Error sending message:', error);
      const failedMessages = updatedMessages.map(m => 
        m.id === messageId ? { ...m, status: 'failed' } : m
      );
      
      const failedConversation = {
        ...updatedConversation,
        messages: failedMessages
      };
      
      setActiveConversation(failedConversation);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleFileAttach = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024); // 10MB limit
    
    if (validFiles.length < files.length) {
      alert('Some files were skipped because they exceed the 10MB limit.');
    }
    
    setAttachments([...attachments, ...validFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const markAsRead = async (conversationId) => {
    try {
      await conversationsAPI.markAsRead(conversationId, user.id);
      setUnreadCounts(prev => ({ ...prev, [conversationId]: 0 }));
      
      setConversations(conversations.map(c => 
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    if (!activeConversation || !meetingDetails.title || !meetingDetails.dateTime) return;

    const meeting = {
      id: `meet_${Date.now()}`,
      title: meetingDetails.title,
      scheduledFor: meetingDetails.dateTime,
      duration: parseInt(meetingDetails.duration),
      agenda: meetingDetails.agenda,
      conversationId: activeConversation.id,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      status: 'scheduled',
      meetingLink: `https://meet.innovatebridge.app/${activeConversation.id}_${Date.now()}`
    };

    const systemMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'system',
      content: `Meeting scheduled: ${meeting.title}`,
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
      setConversations(conversations.map(c => 
        c.id === activeConversation.id ? updatedConversation : c
      ));
      
      setShowMeetingScheduler(false);
      setMeetingDetails({
        title: '',
        dateTime: '',
        duration: '30',
        agenda: ''
      });
    } catch (error) {
      console.error('Error scheduling meeting:', error);
    }
  };

  const handleShareDocument = async (e) => {
    e.preventDefault();
    if (!activeConversation || !documentDetails.file) return;

    const file = documentDetails.file;
    const document = {
      id: `doc_${Date.now()}`,
      name: documentDetails.name || file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      uploadedBy: user.id,
      uploadedAt: new Date().toISOString(),
      status: 'shared'
    };

    const systemMessage = {
      id: `msg_${Date.now()}`,
      senderId: user.id,
      content: `Shared document: ${document.name}`,
      timestamp: new Date().toISOString(),
      type: 'document',
      documentData: document
    };

    try {
      await conversationsAPI.addMessage(activeConversation.id, systemMessage);
      
      const updatedConversation = {
        ...activeConversation,
        messages: [...(activeConversation.messages || []), systemMessage],
        sharedDocuments: [...(activeConversation.sharedDocuments || []), document]
      };
      
      setActiveConversation(updatedConversation);
      setConversations(conversations.map(c => 
        c.id === activeConversation.id ? updatedConversation : c
      ));
      
      setShowDocumentSharing(false);
      setDocumentDetails({
        name: '',
        type: '',
        file: null
      });
    } catch (error) {
      console.error('Error sharing document:', error);
    }
  };

  const handleSignNda = async (conversationId) => {
    try {
      await conversationsAPI.update(conversationId, { ndaSigned: true });
      
      setNdaRequests(prev => ({ ...prev, [conversationId]: true }));
      
      setConversations(conversations.map(c => 
        c.id === conversationId ? { ...c, ndaSigned: true } : c
      ));
      
      if (activeConversation?.id === conversationId) {
        setActiveConversation({ ...activeConversation, ndaSigned: true });
      }
      
      // Send system message
      const systemMessage = {
        id: `msg_${Date.now()}`,
        senderId: 'system',
        content: `NDA signed by ${user.profile?.fullName}`,
        timestamp: new Date().toISOString(),
        type: 'system'
      };
      
      await conversationsAPI.addMessage(conversationId, systemMessage);
      
    } catch (error) {
      console.error('Error signing NDA:', error);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return <Image size={18} />;
    if (fileType?.includes('pdf')) return <FileText size={18} />;
    if (fileType?.includes('spreadsheet') || fileType?.includes('excel') || fileType?.includes('csv')) {
      return <FileSpreadsheet size={18} />;
    }
    if (fileType?.includes('zip') || fileType?.includes('rar') || fileType?.includes('7z')) {
      return <FileArchive size={18} />;
    }
    return <File size={18} />;
  };

  const filteredConversations = conversations
    .filter(c => {
      if (filter === 'unread') return unreadCounts[c.id] > 0;
      if (filter === 'meetings') return c.meetings?.length > 0;
      if (filter === 'nda') return !c.ndaSigned;
      return true;
    })
    .filter(c => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        c.otherUser?.profile?.fullName?.toLowerCase().includes(query) ||
        c.project?.elevatorPitch?.tagline?.toLowerCase().includes(query) ||
        c.lastMessage?.toLowerCase().includes(query)
      );
    });

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  if (!isAuthenticated || user?.type !== 'creator') {
    return null;
  }

  if (loading) {
    return (
      <div className="pt-[72px] min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-12 h-12 border-4 border-neutral-200 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display font-semibold text-neutral-600">Loading your conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[72px] min-h-screen bg-neutral-50 h-screen flex flex-col overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        {/* Conversations Sidebar */}
        <div className="w-96 bg-white border-r border-neutral-200 flex flex-col flex-shrink-0">
          {/* Header */}
          <div className="p-5 border-b border-neutral-200 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-bold flex items-center gap-2">
                <MessageSquare size={20} className="text-primary" />
                Investor Messages
                {Object.values(unreadCounts).reduce((a, b) => a + b, 0) > 0 && (
                  <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                    {Object.values(unreadCounts).reduce((a, b) => a + b, 0)}
                  </span>
                )}
              </h2>
              <button
                onClick={() => navigate('/creator/dashboard')}
                className="p-2 hover:bg-neutral-100 rounded-md transition-colors"
                title="Close"
              >
                <X size={20} className="text-neutral-500" />
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
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {[
                { id: 'all', label: 'All', icon: <Inbox size={14} /> },
                { id: 'unread', label: 'Unread', icon: <Bell size={14} /> },
                { id: 'meetings', label: 'Meetings', icon: <Calendar size={14} /> },
                { id: 'nda', label: 'NDA Pending', icon: <Shield size={14} /> }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={clsx(
                    'px-3 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5',
                    filter === f.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  )}
                >
                  {f.icon}
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare size={32} className="text-neutral-400" />
                </div>
                <h3 className="font-display font-bold text-lg text-neutral-800 mb-2">No conversations yet</h3>
                <p className="text-sm text-neutral-500 mb-6">
                  {filter !== 'all' 
                    ? `No ${filter} conversations found`
                    : 'Investors will reach out when they\'re interested in your projects'
                  }
                </p>
                {filter === 'all' && (
                  <Button 
                    onClick={() => navigate('/creator/dashboard')} 
                    variant="primary" 
                    size="small"
                  >
                    View Your Projects
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {filteredConversations.map(conv => {
                  const unread = unreadCounts[conv.id] || 0;
                  const lastMessage = conv.messages?.[conv.messages.length - 1];
                  const needsNda = !ndaRequests[conv.id];
                  
                  return (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setActiveConversation(conv);
                        markAsRead(conv.id);
                        navigate(`/creator/messages?conversation=${conv.id}`, { replace: true });
                      }}
                      className={clsx(
                        'w-full p-4 hover:bg-neutral-50 transition-all text-left relative',
                        activeConversation?.id === conv.id && 'bg-primary/5 border-l-4 border-l-primary',
                        unread > 0 && 'bg-blue-50/30'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          {conv.otherUser?.profile?.photo ? (
                            <img
                              src={conv.otherUser.profile.photo}
                              alt={conv.otherUser.profile.fullName}
                              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 text-white flex items-center justify-center font-display font-bold text-lg shadow-sm">
                              {getInitials(conv.otherUser?.profile?.fullName)}
                            </div>
                          )}
                          {conv.status === 'active' && (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success border-2 border-white rounded-full" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h4 className={clsx(
                              "font-display text-sm truncate",
                              unread > 0 ? 'font-extrabold text-neutral-900' : 'font-semibold text-neutral-800'
                            )}>
                              {conv.otherUser?.profile?.fullName || 'Unknown Investor'}
                            </h4>
                            <span className="text-xs text-neutral-400 flex-shrink-0 ml-2">
                              {formatTime(conv.lastMessageAt || conv.createdAt)}
                            </span>
                          </div>
                          
                          <p className="text-xs text-neutral-500 mb-1 truncate font-medium">
                            {conv.project?.elevatorPitch?.tagline || 'Project Discussion'}
                          </p>
                          
                          <p className={clsx(
                            'text-xs truncate flex items-center gap-1',
                            unread > 0 
                              ? 'text-neutral-900 font-semibold' 
                              : 'text-neutral-600'
                          )}>
                            {lastMessage?.senderId === user.id && (
                              <CornerDownRight size={12} className="text-neutral-400 flex-shrink-0" />
                            )}
                            {lastMessage?.content || conv.lastMessage || 'No messages yet'}
                            {lastMessage?.attachments?.length > 0 && (
                              <span className="flex items-center gap-0.5 text-neutral-400">
                                <Paperclip size={12} />
                                {lastMessage.attachments.length}
                              </span>
                            )}
                          </p>

                          {/* Status indicators */}
                          <div className="flex gap-2 mt-1.5">
                            {needsNda && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-semibold">
                                <Shield size={10} />
                                NDA Required
                              </span>
                            )}
                            {conv.meetings?.some(m => new Date(m.scheduledFor) > new Date()) && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] font-semibold">
                                <Calendar size={10} />
                                Upcoming
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {unread > 0 && (
                          <span className="absolute top-4 right-4 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                            {unread}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        {activeConversation ? (
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-neutral-200 bg-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {activeConversation.otherUser?.profile?.photo ? (
                    <img
                      src={activeConversation.otherUser.profile.photo}
                      alt={activeConversation.otherUser.profile.fullName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 text-white flex items-center justify-center font-display font-bold text-lg shadow-sm">
                      {getInitials(activeConversation.otherUser?.profile?.fullName)}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success border-2 border-white rounded-full" />
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-lg text-neutral-900">
                      {activeConversation.otherUser?.profile?.fullName || 'Investor'}
                    </h3>
                    {activeConversation.otherUser?.profile?.organization && (
                      <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded text-xs font-medium">
                        {activeConversation.otherUser.profile.organization}
                      </span>
                    )}
                    {activeConversation.otherUser?.verified && (
                      <CheckCircle2 size={16} className="text-primary" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-neutral-500">
                      {activeConversation.project?.elevatorPitch?.tagline || 'Project Discussion'}
                    </p>
                    <span className="w-1 h-1 bg-neutral-300 rounded-full" />
                    <span className="text-xs text-neutral-500">
                      {activeConversation.ndaSigned ? (
                        <span className="text-success font-medium flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          NDA Signed
                        </span>
                      ) : (
                        <span className="text-amber-600 font-medium flex items-center gap-1">
                          <AlertCircle size={12} />
                          NDA Required
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {!activeConversation.ndaSigned && (
                  <button
                    onClick={() => handleSignNda(activeConversation.id)}
                    className="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-all text-sm font-semibold flex items-center gap-2"
                  >
                    <Shield size={16} />
                    Sign NDA
                  </button>
                )}
                
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className={clsx(
                    "p-2.5 rounded-lg transition-all",
                    showSearch 
                      ? 'bg-primary text-white' 
                      : 'text-neutral-600 hover:bg-neutral-100'
                  )}
                  title="Search in conversation"
                >
                  <Search size={18} />
                </button>
                
                <button
                  onClick={() => setShowDocumentSharing(true)}
                  className="p-2.5 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-all"
                  title="Share documents"
                >
                  <FileText size={18} />
                </button>
                
                <button
                  onClick={() => setShowMeetingScheduler(true)}
                  className="p-2.5 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-all"
                  title="Schedule meeting"
                >
                  <Calendar size={18} />
                </button>
                
                <a
                  href={`https://meet.innovatebridge.app/${activeConversation.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-all"
                  title="Start video call"
                >
                  <Video size={18} />
                </a>
              </div>
            </div>

            {/* Search Messages Bar */}
            {showSearch && (
              <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search in this conversation..."
                      className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={() => setShowSearch(false)}
                    className="p-2 text-neutral-500 hover:text-neutral-700"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* NDA Banner */}
            {!activeConversation.ndaSigned && (
              <div className="px-6 py-4 bg-amber-50 border-b border-amber-200">
                <div className="flex items-start gap-3">
                  <Shield size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-display font-bold text-sm text-amber-800 mb-1">
                      NDA Required to Share Full Details
                    </h4>
                    <p className="text-xs text-amber-700 mb-2">
                      This investor hasn't signed an NDA yet. Sign the NDA to share confidential project information.
                    </p>
                    <button
                      onClick={() => handleSignNda(activeConversation.id)}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all text-xs font-semibold inline-flex items-center gap-2"
                    >
                      <Shield size={14} />
                      Sign NDA Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-neutral-50/50 p-6 scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent">
              {(!activeConversation.messages || activeConversation.messages.length === 0) ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mb-6">
                    <MessageSquare size={40} className="text-primary/60" />
                  </div>
                  <h3 className="font-display font-bold text-2xl text-neutral-800 mb-2">
                    Start the conversation
                  </h3>
                  <p className="text-neutral-600 max-w-md mb-8 text-lg">
                    {activeConversation.otherUser?.profile?.fullName?.split(' ')[0] || 'The investor'} is interested in your project.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 max-w-md">
                    <button
                      onClick={() => setMessage("Thank you for your interest in our project! I'd be happy to share more details about our traction and growth plans.")}
                      className="p-4 bg-white border-2 border-neutral-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
                    >
                      <div className="font-display font-semibold text-sm mb-1 flex items-center gap-2">
                        <Users size={16} className="text-primary" />
                        Welcome
                      </div>
                      <p className="text-xs text-neutral-600">Thank the investor for their interest</p>
                    </button>
                    
                    <button
                      onClick={() => setMessage("I'd be happy to schedule a call to discuss potential investment. Are you available next week?")}
                      className="p-4 bg-white border-2 border-neutral-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
                    >
                      <div className="font-display font-semibold text-sm mb-1 flex items-center gap-2">
                        <Calendar size={16} className="text-primary" />
                        Schedule Call
                      </div>
                      <p className="text-xs text-neutral-600">Propose a meeting time</p>
                    </button>
                    
                    <button
                      onClick={() => {
                        setMessage("I've shared our pitch deck and financial model. Please let me know if you have any questions.");
                        handleSignNda(activeConversation.id);
                      }}
                      className="p-4 bg-white border-2 border-neutral-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
                    >
                      <div className="font-display font-semibold text-sm mb-1 flex items-center gap-2">
                        <Shield size={16} className="text-primary" />
                        Share Details
                      </div>
                      <p className="text-xs text-neutral-600">Sign NDA and share confidential info</p>
                    </button>
                    
                    <button
                      onClick={() => setMessage("Here are our key metrics: We've reached 15,000 users with 45% MoM growth and $250K ARR.")}
                      className="p-4 bg-white border-2 border-neutral-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
                    >
                      <div className="font-display font-semibold text-sm mb-1 flex items-center gap-2">
                        <TrendingUp size={16} className="text-primary" />
                        Key Metrics
                      </div>
                      <p className="text-xs text-neutral-600">Share traction highlights</p>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeConversation.messages.map((msg, idx) => {
                    const isOwn = msg.senderId === user.id;
                    const isSystem = msg.senderId === 'system';
                    const showDate = idx === 0 || 
                      new Date(msg.timestamp).toDateString() !== 
                      new Date(activeConversation.messages[idx - 1].timestamp).toDateString();
                    
                    return (
                      <React.Fragment key={msg.id}>
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <span className="px-3 py-1.5 bg-neutral-200/70 text-neutral-700 rounded-full text-xs font-semibold backdrop-blur-sm flex items-center gap-2">
                              <Calendar size={12} />
                              {new Date(msg.timestamp).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                        )}
                        
                        <div
                          id={`message-${msg.id}`}
                          className={clsx(
                            'flex transition-all duration-300',
                            isSystem ? 'justify-center' : isOwn ? 'justify-end' : 'justify-start'
                          )}
                        >
                          {isSystem ? (
                            <div className="bg-neutral-100 text-neutral-700 px-5 py-3 rounded-full text-xs max-w-lg text-center shadow-sm border border-neutral-200 flex items-center gap-2">
                              <Info size={14} className="text-neutral-500" />
                              {msg.content}
                            </div>
                          ) : (
                            <div className={clsx(
                              'max-w-[70%] group relative',
                              isOwn ? 'ml-auto' : 'mr-auto'
                            )}>
                              {!isOwn && (
                                <div className="flex items-center gap-2 mb-1 ml-1">
                                  <span className="text-xs font-semibold text-neutral-700">
                                    {msg.senderName || activeConversation.otherUser?.profile?.fullName}
                                  </span>
                                  {activeConversation.otherUser?.verified && (
                                    <CheckCircle2 size={12} className="text-primary" />
                                  )}
                                </div>
                              )}
                              
                              <div className={clsx(
                                'px-5 py-3 rounded-2xl shadow-sm',
                                isOwn 
                                  ? 'bg-gradient-to-r from-primary to-primary-dark text-white rounded-br-none' 
                                  : 'bg-white border border-neutral-200 rounded-bl-none'
                              )}>
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                
                                {msg.attachments?.length > 0 && (
                                  <div className="mt-3 space-y-2">
                                    {msg.attachments.map((att, attIdx) => (
                                      <div
                                        key={attIdx}
                                        className={clsx(
                                          'flex items-center gap-3 p-2 rounded-lg',
                                          isOwn ? 'bg-primary-dark/50' : 'bg-neutral-100'
                                        )}
                                      >
                                        {getFileIcon(att.type)}
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-medium truncate">{att.name}</p>
                                          <p className="text-[10px] opacity-70">{formatFileSize(att.size)}</p>
                                        </div>
                                        <a
                                          href={att.url}
                                          download={att.name}
                                          className={clsx(
                                            'p-1.5 rounded transition-colors',
                                            isOwn ? 'hover:bg-white/20' : 'hover:bg-neutral-200'
                                          )}
                                        >
                                          <Download size={14} />
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                {msg.meetingData && (
                                  <div className={clsx(
                                    'mt-3 p-3 rounded-lg',
                                    isOwn ? 'bg-primary-dark/50' : 'bg-neutral-100'
                                  )}>
                                    <div className="flex items-center gap-2 mb-2">
                                      <Calendar size={14} />
                                      <span className="text-xs font-semibold">Meeting Scheduled</span>
                                    </div>
                                    <p className="text-xs font-medium">{msg.meetingData.title}</p>
                                    <p className="text-xs opacity-80 mt-1">
                                      {new Date(msg.meetingData.scheduledFor).toLocaleString()}
                                    </p>
                                    <a
                                      href={msg.meetingData.meetingLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 mt-2 text-xs font-semibold underline underline-offset-2"
                                    >
                                      Join Meeting <ExternalLink size={12} />
                                    </a>
                                  </div>
                                )}
                                
                                {msg.documentData && (
                                  <div className={clsx(
                                    'mt-3 p-3 rounded-lg',
                                    isOwn ? 'bg-primary-dark/50' : 'bg-neutral-100'
                                  )}>
                                    <div className="flex items-center gap-2">
                                      {getFileIcon(msg.documentData.type)}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">{msg.documentData.name}</p>
                                        <p className="text-[10px] opacity-70">{formatFileSize(msg.documentData.size)}</p>
                                      </div>
                                      <a
                                        href={msg.documentData.url}
                                        download={msg.documentData.name}
                                        className={clsx(
                                          'p-1.5 rounded transition-colors',
                                          isOwn ? 'hover:bg-white/20' : 'hover:bg-neutral-200'
                                        )}
                                      >
                                        <Download size={14} />
                                      </a>
                                    </div>
                                  </div>
                                )}
                                
                                <div className={clsx(
                                  'flex items-center gap-1 mt-1.5 text-[10px]',
                                  isOwn ? 'text-white/70 justify-end' : 'text-neutral-400'
                                )}>
                                  <span>{formatTime(msg.timestamp)}</span>
                                  {isOwn && (
                                    <>
                                      {msg.status === 'sending' && (
                                        <Loader size={10} className="animate-spin" />
                                      )}
                                      {msg.status === 'sent' && !msg.read && (
                                        <Check size={10} />
                                      )}
                                      {msg.read && (
                                        <CheckCheck size={10} />
                                      )}
                                      {msg.status === 'failed' && (
                                        <AlertCircle size={10} className="text-error" />
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-neutral-200 px-4 py-3 rounded-lg rounded-bl-none shadow-sm">
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
              <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-neutral-700 flex items-center gap-1">
                    <Paperclip size={14} />
                    Attachments ({attachments.length})
                  </span>
                  <button
                    onClick={() => setAttachments([])}
                    className="text-xs text-neutral-500 hover:text-neutral-700"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="relative flex-shrink-0 w-48">
                      <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2">
                        {getFileIcon(file.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{file.name}</p>
                          <p className="text-[10px] text-neutral-500">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                          onClick={() => removeAttachment(idx)}
                          className="p-1 hover:bg-neutral-100 rounded"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="px-6 py-4 border-t border-neutral-200 bg-white">
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
                  className="p-3 hover:bg-neutral-100 rounded-lg transition-colors flex-shrink-0"
                  title="Attach files"
                >
                  <Paperclip size={20} className="text-neutral-600" />
                </button>
                
                <div className="flex-1 relative">
                  <textarea
                    ref={messageInputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={!activeConversation.ndaSigned ? "Sign NDA to share confidential information..." : "Type your message..."}
                    disabled={!activeConversation.ndaSigned}
                    rows={1}
                    className={clsx(
                      "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none",
                      !activeConversation.ndaSigned 
                        ? 'bg-neutral-100 border-neutral-200 text-neutral-500 cursor-not-allowed'
                        : 'border-neutral-200 focus:border-primary focus:ring-primary/20'
                    )}
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                  />
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={(!message.trim() && attachments.length === 0) || sendingMessage || !activeConversation.ndaSigned}
                  className={clsx(
                    "p-3 rounded-lg transition-all flex-shrink-0",
                    (!message.trim() && attachments.length === 0) || sendingMessage || !activeConversation.ndaSigned
                      ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary-dark'
                  )}
                >
                  {sendingMessage ? (
                    <Loader size={20} className="animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-neutral-400">
                  Press Enter to send, Shift+Enter for new line
                </span>
                {!activeConversation.ndaSigned && (
                  <span className="text-[10px] text-amber-600 flex items-center gap-1">
                    <Shield size={10} />
                    NDA required to send messages
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-neutral-50">
            <div className="text-center max-w-md px-6">
              <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <MessageSquare size={48} className="text-primary/60" />
              </div>
              <h2 className="font-display font-bold text-3xl text-neutral-800 mb-3">
                Investor Conversations
              </h2>
              <p className="text-neutral-600 text-lg mb-8">
                Select a conversation to connect with investors interested in your project.
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => navigate('/creator/dashboard')} 
                  variant="primary" 
                  size="large"
                  icon={<LayoutDashboard size={20} />}
                >
                  Go to Dashboard
                </Button>
                <Button 
                  onClick={() => navigate('/creator/projects/new')} 
                  variant="ghost" 
                  size="large"
                  icon={<FileText size={20} />}
                >
                  Create New Project
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Meeting Scheduler Modal */}
      {showMeetingScheduler && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="bg-white p-8 rounded-xl max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                <Calendar size={24} className="text-primary" />
                Schedule Meeting
              </h2>
              <button
                onClick={() => setShowMeetingScheduler(false)}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleScheduleMeeting} className="space-y-4">
              <div>
                <label className="block font-display font-semibold text-sm text-neutral-700 mb-2 flex items-center gap-1">
                  <Flag size={14} />
                  Meeting Title *
                </label>
                <input
                  type="text"
                  value={meetingDetails.title}
                  onChange={(e) => setMeetingDetails({ ...meetingDetails, title: e.target.value })}
                  placeholder="e.g., Investment Discussion - AgroConnect"
                  required
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block font-display font-semibold text-sm text-neutral-700 mb-2 flex items-center gap-1">
                  <CalendarDays size={14} />
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={meetingDetails.dateTime}
                  onChange={(e) => setMeetingDetails({ ...meetingDetails, dateTime: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block font-display font-semibold text-sm text-neutral-700 mb-2 flex items-center gap-1">
                  <Clock size={14} />
                  Duration (minutes)
                </label>
                <select
                  value={meetingDetails.duration}
                  onChange={(e) => setMeetingDetails({ ...meetingDetails, duration: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                </select>
              </div>

              <div>
                <label className="block font-display font-semibold text-sm text-neutral-700 mb-2 flex items-center gap-1">
                  <FileText size={14} />
                  Agenda (Optional)
                </label>
                <textarea
                  value={meetingDetails.agenda}
                  onChange={(e) => setMeetingDetails({ ...meetingDetails, agenda: e.target.value })}
                  placeholder="What would you like to discuss?"
                  rows={3}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setShowMeetingScheduler(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={!meetingDetails.title || !meetingDetails.dateTime}
                >
                  Schedule Meeting
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Sharing Modal */}
      {showDocumentSharing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="bg-white p-8 rounded-xl max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                <FileText size={24} className="text-primary" />
                Share Document
              </h2>
              <button
                onClick={() => setShowDocumentSharing(false)}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleShareDocument} className="space-y-4">
              <div>
                <label className="block font-display font-semibold text-sm text-neutral-700 mb-2 flex items-center gap-1">
                  <File size={14} />
                  Document Name *
                </label>
                <input
                  type="text"
                  value={documentDetails.name}
                  onChange={(e) => setDocumentDetails({ ...documentDetails, name: e.target.value })}
                  placeholder="e.g., Financial Projections Q1 2025"
                  required
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block font-display font-semibold text-sm text-neutral-700 mb-2 flex items-center gap-1">
                  <Upload size={14} />
                  Upload File *
                </label>
                <input
                  type="file"
                  ref={documentInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setDocumentDetails({
                        ...documentDetails,
                        file,
                        name: documentDetails.name || file.name
                      });
                    }
                  }}
                  className="hidden"
                />
                {!documentDetails.file ? (
                  <button
                    type="button"
                    onClick={() => documentInputRef.current?.click()}
                    className="w-full p-8 border-2 border-dashed border-neutral-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center gap-2"
                  >
                    <Upload size={32} className="text-neutral-400" />
                    <span className="text-sm font-medium text-neutral-600">Click to upload</span>
                    <span className="text-xs text-neutral-400">PDF, Excel, Word, Images (Max 10MB)</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                    {getFileIcon(documentDetails.file.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{documentDetails.file.name}</p>
                      <p className="text-xs text-neutral-500">{formatFileSize(documentDetails.file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDocumentDetails({ name: '', type: '', file: null })}
                      className="p-1.5 hover:bg-neutral-200 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              {!activeConversation.ndaSigned && (
                <div className="bg-amber-50 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Shield size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">
                      You need to sign an NDA before sharing documents. Documents shared without NDA may not be protected.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setShowDocumentSharing(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={!documentDetails.name || !documentDetails.file}
                >
                  Share Document
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorMessages;