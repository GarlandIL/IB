import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, Save, Upload, X, Plus, CheckCircle,
  AlertCircle, TrendingUp, Users, DollarSign, Target, Award,
  FileText, Video, Image as ImageIcon, Lightbulb, BarChart, Loader
} from 'lucide-react';
import { projectsAPI, sectorsAPI, sdgsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { clsx } from 'clsx';

const CreateProject = () => {
  const [currentPhase, setCurrentPhase] = useState('A');
  const [formData, setFormData] = useState({
    tagline: '', caption: '', problem: '', solution: '', traction: '', funding: '',
    sector: '', fundingStage: 'seed', investmentModels: [], images: [], video: null,
    marketResearch: '', painPoints: [''], currentSolutions: '', marketTiming: '',
    technicalSpecs: '', proprietaryTech: '', competitiveAdvantages: [''], ipStatus: '', barriers: '',
    tam: '', tamSource: '', sam: '', som: '', currentRevenue: '', userGrowth: '',
    keyPartnerships: [''], pilotsAndLOIs: '',
    businessModelDescription: '', revenueStreams: [{ stream: '', percentage: '', description: '' }],
    pricingStrategy: '', cac: '', ltv: '', paybackPeriod: '', scalabilityPlan: '', competitiveMoat: '',
    fundingAllocations: [{ category: 'Technology Development', amount: '', percentage: '', justification: '' }],
    milestones: [{ milestone: '', timeline: '', kpi: '', target: '' }],
    risks: [{ risk: '', mitigation: '' }],
    teamMembers: [{ name: '', role: '', bio: '', linkedin: '', education: '', experience: '' }],
    advisors: [{ name: '', expertise: '', contribution: '' }],
    hiringPlan: [{ role: '', timeline: '', justification: '' }],
    theoryOfChange: '', sdgTargets: [{ sdg: '', target: '', contribution: '' }],
    impactMetrics: [{ metric: '', baseline: '', target: '', unit: '', timeline: '' }],
    reportingFramework: '',
    pitchDeck: null, financialModel: null, productDemo: null, marketValidation: null,
    legalDocs: null, teamCVs: null, letterOfSupport: null,
    location: '', country: '', city: '', sdgs: []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [sectors, setSectors] = useState([]);
  const [sdgs, setSdgs] = useState([]);
  const [draftId, setDraftId] = useState(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOptions();
    const draft = localStorage.getItem(`project_draft_${user.id}`);
    if (draft) {
      const parsed = JSON.parse(draft);
      setFormData(parsed.formData);
      setCurrentPhase(parsed.currentPhase || 'A');
      setDraftId(parsed.id);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      saveDraft();
    }, 30000);
    return () => clearInterval(interval);
  }, [formData, currentPhase]);

  const fetchOptions = async () => {
    try {
      const [sectorsRes, sdgsRes] = await Promise.all([
        sectorsAPI.getAll(),
        sdgsAPI.getAll()
      ]);
      setSectors(sectorsRes.data);
      setSdgs(sdgsRes.data);
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  const saveDraft = () => {
    const draft = {
      id: draftId || `draft_${Date.now()}`,
      formData,
      currentPhase,
      lastSaved: new Date().toISOString()
    };
    localStorage.setItem(`project_draft_${user.id}`, JSON.stringify(draft));
    setDraftId(draft.id);
    setSaveStatus('Draft saved');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleMultiSelect = (name, value) => {
    const currentValues = formData[name] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setFormData({ ...formData, [name]: newValues });
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    const newArray = [...formData[arrayName]];
    if (typeof newArray[index] === 'object') {
      newArray[index][field] = value;
    } else {
      newArray[index] = value;
    }
    setFormData({ ...formData, [arrayName]: newArray });
  };

  const addArrayItem = (arrayName, template = '') => {
    setFormData({
      ...formData,
      [arrayName]: [...formData[arrayName], template]
    });
  };

  const removeArrayItem = (arrayName, index) => {
    const newArray = formData[arrayName].filter((_, i) => i !== index);
    setFormData({ ...formData, [arrayName]: newArray });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => URL.createObjectURL(file));
    setFormData({
      ...formData,
      images: [...formData.images, ...newImages].slice(0, 5)
    });
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const validatePhase = (phase) => {
    const newErrors = {};
    
    if (phase === 'A') {
      if (!formData.tagline) newErrors.tagline = 'Tagline is required';
      if (!formData.problem) newErrors.problem = 'Problem is required';
      if (!formData.solution) newErrors.solution = 'Solution is required';
      if (!formData.traction) newErrors.traction = 'Traction is required';
      if (!formData.funding || formData.funding <= 0) newErrors.funding = 'Funding amount is required';
      if (!formData.sector) newErrors.sector = 'Sector is required';
    }
    
    if (phase === 'B') {
      if (!formData.marketResearch) newErrors.marketResearch = 'Market research is required';
      if (!formData.businessModelDescription) newErrors.businessModelDescription = 'Business model is required';
      if (formData.teamMembers.length === 0 || !formData.teamMembers[0].name) {
        newErrors.teamMembers = 'At least one team member is required';
      }
      if (!formData.theoryOfChange) newErrors.theoryOfChange = 'Theory of change is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhaseNavigation = (direction) => {
    const phases = ['A', 'B', 'C', 'D'];
    const currentIndex = phases.indexOf(currentPhase);
    
    if (direction === 'next') {
      if (validatePhase(currentPhase)) {
        setCurrentPhase(phases[currentIndex + 1]);
        window.scrollTo(0, 0);
      }
    } else {
      setCurrentPhase(phases[currentIndex - 1]);
      window.scrollTo(0, 0);
    }
  };

  const calculateQualityScore = () => {
    let score = 0;
    
    const requiredFields = ['tagline', 'problem', 'solution', 'traction', 'funding', 'marketResearch', 'businessModelDescription', 'theoryOfChange'];
    const completedFields = requiredFields.filter(field => formData[field]).length;
    score += (completedFields / requiredFields.length) * 40;
    
    const avgLength = (formData.problem?.length + formData.solution?.length + formData.traction?.length) / 3;
    if (avgLength > 100 && avgLength < 500) score += 30;
    else if (avgLength >= 50) score += 20;
    
    if (formData.tam && formData.currentRevenue) score += 10;
    if (formData.keyPartnerships?.length > 0 && formData.keyPartnerships[0]) score += 10;
    
    if (formData.cac && formData.ltv) score += 5;
    if (formData.revenueStreams?.length > 0 && formData.revenueStreams[0].stream) score += 5;
    
    return Math.round(score);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePhase('B')) {
      setCurrentPhase('B');
      return;
    }
    
    setLoading(true);

    try {
      const qualityScore = calculateQualityScore();
      
      const newProject = {
        id: draftId || `proj_${Date.now()}`,
        creatorId: user.id,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        
        elevatorPitch: {
          tagline: formData.tagline,
          caption: formData.caption,
          problem: formData.problem,
          solution: formData.solution,
          traction: formData.traction,
          funding: parseInt(formData.funding),
          images: formData.images,
          video: formData.video ? URL.createObjectURL(formData.video) : null
        },
        
        detailedPitch: {
          problemDeepDive: {
            marketResearch: formData.marketResearch,
            painPoints: formData.painPoints.filter(p => p),
            currentSolutions: formData.currentSolutions,
            marketTiming: formData.marketTiming
          },
          solutionDetails: {
            technicalSpecs: formData.technicalSpecs,
            proprietaryTech: formData.proprietaryTech,
            competitiveAdvantages: formData.competitiveAdvantages.filter(a => a),
            ipStatus: formData.ipStatus,
            barriers: formData.barriers
          },
          market: {
            tam: formData.tam,
            tamSource: formData.tamSource,
            sam: formData.sam,
            som: formData.som,
            currentRevenue: parseInt(formData.currentRevenue) || 0,
            userGrowth: formData.userGrowth,
            keyPartnerships: formData.keyPartnerships.filter(p => p),
            pilotsAndLOIs: formData.pilotsAndLOIs
          },
          businessModel: {
            description: formData.businessModelDescription,
            revenueStreams: formData.revenueStreams.filter(r => r.stream),
            pricingStrategy: formData.pricingStrategy,
            unitEconomics: {
              cac: parseInt(formData.cac) || 0,
              ltv: parseInt(formData.ltv) || 0,
              ltvCacRatio: formData.ltv && formData.cac ? Math.round(formData.ltv / formData.cac) : 0,
              paybackPeriod: formData.paybackPeriod
            },
            scalabilityPlan: formData.scalabilityPlan,
            competitiveMoat: formData.competitiveMoat
          },
          fundingBreakdown: {
            totalAmount: parseInt(formData.funding),
            allocations: formData.fundingAllocations.filter(a => a.category && a.amount)
          },
          milestones: formData.milestones.filter(m => m.milestone),
          risks: formData.risks.filter(r => r.risk),
          team: formData.teamMembers.filter(t => t.name),
          advisors: formData.advisors.filter(a => a.name),
          hiringPlan: formData.hiringPlan.filter(h => h.role),
          impact: {
            theoryOfChange: formData.theoryOfChange,
            sdgTargets: formData.sdgTargets.filter(s => s.sdg),
            impactMetrics: formData.impactMetrics.filter(m => m.metric),
            reportingFramework: formData.reportingFramework
          }
        },
        
        supportingDocuments: [],
        
        qualityScore: {
          contentCompleteness: Math.round((qualityScore / 100) * 40),
          clarityAndCommunication: Math.round((qualityScore / 100) * 30),
          marketValidation: Math.round((qualityScore / 100) * 20),
          financialViability: Math.round((qualityScore / 100) * 10),
          total: qualityScore,
          peerReviewScore: 0,
          expertReviewScore: 0,
          communityUpvotes: 0
        },
        
        peerFeedback: [],
        
        metrics: {
          views: 0,
          uniqueViews: 0,
          bookmarks: 0,
          ndaRequests: 0,
          qualityScore: qualityScore,
          engagementRate: 0,
          averageTimeOnPage: 0
        },
        
        sector: formData.sector,
        location: formData.country || 'Africa',
        sdgs: formData.sdgs,
        fundingModel: formData.investmentModels[0] || 'equity',
        fundingStage: formData.fundingStage,
        investmentModels: formData.investmentModels
      };

      const docTypes = ['pitchDeck', 'financialModel', 'productDemo', 'marketValidation', 'legalDocs', 'teamCVs', 'letterOfSupport'];
      docTypes.forEach(docType => {
        if (formData[docType]) {
          newProject.supportingDocuments.push({
            type: docType,
            filename: formData[docType].name,
            uploadedAt: new Date().toISOString(),
            url: URL.createObjectURL(formData[docType])
          });
        }
      });

      await projectsAPI.create(newProject);
      
      localStorage.removeItem(`project_draft_${user.id}`);
      
      navigate('/creator/dashboard');
    } catch (error) {
      console.error('Error creating project:', error);
      setErrors({ submit: 'Failed to create project. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const PhaseIndicator = () => (
    <div className="flex justify-between items-center mb-12 relative">
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-neutral-200 z-0" />
      {[
        { key: 'A', label: 'Elevator Pitch', icon: <Lightbulb size={20} /> },
        { key: 'B', label: 'Detailed Pitch', icon: <FileText size={20} /> },
        { key: 'C', label: 'Documents', icon: <Upload size={20} /> },
        { key: 'D', label: 'Review', icon: <Award size={20} /> }
      ].map((phase, index) => (
        <div key={phase.key} className="flex flex-col items-center gap-3 z-10 bg-white px-4">
          <div className={clsx(
            "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300",
            currentPhase === phase.key ? 'bg-primary text-white scale-110' : 
            ['A','B','C','D'].indexOf(currentPhase) > index ? 'bg-success text-white' : 'bg-neutral-200 text-neutral-600'
          )}>
            {['A','B','C','D'].indexOf(currentPhase) > index ? <CheckCircle size={16} /> : phase.icon}
          </div>
          <span className={clsx(
            "text-xs font-medium",
            currentPhase === phase.key ? 'text-primary font-semibold' : 'text-neutral-600'
          )}>
            {phase.label}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="pt-[72px] min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 py-8">
      <div className="container-narrow max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={() => navigate('/creator/dashboard')} icon={<ArrowLeft size={18} />}>
            Back to Dashboard
          </Button>
          {saveStatus && (
            <div className="flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-md text-sm animate-fade-in">
              <CheckCircle size={16} />
              {saveStatus}
            </div>
          )}
        </div>

        <div className="bg-white p-10 rounded-xl shadow-md">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold mb-2">Create New Project</h1>
            <p className="text-neutral-600">Share your innovation with potential investors</p>
          </div>

          <PhaseIndicator />

          {errors.submit && (
            <div className="flex items-center gap-3 bg-error/10 border border-error text-error p-4 rounded-md mb-6">
              <AlertCircle size={18} />
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {currentPhase === 'A' && (
              <div className="space-y-8">
                <div className="pb-6 border-b-2 border-neutral-200">
                  <h2 className="text-2xl font-display font-bold mb-2">Phase A: Elevator Pitch (Public Preview)</h2>
                  <p className="text-neutral-600">This information will be visible to all investors browsing projects</p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-display font-semibold text-sm text-neutral-700">
                    <TrendingUp size={18} />
                    Project Tagline *
                  </label>
                  <input
                    name="tagline"
                    type="text"
                    value={formData.tagline}
                    onChange={handleChange}
                    placeholder="e.g., Connecting 5 million smallholder farmers to profitable markets"
                    maxLength={150}
                    required
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
                  />
                  <small className="text-neutral-500 text-xs">{formData.tagline.length}/150 characters</small>
                  {errors.tagline && <span className="text-error text-xs block mt-1">{errors.tagline}</span>}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-display font-semibold text-sm text-neutral-700">
                    Caption
                  </label>
                  <input
                    name="caption"
                    type="text"
                    value={formData.caption}
                    onChange={handleChange}
                    placeholder="A brief subtitle or value proposition"
                    maxLength={100}
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block font-display font-semibold text-sm text-neutral-700">Sector *</label>
                    <select
                      name="sector"
                      value={formData.sector}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                    >
                      <option value="">Select sector...</option>
                      {sectors.map(sector => (
                        <option key={sector.id} value={sector.name}>{sector.name}</option>
                      ))}
                    </select>
                    {errors.sector && <span className="text-error text-xs block mt-1">{errors.sector}</span>}
                  </div>

                  <div className="space-y-2">
                    <label className="block font-display font-semibold text-sm text-neutral-700">Funding Stage *</label>
                    <select
                      name="fundingStage"
                      value={formData.fundingStage}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                    >
                      <option value="pre-seed">Pre-Seed</option>
                      <option value="seed">Seed</option>
                      <option value="series-a">Series A</option>
                      <option value="series-b">Series B</option>
                      <option value="growth">Growth</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-display font-semibold text-sm text-neutral-700">
                    The Problem *
                  </label>
                  <textarea
                    name="problem"
                    value={formData.problem}
                    onChange={handleChange}
                    placeholder="What problem are you solving? Be specific and quantify the impact."
                    rows={4}
                    maxLength={500}
                    required
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary resize-vertical"
                  />
                  <small className="text-neutral-500 text-xs">{formData.problem.length}/500 characters</small>
                  {errors.problem && <span className="text-error text-xs block mt-1">{errors.problem}</span>}
                </div>

                <div className="space-y-2">
                  <label className="block font-display font-semibold text-sm text-neutral-700">
                    Your Solution *
                  </label>
                  <textarea
                    name="solution"
                    value={formData.solution}
                    onChange={handleChange}
                    placeholder="How does your solution work? What makes it unique?"
                    rows={4}
                    maxLength={500}
                    required
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary resize-vertical"
                  />
                  <small className="text-neutral-500 text-xs">{formData.solution.length}/500 characters</small>
                  {errors.solution && <span className="text-error text-xs block mt-1">{errors.solution}</span>}
                </div>

                <div className="space-y-2">
                  <label className="block font-display font-semibold text-sm text-neutral-700">
                    Traction *
                  </label>
                  <input
                    name="traction"
                    type="text"
                    value={formData.traction}
                    onChange={handleChange}
                    placeholder="e.g., 15,000 users, $2M in transactions, 35% income increase"
                    maxLength={200}
                    required
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                  />
                  <small className="text-neutral-500 text-xs">Key metrics, users, revenue, partnerships, etc.</small>
                  {errors.traction && <span className="text-error text-xs block mt-1">{errors.traction}</span>}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-display font-semibold text-sm text-neutral-700">
                    <DollarSign size={18} />
                    Funding Needed (USD) *
                  </label>
                  <input
                    name="funding"
                    type="number"
                    value={formData.funding}
                    onChange={handleChange}
                    placeholder="150000"
                    min="1"
                    required
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                  />
                  {errors.funding && <span className="text-error text-xs block mt-1">{errors.funding}</span>}
                </div>

                <div className="space-y-2">
                  <label className="block font-display font-semibold text-sm text-neutral-700">Investment Models Accepted</label>
                  <div className="flex flex-wrap gap-2">
                    {['equity', 'revenue-share', 'convertible-debt', 'grant'].map(model => (
                      <button
                        key={model}
                        type="button"
                        className={clsx(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 border-2 rounded-full text-xs font-medium transition-all",
                          formData.investmentModels?.includes(model)
                            ? 'bg-primary border-primary text-white'
                            : 'bg-white border-neutral-300 text-neutral-700 hover:border-primary hover:bg-primary/5'
                        )}
                        onClick={() => handleMultiSelect('investmentModels', model)}
                      >
                        {model.replace('-', ' ').toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block font-display font-semibold text-sm text-neutral-700">Country *</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                    >
                      <option value="">Select country...</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="Ghana">Ghana</option>
                      <option value="Kenya">Kenya</option>
                      <option value="South Africa">South Africa</option>
                      <option value="Rwanda">Rwanda</option>
                      <option value="Senegal">Senegal</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block font-display font-semibold text-sm text-neutral-700">City</label>
                    <input
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g., Lagos"
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-display font-semibold text-sm text-neutral-700">SDG Alignment (Select 3-5)</label>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2">
                    {sdgs.map(sdg => (
                      <button
                        key={sdg.id}
                        type="button"
                        className={clsx(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 border-2 rounded-full text-xs font-medium transition-all",
                          formData.sdgs?.includes(parseInt(sdg.id))
                            ? 'bg-primary border-primary text-white'
                            : 'bg-white border-neutral-300 text-neutral-700 hover:border-primary hover:bg-primary/5',
                          !formData.sdgs?.includes(parseInt(sdg.id)) && formData.sdgs?.length >= 5 && 'opacity-50 cursor-not-allowed'
                        )}
                        onClick={() => handleMultiSelect('sdgs', parseInt(sdg.id))}
                        disabled={!formData.sdgs?.includes(parseInt(sdg.id)) && formData.sdgs?.length >= 5}
                      >
                        SDG {sdg.id}: {sdg.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-display font-semibold text-sm text-neutral-700">
                    <ImageIcon size={18} />
                    Project Images (Max 5)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                  />
                  <small className="text-neutral-500 text-xs">Upload high-quality images that showcase your project</small>
                  
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative aspect-video rounded-md overflow-hidden border-2 border-neutral-200">
                          <img src={img} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            className="absolute top-2 right-2 w-7 h-7 bg-black/70 text-white rounded-full flex items-center justify-center hover:bg-error transition-colors"
                            onClick={() => removeImage(index)}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-display font-semibold text-sm text-neutral-700">
                    <Video size={18} />
                    Pitch Video (Optional)
                  </label>
                  <input
                    name="video"
                    type="file"
                    accept="video/*"
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                  />
                  <small className="text-neutral-500 text-xs">Upload a 2-3 minute video pitch (Max 100MB)</small>
                </div>
              </div>
            )}

            {currentPhase === 'B' && (
              <div className="space-y-8">
                <div className="pb-6 border-b-2 border-neutral-200">
                  <h2 className="text-2xl font-display font-bold mb-2">Phase B: Detailed Pitch (NDA-Protected)</h2>
                  <p className="text-neutral-600">This information will only be visible to investors who sign an NDA</p>
                </div>

                <section className="space-y-6 p-6 bg-neutral-50 rounded-lg border border-neutral-200">
                  <h3 className="text-xl font-display font-bold flex items-center gap-2">
                    Problem Deep-Dive
                  </h3>
                  
                  <div className="space-y-2">
                    <label className="block font-display font-semibold text-sm text-neutral-700">
                      Market Research & Data *
                    </label>
                    <textarea
                      name="marketResearch"
                      value={formData.marketResearch}
                      onChange={handleChange}
                      placeholder="Provide comprehensive market research with data sources, statistics, and analysis..."
                      rows={6}
                      required
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary resize-vertical"
                    />
                    {errors.marketResearch && <span className="text-error text-xs block mt-1">{errors.marketResearch}</span>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block font-display font-semibold text-sm text-neutral-700">
                        Key Pain Points
                      </label>
                      <button 
                        type="button" 
                        onClick={() => addArrayItem('painPoints', '')} 
                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-white rounded-md text-xs font-semibold hover:bg-primary-dark transition-colors"
                      >
                        <Plus size={14} /> Add
                      </button>
                    </div>
                    {formData.painPoints.map((point, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={point}
                          onChange={(e) => handleArrayChange('painPoints', index, null, e.target.value)}
                          placeholder={`Pain point ${index + 1}`}
                          className="flex-1 px-4 py-2 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                        />
                        {formData.painPoints.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeArrayItem('painPoints', index)}
                            className="px-2 py-2 text-neutral-400 hover:text-error transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="block font-display font-semibold text-sm text-neutral-700">
                      Current Solution Landscape
                    </label>
                    <textarea
                      name="currentSolutions"
                      value={formData.currentSolutions}
                      onChange={handleChange}
                      placeholder="What existing solutions are available and their limitations..."
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary resize-vertical"
                    />
                  </div>
                </section>

                <section className="space-y-6 p-6 bg-neutral-50 rounded-lg border border-neutral-200">
                  <h3 className="text-xl font-display font-bold flex items-center gap-2">
                    Solution Details
                  </h3>
                  
                  <div className="space-y-2">
                    <label className="block font-display font-semibold text-sm text-neutral-700">
                      Technical Specifications
                    </label>
                    <textarea
                      name="technicalSpecs"
                      value={formData.technicalSpecs}
                      onChange={handleChange}
                      placeholder="Technical architecture, methodology, technology stack..."
                      rows={5}
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary resize-vertical"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block font-display font-semibold text-sm text-neutral-700">
                      Proprietary Technology
                    </label>
                    <textarea
                      name="proprietaryTech"
                      value={formData.proprietaryTech}
                      onChange={handleChange}
                      placeholder="Unique technology, algorithms, or approaches..."
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary resize-vertical"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block font-display font-semibold text-sm text-neutral-700">
                        Competitive Advantages
                      </label>
                      <button 
                        type="button" 
                        onClick={() => addArrayItem('competitiveAdvantages', '')} 
                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-white rounded-md text-xs font-semibold hover:bg-primary-dark transition-colors"
                      >
                        <Plus size={14} /> Add
                      </button>
                    </div>
                    {formData.competitiveAdvantages.map((advantage, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={advantage}
                          onChange={(e) => handleArrayChange('competitiveAdvantages', index, null, e.target.value)}
                          placeholder={`Competitive advantage ${index + 1}`}
                          className="flex-1 px-4 py-2 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                        />
                        {formData.competitiveAdvantages.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeArrayItem('competitiveAdvantages', index)}
                            className="px-2 py-2 text-neutral-400 hover:text-error transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="block font-display font-semibold text-sm text-neutral-700">
                      Intellectual Property Status
                    </label>
                    <input
                      name="ipStatus"
                      type="text"
                      value={formData.ipStatus}
                      onChange={handleChange}
                      placeholder="Patents, trademarks, copyrights (pending or granted)"
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                    />
                  </div>
                </section>

                <section className="space-y-6 p-6 bg-neutral-50 rounded-lg border border-neutral-200">
                  <h3 className="text-xl font-display font-bold flex items-center gap-2">
                    Market & Traction
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 font-display font-semibold text-sm text-neutral-700">
                        <Target size={16} />
                        Total Addressable Market (TAM)
                      </label>
                      <input
                        name="tam"
                        type="text"
                        value={formData.tam}
                        onChange={handleChange}
                        placeholder="e.g., $45B"
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">
                        TAM Source
                      </label>
                      <input
                        name="tamSource"
                        type="text"
                        value={formData.tamSource}
                        onChange={handleChange}
                        placeholder="e.g., World Bank 2024"
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">
                        Serviceable Addressable Market (SAM)
                      </label>
                      <input
                        name="sam"
                        type="text"
                        value={formData.sam}
                        onChange={handleChange}
                        placeholder="e.g., $12B"
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">
                        Serviceable Obtainable Market (SOM)
                      </label>
                      <input
                        name="som"
                        type="text"
                        value={formData.som}
                        onChange={handleChange}
                        placeholder="e.g., $500M"
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">
                        Current Revenue (USD)
                      </label>
                      <input
                        name="currentRevenue"
                        type="number"
                        value={formData.currentRevenue}
                        onChange={handleChange}
                        placeholder="250000"
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">
                        User/Revenue Growth Rate
                      </label>
                      <input
                        name="userGrowth"
                        type="text"
                        value={formData.userGrowth}
                        onChange={handleChange}
                        placeholder="e.g., 45% MoM"
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block font-display font-semibold text-sm text-neutral-700">
                        Key Partnerships
                      </label>
                      <button 
                        type="button" 
                        onClick={() => addArrayItem('keyPartnerships', '')} 
                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-white rounded-md text-xs font-semibold hover:bg-primary-dark transition-colors"
                      >
                        <Plus size={14} /> Add
                      </button>
                    </div>
                    {formData.keyPartnerships.map((partnership, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={partnership}
                          onChange={(e) => handleArrayChange('keyPartnerships', index, null, e.target.value)}
                          placeholder="Partner name and description"
                          className="flex-1 px-4 py-2 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                        />
                        {formData.keyPartnerships.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeArrayItem('keyPartnerships', index)}
                            className="px-2 py-2 text-neutral-400 hover:text-error transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-6 p-6 bg-neutral-50 rounded-lg border border-neutral-200">
                  <h3 className="text-xl font-display font-bold flex items-center gap-2">
                    Business Model & Revenue
                  </h3>
                  
                  <div className="space-y-2">
                    <label className="block font-display font-semibold text-sm text-neutral-700">
                      Business Model Description *
                    </label>
                    <textarea
                      name="businessModelDescription"
                      value={formData.businessModelDescription}
                      onChange={handleChange}
                      placeholder="How do you make money? Describe your revenue model in detail..."
                      rows={4}
                      required
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary resize-vertical"
                    />
                    {errors.businessModelDescription && <span className="text-error text-xs block mt-1">{errors.businessModelDescription}</span>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block font-display font-semibold text-sm text-neutral-700">
                        Revenue Streams
                      </label>
                      <button 
                        type="button" 
                        onClick={() => addArrayItem('revenueStreams', { stream: '', percentage: '', description: '' })} 
                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-white rounded-md text-xs font-semibold hover:bg-primary-dark transition-colors"
                      >
                        <Plus size={14} /> Add
                      </button>
                    </div>
                    {formData.revenueStreams.map((stream, index) => (
                      <div key={index} className="flex flex-col md:flex-row gap-2 p-3 bg-white rounded-md border border-neutral-200">
                        <input
                          type="text"
                          value={stream.stream}
                          onChange={(e) => handleArrayChange('revenueStreams', index, 'stream', e.target.value)}
                          placeholder="Stream name"
                          className="flex-1 px-3 py-2 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                        />
                        <input
                          type="number"
                          value={stream.percentage}
                          onChange={(e) => handleArrayChange('revenueStreams', index, 'percentage', e.target.value)}
                          placeholder="%"
                          className="w-full md:w-24 px-3 py-2 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                        />
                        <input
                          type="text"
                          value={stream.description}
                          onChange={(e) => handleArrayChange('revenueStreams', index, 'description', e.target.value)}
                          placeholder="Description"
                          className="flex-[2] px-3 py-2 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                        />
                        {formData.revenueStreams.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeArrayItem('revenueStreams', index)}
                            className="px-2 py-2 text-neutral-400 hover:text-error transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">
                        Customer Acquisition Cost (CAC)
                      </label>
                      <input
                        name="cac"
                        type="number"
                        value={formData.cac}
                        onChange={handleChange}
                        placeholder="USD"
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">
                        Lifetime Value (LTV)
                      </label>
                      <input
                        name="ltv"
                        type="number"
                        value={formData.ltv}
                        onChange={handleChange}
                        placeholder="USD"
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">
                        LTV:CAC Ratio
                      </label>
                      <input
                        type="text"
                        value={formData.ltv && formData.cac ? `${(formData.ltv / formData.cac).toFixed(1)}:1` : 'N/A'}
                        disabled
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md bg-neutral-100 text-neutral-600"
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-6 p-6 bg-neutral-50 rounded-lg border border-neutral-200">
                  <h3 className="text-xl font-display font-bold flex items-center gap-2">
                    Use of Funds & Milestones
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block font-display font-semibold text-sm text-neutral-700">
                        Funding Allocations
                      </label>
                      <button 
                        type="button" 
                        onClick={() => addArrayItem('fundingAllocations', { category: '', amount: '', percentage: '', justification: '' })} 
                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-white rounded-md text-xs font-semibold hover:bg-primary-dark transition-colors"
                      >
                        <Plus size={14} /> Add
                      </button>
                    </div>
                    {formData.fundingAllocations.map((allocation, index) => (
                      <div key={index} className="flex flex-col gap-2 p-3 bg-white rounded-md border border-neutral-200">
                        <div className="flex flex-col md:flex-row gap-2">
                          <input
                            type="text"
                            value={allocation.category}
                            onChange={(e) => handleArrayChange('fundingAllocations', index, 'category', e.target.value)}
                            placeholder="Category (e.g., Technology Development)"
                            className="flex-1 px-3 py-2 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                          />
                          <input
                            type="number"
                            value={allocation.amount}
                            onChange={(e) => {
                              const amount = e.target.value;
                              const percentage = formData.funding ? ((amount / formData.funding) * 100).toFixed(0) : 0;
                              handleArrayChange('fundingAllocations', index, 'amount', amount);
                              handleArrayChange('fundingAllocations', index, 'percentage', percentage);
                            }}
                            placeholder="Amount"
                            className="w-full md:w-32 px-3 py-2 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                          />
                          <input
                            type="number"
                            value={allocation.percentage}
                            onChange={(e) => {
                              const percentage = e.target.value;
                              const amount = formData.funding ? Math.round((percentage / 100) * formData.funding) : 0;
                              handleArrayChange('fundingAllocations', index, 'percentage', percentage);
                              handleArrayChange('fundingAllocations', index, 'amount', amount);
                            }}
                            placeholder="%"
                            className="w-full md:w-20 px-3 py-2 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                          />
                          {formData.fundingAllocations.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => removeArrayItem('fundingAllocations', index)}
                              className="px-2 py-2 text-neutral-400 hover:text-error transition-colors"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                        <textarea
                          value={allocation.justification}
                          onChange={(e) => handleArrayChange('fundingAllocations', index, 'justification', e.target.value)}
                          placeholder="Justification"
                          rows={2}
                          className="w-full px-3 py-2 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary resize-vertical"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block font-display font-semibold text-sm text-neutral-700">
                        18-Month Milestones
                      </label>
                      <button 
                        type="button" 
                        onClick={() => addArrayItem('milestones', { milestone: '', timeline: '', kpi: '', target: '' })} 
                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-white rounded-md text-xs font-semibold hover:bg-primary-dark transition-colors"
                      >
                        <Plus size={14} /> Add
                      </button>
                    </div>
                    {formData.milestones.map((milestone, index) => (
                      <div key={index} className="flex flex-wrap gap-2 p-3 bg-white rounded-md border border-neutral-200">
                        <input
                          type="text"
                          value={milestone.milestone}
                          onChange={(e) => handleArrayChange('milestones', index, 'milestone', e.target.value)}
                          placeholder="Milestone description"
                          className="flex-1 min-w-[200px] px-3 py-2 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                        />
                        <input
                          type="text"
                          value={milestone.timeline}
                          onChange={(e) => handleArrayChange('milestones', index, 'timeline', e.target.value)}
                          placeholder="Timeline"
                          className="w-full md:w-32 px-3 py-2 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                        />
                        <input
                          type="text"
                          value={milestone.kpi}
                          onChange={(e) => handleArrayChange('milestones', index, 'kpi', e.target.value)}
                          placeholder="KPI"
                          className="w-full md:w-32 px-3 py-2 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                        />
                        <input
                          type="text"
                          value={milestone.target}
                          onChange={(e) => handleArrayChange('milestones', index, 'target', e.target.value)}
                          placeholder="Target"
                          className="w-full md:w-32 px-3 py-2 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                        />
                        {formData.milestones.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeArrayItem('milestones', index)}
                            className="px-2 py-2 text-neutral-400 hover:text-error transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block font-display font-semibold text-sm text-neutral-700">
                        Risks & Mitigation
                      </label>
                      <button 
                        type="button" 
                        onClick={() => addArrayItem('risks', { risk: '', mitigation: '' })} 
                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-white rounded-md text-xs font-semibold hover:bg-primary-dark transition-colors"
                      >
                        <Plus size={14} /> Add
                      </button>
                    </div>
                    {formData.risks.map((risk, index) => (
                      <div key={index} className="flex gap-2 p-3 bg-white rounded-md border border-neutral-200">
                        <input
                          type="text"
                          value={risk.risk}
                          onChange={(e) => handleArrayChange('risks', index, 'risk', e.target.value)}
                          placeholder="Risk"
                          className="flex-1 px-3 py-2 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                        />
                        <input
                          type="text"
                          value={risk.mitigation}
                          onChange={(e) => handleArrayChange('risks', index, 'mitigation', e.target.value)}
                          placeholder="Mitigation strategy"
                          className="flex-1 px-3 py-2 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                        />
                        {formData.risks.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeArrayItem('risks', index)}
                            className="px-2 py-2 text-neutral-400 hover:text-error transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-6 p-6 bg-neutral-50 rounded-lg border border-neutral-200">
                  <h3 className="text-xl font-display font-bold flex items-center gap-2">
                    <Users size={18} />
                    Team & Advisory
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block font-display font-semibold text-sm text-neutral-700">
                        Team Members *
                      </label>
                      <button 
                        type="button" 
                        onClick={() => addArrayItem('teamMembers', { name: '', role: '', bio: '', linkedin: '', education: '', experience: '' })} 
                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-white rounded-md text-xs font-semibold hover:bg-primary-dark transition-colors"
                      >
                        <Plus size={14} /> Add
                      </button>
                    </div>
                    {formData.teamMembers.map((member, index) => (
                      <div key={index} className="flex flex-col gap-2 p-4 bg-white rounded-md border border-neutral-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => handleArrayChange('teamMembers', index, 'name', e.target.value)}
                            placeholder="Full name"
                            className="px-3 py-2 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                          />
                          <input
                            type="text"
                            value={member.role}
                            onChange={(e) => handleArrayChange('teamMembers', index, 'role', e.target.value)}
                            placeholder="Role/Title"
                            className="px-3 py-2 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                          />
                        </div>
                        <textarea
                          value={member.bio}
                          onChange={(e) => handleArrayChange('teamMembers', index, 'bio', e.target.value)}
                          placeholder="Bio and relevant experience"
                          rows={2}
                          className="w-full px-3 py-2 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary resize-vertical"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <input
                            type="url"
                            value={member.linkedin}
                            onChange={(e) => handleArrayChange('teamMembers', index, 'linkedin', e.target.value)}
                            placeholder="LinkedIn URL"
                            className="px-3 py-2 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                          />
                          <input
                            type="text"
                            value={member.education}
                            onChange={(e) => handleArrayChange('teamMembers', index, 'education', e.target.value)}
                            placeholder="Education"
                            className="px-3 py-2 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                          />
                        </div>
                        <input
                          type="text"
                          value={member.experience}
                          onChange={(e) => handleArrayChange('teamMembers', index, 'experience', e.target.value)}
                          placeholder="Relevant experience summary"
                          className="w-full px-3 py-2 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                        />
                        {formData.teamMembers.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeArrayItem('teamMembers', index)}
                            className="self-end px-2 py-2 text-neutral-400 hover:text-error transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    {errors.teamMembers && <span className="text-error text-xs block mt-1">{errors.teamMembers}</span>}
                  </div>
                </section>

                <section className="space-y-6 p-6 bg-neutral-50 rounded-lg border border-neutral-200">
                  <h3 className="text-xl font-display font-bold flex items-center gap-2">
                    Impact Measurement
                  </h3>
                  
                  <div className="space-y-2">
                    <label className="block font-display font-semibold text-sm text-neutral-700">
                      Theory of Change *
                    </label>
                    <textarea
                      name="theoryOfChange"
                      value={formData.theoryOfChange}
                      onChange={handleChange}
                      placeholder="How does your solution create impact? Describe the causal pathway from your activities to outcomes..."
                      rows={5}
                      required
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary resize-vertical"
                    />
                    {errors.theoryOfChange && <span className="text-error text-xs block mt-1">{errors.theoryOfChange}</span>}
                  </div>
                </section>
              </div>
            )}

            {currentPhase === 'C' && (
              <div className="space-y-8">
                <div className="pb-6 border-b-2 border-neutral-200">
                  <h2 className="text-2xl font-display font-bold mb-2">Phase C: Supporting Documents</h2>
                  <p className="text-neutral-600">Upload additional documentation to strengthen your pitch</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-display font-semibold text-sm text-neutral-700">
                      <FileText size={18} />
                      Pitch Deck (PDF, max 15 slides)
                    </label>
                    <input
                      name="pitchDeck"
                      type="file"
                      accept=".pdf"
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                    />
                    {formData.pitchDeck && (
                      <div className="flex items-center gap-2 p-2 bg-neutral-50 rounded-md text-sm">
                        <FileText size={16} className="text-primary" />
                        <span className="flex-1 truncate">{formData.pitchDeck.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-display font-semibold text-sm text-neutral-700">
                      <BarChart size={18} />
                      Financial Model (Excel/CSV)
                    </label>
                    <input
                      name="financialModel"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                    />
                    {formData.financialModel && (
                      <div className="flex items-center gap-2 p-2 bg-neutral-50 rounded-md text-sm">
                        <FileText size={16} className="text-primary" />
                        <span className="flex-1 truncate">{formData.financialModel.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-display font-semibold text-sm text-neutral-700">
                      <Video size={18} />
                      Product Demo Video/Link
                    </label>
                    <input
                      name="productDemo"
                      type="file"
                      accept="video/*"
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                    />
                    {formData.productDemo && (
                      <div className="flex items-center gap-2 p-2 bg-neutral-50 rounded-md text-sm">
                        <Video size={16} className="text-primary" />
                        <span className="flex-1 truncate">{formData.productDemo.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-display font-semibold text-sm text-neutral-700">
                      <Award size={18} />
                      Market Validation Documents
                    </label>
                    <input
                      name="marketValidation"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                    />
                    <small className="text-neutral-500 text-xs">Customer interviews, surveys, pilot results</small>
                    {formData.marketValidation && (
                      <div className="flex items-center gap-2 p-2 bg-neutral-50 rounded-md text-sm">
                        <FileText size={16} className="text-primary" />
                        <span className="flex-1 truncate">{formData.marketValidation.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentPhase === 'D' && (
              <div className="space-y-8">
                <div className="pb-6 border-b-2 border-neutral-200">
                  <h2 className="text-2xl font-display font-bold mb-2">Phase D: Review & Publish</h2>
                  <p className="text-neutral-600">Review your project and quality score before publishing</p>
                </div>

                <div className="p-8 bg-gradient-to-r from-primary/90 to-clay/90 rounded-lg text-white">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
                    <h3 className="text-2xl font-display font-bold">Quality Score</h3>
                    <div className="relative w-32 h-32">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" />
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="45" 
                          fill="none" 
                          stroke="white" 
                          strokeWidth="10"
                          strokeDasharray={`${calculateQualityScore() * 2.83} 283`}
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-display font-bold">
                        {calculateQualityScore()}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-[200px,1fr,60px] items-center gap-4">
                      <span className="font-display font-medium">Content Completeness</span>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white rounded-full"
                          style={{ width: `${(calculateQualityScore() / 100) * 40}%` }}
                        />
                      </div>
                      <span className="font-display font-semibold text-right">{Math.round((calculateQualityScore() / 100) * 40)}/40</span>
                    </div>
                    <div className="grid grid-cols-[200px,1fr,60px] items-center gap-4">
                      <span className="font-display font-medium">Clarity & Communication</span>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white rounded-full"
                          style={{ width: `${(calculateQualityScore() / 100) * 30}%` }}
                        />
                      </div>
                      <span className="font-display font-semibold text-right">{Math.round((calculateQualityScore() / 100) * 30)}/30</span>
                    </div>
                    <div className="grid grid-cols-[200px,1fr,60px] items-center gap-4">
                      <span className="font-display font-medium">Market Validation</span>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white rounded-full"
                          style={{ width: `${(calculateQualityScore() / 100) * 20}%` }}
                        />
                      </div>
                      <span className="font-display font-semibold text-right">{Math.round((calculateQualityScore() / 100) * 20)}/20</span>
                    </div>
                    <div className="grid grid-cols-[200px,1fr,60px] items-center gap-4">
                      <span className="font-display font-medium">Financial Viability</span>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white rounded-full"
                          style={{ width: `${(calculateQualityScore() / 100) * 10}%` }}
                        />
                      </div>
                      <span className="font-display font-semibold text-right">{Math.round((calculateQualityScore() / 100) * 10)}/10</span>
                    </div>
                  </div>

                  {calculateQualityScore() < 70 && (
                    <div className="flex items-start gap-3 mt-6 p-4 bg-white/20 rounded-md">
                      <AlertCircle size={18} className="flex-shrink-0" />
                      <p className="text-sm">Your quality score is below 70%. Consider adding more detail to improve your chances of attracting investors.</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-display font-bold">Project Preview</h3>
                  <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white">
                    <div className="relative aspect-video bg-neutral-100">
                      {formData.images[0] ? (
                        <img src={formData.images[0]} alt="Project preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400 font-medium">
                          No image uploaded
                        </div>
                      )}
                      <div className="absolute top-4 left-4 px-3 py-1.5 bg-primary text-white rounded-full text-xs font-semibold">
                        {formData.sector || 'Sector'}
                      </div>
                    </div>
                    <div className="p-6">
                      <h4 className="text-xl font-display font-bold mb-4">{formData.tagline || 'Your project tagline will appear here'}</h4>
                      <p className="text-neutral-700 mb-2">{formData.problem || 'Problem description...'}</p>
                      <p className="text-neutral-700 mb-4">{formData.solution || 'Solution description...'}</p>
                      <div className="flex gap-6 pt-4 border-t border-neutral-200 text-sm font-medium text-neutral-600">
                        <span>💰 ${formData.funding ? (parseInt(formData.funding) / 1000).toFixed(0) + 'K' : '0'}</span>
                        <span>📍 {formData.country || 'Location'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-display font-bold">Publication Options</h3>
                  <div className="space-y-3">
                    <div className="flex gap-4 p-6 border-2 border-neutral-200 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                      <input type="radio" id="saveDraft" name="submissionType" value="draft" defaultChecked className="mt-1 w-5 h-5 accent-primary cursor-pointer" />
                      <label htmlFor="saveDraft" className="flex-1 cursor-pointer">
                        <h4 className="font-display font-bold text-lg text-neutral-900">Save as Draft</h4>
                        <p className="text-neutral-600 text-sm">Continue working on your project later. Not visible to investors.</p>
                      </label>
                    </div>
                    <div className="flex gap-4 p-6 border-2 border-neutral-200 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                      <input type="radio" id="submitReview" name="submissionType" value="review" className="mt-1 w-5 h-5 accent-primary cursor-pointer" />
                      <label htmlFor="submitReview" className="flex-1 cursor-pointer">
                        <h4 className="font-display font-bold text-lg text-neutral-900">Submit for Review</h4>
                        <p className="text-neutral-600 text-sm">Our team will review your project for compliance and quality before publishing.</p>
                      </label>
                    </div>
                    <div className="flex gap-4 p-6 border-2 border-neutral-200 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                      <input type="radio" id="publishNow" name="submissionType" value="live" className="mt-1 w-5 h-5 accent-primary cursor-pointer" />
                      <label htmlFor="publishNow" className="flex-1 cursor-pointer">
                        <h4 className="font-display font-bold text-lg text-neutral-900">Publish Now</h4>
                        <p className="text-neutral-600 text-sm">Make your project immediately visible to investors.</p>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-8 mt-8 border-t-2 border-neutral-200">
              <div className="flex gap-4">
                {currentPhase !== 'A' && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handlePhaseNavigation('back')}
                    icon={<ArrowLeft size={18} />}
                  >
                    Previous
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={saveDraft}
                  icon={<Save size={18} />}
                >
                  Save Draft
                </Button>
              </div>

              <div>
                {currentPhase !== 'D' ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => handlePhaseNavigation('next')}
                    icon={<ArrowRight size={18} />}
                    iconPosition="right"
                  >
                    Next Phase
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    size="large"
                    disabled={loading}
                    icon={loading ? <Loader className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                    iconPosition="right"
                  >
                    {loading ? 'Creating Project...' : 'Create Project'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;