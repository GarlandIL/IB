import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Video, FileText, Download, Award,
  Search, Filter, Play, Clock, Users, TrendingUp,
  Shield, CheckCircle, ArrowRight, Star, Calendar,
  Download as DownloadIcon, ExternalLink, Bookmark,
  ChevronRight, PlayCircle, FileSpreadsheet, FileImage,
  MessageSquare, Lightbulb, Target, Briefcase, Heart,
  Globe, MapPin, DollarSign, BarChart, Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { clsx } from 'clsx';

const LearningHub = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [savedResources, setSavedResources] = useState([]);
  
  const { user, isAuthenticated } = useAuth();

  const categories = [
    { id: 'all', name: 'All Resources', icon: <Layers size={16} /> },
    { id: 'pitch_preparation', name: 'Pitch Preparation', icon: <Lightbulb size={16} /> },
    { id: 'investment_basics', name: 'Investment Basics', icon: <DollarSign size={16} /> },
    { id: 'financial_planning', name: 'Financial Planning', icon: <BarChart size={16} /> },
    { id: 'due_diligence', name: 'Due Diligence', icon: <Shield size={16} /> },
    { id: 'impact_measurement', name: 'Impact Measurement', icon: <Heart size={16} /> },
    { id: 'legal', name: 'Legal & Compliance', icon: <FileText size={16} /> }
  ];

  const resourceTypes = [
    { id: 'all', name: 'All Types', icon: null },
    { id: 'video', name: 'Videos', icon: <Video size={14} /> },
    { id: 'article', name: 'Articles', icon: <FileText size={14} /> },
    { id: 'guide', name: 'Guides', icon: <BookOpen size={14} /> },
    { id: 'template', name: 'Templates', icon: <FileSpreadsheet size={14} /> },
    { id: 'webinar', name: 'Webinars', icon: <PlayCircle size={14} /> }
  ];

  const resources = [
    {
      id: 1,
      title: 'How to Create a Winning Pitch Deck',
      description: 'Learn the essential elements of a compelling pitch deck that captures investor attention. Includes real examples from successful African startups.',
      type: 'video',
      category: 'pitch_preparation',
      duration: 1200,
      readTime: null,
      thumbnail: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400',
      url: '/resources/pitch-deck-masterclass',
      author: 'Amara Okoro, AgroConnect',
      published: '2025-01-15',
      views: 1234,
      rating: 4.8,
      level: 'beginner',
      tags: ['pitch deck', 'presentation', 'fundraising']
    },
    {
      id: 2,
      title: 'Understanding Investment Terms: Equity, Convertible Debt, and SAFEs',
      description: 'A comprehensive guide to common investment structures used in African startup funding. Learn the pros and cons of each.',
      type: 'article',
      category: 'investment_basics',
      duration: null,
      readTime: 15,
      thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
      url: '/resources/investment-terms-guide',
      author: 'Kwame Mensah, West Africa Angels',
      published: '2025-01-20',
      views: 892,
      rating: 4.9,
      level: 'beginner',
      tags: ['equity', 'convertible debt', 'valuation', 'terms']
    },
    {
      id: 3,
      title: 'Building Financial Projections for African Startups',
      description: 'Step-by-step guide to creating realistic 3-year financial projections. Includes downloadable Excel template tailored for African market assumptions.',
      type: 'template',
      category: 'financial_planning',
      duration: null,
      readTime: null,
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
      url: '/resources/financial-template',
      author: 'InnovateBridge Finance Team',
      published: '2025-01-10',
      downloads: 3456,
      rating: 4.7,
      level: 'intermediate',
      tags: ['financials', 'excel', 'projections', 'unit economics']
    },
    {
      id: 4,
      title: 'Investor Due Diligence Checklist',
      description: 'Comprehensive checklist for investors evaluating early-stage African startups. Covers financial, legal, operational, and market due diligence.',
      type: 'guide',
      category: 'due_diligence',
      duration: null,
      readTime: 25,
      thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400',
      url: '/resources/due-diligence-checklist',
      author: 'David Nkosi, Impact Ventures Africa',
      published: '2025-01-05',
      views: 567,
      rating: 4.9,
      level: 'advanced',
      tags: ['due diligence', 'investing', 'risk assessment']
    },
    {
      id: 5,
      title: 'Measuring Social Impact: IRIS+ and SDG Frameworks',
      description: 'How to define, measure, and report social impact using global standards. Perfect for impact investors and mission-driven entrepreneurs.',
      type: 'article',
      category: 'impact_measurement',
      duration: null,
      readTime: 20,
      thumbnail: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400',
      url: '/resources/impact-measurement',
      author: 'Dr. Ngozi Eze, Impact Metrics Lab',
      published: '2025-01-18',
      views: 345,
      rating: 4.6,
      level: 'intermediate',
      tags: ['impact', 'SDG', 'IRIS+', 'ESG']
    },
    {
      id: 6,
      title: 'Legal Essentials for African Founders',
      description: 'Key legal considerations when incorporating, raising capital, and protecting intellectual property in major African jurisdictions.',
      type: 'guide',
      category: 'legal',
      duration: null,
      readTime: 30,
      thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400',
      url: '/resources/legal-essentials',
      author: 'ALN Nigeria Law Firm',
      published: '2025-01-12',
      views: 678,
      rating: 4.8,
      level: 'intermediate',
      tags: ['legal', 'incorporation', 'IP', 'compliance']
    },
    {
      id: 7,
      title: 'Masterclass: Pitching to African Investors',
      description: 'Recorded webinar featuring 5 top African VCs discussing what they look for in pitch decks and founder meetings.',
      type: 'webinar',
      category: 'pitch_preparation',
      duration: 5400,
      readTime: null,
      thumbnail: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400',
      url: '/resources/pitch-masterclass',
      author: 'InnovateBridge + VC Panel',
      published: '2025-01-25',
      views: 2341,
      rating: 4.9,
      level: 'all',
      tags: ['pitching', 'webinar', 'investor perspective']
    },
    {
      id: 8,
      title: 'Customer Acquisition Cost (CAC) Benchmark Report',
      description: 'Benchmark CAC data across African tech sectors. Understand what "good" looks like for fintech, agritech, edtech, and more.',
      type: 'article',
      category: 'financial_planning',
      duration: null,
      readTime: 12,
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
      url: '/resources/cac-benchmarks',
      author: 'InnovateBridge Research',
      published: '2025-01-22',
      views: 1890,
      rating: 4.7,
      level: 'intermediate',
      tags: ['CAC', 'unit economics', 'benchmarks']
    }
  ];

  const featuredCourses = [
    {
      id: 'course_1',
      title: 'Fundraising Masterclass for African Founders',
      description: '6-week comprehensive course on preparing for, conducting, and closing funding rounds.',
      modules: 12,
      duration: '18 hours',
      level: 'All Levels',
      enrollment: 345,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
      startDate: '2025-03-01'
    },
    {
      id: 'course_2',
      title: 'Angel Investing in Africa',
      description: 'Learn how to source, evaluate, and support early-stage startups across the continent.',
      modules: 8,
      duration: '12 hours',
      level: 'Beginner',
      enrollment: 189,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?w=400',
      startDate: '2025-03-15'
    }
  ];

  const getFilteredResources = () => {
    return resources
      .filter(resource => {
        if (selectedCategory !== 'all' && resource.category !== selectedCategory) return false;
        if (selectedType !== 'all' && resource.type !== selectedType) return false;
        if (!searchQuery) return true;
        
        const query = searchQuery.toLowerCase();
        return (
          resource.title.toLowerCase().includes(query) ||
          resource.description.toLowerCase().includes(query) ||
          resource.tags.some(tag => tag.toLowerCase().includes(query))
        );
      });
  };

  const filteredResources = getFilteredResources();
  const isCreator = user?.type === 'creator';
  const isInvestor = user?.type === 'investor';

  const toggleSaveResource = (resourceId) => {
    setSavedResources(prev =>
      prev.includes(resourceId)
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  const formatDuration = (seconds) => {
    if (!seconds) return null;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Video size={16} />;
      case 'article': return <FileText size={16} />;
      case 'guide': return <BookOpen size={16} />;
      case 'template': return <FileSpreadsheet size={16} />;
      case 'webinar': return <PlayCircle size={16} />;
      default: return <FileText size={16} />;
    }
  };

  return (
    <div className="pt-[72px] min-h-screen bg-neutral-50 pb-16">
      <div className="container">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl text-white p-12 my-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
          
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Award size={24} />
              <span className="text-sm font-semibold uppercase tracking-wider">InnovateBridge Academy</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Learn to Raise, Invest, and Scale
            </h1>
            <p className="text-xl opacity-90 mb-8">
              Free resources, templates, and courses designed for African innovators and investors.
            </p>
            
            <div className="flex flex-wrap gap-4">
              {!isAuthenticated ? (
                <>
                  <Link to="/signup?type=creator">
                    <Button size="large" className="bg-white text-primary hover:bg-neutral-100">
                      Join as Creator
                    </Button>
                  </Link>
                  <Link to="/signup?type=investor">
                    <Button size="large" variant="secondary" className="border-white text-white hover:bg-white/10">
                      Join as Investor
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-4 bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <BookOpen size={24} />
                  <div>
                    <p className="text-sm font-semibold">Your Learning Progress</p>
                    <p className="text-2xl font-display font-bold">3/12</p>
                    <p className="text-xs opacity-80">Resources completed</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={clsx(
              "px-6 py-4 text-sm font-display font-medium flex items-center gap-2 border-b-2 transition-all whitespace-nowrap",
              activeTab === 'all'
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            )}
          >
            <Layers size={16} />
            All Resources
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={clsx(
              "px-6 py-4 text-sm font-display font-medium flex items-center gap-2 border-b-2 transition-all whitespace-nowrap",
              activeTab === 'courses'
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            )}
          >
            <PlayCircle size={16} />
            Courses
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={clsx(
              "px-6 py-4 text-sm font-display font-medium flex items-center gap-2 border-b-2 transition-all whitespace-nowrap",
              activeTab === 'templates'
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            )}
          >
            <FileSpreadsheet size={16} />
            Templates
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={clsx(
              "px-6 py-4 text-sm font-display font-medium flex items-center gap-2 border-b-2 transition-all whitespace-nowrap",
              activeTab === 'saved'
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            )}
          >
            <Bookmark size={16} />
            Saved Resources
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search resources, guides, templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            <div className="flex gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary bg-white"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary bg-white"
              >
                {resourceTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {activeTab === 'all' && (
          <>
            {/* Featured Courses */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                  <Award size={24} className="text-primary" />
                  Featured Courses
                </h2>
                <Link to="/learn/courses" className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline">
                  View All Courses
                  <ChevronRight size={16} />
                </Link>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {featuredCourses.map(course => (
                  <div key={course.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all border border-neutral-200">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-48 h-48 md:h-auto">
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                            {course.level}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-neutral-500">
                            <Star size={12} className="fill-amber-400 text-amber-400" />
                            {course.rating}
                          </span>
                        </div>
                        
                        <h3 className="font-display font-bold text-lg mb-2 line-clamp-2">
                          {course.title}
                        </h3>
                        
                        <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                          {course.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-neutral-500 mb-4">
                          <span className="flex items-center gap-1">
                            <Layers size={14} />
                            {course.modules} modules
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {course.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            {course.enrollment} enrolled
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs">
                            <Calendar size={14} className="text-primary" />
                            <span>Starts {new Date(course.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
                          </div>
                          
                          <Button variant="primary" size="small">
                            Enroll Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Resources */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                  <BookOpen size={24} className="text-primary" />
                  Recent Resources
                </h2>
                <p className="text-sm text-neutral-500">
                  {filteredResources.length} resources available
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map(resource => (
                  <div key={resource.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all border border-neutral-200 group">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={resource.thumbnail}
                        alt={resource.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {resource.type === 'video' && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                            <Play size={20} className="text-primary ml-1" />
                          </div>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold flex items-center gap-1">
                          {getTypeIcon(resource.type)}
                          {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                        </span>
                      </div>
                      {isAuthenticated && (
                        <button
                          onClick={() => toggleSaveResource(resource.id)}
                          className="absolute top-3 right-3 w-8 h-8 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                        >
                          <Bookmark
                            size={14}
                            className={savedResources.includes(resource.id) ? 'fill-current' : ''}
                          />
                        </button>
                      )}
                    </div>
                    
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-primary">
                          {categories.find(c => c.id === resource.category)?.name}
                        </span>
                        <span className="w-1 h-1 bg-neutral-300 rounded-full" />
                        <span className="text-xs text-neutral-500">
                          {resource.type === 'article' ? `${resource.readTime} min read` : 
                           resource.type === 'video' ? formatDuration(resource.duration) :
                           resource.type === 'webinar' ? formatDuration(resource.duration) :
                           `${resource.downloads || 0} downloads`}
                        </span>
                      </div>
                      
                      <h3 className="font-display font-bold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors">
                        <Link to={resource.url}>{resource.title}</Link>
                      </h3>
                      
                      <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                        {resource.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="text-xs">
                            <p className="font-medium text-neutral-900">{resource.author}</p>
                            <p className="text-neutral-500">{new Date(resource.published).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 text-amber-400">
                          <Star size={12} fill="currentColor" />
                          <span className="text-xs font-medium text-neutral-700">{resource.rating}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-neutral-200">
                        <div className="flex flex-wrap gap-1">
                          {resource.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-full text-[10px] font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'courses' && (
          <div className="text-center py-16">
            <PlayCircle size={64} className="mx-auto text-primary mb-4" />
            <h2 className="text-2xl font-display font-bold mb-2">Full Course Catalog Coming Soon</h2>
            <p className="text-neutral-600 mb-6">
              We're developing comprehensive courses on fundraising, investing, and scaling in Africa.
            </p>
            <Button variant="primary" onClick={() => setActiveTab('all')}>
              Browse Resources
            </Button>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.filter(r => r.type === 'template').map(template => (
              <div key={template.id} className="bg-white rounded-lg shadow-sm p-6 border border-neutral-200 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <FileSpreadsheet size={24} className="text-primary" />
                </div>
                
                <h3 className="font-display font-bold text-lg mb-2">{template.title}</h3>
                <p className="text-sm text-neutral-600 mb-4">{template.description}</p>
                
                <div className="flex items-center gap-4 text-xs text-neutral-500 mb-4">
                  <span className="flex items-center gap-1">
                    <DownloadIcon size={14} />
                    {template.downloads} downloads
                  </span>
                  <span className="flex items-center gap-1">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    {template.rating}
                  </span>
                </div>
                
                <Button variant="primary" fullWidth icon={<DownloadIcon size={16} />}>
                  Download Template
                </Button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="text-center py-16">
            <Bookmark size={64} className="mx-auto text-neutral-300 mb-4" />
            <h2 className="text-2xl font-display font-bold mb-2">No saved resources yet</h2>
            <p className="text-neutral-600 mb-6">
              Bookmark resources to access them later.
            </p>
            <Button variant="primary" onClick={() => setActiveTab('all')}>
              Explore Resources
            </Button>
          </div>
        )}

        {/* Personalized Recommendations */}
        {isAuthenticated && (
          <div className="mt-16 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Target size={24} className="text-primary" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-display font-bold text-xl mb-2">
                  {isCreator ? 'Recommended for Creators' : 'Recommended for Investors'}
                </h3>
                <p className="text-neutral-700 mb-6">
                  {isCreator 
                    ? 'Based on your profile and recent activity, we think you\'ll find these resources helpful for your fundraising journey.'
                    : 'Based on your investment preferences, these resources will help you conduct better due diligence.'}
                </p>
                
                <div className="grid md:grid-cols-3 gap-4">
                  {resources.slice(0, 3).map(resource => (
                    <div key={resource.id} className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        {getTypeIcon(resource.type)}
                        <span className="text-xs font-medium text-primary">{categories.find(c => c.id === resource.category)?.name}</span>
                      </div>
                      <h4 className="font-display font-semibold text-sm mb-1 line-clamp-2">
                        {resource.title}
                      </h4>
                      <p className="text-xs text-neutral-500 mb-2">{resource.author}</p>
                      <Link to={resource.url} className="text-primary text-xs font-semibold flex items-center gap-1 hover:underline">
                        View Resource
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningHub;