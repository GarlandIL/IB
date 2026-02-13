import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Bookmark, Search, Filter, X, Trash2, 
  Folder, Tag, Calendar, Clock, Eye, MessageSquare,
  FileText, Download, Share2, MoreVertical, Edit3,
  Check, CheckCircle, AlertCircle, Plus, Grid, List,
  ChevronDown, ChevronUp, FolderOpen, Star, Heart,
  TrendingUp, MapPin, DollarSign, Award, Users
} from 'lucide-react';
import { bookmarksAPI, projectsAPI, conversationsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import ProjectCard from '../../components/common/ProjectCard';
import { clsx } from 'clsx';

const InvestorBookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editTags, setEditTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [collections, setCollections] = useState([
    { id: 'all', name: 'All Bookmarks', icon: <FolderOpen size={16} />, count: 0 },
    { id: 'high-potential', name: 'High Potential', icon: <Star size={16} />, count: 0 },
    { id: 'due-diligence', name: 'Due Diligence', icon: <Eye size={16} />, count: 0 },
    { id: 'meetings', name: 'Meetings Scheduled', icon: <Calendar size={16} />, count: 0 },
    { id: 'archived', name: 'Archived', icon: <Folder size={16} />, count: 0 }
  ]);
  const [activeCollection, setActiveCollection] = useState('all');
  
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user?.type !== 'investor') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (isAuthenticated && user?.type === 'investor') {
      fetchBookmarks();
    }
  }, [isAuthenticated, user]);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = await bookmarksAPI.getByInvestor(user.id);
      setBookmarks(response.data);
      
      // Fetch project details for each bookmark
      if (response.data.length > 0) {
        const projectPromises = response.data.map(b => 
          projectsAPI.getById(b.projectId).catch(err => null)
        );
        const projectResults = await Promise.all(projectPromises);
        const validProjects = projectResults.filter(p => p !== null).map(p => p.data);
        setProjects(validProjects);
        
        // Update collection counts
        const updatedCollections = [...collections];
        updatedCollections[0].count = response.data.length;
        
        const highPotential = response.data.filter(b => 
          b.tags?.includes('high-potential') || b.tags?.includes('seed-ready')
        ).length;
        updatedCollections[1].count = highPotential;
        
        const dueDiligence = response.data.filter(b => 
          b.tags?.includes('due-diligence')
        ).length;
        updatedCollections[2].count = dueDiligence;
        
        setCollections(updatedCollections);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (bookmarkId, projectId) => {
    try {
      await bookmarksAPI.delete(bookmarkId);
      setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
      setProjects(projects.filter(p => p.id !== projectId));
      
      // Update collection counts
      const updatedCollections = [...collections];
      updatedCollections[0].count = bookmarks.length - 1;
      setCollections(updatedCollections);
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const handleEditBookmark = (bookmark) => {
    setSelectedBookmark(bookmark);
    setEditNotes(bookmark.notes || '');
    setEditTags(bookmark.tags || []);
    setShowNotesModal(true);
  };

  const handleSaveBookmarkEdits = async () => {
    if (!selectedBookmark) return;
    
    try {
      const updatedBookmark = {
        ...selectedBookmark,
        notes: editNotes,
        tags: editTags,
        updatedAt: new Date().toISOString()
      };
      
      await bookmarksAPI.update(selectedBookmark.id, updatedBookmark);
      
      setBookmarks(bookmarks.map(b => 
        b.id === selectedBookmark.id ? updatedBookmark : b
      ));
      
      setShowNotesModal(false);
      setSelectedBookmark(null);
      setEditNotes('');
      setEditTags([]);
    } catch (error) {
      console.error('Error updating bookmark:', error);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !editTags.includes(tagInput.trim())) {
      setEditTags([...editTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setEditTags(editTags.filter(t => t !== tag));
  };

  const getAllTags = () => {
    const tags = new Set();
    bookmarks.forEach(b => {
      b.tags?.forEach(t => tags.add(t));
    });
    return Array.from(tags);
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setActiveCollection('all');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedTags.length > 0) count++;
    if (activeCollection !== 'all') count++;
    return count;
  };

  const filteredBookmarks = bookmarks
    .filter(bookmark => {
      const project = projects.find(p => p.id === bookmark.projectId);
      if (!project) return false;
      
      // Collection filter
      if (activeCollection === 'high-potential') {
        return bookmark.tags?.some(t => ['high-potential', 'seed-ready'].includes(t));
      }
      if (activeCollection === 'due-diligence') {
        return bookmark.tags?.includes('due-diligence');
      }
      if (activeCollection === 'meetings') {
        // Would need to check for scheduled meetings
        return false;
      }
      if (activeCollection === 'archived') {
        return false; // Implement archive functionality
      }
      
      return true;
    })
    .filter(bookmark => {
      if (selectedTags.length === 0) return true;
      return selectedTags.every(tag => bookmark.tags?.includes(tag));
    })
    .filter(bookmark => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const project = projects.find(p => p.id === bookmark.projectId);
      
      return (
        project?.elevatorPitch?.tagline?.toLowerCase().includes(query) ||
        project?.sector?.toLowerCase().includes(query) ||
        project?.location?.toLowerCase().includes(query) ||
        bookmark.notes?.toLowerCase().includes(query) ||
        bookmark.tags?.some(t => t.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name':
          const projectA = projects.find(p => p.id === a.projectId);
          const projectB = projects.find(p => p.id === b.projectId);
          return (projectA?.elevatorPitch?.tagline || '').localeCompare(projectB?.elevatorPitch?.tagline || '');
        case 'funding':
          const fundingA = projects.find(p => p.id === a.projectId)?.elevatorPitch?.funding || 0;
          const fundingB = projects.find(p => p.id === b.projectId)?.elevatorPitch?.funding || 0;
          return fundingB - fundingA;
        default:
          return 0;
      }
    });

  const getProjectById = (projectId) => {
    return projects.find(p => p.id === projectId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (!isAuthenticated || user?.type !== 'investor') {
    return null;
  }

  if (loading) {
    return (
      <div className="pt-[72px] min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-12 h-12 border-4 border-neutral-200 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display font-semibold text-neutral-600">Loading your bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[72px] min-h-screen bg-neutral-50 pb-16">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 my-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-neutral-600" />
              </button>
              <h1 className="text-3xl md:text-4xl font-display font-bold flex items-center gap-3">
                <Bookmark size={32} className="text-primary" />
                Saved Projects
              </h1>
            </div>
            <p className="text-lg text-neutral-600 ml-12">
              Track and manage projects you're interested in
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={() => navigate('/discover')}
              icon={<Plus size={18} />}
            >
              Discover More
            </Button>
          </div>
        </div>

        {bookmarks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm mt-8">
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bookmark size={40} className="text-neutral-400" />
            </div>
            <h2 className="text-2xl font-display font-bold text-neutral-800 mb-3">
              No saved projects yet
            </h2>
            <p className="text-neutral-600 mb-8 max-w-md mx-auto">
              When you find interesting projects, bookmark them to review later and track your investment opportunities.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => navigate('/discover')} 
                variant="primary" 
                size="large"
              >
                Start Discovering
              </Button>
              <Button 
                onClick={() => navigate('/investor/dashboard')} 
                variant="ghost" 
                size="large"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 mt-8">
            {/* Sidebar - Collections & Tags */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-[92px]">
                <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                  <Folder size={18} className="text-primary" />
                  Collections
                </h3>
                
                <div className="space-y-1 mb-6">
                  {collections.map(collection => (
                    <button
                      key={collection.id}
                      onClick={() => setActiveCollection(collection.id)}
                      className={clsx(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all",
                        activeCollection === collection.id
                          ? 'bg-primary text-white'
                          : 'hover:bg-neutral-100 text-neutral-700'
                      )}
                    >
                      <span className="flex items-center gap-2 text-sm font-medium">
                        {collection.icon}
                        {collection.name}
                      </span>
                      <span className={clsx(
                        "text-xs font-semibold px-2 py-0.5 rounded-full",
                        activeCollection === collection.id
                          ? 'bg-white/20 text-white'
                          : 'bg-neutral-200 text-neutral-700'
                      )}>
                        {collection.count}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="border-t border-neutral-200 pt-6">
                  <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                    <Tag size={18} className="text-primary" />
                    Popular Tags
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {getAllTags().map(tag => {
                      const count = bookmarks.filter(b => b.tags?.includes(tag)).length;
                      const isSelected = selectedTags.includes(tag);
                      
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={clsx(
                            "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                            isSelected
                              ? 'bg-primary text-white'
                              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                          )}
                        >
                          <Tag size={12} />
                          {tag}
                          <span className={clsx(
                            "ml-1 text-[10px] font-bold",
                            isSelected ? 'text-white/80' : 'text-neutral-500'
                          )}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                    
                    {getAllTags().length === 0 && (
                      <p className="text-sm text-neutral-500">
                        No tags yet. Add tags to organize your bookmarks.
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-6 mt-6">
                  <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                    <Eye size={18} className="text-primary" />
                    Quick Stats
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600">Total Saved</span>
                      <span className="font-display font-bold text-lg">{bookmarks.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600">With Notes</span>
                      <span className="font-display font-bold text-lg">
                        {bookmarks.filter(b => b.notes).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600">High Potential</span>
                      <span className="font-display font-bold text-lg text-success">
                        {bookmarks.filter(b => b.tags?.includes('high-potential')).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-neutral-600">Due Diligence</span>
                      <span className="font-display font-bold text-lg text-amber-600">
                        {bookmarks.filter(b => b.tags?.includes('due-diligence')).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Search & Filters */}
              <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search by project name, notes, or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={clsx(
                        "px-4 py-2.5 border rounded-lg flex items-center gap-2 text-sm font-medium transition-all",
                        showFilters || getActiveFilterCount() > 0
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                      )}
                    >
                      <Filter size={16} />
                      Filters
                      {getActiveFilterCount() > 0 && (
                        <span className="ml-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {getActiveFilterCount()}
                        </span>
                      )}
                    </button>
                    
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2.5 border border-neutral-200 rounded-lg text-sm font-medium focus:outline-none focus:border-primary bg-white"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="oldest">Oldest First</option>
                      <option value="name">Project Name</option>
                      <option value="funding">Funding Amount</option>
                    </select>
                    
                    <div className="flex border border-neutral-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={clsx(
                          "px-3 py-2.5 transition-colors",
                          viewMode === 'grid'
                            ? 'bg-primary text-white'
                            : 'bg-white text-neutral-600 hover:bg-neutral-100'
                        )}
                      >
                        <Grid size={16} />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={clsx(
                          "px-3 py-2.5 transition-colors border-l border-neutral-200",
                          viewMode === 'list'
                            ? 'bg-primary text-white'
                            : 'bg-white text-neutral-600 hover:bg-neutral-100'
                        )}
                      >
                        <List size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Active Filters */}
                {(selectedTags.length > 0 || searchQuery || activeCollection !== 'all') && (
                  <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-neutral-200">
                    <div className="flex flex-wrap gap-2">
                      {activeCollection !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                          {collections.find(c => c.id === activeCollection)?.name}
                          <button
                            onClick={() => setActiveCollection('all')}
                            className="ml-1 hover:text-primary-dark"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      )}
                      
                      {selectedTags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                          <Tag size={10} />
                          {tag}
                          <button
                            onClick={() => toggleTag(tag)}
                            className="ml-1 hover:text-primary-dark"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-neutral-500 hover:text-neutral-700 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>

              {/* Results Count */}
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-neutral-600">
                  Showing <span className="font-semibold text-neutral-900">{filteredBookmarks.length}</span> of{' '}
                  <span className="font-semibold text-neutral-900">{bookmarks.length}</span> saved projects
                </p>
              </div>

              {/* Bookmarks Grid/List */}
              {filteredBookmarks.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={32} className="text-neutral-400" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-neutral-800 mb-2">
                    No matches found
                  </h3>
                  <p className="text-neutral-600 mb-6">
                    Try adjusting your search or filters
                  </p>
                  <Button variant="ghost" onClick={clearAllFilters}>
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                <div className={clsx(
                  "gap-6",
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' 
                    : 'space-y-4'
                )}>
                  {filteredBookmarks.map(bookmark => {
                    const project = getProjectById(bookmark.projectId);
                    if (!project) return null;
                    
                    return viewMode === 'grid' ? (
                      <div key={bookmark.id} className="relative group">
                        <ProjectCard
                          project={project}
                          onBookmark={null}
                          isBookmarked={true}
                        />
                        
                        {/* Overlay Actions */}
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditBookmark(bookmark)}
                            className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-neutral-100 transition-colors"
                            title="Edit notes & tags"
                          >
                            <Edit3 size={14} className="text-neutral-700" />
                          </button>
                          <button
                            onClick={() => handleRemoveBookmark(bookmark.id, project.id)}
                            className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-error hover:text-white transition-colors"
                            title="Remove bookmark"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        
                        {/* Notes Indicator */}
                        {bookmark.notes && (
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-2 text-xs border border-neutral-200 shadow-sm">
                              <p className="line-clamp-2 text-neutral-600">{bookmark.notes}</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Tags */}
                        {bookmark.tags && bookmark.tags.length > 0 && (
                          <div className="absolute top-4 left-4 flex flex-wrap gap-1 max-w-[60%]">
                            {bookmark.tags.slice(0, 2).map(tag => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 bg-white/95 backdrop-blur-sm text-neutral-700 rounded-full text-[10px] font-semibold border border-neutral-200"
                              >
                                {tag}
                              </span>
                            ))}
                            {bookmark.tags.length > 2 && (
                              <span className="px-2 py-0.5 bg-white/95 backdrop-blur-sm text-neutral-700 rounded-full text-[10px] font-semibold border border-neutral-200">
                                +{bookmark.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Date Saved */}
                        <div className="absolute bottom-4 right-4 text-[10px] text-neutral-500 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full border border-neutral-200">
                          Saved {formatDate(bookmark.createdAt)}
                        </div>
                      </div>
                    ) : (
                      <div key={bookmark.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-neutral-200 p-5">
                        <div className="flex items-start gap-4">
                          {/* Project Image */}
                          <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                            <img
                              src={project.elevatorPitch.images?.[0] || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200'}
                              alt={project.elevatorPitch.tagline}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="font-display font-bold text-lg mb-1">
                                  <Link to={`/projects/${project.id}`} className="hover:text-primary transition-colors">
                                    {project.elevatorPitch.tagline}
                                  </Link>
                                </h3>
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="inline-flex px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-md text-xs font-semibold">
                                    {project.sector}
                                  </span>
                                  <span className="flex items-center gap-1 text-xs text-neutral-500">
                                    <MapPin size={12} />
                                    {project.location}
                                  </span>
                                  <span className="flex items-center gap-1 text-xs text-success font-semibold">
                                    <DollarSign size={12} />
                                    ${(project.elevatorPitch.funding / 1000).toFixed(0)}K
                                  </span>
                                </div>
                                
                                {/* Notes */}
                                {bookmark.notes && (
                                  <div className="mb-2 p-2 bg-neutral-50 rounded-md text-xs text-neutral-600 border-l-3 border-primary">
                                    {bookmark.notes}
                                  </div>
                                )}
                                
                                {/* Tags */}
                                {bookmark.tags && bookmark.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {bookmark.tags.map(tag => (
                                      <span
                                        key={tag}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-full text-[10px] font-medium"
                                      >
                                        <Tag size={10} />
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                
                                {/* Metadata */}
                                <div className="flex items-center gap-4 text-[10px] text-neutral-400">
                                  <span className="flex items-center gap-1">
                                    <Calendar size={10} />
                                    Saved {formatDate(bookmark.createdAt)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Eye size={10} />
                                    {project.metrics?.views || 0} views
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Award size={10} />
                                    {project.metrics?.qualityScore || 0}% quality
                                  </span>
                                </div>
                              </div>
                              
                              {/* Actions */}
                              <div className="flex gap-2">
                                <Link to={`/projects/${project.id}`}>
                                  <Button variant="primary" size="small">
                                    View Project
                                  </Button>
                                </Link>
                                <button
                                  onClick={() => handleEditBookmark(bookmark)}
                                  className="p-2 text-neutral-500 hover:text-primary hover:bg-neutral-100 rounded-lg transition-colors"
                                  title="Edit notes & tags"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={() => handleRemoveBookmark(bookmark.id, project.id)}
                                  className="p-2 text-neutral-500 hover:text-error hover:bg-neutral-100 rounded-lg transition-colors"
                                  title="Remove bookmark"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Notes & Tags Modal */}
      {showNotesModal && selectedBookmark && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="bg-white p-8 rounded-xl max-w-lg w-full shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                <Bookmark size={24} className="text-primary" />
                Edit Bookmark
              </h2>
              <button
                onClick={() => setShowNotesModal(false)}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Project Info */}
              <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg">
                <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                  <img
                    src={projects.find(p => p.id === selectedBookmark.projectId)?.elevatorPitch.images?.[0] || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100'}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-sm truncate">
                    {projects.find(p => p.id === selectedBookmark.projectId)?.elevatorPitch.tagline}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {projects.find(p => p.id === selectedBookmark.projectId)?.sector} · {projects.find(p => p.id === selectedBookmark.projectId)?.location}
                  </p>
                </div>
              </div>
              
              {/* Notes */}
              <div>
                <label className="block font-display font-semibold text-sm text-neutral-700 mb-2 flex items-center gap-1">
                  <FileText size={14} />
                  Your Notes
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add notes about this project (e.g., key observations, follow-up questions, due diligence findings)"
                  rows={5}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                />
                <p className="text-xs text-neutral-400 mt-1">
                  {editNotes.length} characters · Markdown supported
                </p>
              </div>
              
              {/* Tags */}
              <div>
                <label className="block font-display font-semibold text-sm text-neutral-700 mb-2 flex items-center gap-1">
                  <Tag size={14} />
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {editTags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-primary-dark"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add a tag and press Enter"
                    className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                  />
                  <Button type="button" onClick={addTag} variant="secondary" size="small">
                    Add
                  </Button>
                </div>
                
                <div className="mt-3">
                  <p className="text-xs text-neutral-500 mb-2">Suggested tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {['high-potential', 'due-diligence', 'follow-up', 'seed-ready', 'meeting-scheduled', 'needs-research'].map(tag => (
                      !editTags.includes(tag) && (
                        <button
                          key={tag}
                          onClick={() => setEditTags([...editTags, tag])}
                          className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded-full text-[10px] font-medium hover:bg-neutral-200 transition-colors"
                        >
                          + {tag}
                        </button>
                      )
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <Award size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-blue-700 mb-1">Due Diligence Checklist</h4>
                    <div className="space-y-1">
                      <label className="flex items-center gap-2 text-xs text-blue-600">
                        <input type="checkbox" className="w-3 h-3 accent-primary" />
                        Review financial projections
                      </label>
                      <label className="flex items-center gap-2 text-xs text-blue-600">
                        <input type="checkbox" className="w-3 h-3 accent-primary" />
                        Verify market size claims
                      </label>
                      <label className="flex items-center gap-2 text-xs text-blue-600">
                        <input type="checkbox" className="w-3 h-3 accent-primary" />
                        Schedule founder call
                      </label>
                      <label className="flex items-center gap-2 text-xs text-blue-600">
                        <input type="checkbox" className="w-3 h-3 accent-primary" />
                        Check competitor landscape
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-neutral-200">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setShowNotesModal(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="primary" 
                onClick={handleSaveBookmarkEdits}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorBookmarks;