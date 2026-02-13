import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, X, ChevronDown, Save, Trash2, MapPin,
  DollarSign, TrendingUp, Target, Grid, List, SlidersHorizontal,
  BookmarkPlus, Star, Eye, Calendar, ArrowUpDown, Tag, FileText,
  Play, Award, CheckCircle
} from 'lucide-react';
import { projectsAPI, sectorsAPI, sdgsAPI, bookmarksAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProjectCard from '../components/common/ProjectCard';
import Button from '../components/common/Button';
import { clsx } from 'clsx';

const Discover = () => {
  const [allProjects, setAllProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [sdgs, setSdgs] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    sectors: [],
    countries: [],
    regions: [],
    cities: [],
    urbanRuralFocus: 'all',
    fundingStages: [],
    investmentModels: [],
    fundingRangeMin: '',
    fundingRangeMax: '',
    sdgs: [],
    impactThemes: [],
    qualityScoreMin: 0,
    hasVideo: false,
    hasPilots: false,
    verified: false
  });
  
  const [sortBy, setSortBy] = useState('recent');
  const [sortOrder, setSortOrder] = useState('desc');
  const [savedSearches, setSavedSearches] = useState([]);
  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [bookmarkNotes, setBookmarkNotes] = useState('');
  const [bookmarkTags, setBookmarkTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [ndaSignedForProject, setNdaSignedForProject] = useState({});
  const [showNDAConfirmModal, setShowNDAConfirmModal] = useState(false);
  const [selectedProjectForNDA, setSelectedProjectForNDA] = useState(null);

  const handleRequestNDA = (projectId) => {
    setSelectedProjectForNDA(projectId);
    setShowNDAConfirmModal(true);
  };

  const confirmSignNDA = async () => {
    try {
      const ndaRequest = {
        id: `nda_${Date.now()}`,
        investorId: user.id,
        projectId: selectedProjectForNDA,
        status: 'signed',
        requestedAt: new Date().toISOString(),
        signedAt: new Date().toISOString(),
      };
      await ndaAPI.create(ndaRequest);
      setNdaSignedForProject(prev => ({ ...prev, [selectedProjectForNDA]: true }));
      setShowNDAConfirmModal(false);
      setSelectedProjectForNDA(null);
    } catch (error) {
      console.error('Error signing NDA:', error);
    }
  };
  
  const { user, isInvestor } = useAuth();

  const africanCountries = [
    'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Rwanda', 'Senegal',
    'Ethiopia', 'Tanzania', 'Uganda', 'Egypt', 'Morocco', 'Ivory Coast',
    'Zambia', 'Zimbabwe', 'Botswana', 'Namibia', 'Malawi', 'Angola'
  ];

  const regions = [
    'West Africa', 'East Africa', 'Southern Africa', 'North Africa', 'Central Africa'
  ];

  const fundingStages = [
    { value: 'pre-seed', label: 'Pre-Seed' },
    { value: 'seed', label: 'Seed' },
    { value: 'series-a', label: 'Series A' },
    { value: 'series-b', label: 'Series B' },
    { value: 'growth', label: 'Growth' }
  ];

  const investmentModels = [
    { value: 'equity', label: 'Equity' },
    { value: 'revenue-share', label: 'Revenue Share' },
    { value: 'convertible-debt', label: 'Convertible Debt' },
    { value: 'grant', label: 'Grant' }
  ];

  const impactThemes = [
    'Financial Inclusion', 'Food Security', 'Healthcare Access',
    'Quality Education', 'Climate Action', 'Youth Employment',
    'Gender Equality', 'Clean Energy', 'Digital Inclusion'
  ];

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'quality', label: 'Highest Quality Score' },
    { value: 'funding-high', label: 'Funding: High to Low' },
    { value: 'funding-low', label: 'Funding: Low to High' },
    { value: 'alphabetical', label: 'Alphabetical' }
  ];

  useEffect(() => {
    fetchData();
    loadSavedSearches();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [activeFilters, sortBy, sortOrder, searchQuery, allProjects]);

  const fetchData = async () => {
    try {
      const [projectsRes, sectorsRes, sdgsRes] = await Promise.all([
        projectsAPI.getAll({ status: 'live' }),
        sectorsAPI.getAll(),
        sdgsAPI.getAll()
      ]);

      setAllProjects(projectsRes.data);
      setSectors(sectorsRes.data);
      setSdgs(sdgsRes.data);

      if (isInvestor) {
        const bookmarksRes = await bookmarksAPI.getByInvestor(user.id);
        setBookmarks(bookmarksRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedSearches = () => {
    const saved = localStorage.getItem(`saved_searches_${user?.id || 'guest'}`);
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...allProjects];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project =>
        project.elevatorPitch.tagline.toLowerCase().includes(query) ||
        project.elevatorPitch.problem.toLowerCase().includes(query) ||
        project.elevatorPitch.solution.toLowerCase().includes(query) ||
        project.sector.toLowerCase().includes(query) ||
        project.location.toLowerCase().includes(query) ||
        project.elevatorPitch.traction.toLowerCase().includes(query)
      );
    }

    if (activeFilters.sectors.length > 0) {
      filtered = filtered.filter(p => activeFilters.sectors.includes(p.sector));
    }

    if (activeFilters.countries.length > 0) {
      filtered = filtered.filter(p => activeFilters.countries.includes(p.location));
    }

    if (activeFilters.regions.length > 0) {
      filtered = filtered.filter(p => {
        const countryToRegion = {
          'Nigeria': 'West Africa', 'Ghana': 'West Africa', 'Senegal': 'West Africa',
          'Kenya': 'East Africa', 'Tanzania': 'East Africa', 'Uganda': 'East Africa', 'Ethiopia': 'East Africa',
          'South Africa': 'Southern Africa', 'Zimbabwe': 'Southern Africa', 'Zambia': 'Southern Africa',
          'Egypt': 'North Africa', 'Morocco': 'North Africa'
        };
        return activeFilters.regions.includes(countryToRegion[p.location]);
      });
    }

    if (activeFilters.fundingStages.length > 0) {
      filtered = filtered.filter(p => activeFilters.fundingStages.includes(p.fundingStage));
    }

    if (activeFilters.investmentModels.length > 0) {
      filtered = filtered.filter(p => 
        p.investmentModels?.some(model => activeFilters.investmentModels.includes(model))
      );
    }

    if (activeFilters.fundingRangeMin) {
      filtered = filtered.filter(p => p.elevatorPitch.funding >= parseInt(activeFilters.fundingRangeMin));
    }
    if (activeFilters.fundingRangeMax) {
      filtered = filtered.filter(p => p.elevatorPitch.funding <= parseInt(activeFilters.fundingRangeMax));
    }

    if (activeFilters.sdgs.length > 0) {
      filtered = filtered.filter(p => 
        p.sdgs?.some(sdg => activeFilters.sdgs.includes(sdg))
      );
    }

    if (activeFilters.qualityScoreMin > 0) {
      filtered = filtered.filter(p => p.metrics?.qualityScore >= activeFilters.qualityScoreMin);
    }

    if (activeFilters.hasVideo) {
      filtered = filtered.filter(p => p.elevatorPitch.video);
    }

    if (activeFilters.hasPilots) {
      filtered = filtered.filter(p => 
        p.detailedPitch?.market?.pilotsAndLOIs && p.detailedPitch.market.pilotsAndLOIs.length > 0
      );
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'recent':
          comparison = new Date(b.createdAt) - new Date(a.createdAt);
          break;
        case 'popular':
          comparison = (b.metrics?.views || 0) - (a.metrics?.views || 0);
          break;
        case 'quality':
          comparison = (b.metrics?.qualityScore || 0) - (a.metrics?.qualityScore || 0);
          break;
        case 'funding-high':
          comparison = b.elevatorPitch.funding - a.elevatorPitch.funding;
          break;
        case 'funding-low':
          comparison = a.elevatorPitch.funding - b.elevatorPitch.funding;
          break;
        case 'alphabetical':
          comparison = a.elevatorPitch.tagline.localeCompare(b.elevatorPitch.tagline);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'desc' ? comparison : -comparison;
    });

    setFilteredProjects(filtered);
  };

  const toggleFilter = (filterType, value) => {
    setActiveFilters(prev => {
      const current = prev[filterType];
      const newValue = Array.isArray(current)
        ? current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value]
        : value;
      return { ...prev, [filterType]: newValue };
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({
      sectors: [],
      countries: [],
      regions: [],
      cities: [],
      urbanRuralFocus: 'all',
      fundingStages: [],
      investmentModels: [],
      fundingRangeMin: '',
      fundingRangeMax: '',
      sdgs: [],
      impactThemes: [],
      qualityScoreMin: 0,
      hasVideo: false,
      hasPilots: false,
      verified: false
    });
    setSearchQuery('');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.sectors.length > 0) count++;
    if (activeFilters.countries.length > 0) count++;
    if (activeFilters.regions.length > 0) count++;
    if (activeFilters.fundingStages.length > 0) count++;
    if (activeFilters.investmentModels.length > 0) count++;
    if (activeFilters.fundingRangeMin || activeFilters.fundingRangeMax) count++;
    if (activeFilters.sdgs.length > 0) count++;
    if (activeFilters.qualityScoreMin > 0) count++;
    if (activeFilters.hasVideo) count++;
    if (activeFilters.hasPilots) count++;
    return count;
  };

  const saveSearch = () => {
    if (!searchName.trim()) return;
    
    const newSearch = {
      id: `search_${Date.now()}`,
      name: searchName,
      query: searchQuery,
      filters: activeFilters,
      sortBy,
      sortOrder,
      createdAt: new Date().toISOString()
    };
    
    const updated = [...savedSearches, newSearch];
    setSavedSearches(updated);
    localStorage.setItem(`saved_searches_${user?.id || 'guest'}`, JSON.stringify(updated));
    setShowSaveSearchModal(false);
    setSearchName('');
  };

  const loadSearch = (search) => {
    setSearchQuery(search.query);
    setActiveFilters(search.filters);
    setSortBy(search.sortBy);
    setSortOrder(search.sortOrder);
  };

  const deleteSearch = (searchId) => {
    const updated = savedSearches.filter(s => s.id !== searchId);
    setSavedSearches(updated);
    localStorage.setItem(`saved_searches_${user?.id || 'guest'}`, JSON.stringify(updated));
  };

  const handleBookmark = async (projectId) => {
    if (!isInvestor) return;

    const existingBookmark = bookmarks.find(b => b.projectId === projectId);
    
    if (existingBookmark) {
      try {
        await bookmarksAPI.delete(existingBookmark.id);
        setBookmarks(bookmarks.filter(b => b.id !== existingBookmark.id));
      } catch (error) {
        console.error('Error removing bookmark:', error);
      }
    } else {
      setSelectedProject(projectId);
      setShowBookmarkModal(true);
    }
  };

  const saveBookmark = async () => {
    try {
      const newBookmark = {
        id: `bm_${Date.now()}`,
        investorId: user.id,
        projectId: selectedProject,
        createdAt: new Date().toISOString(),
        notes: bookmarkNotes,
        tags: bookmarkTags
      };
      
      await bookmarksAPI.create(newBookmark);
      setBookmarks([...bookmarks, newBookmark]);
      setShowBookmarkModal(false);
      setSelectedProject(null);
      setBookmarkNotes('');
      setBookmarkTags([]);
    } catch (error) {
      console.error('Error saving bookmark:', error);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !bookmarkTags.includes(tagInput.trim())) {
      setBookmarkTags([...bookmarkTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setBookmarkTags(bookmarkTags.filter(t => t !== tag));
  };

  const isBookmarked = (projectId) => {
    return bookmarks.some(b => b.projectId === projectId);
  };

  if (loading) {
    return (
      <div className="pt-[72px] min-h-screen bg-neutral-50">
        <div className="container">
          <div className="flex flex-col items-center justify-center py-16 min-h-[400px]">
            <div className="spinner w-12 h-12 border-4 border-neutral-200 border-t-primary rounded-full animate-spin mb-4" />
            <p className="font-display font-semibold text-neutral-600">Loading innovative projects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[72px] min-h-screen bg-neutral-50">
      <div className="bg-gradient-to-r from-primary to-clay py-16 text-center text-white">
        <div className="container">
          <h1 className="text-white mb-2">Discover Innovation</h1>
          <p className="text-xl opacity-95">Explore game-changing projects from across Africa</p>
        </div>
      </div>
      {showNDAConfirmModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="bg-white p-8 rounded-xl max-w-md w-full shadow-xl">
            <h2 className="text-2xl font-display font-bold mb-4">Sign NDA to Access Full Details</h2>
            <p className="text-neutral-600 mb-6">
              By signing this NDA, you agree to keep all project information confidential and use it solely for investment evaluation.
            </p>
            <div className="flex justify-end gap-4">
              <Button variant="ghost" onClick={() => setShowNDAConfirmModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={confirmSignNDA}>I Agree – Sign NDA</Button>
            </div>
          </div>
        </div>
      )}
      <div className="container">
        {savedSearches.length > 0 && (
          <div className="mt-8">
            <h3 className="flex items-center gap-2 font-display font-bold text-lg mb-3">
              <Save size={18} />
              Saved Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {savedSearches.map(search => (
                <div key={search.id} className="flex items-center bg-white rounded-md shadow-sm border border-neutral-200 overflow-hidden">
                  <button 
                    onClick={() => loadSearch(search)} 
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 hover:text-primary transition-colors"
                  >
                    <Search size={16} />
                    {search.name}
                  </button>
                  <button 
                    onClick={() => deleteSearch(search.id)} 
                    className="px-2 py-2 text-neutral-400 hover:text-error border-l border-neutral-200 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 my-8">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search projects, sectors, problems, solutions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 py-3 font-body text-base border-2 border-neutral-200 rounded-md bg-white focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
            />
            {searchQuery && (
              <button 
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-sm transition-all"
                onClick={() => setSearchQuery('')}
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              icon={<Filter size={18} />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
            </Button>

            {(searchQuery || getActiveFilterCount() > 0) && (
              <Button
                variant="ghost"
                icon={<Save size={18} />}
                onClick={() => setShowSaveSearchModal(true)}
              >
                Save Search
              </Button>
            )}

            <select 
              className="px-3 py-2 border-2 border-neutral-200 rounded-md font-display font-semibold text-sm bg-white focus:outline-none focus:border-primary"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="flex border-2 border-neutral-200 rounded-md overflow-hidden">
              <button 
                className={clsx(
                  "px-3 py-2 transition-colors",
                  viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100'
                )}
                onClick={() => setViewMode('grid')}
              >
                <Grid size={18} />
              </button>
              <button 
                className={clsx(
                  "px-3 py-2 transition-colors border-l-2 border-neutral-200",
                  viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100'
                )}
                onClick={() => setViewMode('list')}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {getActiveFilterCount() > 0 && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-wrap gap-2">
              {activeFilters.sectors.map(sector => (
                <span key={sector} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm font-medium">
                  {sector}
                  <button onClick={() => toggleFilter('sectors', sector)} className="ml-1 hover:text-primary-dark">
                    <X size={14} />
                  </button>
                </span>
              ))}
              {activeFilters.countries.map(country => (
                <span key={country} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm font-medium">
                  {country}
                  <button onClick={() => toggleFilter('countries', country)} className="ml-1 hover:text-primary-dark">
                    <X size={14} />
                  </button>
                </span>
              ))}
              {activeFilters.fundingStages.map(stage => (
                <span key={stage} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm font-medium">
                  {fundingStages.find(s => s.value === stage)?.label}
                  <button onClick={() => toggleFilter('fundingStages', stage)} className="ml-1 hover:text-primary-dark">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <Button variant="ghost" size="small" onClick={clearAllFilters}>
              Clear All
            </Button>
          </div>
        )}

        {showFilters && (
          <div className="bg-white p-6 rounded-md shadow-sm mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-display font-bold text-sm uppercase tracking-wider text-neutral-700">
                  <MapPin size={16} />
                  Location
                </h4>
                
                <div className="space-y-3">
                  <label className="block font-display font-semibold text-xs text-neutral-700">Region</label>
                  <div className="flex flex-wrap gap-2">
                    {regions.map(region => (
                      <button
                        key={region}
                        className={clsx(
                          "filter-chip",
                          activeFilters.regions.includes(region) && 'active'
                        )}
                        onClick={() => toggleFilter('regions', region)}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block font-display font-semibold text-xs text-neutral-700">Country</label>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                    {africanCountries.map(country => (
                      <button
                        key={country}
                        className={clsx(
                          "filter-chip",
                          activeFilters.countries.includes(country) && 'active'
                        )}
                        onClick={() => toggleFilter('countries', country)}
                      >
                        {country}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block font-display font-semibold text-xs text-neutral-700">Urban/Rural Focus</label>
                  <select
                    value={activeFilters.urbanRuralFocus}
                    onChange={(e) => setActiveFilters({...activeFilters, urbanRuralFocus: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                  >
                    <option value="all">All</option>
                    <option value="urban">Urban</option>
                    <option value="rural">Rural</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-display font-bold text-sm uppercase tracking-wider text-neutral-700">
                  <Target size={16} />
                  Sector & Industry
                </h4>
                <div className="flex flex-wrap gap-2">
                  {sectors.map(sector => (
                    <button
                      key={sector.id}
                      className={clsx(
                        "filter-chip",
                        activeFilters.sectors.includes(sector.name) && 'active'
                      )}
                      onClick={() => toggleFilter('sectors', sector.name)}
                    >
                      {sector.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-display font-bold text-sm uppercase tracking-wider text-neutral-700">
                  <DollarSign size={16} />
                  Funding & Stage
                </h4>
                
                <div className="space-y-3">
                  <label className="block font-display font-semibold text-xs text-neutral-700">Funding Stage</label>
                  <div className="flex flex-wrap gap-2">
                    {fundingStages.map(stage => (
                      <button
                        key={stage.value}
                        className={clsx(
                          "filter-chip",
                          activeFilters.fundingStages.includes(stage.value) && 'active'
                        )}
                        onClick={() => toggleFilter('fundingStages', stage.value)}
                      >
                        {stage.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block font-display font-semibold text-xs text-neutral-700">Investment Model</label>
                  <div className="flex flex-wrap gap-2">
                    {investmentModels.map(model => (
                      <button
                        key={model.value}
                        className={clsx(
                          "filter-chip",
                          activeFilters.investmentModels.includes(model.value) && 'active'
                        )}
                        onClick={() => toggleFilter('investmentModels', model.value)}
                      >
                        {model.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block font-display font-semibold text-xs text-neutral-700">Funding Amount Range (USD)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={activeFilters.fundingRangeMin}
                      onChange={(e) => setActiveFilters({...activeFilters, fundingRangeMin: e.target.value})}
                      className="flex-1 px-3 py-2 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                    />
                    <span className="text-neutral-400">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={activeFilters.fundingRangeMax}
                      onChange={(e) => setActiveFilters({...activeFilters, fundingRangeMax: e.target.value})}
                      className="flex-1 px-3 py-2 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-display font-bold text-sm uppercase tracking-wider text-neutral-700">
                  <TrendingUp size={16} />
                  Impact & SDGs
                </h4>
                
                <div className="space-y-3">
                  <label className="block font-display font-semibold text-xs text-neutral-700">SDG Alignment</label>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                    {sdgs.map(sdg => (
                      <button
                        key={sdg.id}
                        className={clsx(
                          "filter-chip",
                          activeFilters.sdgs.includes(parseInt(sdg.id)) && 'active'
                        )}
                        onClick={() => toggleFilter('sdgs', parseInt(sdg.id))}
                        style={{ borderColor: sdg.color }}
                      >
                        SDG {sdg.id}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block font-display font-semibold text-xs text-neutral-700">Impact Themes</label>
                  <div className="flex flex-wrap gap-2">
                    {impactThemes.map(theme => (
                      <button
                        key={theme}
                        className={clsx(
                          "filter-chip",
                          activeFilters.impactThemes.includes(theme) && 'active'
                        )}
                        onClick={() => toggleFilter('impactThemes', theme)}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-display font-bold text-sm uppercase tracking-wider text-neutral-700">
                  <Award size={16} />
                  Quality & Features
                </h4>
                
                <div className="space-y-3">
                  <label className="block font-display font-semibold text-xs text-neutral-700">
                    Minimum Quality Score: {activeFilters.qualityScoreMin}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={activeFilters.qualityScoreMin}
                    onChange={(e) => setActiveFilters({...activeFilters, qualityScoreMin: parseInt(e.target.value)})}
                    className="w-full accent-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeFilters.hasVideo}
                      onChange={(e) => setActiveFilters({...activeFilters, hasVideo: e.target.checked})}
                      className="w-4 h-4 accent-primary"
                    />
                    <Play size={16} className="text-neutral-600" />
                    <span className="text-sm font-medium text-neutral-700">Has Video Pitch</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeFilters.hasPilots}
                      onChange={(e) => setActiveFilters({...activeFilters, hasPilots: e.target.checked})}
                      className="w-4 h-4 accent-primary"
                    />
                    <CheckCircle size={16} className="text-neutral-600" />
                    <span className="text-sm font-medium text-neutral-700">Has Pilot Programs</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeFilters.verified}
                      onChange={(e) => setActiveFilters({...activeFilters, verified: e.target.checked})}
                      className="w-4 h-4 accent-primary"
                    />
                    <Award size={16} className="text-neutral-600" />
                    <span className="text-sm font-medium text-neutral-700">Verified Founders</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="pb-16">
          <div className="mb-6">
            <p className="font-display font-semibold text-neutral-600">
              {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <h3 className="text-2xl font-display font-bold text-neutral-700 mb-2">No projects found</h3>
              <p className="text-neutral-500 mb-6">Try adjusting your search or filters</p>
              <Button onClick={clearAllFilters}>Clear All Filters</Button>
            </div>
          ) : (
            <div className={clsx(
              "grid gap-8",
              viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
            )}>
              {filteredProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onBookmark={isInvestor ? handleBookmark : null}
                  isBookmarked={isBookmarked(project.id)}
                  onRequestNDA={isInvestor ? handleRequestNDA : null}
                  ndaSigned={ndaSignedForProject[project.id]}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showSaveSearchModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="bg-white p-10 rounded-xl max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-display font-bold mb-6">Save Search</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block font-display font-semibold text-sm text-neutral-700">Search Name</label>
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="e.g., FinTech in Nigeria"
                  autoFocus
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                />
              </div>
              <div className="bg-neutral-50 p-4 rounded-md text-sm">
                <p><strong className="font-display">Query:</strong> {searchQuery || 'None'}</p>
                <p><strong className="font-display">Active Filters:</strong> {getActiveFilterCount()}</p>
                <p><strong className="font-display">Sort:</strong> {sortOptions.find(o => o.value === sortBy)?.label}</p>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <Button variant="ghost" onClick={() => setShowSaveSearchModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={saveSearch} disabled={!searchName.trim()}>
                Save Search
              </Button>
            </div>
          </div>
        </div>
      )}

      {showBookmarkModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="bg-white p-10 rounded-xl max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="flex items-center gap-2 text-2xl font-display font-bold mb-6">
              <BookmarkPlus size={24} className="text-primary" />
              Add Bookmark
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block font-display font-semibold text-sm text-neutral-700">Notes (Optional)</label>
                <textarea
                  value={bookmarkNotes}
                  onChange={(e) => setBookmarkNotes(e.target.value)}
                  placeholder="Add notes about this project..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary resize-vertical"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block font-display font-semibold text-sm text-neutral-700">Tags</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add a tag and press Enter"
                    className="flex-1 px-4 py-2 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                  />
                  <Button type="button" onClick={addTag} icon={<Tag size={16} />}>
                    Add
                  </Button>
                </div>
                {bookmarkTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {bookmarkTags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-primary-dark">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <small className="text-neutral-500 text-xs block mt-2">
                  Suggested: high-potential, due-diligence, seed-ready, follow-up
                </small>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <Button variant="ghost" onClick={() => setShowBookmarkModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={saveBookmark}>
                Save Bookmark
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discover;