import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, TrendingUp, MessageSquare, Eye } from 'lucide-react';
import { bookmarksAPI, projectsAPI, conversationsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ProjectCard from '../../components/common/ProjectCard';
import Button from '../../components/common/Button';

const InvestorDashboard = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [stats, setStats] = useState({
    savedProjects: 0,
    activeChats: 0,
    projectsViewed: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [bookmarksRes, conversationsRes] = await Promise.all([
        bookmarksAPI.getByInvestor(user.id),
        conversationsAPI.getByUser(user.id),
      ]);

      setBookmarks(bookmarksRes.data);
      setConversations(conversationsRes.data);

      if (bookmarksRes.data.length > 0) {
        const bookmarkedProjectIds = bookmarksRes.data.map(b => b.projectId);
        const projectsPromises = bookmarkedProjectIds.map(id => projectsAPI.getById(id));
        const projectsResults = await Promise.all(projectsPromises);
        setProjects(projectsResults.map(r => r.data));
      }

      setStats({
        savedProjects: bookmarksRes.data.length,
        activeChats: conversationsRes.data.filter(c => c.status === 'active').length,
        projectsViewed: bookmarksRes.data.length * 2,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
            <p className="text-lg text-neutral-600">Discover and track promising African innovations</p>
          </div>
          <Link to="/discover">
            <Button variant="primary" size="large">
              Discover Projects
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm flex items-center gap-6 hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-md flex items-center justify-center">
              <Bookmark size={24} />
            </div>
            <div>
              <div className="font-display text-3xl font-extrabold text-neutral-900 leading-none mb-1">
                {stats.savedProjects}
              </div>
              <div className="font-display font-semibold text-xs uppercase tracking-wider text-neutral-600">
                Saved Projects
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
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm flex items-center gap-6 hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-md flex items-center justify-center">
              <Eye size={24} />
            </div>
            <div>
              <div className="font-display text-3xl font-extrabold text-neutral-900 leading-none mb-1">
                {stats.projectsViewed}
              </div>
              <div className="font-display font-semibold text-xs uppercase tracking-wider text-neutral-600">
                Projects Viewed
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-display font-bold">Saved Projects</h2>
            <Link to="/investor/bookmarks">
              <Button variant="ghost">View All</Button>
            </Link>
          </div>
          
          {projects.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <h3 className="text-2xl font-display font-bold text-neutral-700 mb-2">No saved projects yet</h3>
              <p className="text-neutral-600 mb-6">Explore projects and bookmark the ones that interest you</p>
              <Link to="/discover">
                <Button variant="primary">
                  Start Discovering
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.slice(0, 3).map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project}
                  isBookmarked={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestorDashboard;