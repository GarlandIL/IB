import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, TrendingUp, Eye, MessageSquare, FileText, Edit, Trash2,
  BarChart3, Calendar, DollarSign, Target, Award, Users, Clock,
  CheckCircle, AlertCircle, PlayCircle, Archive
} from 'lucide-react';
import { projectsAPI, conversationsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { clsx } from 'clsx';

const CreatorDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalBookmarks: 0,
    activeChats: 0,
    ndaRequests: 0,
    totalProjects: 0,
    liveProjects: 0,
    avgQualityScore: 0,
    avgEngagementRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  
  const { user } = useAuth();

  const statusConfig = {
    draft: {
      label: 'Draft',
      icon: <FileText size={16} />,
      color: '#6b7280',
      description: 'Incomplete pitches being worked on'
    },
    review: {
      label: 'Under Review',
      icon: <Clock size={16} />,
      color: '#f59e0b',
      description: 'Submitted pitches in quality assurance'
    },
    live: {
      label: 'Live',
      icon: <PlayCircle size={16} />,
      color: '#10b981',
      description: 'Published and visible to investors'
    },
    funded: {
      label: 'Funded',
      icon: <CheckCircle size={16} />,
      color: '#8b5cf6',
      description: 'Successfully funded projects'
    },
    archived: {
      label: 'Archived',
      icon: <Archive size={16} />,
      color: '#94a3b8',
      description: 'Completed or withdrawn pitches'
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, conversationsRes] = await Promise.all([
        projectsAPI.getByCreator(user.id),
        conversationsAPI.getByUser(user.id),
      ]);

      setProjects(projectsRes.data);
      setConversations(conversationsRes.data);

      const totalViews = projectsRes.data.reduce((sum, p) => sum + (p.metrics?.views || 0), 0);
      const totalBookmarks = projectsRes.data.reduce((sum, p) => sum + (p.metrics?.bookmarks || 0), 0);
      const ndaRequests = projectsRes.data.reduce((sum, p) => sum + (p.metrics?.ndaRequests || 0), 0);
      const liveProjects = projectsRes.data.filter(p => p.status === 'live').length;
      
      const avgQuality = projectsRes.data.reduce((sum, p) => sum + (p.metrics?.qualityScore || 0), 0) / projectsRes.data.length;
      const avgEngagement = projectsRes.data.reduce((sum, p) => sum + (p.metrics?.engagementRate || 0), 0) / projectsRes.data.length;
      
      setStats({
        totalViews,
        totalBookmarks,
        activeChats: conversationsRes.data.filter(c => c.status === 'active').length,
        ndaRequests,
        totalProjects: projectsRes.data.length,
        liveProjects,
        avgQualityScore: Math.round(avgQuality),
        avgEngagementRate: avgEngagement.toFixed(1)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    try {
      await projectsAPI.delete(projectToDelete);
      setProjects(projects.filter(p => p.id !== projectToDelete));
      setShowDeleteModal(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const getProjectsByStatus = (status) => {
    if (status === 'all') return projects;
    return projects.filter(p => p.status === status);
  };

  const formatCurrency = (amount) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status];
    return (
      <span 
        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full"
        style={{ 
          backgroundColor: `${config.color}15`,
          color: config.color,
          border: `1px solid ${config.color}40`
        }}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  const upcomingMeetings = conversations
    .flatMap(c => c.meetings || [])
    .filter(m => new Date(m.scheduledFor) > new Date())
    .sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor))
    .slice(0, 3);

  const recentActivity = [
    ...projects.map(p => ({
      type: 'project',
      projectId: p.id,
      message: `Project updated: ${p.elevatorPitch.tagline}`,
      timestamp: p.updatedAt
    })),
    ...conversations.flatMap(c => 
      (c.messages || []).map(m => ({
        type: 'message',
        conversationId: c.id,
        message: `New message in conversation`,
        timestamp: m.timestamp
      }))
    )
  ]
  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  .slice(0, 5);

  if (loading) {
    return (
      <div className="pt-[72px] min-h-screen bg-neutral-50 pb-16">
        <div className="container">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="spinner w-12 h-12 border-4 border-neutral-200 border-t-primary rounded-full animate-spin mb-4" />
            <p className="font-display font-semibold text-neutral-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[72px] min-h-screen bg-neutral-50 pb-16">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 my-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-1">Welcome back, {user.profile.fullName}! 👋</h1>
            <p className="text-lg text-neutral-600">Manage your projects and track investor engagement</p>
          </div>
          <Link to="/creator/projects/new">
            <Button variant="primary" size="large" icon={<Plus size={20} />}>
              New Project
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm flex items-center gap-6 hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center">
              <Eye size={24} />
            </div>
            <div>
              <div className="font-display text-3xl font-extrabold text-neutral-900 leading-none mb-1">
                {stats.totalViews.toLocaleString()}
              </div>
              <div className="font-display font-semibold text-xs uppercase tracking-wider text-neutral-600">
                Total Views
              </div>
              <div className="flex items-center gap-1 text-xs text-success mt-1">
                <TrendingUp size={12} /> +12% this month
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm flex items-center gap-6 hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-md flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="font-display text-3xl font-extrabold text-neutral-900 leading-none mb-1">
                {stats.totalBookmarks}
              </div>
              <div className="font-display font-semibold text-xs uppercase tracking-wider text-neutral-600">
                Bookmarks
              </div>
              <div className="flex items-center gap-1 text-xs text-success mt-1">
                <TrendingUp size={12} /> +8 this week
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm flex items-center gap-6 hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-md flex items-center justify-center">
              <MessageSquare size={24} />
            </div>
            <div>
              <div className="font-display text-3xl font-extrabold text-neutral-900 leading-none mb-1">
                {stats.activeChats}
              </div>
              <div className="font-display font-semibold text-xs uppercase tracking-wider text-neutral-600">
                Active Conversations
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                {stats.activeChats > 0 ? `${stats.activeChats} ongoing` : 'None active'}
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm flex items-center gap-6 hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-md flex items-center justify-center">
              <FileText size={24} />
            </div>
            <div>
              <div className="font-display text-3xl font-extrabold text-neutral-900 leading-none mb-1">
                {stats.totalProjects}
              </div>
              <div className="font-display font-semibold text-xs uppercase tracking-wider text-neutral-600">
                Total Projects
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                {stats.liveProjects} live
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm flex items-center gap-6 hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-cyan-50 text-cyan-600 rounded-md flex items-center justify-center">
              <Award size={24} />
            </div>
            <div>
              <div className="font-display text-3xl font-extrabold text-neutral-900 leading-none mb-1">
                {stats.avgQualityScore}%
              </div>
              <div className="font-display font-semibold text-xs uppercase tracking-wider text-neutral-600">
                Avg Quality Score
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                {stats.avgQualityScore >= 80 ? 'Excellent' : stats.avgQualityScore >= 60 ? 'Good' : 'Needs work'}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm flex items-center gap-6 hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-md flex items-center justify-center">
              <Target size={24} />
            </div>
            <div>
              <div className="font-display text-3xl font-extrabold text-neutral-900 leading-none mb-1">
                {stats.avgEngagementRate}%
              </div>
              <div className="font-display font-semibold text-xs uppercase tracking-wider text-neutral-600">
                Engagement Rate
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                {stats.ndaRequests} NDA requests
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="text-3xl font-display font-bold">Your Projects</h2>
                <div className="flex flex-wrap gap-2">
                  <button 
                    className={clsx(
                      "px-3 py-1.5 text-sm font-display font-semibold rounded-md transition-colors",
                      selectedStatus === 'all' 
                        ? 'bg-primary text-white' 
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    )}
                    onClick={() => setSelectedStatus('all')}
                  >
                    All ({projects.length})
                  </button>
                  {Object.entries(statusConfig).map(([key, config]) => {
                    const count = projects.filter(p => p.status === key).length;
                    return count > 0 && (
                      <button
                        key={key}
                        className={clsx(
                          "px-3 py-1.5 text-sm font-display font-semibold rounded-md transition-colors inline-flex items-center gap-1",
                          selectedStatus === key 
                            ? 'bg-primary text-white' 
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        )}
                        onClick={() => setSelectedStatus(key)}
                      >
                        {config.icon}
                        {config.label} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {getProjectsByStatus(selectedStatus).length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                  <h3 className="text-2xl font-display font-bold text-neutral-700 mb-2">
                    No {selectedStatus !== 'all' ? statusConfig[selectedStatus].label.toLowerCase() : ''} projects
                  </h3>
                  <p className="text-neutral-600 mb-6">
                    {selectedStatus === 'all' && 'Create your first project to start connecting with investors'}
                  </p>
                  {selectedStatus === 'all' && (
                    <Link to="/creator/projects/new">
                      <Button variant="primary" icon={<Plus size={20} />}>
                        Create First Project
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {getProjectsByStatus(selectedStatus).map(project => (
                    <div key={project.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all">
                      <div className="flex flex-col md:flex-row">
                        <div className="relative md:w-48 h-48 md:h-auto">
                          <img 
                            src={project.elevatorPitch.images?.[0] || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400'} 
                            alt={project.elevatorPitch.tagline}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 right-3">
                            {getStatusBadge(project.status)}
                          </div>
                        </div>
                        
                        <div className="flex-1 p-6">
                          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                            <div>
                              <h3 className="text-xl font-display font-bold mb-2">{project.elevatorPitch.tagline}</h3>
                              <div className="flex flex-wrap gap-3">
                                <span className="inline-flex px-2 py-1 bg-neutral-100 text-neutral-700 rounded-md text-xs font-semibold">
                                  {project.sector}
                                </span>
                                <span className="inline-flex px-2 py-1 bg-success/10 text-success rounded-md text-xs font-semibold">
                                  {formatCurrency(project.elevatorPitch.funding)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {project.metrics && (
                            <div className="flex flex-wrap items-center gap-4 py-3 mb-4 border-t border-b border-neutral-200">
                              <div className="flex items-center gap-1 text-xs text-neutral-600">
                                <Eye size={14} />
                                <span>{project.metrics.views.toLocaleString()} views</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-neutral-600">
                                <TrendingUp size={14} />
                                <span>{project.metrics.bookmarks} bookmarks</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-neutral-600">
                                <MessageSquare size={14} />
                                <span>{project.metrics.ndaRequests} NDA requests</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-success font-semibold ml-auto">
                                <Award size={14} />
                                <span>{project.metrics.qualityScore}% quality</span>
                              </div>
                            </div>
                          )}

                          {project.status === 'draft' && project.metrics && (
                            <div className="mb-4">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium text-neutral-600">Completion</span>
                                <span className="font-semibold text-primary">{project.metrics.qualityScore}%</span>
                              </div>
                              <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full transition-all"
                                  style={{ width: `${project.metrics.qualityScore}%` }}
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-3">
                            <Link to={`/projects/${project.id}`}>
                              <Button variant="ghost" size="small" icon={<Eye size={16} />}>
                                View
                              </Button>
                            </Link>
                            <Link to={`/creator/projects/${project.id}/edit`}>
                              <Button variant="secondary" size="small" icon={<Edit size={16} />}>
                                Edit
                              </Button>
                            </Link>
                            <button 
                              className="p-2 text-neutral-400 hover:text-error rounded-md transition-colors"
                              onClick={() => {
                                setProjectToDelete(project.id);
                                setShowDeleteModal(true);
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="flex items-center gap-1 mt-4 text-xs text-neutral-400">
                            <Clock size={12} />
                            <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {upcomingMeetings.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="flex items-center gap-2 text-lg font-display font-bold mb-4">
                  <Calendar size={18} />
                  Upcoming Meetings
                </h3>
                <div className="space-y-4">
                  {upcomingMeetings.map(meeting => (
                    <div key={meeting.id} className="flex gap-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-neutral-100 rounded-md flex flex-col items-center justify-center">
                        <div className="font-display font-bold text-lg leading-none">
                          {new Date(meeting.scheduledFor).getDate()}
                        </div>
                        <div className="text-xs uppercase">
                          {new Date(meeting.scheduledFor).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-display font-semibold text-sm">{meeting.title}</h4>
                        <p className="text-xs text-neutral-500">
                          {new Date(meeting.scheduledFor).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                          })} · {meeting.duration}min
                        </p>
                        {meeting.meetingLink && (
                          <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-semibold hover:underline">
                            Join Meeting
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/creator/meetings" className="block mt-4">
                  <Button variant="ghost" fullWidth>View All Meetings</Button>
                </Link>
              </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-display font-bold mb-4">
                <BarChart3 size={18} />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-neutral-500 text-center py-4">No recent activity</p>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 flex items-center justify-center text-neutral-400">
                        {activity.type === 'project' ? <FileText size={14} /> : <MessageSquare size={14} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-neutral-700">{activity.message}</p>
                        <span className="text-xs text-neutral-400">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-primary">
              <h3 className="flex items-center gap-2 text-lg font-display font-bold mb-4">
                <Target size={18} />
                Quick Tips
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle size={14} className="text-success flex-shrink-0 mt-0.5" />
                  <span>Respond to investor messages within 24 hours</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle size={14} className="text-success flex-shrink-0 mt-0.5" />
                  <span>Update your project status regularly</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle size={14} className="text-success flex-shrink-0 mt-0.5" />
                  <span>Maintain a quality score above 80%</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle size={14} className="text-success flex-shrink-0 mt-0.5" />
                  <span>Add video pitches to increase engagement</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="bg-white p-10 rounded-xl max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-error" />
            </div>
            <h2 className="text-2xl font-display font-bold text-center mb-4">Delete Project?</h2>
            <p className="text-neutral-600 text-center mb-8">
              Are you sure you want to delete this project? This action cannot be undone.
              All associated data including conversations and analytics will be permanently removed.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteProject}>
                Delete Project
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorDashboard;