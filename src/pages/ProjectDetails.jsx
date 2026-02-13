import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, TrendingUp, Eye, Bookmark, Users, DollarSign, 
  Target, Calendar, AlertCircle, CheckCircle, Shield, 
  MessageSquare, FileText, Award, ChevronLeft, Download,
  ExternalLink, Clock, Briefcase, Heart
} from 'lucide-react';
import { projectsAPI, ndaAPI, bookmarksAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import { clsx } from 'clsx';

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ndaSigned, setNdaSigned] = useState(false);
  const [showNDAModal, setShowNDAModal] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);
  const [creator, setCreator] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { user, isInvestor, isAuthenticated } = useAuth();

  // Fetch project and related data
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        const projectRes = await projectsAPI.getById(id);
        setProject(projectRes.data);

        // Fetch creator details
        const creatorRes = await usersAPI.getById(projectRes.data.creatorId);
        setCreator(creatorRes.data);

        // Check NDA status if investor
        if (isInvestor && user) {
          const ndaRes = await ndaAPI.getByProject(id);
          const signed = ndaRes.data.find(
            n => n.investorId === user.id && n.status === 'signed'
          );
          setNdaSigned(!!signed);

          // Check bookmark status
          const bookmarksRes = await bookmarksAPI.getByInvestor(user.id);
          const bookmark = bookmarksRes.data.find(b => b.projectId === id);
          if (bookmark) {
            setIsBookmarked(true);
            setBookmarkId(bookmark.id);
          }
        }

        setError('');
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id, isInvestor, user]);

  // Handle NDA signing
  const handleSignNDA = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    try {
      const newNDA = {
        id: `nda_${Date.now()}`,
        investorId: user.id,
        projectId: id,
        status: 'signed',
        requestedAt: new Date().toISOString(),
        signedAt: new Date().toISOString(),
      };
      await ndaAPI.create(newNDA);
      setNdaSigned(true);
      setShowNDAModal(false);
    } catch (err) {
      console.error('Error signing NDA:', err);
      setError('Failed to sign NDA. Please try again.');
    }
  };

  // Handle bookmark toggle
  const handleBookmark = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    try {
      if (isBookmarked && bookmarkId) {
        await bookmarksAPI.delete(bookmarkId);
        setIsBookmarked(false);
        setBookmarkId(null);
      } else {
        const newBookmark = {
          id: `bm_${Date.now()}`,
          investorId: user.id,
          projectId: id,
          createdAt: new Date().toISOString(),
          notes: '',
          tags: []
        };
        const res = await bookmarksAPI.create(newBookmark);
        setIsBookmarked(true);
        setBookmarkId(res.data.id);
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="pt-18 min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-12 h-12 border-4 border-neutral-200 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display font-semibold text-neutral-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="pt-18 min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-sm">
          <AlertCircle size={48} className="text-error mx-auto mb-4" />
          <h2 className="font-display font-bold text-2xl mb-2">Project Not Found</h2>
          <p className="text-neutral-600 mb-6">{error || 'This project may have been removed.'}</p>
          <Link to="/discover">
            <Button variant="primary">Browse Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { elevatorPitch, detailedPitch, sector, location, metrics, status } = project;

  return (
    <div className="pt-18 min-h-screen bg-neutral-50 pb-16">
      {/* Hero Section */}
      <div className="relative h-125 overflow-hidden">
        <img 
          src={elevatorPitch.images?.[0] || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200'} 
          alt={elevatorPitch.tagline}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/50 to-transparent">
          <div className="container h-full flex flex-col justify-end pb-16">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1.5 bg-primary text-white rounded-md font-display font-bold text-sm uppercase tracking-wider">
                  {sector}
                </span>
                {status === 'live' && (
                  <span className="px-3 py-1.5 bg-success/90 text-white rounded-md text-xs font-semibold flex items-center gap-1">
                    <CheckCircle size={14} />
                    Live
                  </span>
                )}
              </div>
              
              <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4">
                {elevatorPitch.tagline}
              </h1>
              
              {elevatorPitch.caption && (
                <p className="text-white/90 text-xl mb-6">{elevatorPitch.caption}</p>
              )}
              
              <div className="flex flex-wrap gap-6 items-center text-white">
                <span className="flex items-center gap-2 text-lg font-medium">
                  <MapPin size={20} />
                  {location}
                </span>
                <span className="flex items-center gap-2 text-lg font-medium text-success">
                  <DollarSign size={20} />
                  {formatCurrency(elevatorPitch.funding)} seeking
                </span>
                <span className="flex items-center gap-2 text-lg font-medium">
                  <TrendingUp size={20} />
                  {project.fundingStage?.replace('-', ' ') || 'Seed'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8">
                {isInvestor && (
                  <>
                    <Button
                      variant="primary"
                      size="large"
                      icon={isBookmarked ? <Bookmark fill="currentColor" /> : <Bookmark />}
                      onClick={handleBookmark}
                      className=" text-primary  bg-neutral-100"
                    >
                      {isBookmarked ? 'Saved' : 'Save Project'}
                    </Button>

                    {!ndaSigned ? (
                      <Button
                        variant="secondary"
                        size="large"
                        icon={<Shield />}
                        onClick={() => setShowNDAModal(true)}
                        className="border-white text-white hover:bg-white/10"
                      >
                        Request Full Details (NDA)
                      </Button>
                    ) : (
                      <Link to={`/investor/messages?project=${id}`}>
                        <Button
                          variant="secondary"
                          size="large"
                          icon={<MessageSquare />}
                          className="border-white text-white bg-white/10"
                        >
                          Contact Creator
                        </Button>
                      </Link>
                    )}
                  </>
                )}

                {!isAuthenticated && (
                  <Link to="/signup">
                    <Button
                      variant="primary"
                      size="large"
                      className="bg-white text-primary hover:bg-neutral-100"
                    >
                      Sign up to Connect
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column – Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Public Elevator Pitch Section */}
            <section className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-3xl font-display font-bold mb-6">The Problem</h2>
              <p className="text-lg leading-relaxed text-neutral-700">{elevatorPitch.problem}</p>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-3xl font-display font-bold mb-6">The Solution</h2>
              <p className="text-lg leading-relaxed text-neutral-700">{elevatorPitch.solution}</p>
            </section>

            <section className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-3xl font-display font-bold mb-6">Traction</h2>
              <div className="p-6 bg-neutral-50 border-l-4 border-primary rounded-md text-lg leading-relaxed">
                {elevatorPitch.traction}
              </div>
            </section>

            {/* Confidential Detailed Pitch – only shown if NDA signed */}
            {ndaSigned && detailedPitch && (
              <>
                {/* Tabs for detailed sections */}
                <div className="border-b border-neutral-200">
                  <div className="flex gap-6 overflow-x-auto">
                    {[
                      { id: 'overview', label: 'Overview', icon: <FileText size={18} /> },
                      { id: 'market', label: 'Market', icon: <Target size={18} /> },
                      { id: 'business', label: 'Business Model', icon: <Briefcase size={18} /> },
                      { id: 'team', label: 'Team', icon: <Users size={18} /> },
                      { id: 'impact', label: 'Impact', icon: <Heart size={18} /> }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                          "py-4 px-1 font-display font-medium text-sm flex items-center gap-2 border-b-2 transition-colors",
                          activeTab === tab.id
                            ? 'border-primary text-primary'
                            : 'border-transparent text-neutral-500 hover:text-neutral-700'
                        )}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white p-8 rounded-lg shadow-sm">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-display font-bold mb-3">Problem Deep-Dive</h3>
                        <p className="text-neutral-700">{detailedPitch.problemDeepDive?.marketResearch}</p>
                        
                        {detailedPitch.problemDeepDive?.painPoints?.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-display font-semibold mb-2">Key Pain Points</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {detailedPitch.problemDeepDive.painPoints.map((point, i) => (
                                <li key={i} className="text-neutral-600">{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-xl font-display font-bold mb-3">Solution Details</h3>
                        <p className="text-neutral-700">{detailedPitch.solutionDetails?.technicalSpecs}</p>
                        
                        {detailedPitch.solutionDetails?.competitiveAdvantages?.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-display font-semibold mb-2">Competitive Advantages</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {detailedPitch.solutionDetails.competitiveAdvantages.map((adv, i) => (
                                <li key={i} className="text-neutral-600">{adv}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'market' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-neutral-50 rounded-lg text-center">
                          <div className="text-xs uppercase text-neutral-500 mb-1">TAM</div>
                          <div className="text-2xl font-display font-bold text-primary">${detailedPitch.market?.tam}</div>
                          {detailedPitch.market?.tamSource && (
                            <div className="text-xs text-neutral-400 mt-1">{detailedPitch.market.tamSource}</div>
                          )}
                        </div>
                        <div className="p-4 bg-neutral-50 rounded-lg text-center">
                          <div className="text-xs uppercase text-neutral-500 mb-1">SAM</div>
                          <div className="text-2xl font-display font-bold text-primary">${detailedPitch.market?.sam}</div>
                        </div>
                        <div className="p-4 bg-neutral-50 rounded-lg text-center">
                          <div className="text-xs uppercase text-neutral-500 mb-1">SOM</div>
                          <div className="text-2xl font-display font-bold text-primary">${detailedPitch.market?.som}</div>
                        </div>
                        <div className="p-4 bg-neutral-50 rounded-lg text-center">
                          <div className="text-xs uppercase text-neutral-500 mb-1">Current Revenue</div>
                          <div className="text-2xl font-display font-bold text-success">
                            {formatCurrency(detailedPitch.market?.currentRevenue || 0)}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-display font-bold mb-2">Key Partnerships</h4>
                        <ul className="list-disc list-inside">
                          {detailedPitch.market?.keyPartnerships?.map((p, i) => (
                            <li key={i} className="text-neutral-600">{p}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === 'business' && (
                    <div className="space-y-6">
                      <p className="text-neutral-700">{detailedPitch.businessModel?.description}</p>
                      
                      <div>
                        <h4 className="font-display font-bold mb-3">Revenue Streams</h4>
                        <div className="space-y-3">
                          {detailedPitch.businessModel?.revenueStreams?.map((stream, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 bg-neutral-50 rounded-lg">
                              <div className="flex-1">
                                <div className="font-display font-semibold">{stream.stream}</div>
                                <div className="text-sm text-neutral-600">{stream.description}</div>
                              </div>
                              <div className="text-lg font-display font-bold text-primary">{stream.percentage}%</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-neutral-50 rounded-lg">
                          <div className="text-xs text-neutral-500">CAC</div>
                          <div className="text-xl font-display font-bold">{formatCurrency(detailedPitch.businessModel?.unitEconomics?.cac || 0)}</div>
                        </div>
                        <div className="p-4 bg-neutral-50 rounded-lg">
                          <div className="text-xs text-neutral-500">LTV</div>
                          <div className="text-xl font-display font-bold">{formatCurrency(detailedPitch.businessModel?.unitEconomics?.ltv || 0)}</div>
                        </div>
                        <div className="p-4 bg-neutral-50 rounded-lg">
                          <div className="text-xs text-neutral-500">LTV:CAC</div>
                          <div className="text-xl font-display font-bold">{detailedPitch.businessModel?.unitEconomics?.ltvCacRatio || 0}:1</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'team' && (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        {detailedPitch.team?.map((member, i) => (
                          <div key={i} className="flex gap-4 p-4 bg-neutral-50 rounded-lg">
                            <img 
                              src={`https://i.pravatar.cc/80?img=${i+10}`} 
                              alt={member.name}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                            <div>
                              <h4 className="font-display font-bold">{member.name}</h4>
                              <p className="text-sm text-primary font-medium">{member.role}</p>
                              <p className="text-xs text-neutral-600 mt-1">{member.bio}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'impact' && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-display font-bold mb-2">Theory of Change</h4>
                        <p className="text-neutral-700">{detailedPitch.impact?.theoryOfChange}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-display font-bold mb-3">SDG Contributions</h4>
                        <div className="space-y-2">
                          {detailedPitch.impact?.sdgTargets?.map((sdg, i) => (
                            <div key={i} className="p-3 bg-neutral-50 rounded-lg">
                              <div className="font-semibold">SDG {sdg.sdg}</div>
                              <div className="text-sm text-neutral-600">{sdg.contribution}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* NDA Gate – shown to investors who haven't signed */}
            {isInvestor && !ndaSigned && (
              <section className="bg-white p-12 rounded-lg shadow-sm border-2 border-primary/20">
                <div className="text-center max-w-lg mx-auto">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield size={32} className="text-primary" />
                  </div>
                  <h3 className="text-2xl font-display font-bold mb-3">🔒 Confidential Information</h3>
                  <p className="text-neutral-600 mb-6">
                    The full business plan, financial projections, and team details are protected by NDA. 
                    Sign a non-disclosure agreement to access this information.
                  </p>
                  <Button 
                    variant="primary" 
                    size="large"
                    onClick={() => setShowNDAModal(true)}
                    icon={<Shield size={18} />}
                  >
                    Sign NDA to Continue
                  </Button>
                </div>
              </section>
            )}
          </div>

          {/* Right Column – Sidebar */}
          <div className="space-y-6">
            {/* Creator Card */}
            {creator && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-display font-bold mb-4">About the Creator</h3>
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={creator.profile?.photo || 'https://i.pravatar.cc/60'} 
                    alt={creator.profile?.fullName}
                    className="w-16 h-16 rounded-full object-cover border-3 border-primary"
                  />
                  <div>
                    <h4 className="font-display font-bold text-lg">{creator.profile?.fullName}</h4>
                    <p className="text-sm text-neutral-600">{creator.profile?.company || creator.profile?.title}</p>
                  </div>
                </div>
                <p className="text-sm text-neutral-700 line-clamp-3">{creator.profile?.bio}</p>
                
                {ndaSigned && (
                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <Link to={`/investor/messages?project=${id}`}>
                      <Button variant="primary" fullWidth icon={<MessageSquare size={16} />}>
                        Send Message
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Project Metrics */}
            {metrics && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-display font-bold mb-4">Project Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 flex items-center gap-2">
                      <Eye size={16} /> Views
                    </span>
                    <span className="font-display font-semibold">{formatNumber(metrics.views)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 flex items-center gap-2">
                      <Bookmark size={16} /> Bookmarks
                    </span>
                    <span className="font-display font-semibold">{metrics.bookmarks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 flex items-center gap-2">
                      <Shield size={16} /> NDA Requests
                    </span>
                    <span className="font-display font-semibold">{metrics.ndaRequests || 0}</span>
                  </div>
                  <div className="pt-3 border-t border-neutral-200">
                    <div className="flex justify-between items-center">
                      <span className="font-display font-semibold text-success">Quality Score</span>
                      <span className="text-2xl font-display font-bold text-success">{metrics.qualityScore}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Investment Details */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-display font-bold mb-4">Investment Details</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-neutral-500 mb-1">Funding Stage</div>
                  <div className="font-display font-semibold capitalize">{project.fundingStage?.replace('-', ' ') || 'Seed'}</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-500 mb-1">Funding Goal</div>
                  <div className="text-2xl font-display font-bold text-primary">{formatCurrency(elevatorPitch.funding)}</div>
                </div>
                {project.investmentModels?.length > 0 && (
                  <div>
                    <div className="text-sm text-neutral-500 mb-2">Investment Models</div>
                    <div className="flex flex-wrap gap-2">
                      {project.investmentModels.map(model => (
                        <span key={model} className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded-full text-xs font-medium">
                          {model.replace('-', ' ').toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NDA Signing Modal */}
      {showNDAModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="bg-white p-8 rounded-xl max-w-lg w-full shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                <Shield size={24} className="text-primary" />
                Non-Disclosure Agreement
              </h2>
              <button
                onClick={() => setShowNDAModal(false)}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <AlertCircle size={20} className="text-neutral-500" />
              </button>
            </div>

            <div className="space-y-4 text-neutral-700 mb-8">
              <p>
                This Non-Disclosure Agreement (the "Agreement") is entered into between 
                <span className="font-semibold"> {creator?.profile?.fullName || 'the Creator'}</span> and 
                <span className="font-semibold"> {user?.profile?.fullName || 'the Investor'}</span>.
              </p>
              <p>
                By signing this Agreement, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Keep all confidential information about this project strictly private</li>
                <li>Use the information solely for investment evaluation purposes</li>
                <li>Not disclose any proprietary information to third parties without written consent</li>
                <li>Not contact the creator's employees, partners, or customers outside this platform</li>
                <li>Return or destroy all confidential materials upon request</li>
              </ul>
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-xs text-amber-700">
                  This NDA is legally binding. Electronic signatures have the same force as physical signatures.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="ghost" onClick={() => setShowNDAModal(false)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSignNDA}
                icon={<CheckCircle size={16} />}
              >
                I Agree – Sign NDA
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;