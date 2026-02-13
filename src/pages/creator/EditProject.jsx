import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, Upload, X, Plus, CheckCircle,
  AlertCircle, TrendingUp, Users, DollarSign, Target, Award,
  FileText, Video, Image, Lightbulb, BarChart, Loader,
  Trash2, Edit3, Eye, Calendar, MapPin, Tag, Briefcase,
  Shield, Zap, Heart, Globe, Clock, Settings, HelpCircle,
  CheckCircle2, AlertTriangle, Info, FileSpreadsheet,
  FileArchive, FileImage, File, Download, ExternalLink,
  Copy, Share2, MoreHorizontal, ChevronDown, ChevronUp
} from 'lucide-react';
import { projectsAPI, sectorsAPI, sdgsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { clsx } from 'clsx';

const EditProject = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('elevator');
  const [formData, setFormData] = useState({
    // Phase A - Elevator Pitch
    tagline: '',
    caption: '',
    problem: '',
    solution: '',
    traction: '',
    funding: '',
    sector: '',
    fundingStage: 'seed',
    investmentModels: [],
    images: [],
    video: null,
    country: '',
    city: '',
    sdgs: [],
    
    // Phase B - Detailed Pitch
    marketResearch: '',
    painPoints: [''],
    currentSolutions: '',
    marketTiming: '',
    technicalSpecs: '',
    proprietaryTech: '',
    competitiveAdvantages: [''],
    ipStatus: '',
    barriers: '',
    tam: '',
    tamSource: '',
    sam: '',
    som: '',
    currentRevenue: '',
    userGrowth: '',
    keyPartnerships: [''],
    pilotsAndLOIs: '',
    businessModelDescription: '',
    revenueStreams: [{ stream: '', percentage: '', description: '' }],
    pricingStrategy: '',
    cac: '',
    ltv: '',
    paybackPeriod: '',
    scalabilityPlan: '',
    competitiveMoat: '',
    fundingAllocations: [{ category: '', amount: '', percentage: '', justification: '' }],
    milestones: [{ milestone: '', timeline: '', kpi: '', target: '' }],
    risks: [{ risk: '', mitigation: '' }],
    teamMembers: [{ name: '', role: '', bio: '', linkedin: '', education: '', experience: '' }],
    advisors: [{ name: '', expertise: '', contribution: '' }],
    hiringPlan: [{ role: '', timeline: '', justification: '' }],
    theoryOfChange: '',
    sdgTargets: [{ sdg: '', target: '', contribution: '' }],
    impactMetrics: [{ metric: '', baseline: '', target: '', unit: '', timeline: '' }],
    reportingFramework: '',
    
    // Phase C - Documents
    pitchDeck: null,
    financialModel: null,
    productDemo: null,
    marketValidation: null,
    legalDocs: null,
    teamCVs: null,
    letterOfSupport: null
  });
  
  const [sectors, setSectors] = useState([]);
  const [sdgs, setSdgs] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishAction, setPublishAction] = useState('update');
  
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user?.type !== 'creator') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    fetchProject();
    fetchOptions();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getById(id);
      const projectData = response.data;
      
      // Verify ownership
      if (projectData.creatorId !== user.id) {
        setError('You do not have permission to edit this project');
        setTimeout(() => navigate('/creator/dashboard'), 2000);
        return;
      }
      
      setProject(projectData);
      
      // Populate form data
      setFormData({
        // Phase A
        tagline: projectData.elevatorPitch?.tagline || '',
        caption: projectData.elevatorPitch?.caption || '',
        problem: projectData.elevatorPitch?.problem || '',
        solution: projectData.elevatorPitch?.solution || '',
        traction: projectData.elevatorPitch?.traction || '',
        funding: projectData.elevatorPitch?.funding || '',
        sector: projectData.sector || '',
        fundingStage: projectData.fundingStage || 'seed',
        investmentModels: projectData.investmentModels || [],
        images: projectData.elevatorPitch?.images || [],
        video: projectData.elevatorPitch?.video || null,
        country: projectData.location?.split(',')[0] || '',
        city: projectData.location?.split(',')[1]?.trim() || '',
        sdgs: projectData.sdgs || [],
        
        // Phase B
        marketResearch: projectData.detailedPitch?.problemDeepDive?.marketResearch || '',
        painPoints: projectData.detailedPitch?.problemDeepDive?.painPoints || [''],
        currentSolutions: projectData.detailedPitch?.problemDeepDive?.currentSolutions || '',
        marketTiming: projectData.detailedPitch?.problemDeepDive?.marketTiming || '',
        technicalSpecs: projectData.detailedPitch?.solutionDetails?.technicalSpecs || '',
        proprietaryTech: projectData.detailedPitch?.solutionDetails?.proprietaryTech || '',
        competitiveAdvantages: projectData.detailedPitch?.solutionDetails?.competitiveAdvantages || [''],
        ipStatus: projectData.detailedPitch?.solutionDetails?.ipStatus || '',
        barriers: projectData.detailedPitch?.solutionDetails?.barriers || '',
        tam: projectData.detailedPitch?.market?.tam || '',
        tamSource: projectData.detailedPitch?.market?.tamSource || '',
        sam: projectData.detailedPitch?.market?.sam || '',
        som: projectData.detailedPitch?.market?.som || '',
        currentRevenue: projectData.detailedPitch?.market?.currentRevenue || '',
        userGrowth: projectData.detailedPitch?.market?.userGrowth || '',
        keyPartnerships: projectData.detailedPitch?.market?.keyPartnerships || [''],
        pilotsAndLOIs: projectData.detailedPitch?.market?.pilotsAndLOIs || '',
        businessModelDescription: projectData.detailedPitch?.businessModel?.description || '',
        revenueStreams: projectData.detailedPitch?.businessModel?.revenueStreams || [{ stream: '', percentage: '', description: '' }],
        pricingStrategy: projectData.detailedPitch?.businessModel?.pricingStrategy || '',
        cac: projectData.detailedPitch?.businessModel?.unitEconomics?.cac || '',
        ltv: projectData.detailedPitch?.businessModel?.unitEconomics?.ltv || '',
        paybackPeriod: projectData.detailedPitch?.businessModel?.unitEconomics?.paybackPeriod || '',
        scalabilityPlan: projectData.detailedPitch?.businessModel?.scalabilityPlan || '',
        competitiveMoat: projectData.detailedPitch?.businessModel?.competitiveMoat || '',
        fundingAllocations: projectData.detailedPitch?.fundingBreakdown?.allocations || [{ category: '', amount: '', percentage: '', justification: '' }],
        milestones: projectData.detailedPitch?.milestones || [{ milestone: '', timeline: '', kpi: '', target: '' }],
        risks: projectData.detailedPitch?.risks || [{ risk: '', mitigation: '' }],
        teamMembers: projectData.detailedPitch?.team || [{ name: '', role: '', bio: '', linkedin: '', education: '', experience: '' }],
        advisors: projectData.detailedPitch?.advisors || [{ name: '', expertise: '', contribution: '' }],
        hiringPlan: projectData.detailedPitch?.hiringPlan || [{ role: '', timeline: '', justification: '' }],
        theoryOfChange: projectData.detailedPitch?.impact?.theoryOfChange || '',
        sdgTargets: projectData.detailedPitch?.impact?.sdgTargets || [{ sdg: '', target: '', contribution: '' }],
        impactMetrics: projectData.detailedPitch?.impact?.impactMetrics || [{ metric: '', baseline: '', target: '', unit: '', timeline: '' }],
        reportingFramework: projectData.detailedPitch?.impact?.reportingFramework || '',
        
        // Phase C - We don't populate file inputs for security
      });
      
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Failed to load project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
    if (field) {
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

  const calculateQualityScore = () => {
    let score = 0;
    
    // Content Completeness (40 points)
    const requiredFields = [
      'tagline', 'problem', 'solution', 'traction', 'funding',
      'marketResearch', 'businessModelDescription', 'theoryOfChange'
    ];
    const completedFields = requiredFields.filter(field => formData[field]).length;
    score += (completedFields / requiredFields.length) * 40;
    
    // Clarity & Communication (30 points)
    const avgLength = (formData.problem?.length + formData.solution?.length + formData.traction?.length) / 3;
    if (avgLength > 200) score += 30;
    else if (avgLength > 100) score += 20;
    else if (avgLength > 50) score += 10;
    
    // Market Validation (20 points)
    if (formData.tam && formData.currentRevenue) score += 10;
    if (formData.keyPartnerships?.length > 0 && formData.keyPartnerships[0]) score += 5;
    if (formData.pilotsAndLOIs) score += 5;
    
    // Financial Viability (10 points)
    if (formData.cac && formData.ltv) score += 5;
    if (formData.revenueStreams?.length > 0 && formData.revenueStreams[0].stream) score += 5;
    if (formData.paybackPeriod) score += 5;
    
    return Math.min(Math.round(score), 100);
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const qualityScore = calculateQualityScore();
      
      const updatedProject = {
        ...project,
        ...formData,
        elevatorPitch: {
          tagline: formData.tagline,
          caption: formData.caption,
          problem: formData.problem,
          solution: formData.solution,
          traction: formData.traction,
          funding: parseInt(formData.funding) || 0,
          images: formData.images,
          video: formData.video
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
              ltvCacRatio: formData.ltv && formData.cac ? (formData.ltv / formData.cac).toFixed(1) : 0,
              paybackPeriod: formData.paybackPeriod
            },
            scalabilityPlan: formData.scalabilityPlan,
            competitiveMoat: formData.competitiveMoat
          },
          fundingBreakdown: {
            totalAmount: parseInt(formData.funding) || 0,
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
        sector: formData.sector,
        location: formData.country + (formData.city ? `, ${formData.city}` : ''),
        sdgs: formData.sdgs,
        fundingStage: formData.fundingStage,
        investmentModels: formData.investmentModels,
        updatedAt: new Date().toISOString(),
        metrics: {
          ...project.metrics,
          qualityScore: qualityScore
        }
      };
      
      await projectsAPI.update(id, updatedProject);
      setSuccess('Project saved successfully!');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving project:', error);
      setError('Failed to save project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    setError('');
    
    try {
      const updatedProject = {
        ...project,
        status: publishAction === 'publish' ? 'live' : 'review',
        updatedAt: new Date().toISOString()
      };
      
      await projectsAPI.update(id, updatedProject);
      
      setPublishModalOpen(false);
      navigate('/creator/dashboard', { 
        state: { 
          message: publishAction === 'publish' 
            ? 'Your project is now live and visible to investors!' 
            : 'Your project has been submitted for review.' 
        } 
      });
      
    } catch (error) {
      console.error('Error publishing project:', error);
      setError('Failed to publish project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await projectsAPI.delete(id);
      navigate('/creator/dashboard', { 
        state: { message: 'Project deleted successfully.' } 
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project. Please try again.');
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="pt-[72px] min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-12 h-12 border-4 border-neutral-200 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="font-display font-semibold text-neutral-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="pt-[72px] min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-sm">
          <AlertCircle size={48} className="text-error mx-auto mb-4" />
          <h2 className="font-display font-bold text-2xl mb-2">Error</h2>
          <p className="text-neutral-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/creator/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[72px] min-h-screen bg-neutral-50 pb-16">
      <div className="container-narrow max-w-5xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 sticky top-[72px] z-30">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/creator/dashboard')}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-neutral-600" />
              </button>
              <div>
                <h1 className="text-2xl font-display font-bold flex items-center gap-2">
                  <Edit3 size={24} className="text-primary" />
                  Edit Project
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={clsx(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
                    project?.status === 'live' ? 'bg-success/10 text-success' :
                    project?.status === 'review' ? 'bg-amber-50 text-amber-700' :
                    'bg-neutral-100 text-neutral-700'
                  )}>
                    {project?.status === 'live' && <Eye size={12} />}
                    {project?.status === 'review' && <Clock size={12} />}
                    {project?.status === 'draft' && <FileText size={12} />}
                    {project?.status?.charAt(0).toUpperCase() + project?.status?.slice(1)}
                  </span>
                  <span className="text-xs text-neutral-400">
                    Last updated {new Date(project?.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              {success && (
                <div className="flex-1 md:flex-none flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-lg text-sm animate-fade-in">
                  <CheckCircle2 size={16} />
                  {success}
                </div>
              )}
              
              {error && (
                <div className="flex-1 md:flex-none flex items-center gap-2 px-4 py-2 bg-error/10 text-error rounded-lg text-sm animate-fade-in">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
              
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={clsx(
                  "px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all",
                  previewMode
                    ? 'bg-primary text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                )}
              >
                <Eye size={16} />
                {previewMode ? 'Edit Mode' : 'Preview'}
              </button>
              
              <Button
                onClick={handleSaveDraft}
                variant="secondary"
                disabled={saving}
                icon={saving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
              >
                Save Draft
              </Button>
              
              <Button
                onClick={() => setPublishModalOpen(true)}
                variant="primary"
                disabled={saving}
              >
                {project?.status === 'live' ? 'Update' : 'Publish'}
              </Button>
              
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="p-2 text-neutral-400 hover:text-error hover:bg-neutral-100 rounded-lg transition-colors"
                title="Delete project"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
          
          {/* Quality Score Bar */}
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-neutral-600 flex items-center gap-1">
                <Award size={14} className="text-primary" />
                Quality Score
              </span>
              <span className="text-sm font-display font-bold text-primary">
                {calculateQualityScore()}%
              </span>
            </div>
            <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-500"
                style={{ width: `${calculateQualityScore()}%` }}
              />
            </div>
            <p className="text-[10px] text-neutral-500 mt-2">
              {calculateQualityScore() >= 80 
                ? 'Excellent! Your project is ready for investors.'
                : 'Add more details to improve your quality score and attract more investors.'}
            </p>
          </div>
        </div>

        {/* Preview Mode */}
        {previewMode ? (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold">Project Preview</h2>
              <Button
                variant="ghost"
                size="small"
                onClick={() => window.open(`/projects/${id}`, '_blank')}
                icon={<ExternalLink size={16} />}
              >
                Open Full Page
              </Button>
            </div>
            
            <div className="border border-neutral-200 rounded-lg overflow-hidden">
              <div className="relative aspect-video bg-neutral-100">
                {formData.images[0] ? (
                  <img 
                    src={formData.images[0]} 
                    alt="Project preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400">
                    <Image size={48} />
                  </div>
                )}
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-primary text-white rounded-full text-xs font-semibold">
                  {formData.sector || 'Sector'}
                </div>
              </div>
              
              <div className="p-6">
                <h1 className="text-3xl font-display font-bold mb-2">
                  {formData.tagline || 'Your project tagline'}
                </h1>
                {formData.caption && (
                  <p className="text-lg text-neutral-600 mb-4">{formData.caption}</p>
                )}
                
                <div className="flex flex-wrap gap-4 mb-6">
                  <span className="flex items-center gap-1 text-sm text-neutral-600">
                    <MapPin size={16} />
                    {formData.country || 'Location'} {formData.city && `, ${formData.city}`}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-success font-semibold">
                    <DollarSign size={16} />
                    {formatCurrency(formData.funding)} seeking
                  </span>
                  <span className="flex items-center gap-1 text-sm text-neutral-600">
                    <TrendingUp size={16} />
                    {formData.fundingStage?.replace('-', ' ') || 'Seed'}
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-display font-bold text-lg mb-2">The Problem</h3>
                    <p className="text-neutral-700">{formData.problem || 'No problem description yet.'}</p>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg mb-2">The Solution</h3>
                    <p className="text-neutral-700">{formData.solution || 'No solution description yet.'}</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-neutral-50 rounded-lg border-l-4 border-primary">
                  <h4 className="font-display font-semibold text-sm mb-1">Traction</h4>
                  <p className="text-neutral-700">{formData.traction || 'No traction information yet.'}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Edit Mode Tabs */
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-neutral-200 overflow-x-auto">
              {[
                { id: 'elevator', label: 'Elevator Pitch', icon: <Lightbulb size={16} /> },
                { id: 'problem', label: 'Problem & Solution', icon: <Target size={16} /> },
                { id: 'market', label: 'Market & Traction', icon: <TrendingUp size={16} /> },
                { id: 'business', label: 'Business Model', icon: <Briefcase size={16} /> },
                { id: 'team', label: 'Team', icon: <Users size={16} /> },
                { id: 'impact', label: 'Impact', icon: <Heart size={16} /> },
                { id: 'documents', label: 'Documents', icon: <FileText size={16} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "px-5 py-4 text-sm font-display font-medium flex items-center gap-2 border-b-2 transition-all whitespace-nowrap",
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* ELEVATOR PITCH TAB */}
              {activeTab === 'elevator' && (
                <div className="space-y-6">
                  <div>
                    <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                      Project Tagline *
                    </label>
                    <input
                      type="text"
                      name="tagline"
                      value={formData.tagline}
                      onChange={handleChange}
                      placeholder="e.g., Connecting 5 million smallholder farmers to profitable markets"
                      maxLength={150}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-neutral-500">{formData.tagline.length}/150 characters</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                      Caption / Subtitle
                    </label>
                    <input
                      type="text"
                      name="caption"
                      value={formData.caption}
                      onChange={handleChange}
                      placeholder="A brief value proposition"
                      maxLength={100}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                        Sector *
                      </label>
                      <select
                        name="sector"
                        value={formData.sector}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">Select sector...</option>
                        {sectors.map(sector => (
                          <option key={sector.id} value={sector.name}>{sector.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                        Funding Stage
                      </label>
                      <select
                        name="fundingStage"
                        value={formData.fundingStage}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="pre-seed">Pre-Seed</option>
                        <option value="seed">Seed</option>
                        <option value="series-a">Series A</option>
                        <option value="series-b">Series B</option>
                        <option value="growth">Growth</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                      Investment Models
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['equity', 'revenue-share', 'convertible-debt', 'grant'].map(model => (
                        <button
                          key={model}
                          type="button"
                          onClick={() => handleMultiSelect('investmentModels', model)}
                          className={clsx(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                            formData.investmentModels?.includes(model)
                              ? 'bg-primary text-white'
                              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                          )}
                        >
                          {model.replace('-', ' ').toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                      The Problem *
                    </label>
                    <textarea
                      name="problem"
                      value={formData.problem}
                      onChange={handleChange}
                      placeholder="What problem are you solving? Be specific about the pain points and who experiences them."
                      rows={4}
                      maxLength={500}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                    <span className="text-xs text-neutral-500">{formData.problem.length}/500 characters</span>
                  </div>

                  <div>
                    <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                      Your Solution *
                    </label>
                    <textarea
                      name="solution"
                      value={formData.solution}
                      onChange={handleChange}
                      placeholder="How does your solution work? What makes it unique and better than alternatives?"
                      rows={4}
                      maxLength={500}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                    <span className="text-xs text-neutral-500">{formData.solution.length}/500 characters</span>
                  </div>

                  <div>
                    <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                      Traction *
                    </label>
                    <input
                      type="text"
                      name="traction"
                      value={formData.traction}
                      onChange={handleChange}
                      placeholder="e.g., 15,000 users, $2M in transactions, 35% income increase"
                      maxLength={200}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                      Funding Needed (USD) *
                    </label>
                    <input
                      type="number"
                      name="funding"
                      value={formData.funding}
                      onChange={handleChange}
                      placeholder="150000"
                      min="1"
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                        Country *
                      </label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">Select country...</option>
                        <option value="Nigeria">Nigeria</option>
                        <option value="Ghana">Ghana</option>
                        <option value="Kenya">Kenya</option>
                        <option value="South Africa">South Africa</option>
                        <option value="Rwanda">Rwanda</option>
                        <option value="Senegal">Senegal</option>
                        <option value="Ethiopia">Ethiopia</option>
                        <option value="Tanzania">Tanzania</option>
                        <option value="Uganda">Uganda</option>
                        <option value="Egypt">Egypt</option>
                        <option value="Morocco">Morocco</option>
                        <option value="Zambia">Zambia</option>
                        <option value="Zimbabwe">Zimbabwe</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="e.g., Lagos"
                        className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                      SDG Alignment
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-neutral-200 rounded-lg">
                      {sdgs.map(sdg => (
                        <button
                          key={sdg.id}
                          type="button"
                          onClick={() => handleMultiSelect('sdgs', parseInt(sdg.id))}
                          className={clsx(
                            "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                            formData.sdgs?.includes(parseInt(sdg.id))
                              ? 'bg-primary text-white'
                              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                          )}
                          style={formData.sdgs?.includes(parseInt(sdg.id)) ? {} : { borderColor: sdg.color }}
                        >
                          SDG {sdg.id}: {sdg.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                      Project Images
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                    />
                    <p className="text-xs text-neutral-500 mt-1">Upload up to 5 images. Recommended size: 1200x800px</p>
                    
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                        {formData.images.map((img, index) => (
                          <div key={index} className="relative aspect-video rounded-lg overflow-hidden border-2 border-neutral-200 group">
                            <img src={img} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 w-7 h-7 bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PROBLEM & SOLUTION TAB */}
              {activeTab === 'problem' && (
                <div className="space-y-6">
                  <div>
                    <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                      Market Research & Data *
                    </label>
                    <textarea
                      name="marketResearch"
                      value={formData.marketResearch}
                      onChange={handleChange}
                      placeholder="Provide comprehensive market research with data sources, statistics, and analysis..."
                      rows={6}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">
                        Key Pain Points
                      </label>
                      <button
                        type="button"
                        onClick={() => addArrayItem('painPoints', '')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark transition-colors"
                      >
                        <Plus size={14} />
                        Add Pain Point
                      </button>
                    </div>
                    {formData.painPoints.map((point, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={point}
                          onChange={(e) => handleArrayChange('painPoints', index, null, e.target.value)}
                          placeholder={`Pain point ${index + 1}`}
                          className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        {formData.painPoints.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('painPoints', index)}
                            className="p-2 text-neutral-400 hover:text-error hover:bg-neutral-100 rounded-lg transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                      Current Solution Landscape
                    </label>
                    <textarea
                      name="currentSolutions"
                      value={formData.currentSolutions}
                      onChange={handleChange}
                      placeholder="What existing solutions are available and what are their limitations?"
                      rows={4}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                      Market Timing
                    </label>
                    <textarea
                      name="marketTiming"
                      value={formData.marketTiming}
                      onChange={handleChange}
                      placeholder="Why is now the right time for your solution?"
                      rows={3}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                      Technical Specifications
                    </label>
                    <textarea
                      name="technicalSpecs"
                      value={formData.technicalSpecs}
                      onChange={handleChange}
                      placeholder="Technical architecture, methodology, technology stack..."
                      rows={4}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                      Proprietary Technology
                    </label>
                    <textarea
                      name="proprietaryTech"
                      value={formData.proprietaryTech}
                      onChange={handleChange}
                      placeholder="Unique technology, algorithms, or approaches..."
                      rows={3}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">
                        Competitive Advantages
                      </label>
                      <button
                        type="button"
                        onClick={() => addArrayItem('competitiveAdvantages', '')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark transition-colors"
                      >
                        <Plus size={14} />
                        Add Advantage
                      </button>
                    </div>
                    {formData.competitiveAdvantages.map((advantage, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={advantage}
                          onChange={(e) => handleArrayChange('competitiveAdvantages', index, null, e.target.value)}
                          placeholder={`Competitive advantage ${index + 1}`}
                          className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        {formData.competitiveAdvantages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('competitiveAdvantages', index)}
                            className="p-2 text-neutral-400 hover:text-error hover:bg-neutral-100 rounded-lg transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                      Intellectual Property Status
                    </label>
                    <input
                      type="text"
                      name="ipStatus"
                      value={formData.ipStatus}
                      onChange={handleChange}
                      placeholder="Patents, trademarks, copyrights (pending or granted)"
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              )}

              {/* MARKET & TRACTION TAB */}
              {activeTab === 'market' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                        Total Addressable Market (TAM)
                      </label>
                      <input
                        type="text"
                        name="tam"
                        value={formData.tam}
                        onChange={handleChange}
                        placeholder="e.g., $45B"
                        className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                        TAM Source
                      </label>
                      <input
                        type="text"
                        name="tamSource"
                        value={formData.tamSource}
                        onChange={handleChange}
                        placeholder="e.g., World Bank 2024"
                        className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                        Serviceable Addressable Market (SAM)
                      </label>
                      <input
                        type="text"
                        name="sam"
                        value={formData.sam}
                        onChange={handleChange}
                        placeholder="e.g., $12B"
                        className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                        Serviceable Obtainable Market (SOM)
                      </label>
                      <input
                        type="text"
                        name="som"
                        value={formData.som}
                        onChange={handleChange}
                        placeholder="e.g., $500M"
                        className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                        Current Revenue (USD)
                      </label>
                      <input
                        type="number"
                        name="currentRevenue"
                        value={formData.currentRevenue}
                        onChange={handleChange}
                        placeholder="250000"
                        className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                        User/Revenue Growth Rate
                      </label>
                      <input
                        type="text"
                        name="userGrowth"
                        value={formData.userGrowth}
                        onChange={handleChange}
                        placeholder="e.g., 45% MoM"
                        className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">
                        Key Partnerships
                      </label>
                      <button
                        type="button"
                        onClick={() => addArrayItem('keyPartnerships', '')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark transition-colors"
                      >
                        <Plus size={14} />
                        Add Partnership
                      </button>
                    </div>
                    {formData.keyPartnerships.map((partnership, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={partnership}
                          onChange={(e) => handleArrayChange('keyPartnerships', index, null, e.target.value)}
                          placeholder="Partner name and description"
                          className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        {formData.keyPartnerships.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('keyPartnerships', index)}
                            className="p-2 text-neutral-400 hover:text-error hover:bg-neutral-100 rounded-lg transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                      Pilots & Letters of Intent
                    </label>
                    <textarea
                      name="pilotsAndLOIs"
                      value={formData.pilotsAndLOIs}
                      onChange={handleChange}
                      placeholder="Describe your pilot programs, LOIs signed, or active partnerships..."
                      rows={3}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* BUSINESS MODEL TAB */}
              {activeTab === 'business' && (
                <div className="space-y-6">
                  <div>
                    <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                      Business Model Description *
                    </label>
                    <textarea
                      name="businessModelDescription"
                      value={formData.businessModelDescription}
                      onChange={handleChange}
                      placeholder="How do you make money? Describe your revenue model in detail..."
                      rows={4}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">
                        Revenue Streams
                      </label>
                      <button
                        type="button"
                        onClick={() => addArrayItem('revenueStreams', { stream: '', percentage: '', description: '' })}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark transition-colors"
                      >
                        <Plus size={14} />
                        Add Revenue Stream
                      </button>
                    </div>
                    {formData.revenueStreams.map((stream, index) => (
                      <div key={index} className="flex flex-col md:flex-row gap-2 p-4 bg-neutral-50 rounded-lg mb-2">
                        <input
                          type="text"
                          value={stream.stream}
                          onChange={(e) => handleArrayChange('revenueStreams', index, 'stream', e.target.value)}
                          placeholder="Stream name"
                          className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <input
                          type="number"
                          value={stream.percentage}
                          onChange={(e) => handleArrayChange('revenueStreams', index, 'percentage', e.target.value)}
                          placeholder="%"
                          className="w-full md:w-24 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <input
                          type="text"
                          value={stream.description}
                          onChange={(e) => handleArrayChange('revenueStreams', index, 'description', e.target.value)}
                          placeholder="Description"
                          className="flex-[2] px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        {formData.revenueStreams.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('revenueStreams', index)}
                            className="p-2 text-neutral-400 hover:text-error hover:bg-neutral-200 rounded-lg transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                      Pricing Strategy
                    </label>
                    <textarea
                      name="pricingStrategy"
                      value={formData.pricingStrategy}
                      onChange={handleChange}
                      placeholder="Explain your pricing model and rationale..."
                      rows={3}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                        Customer Acquisition Cost (CAC)
                      </label>
                      <input
                        type="number"
                        name="cac"
                        value={formData.cac}
                        onChange={handleChange}
                        placeholder="USD"
                        className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                        Lifetime Value (LTV)
                      </label>
                      <input
                        type="number"
                        name="ltv"
                        value={formData.ltv}
                        onChange={handleChange}
                        placeholder="USD"
                        className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                        Payback Period
                      </label>
                      <input
                        type="text"
                        name="paybackPeriod"
                        value={formData.paybackPeriod}
                        onChange={handleChange}
                        placeholder="e.g., 3 months"
                        className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                      Scalability Plan
                    </label>
                    <textarea
                      name="scalabilityPlan"
                      value={formData.scalabilityPlan}
                      onChange={handleChange}
                      placeholder="How will you grow across African markets?"
                      rows={3}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">
                        Funding Allocations
                      </label>
                      <button
                        type="button"
                        onClick={() => addArrayItem('fundingAllocations', { category: '', amount: '', percentage: '', justification: '' })}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark transition-colors"
                      >
                        <Plus size={14} />
                        Add Allocation
                      </button>
                    </div>
                    {formData.fundingAllocations.map((allocation, index) => (
                      <div key={index} className="space-y-2 p-4 bg-neutral-50 rounded-lg mb-2">
                        <div className="flex flex-col md:flex-row gap-2">
                          <input
                            type="text"
                            value={allocation.category}
                            onChange={(e) => handleArrayChange('fundingAllocations', index, 'category', e.target.value)}
                            placeholder="Category (e.g., Technology Development)"
                            className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                          <div className="flex gap-2">
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
                              className="w-full md:w-32 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                              className="w-full md:w-20 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                          {formData.fundingAllocations.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArrayItem('fundingAllocations', index)}
                              className="p-2 text-neutral-400 hover:text-error hover:bg-neutral-200 rounded-lg transition-colors"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                        <textarea
                          value={allocation.justification}
                          onChange={(e) => handleArrayChange('fundingAllocations', index, 'justification', e.target.value)}
                          placeholder="Justification for this allocation"
                          rows={2}
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">
                        18-Month Milestones
                      </label>
                      <button
                        type="button"
                        onClick={() => addArrayItem('milestones', { milestone: '', timeline: '', kpi: '', target: '' })}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark transition-colors"
                      >
                        <Plus size={14} />
                        Add Milestone
                      </button>
                    </div>
                    {formData.milestones.map((milestone, index) => (
                      <div key={index} className="flex flex-wrap gap-2 p-4 bg-neutral-50 rounded-lg mb-2">
                        <input
                          type="text"
                          value={milestone.milestone}
                          onChange={(e) => handleArrayChange('milestones', index, 'milestone', e.target.value)}
                          placeholder="Milestone description"
                          className="flex-1 min-w-[200px] px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <input
                          type="text"
                          value={milestone.timeline}
                          onChange={(e) => handleArrayChange('milestones', index, 'timeline', e.target.value)}
                          placeholder="Timeline"
                          className="w-full md:w-32 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <input
                          type="text"
                          value={milestone.kpi}
                          onChange={(e) => handleArrayChange('milestones', index, 'kpi', e.target.value)}
                          placeholder="KPI"
                          className="w-full md:w-32 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <input
                          type="text"
                          value={milestone.target}
                          onChange={(e) => handleArrayChange('milestones', index, 'target', e.target.value)}
                          placeholder="Target"
                          className="w-full md:w-32 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        {formData.milestones.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('milestones', index)}
                            className="p-2 text-neutral-400 hover:text-error hover:bg-neutral-200 rounded-lg transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">
                        Risks & Mitigation
                      </label>
                      <button
                        type="button"
                        onClick={() => addArrayItem('risks', { risk: '', mitigation: '' })}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark transition-colors"
                      >
                        <Plus size={14} />
                        Add Risk
                      </button>
                    </div>
                    {formData.risks.map((risk, index) => (
                      <div key={index} className="flex flex-col md:flex-row gap-2 p-4 bg-neutral-50 rounded-lg mb-2">
                        <input
                          type="text"
                          value={risk.risk}
                          onChange={(e) => handleArrayChange('risks', index, 'risk', e.target.value)}
                          placeholder="Risk"
                          className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <input
                          type="text"
                          value={risk.mitigation}
                          onChange={(e) => handleArrayChange('risks', index, 'mitigation', e.target.value)}
                          placeholder="Mitigation strategy"
                          className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        {formData.risks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('risks', index)}
                            className="p-2 text-neutral-400 hover:text-error hover:bg-neutral-200 rounded-lg transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TEAM TAB */}
              {activeTab === 'team' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">
                        Team Members *
                      </label>
                      <button
                        type="button"
                        onClick={() => addArrayItem('teamMembers', { name: '', role: '', bio: '', linkedin: '', education: '', experience: '' })}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark transition-colors"
                      >
                        <Plus size={14} />
                        Add Team Member
                      </button>
                    </div>
                    {formData.teamMembers.map((member, index) => (
                      <div key={index} className="space-y-3 p-4 bg-neutral-50 rounded-lg mb-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-display font-semibold text-sm">Team Member {index + 1}</h4>
                          {formData.teamMembers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArrayItem('teamMembers', index)}
                              className="p-1.5 text-neutral-400 hover:text-error hover:bg-neutral-200 rounded-lg transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => handleArrayChange('teamMembers', index, 'name', e.target.value)}
                            placeholder="Full name"
                            className="px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                          <input
                            type="text"
                            value={member.role}
                            onChange={(e) => handleArrayChange('teamMembers', index, 'role', e.target.value)}
                            placeholder="Role/Title"
                            className="px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        
                        <textarea
                          value={member.bio}
                          onChange={(e) => handleArrayChange('teamMembers', index, 'bio', e.target.value)}
                          placeholder="Bio and relevant experience"
                          rows={2}
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                        />
                        
                        <div className="grid md:grid-cols-2 gap-3">
                          <input
                            type="url"
                            value={member.linkedin}
                            onChange={(e) => handleArrayChange('teamMembers', index, 'linkedin', e.target.value)}
                            placeholder="LinkedIn URL"
                            className="px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                          <input
                            type="text"
                            value={member.education}
                            onChange={(e) => handleArrayChange('teamMembers', index, 'education', e.target.value)}
                            placeholder="Education"
                            className="px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        
                        <input
                          type="text"
                          value={member.experience}
                          onChange={(e) => handleArrayChange('teamMembers', index, 'experience', e.target.value)}
                          placeholder="Relevant experience summary"
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">
                        Advisors
                      </label>
                      <button
                        type="button"
                        onClick={() => addArrayItem('advisors', { name: '', expertise: '', contribution: '' })}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark transition-colors"
                      >
                        <Plus size={14} />
                        Add Advisor
                      </button>
                    </div>
                    {formData.advisors.map((advisor, index) => (
                      <div key={index} className="flex flex-col gap-2 p-4 bg-neutral-50 rounded-lg mb-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-display font-semibold text-sm">Advisor {index + 1}</h4>
                          {formData.advisors.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArrayItem('advisors', index)}
                              className="p-1.5 text-neutral-400 hover:text-error hover:bg-neutral-200 rounded-lg transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        
                        <input
                          type="text"
                          value={advisor.name}
                          onChange={(e) => handleArrayChange('advisors', index, 'name', e.target.value)}
                          placeholder="Advisor name"
                          className="px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        
                        <input
                          type="text"
                          value={advisor.expertise}
                          onChange={(e) => handleArrayChange('advisors', index, 'expertise', e.target.value)}
                          placeholder="Area of expertise"
                          className="px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        
                        <input
                          type="text"
                          value={advisor.contribution}
                          onChange={(e) => handleArrayChange('advisors', index, 'contribution', e.target.value)}
                          placeholder="Contribution to the project"
                          className="px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">
                        Hiring Plan
                      </label>
                      <button
                        type="button"
                        onClick={() => addArrayItem('hiringPlan', { role: '', timeline: '', justification: '' })}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark transition-colors"
                      >
                        <Plus size={14} />
                        Add Role
                      </button>
                    </div>
                    {formData.hiringPlan.map((hire, index) => (
                      <div key={index} className="flex flex-col md:flex-row gap-2 p-4 bg-neutral-50 rounded-lg mb-2">
                        <input
                          type="text"
                          value={hire.role}
                          onChange={(e) => handleArrayChange('hiringPlan', index, 'role', e.target.value)}
                          placeholder="Role title"
                          className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <input
                          type="text"
                          value={hire.timeline}
                          onChange={(e) => handleArrayChange('hiringPlan', index, 'timeline', e.target.value)}
                          placeholder="Timeline"
                          className="w-full md:w-32 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <input
                          type="text"
                          value={hire.justification}
                          onChange={(e) => handleArrayChange('hiringPlan', index, 'justification', e.target.value)}
                          placeholder="Why this role?"
                          className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        {formData.hiringPlan.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('hiringPlan', index)}
                            className="p-2 text-neutral-400 hover:text-error hover:bg-neutral-200 rounded-lg transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* IMPACT TAB */}
              {activeTab === 'impact' && (
                <div className="space-y-6">
                  <div>
                    <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                      Theory of Change *
                    </label>
                    <textarea
                      name="theoryOfChange"
                      value={formData.theoryOfChange}
                      onChange={handleChange}
                      placeholder="How does your solution create impact? Describe the causal pathway from your activities to outcomes..."
                      rows={5}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">
                        SDG Targets
                      </label>
                      <button
                        type="button"
                        onClick={() => addArrayItem('sdgTargets', { sdg: '', target: '', contribution: '' })}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark transition-colors"
                      >
                        <Plus size={14} />
                        Add SDG Target
                      </button>
                    </div>
                    {formData.sdgTargets.map((sdgTarget, index) => (
                      <div key={index} className="flex flex-col gap-2 p-4 bg-neutral-50 rounded-lg mb-2">
                        <div className="grid md:grid-cols-2 gap-2">
                          <select
                            value={sdgTarget.sdg}
                            onChange={(e) => handleArrayChange('sdgTargets', index, 'sdg', e.target.value)}
                            className="px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          >
                            <option value="">Select SDG...</option>
                            {sdgs.map(sdg => (
                              <option key={sdg.id} value={sdg.id}>SDG {sdg.id}: {sdg.name}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={sdgTarget.target}
                            onChange={(e) => handleArrayChange('sdgTargets', index, 'target', e.target.value)}
                            placeholder="SDG Target (e.g., 2.3)"
                            className="px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <textarea
                          value={sdgTarget.contribution}
                          onChange={(e) => handleArrayChange('sdgTargets', index, 'contribution', e.target.value)}
                          placeholder="How does your project contribute to this target?"
                          rows={2}
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                        />
                        {formData.sdgTargets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('sdgTargets', index)}
                            className="self-end p-1.5 text-neutral-400 hover:text-error hover:bg-neutral-200 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">
                        Impact Metrics
                      </label>
                      <button
                        type="button"
                        onClick={() => addArrayItem('impactMetrics', { metric: '', baseline: '', target: '', unit: '', timeline: '' })}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark transition-colors"
                      >
                        <Plus size={14} />
                        Add Metric
                      </button>
                    </div>
                    {formData.impactMetrics.map((metric, index) => (
                      <div key={index} className="flex flex-col gap-2 p-4 bg-neutral-50 rounded-lg mb-2">
                        <div className="grid md:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={metric.metric}
                            onChange={(e) => handleArrayChange('impactMetrics', index, 'metric', e.target.value)}
                            placeholder="Metric name (e.g., Farmers reached)"
                            className="px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                          <input
                            type="text"
                            value={metric.unit}
                            onChange={(e) => handleArrayChange('impactMetrics', index, 'unit', e.target.value)}
                            placeholder="Unit (e.g., number, %)"
                            className="px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div className="grid md:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={metric.baseline}
                            onChange={(e) => handleArrayChange('impactMetrics', index, 'baseline', e.target.value)}
                            placeholder="Baseline"
                            className="px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                          <input
                            type="text"
                            value={metric.target}
                            onChange={(e) => handleArrayChange('impactMetrics', index, 'target', e.target.value)}
                            placeholder="Target"
                            className="px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                          <input
                            type="text"
                            value={metric.timeline}
                            onChange={(e) => handleArrayChange('impactMetrics', index, 'timeline', e.target.value)}
                            placeholder="Timeline"
                            className="px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        {formData.impactMetrics.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('impactMetrics', index)}
                            className="self-end p-1.5 text-neutral-400 hover:text-error hover:bg-neutral-200 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                      Reporting Framework
                    </label>
                    <textarea
                      name="reportingFramework"
                      value={formData.reportingFramework}
                      onChange={handleChange}
                      placeholder="How and when will you report impact to investors? (e.g., Quarterly reports, IRIS+ metrics, third-party verification)"
                      rows={3}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* DOCUMENTS TAB */}
              {activeTab === 'documents' && (
                <div className="space-y-6">
                  <p className="text-sm text-neutral-600 bg-blue-50 p-4 rounded-lg flex items-center gap-2">
                    <Shield size={16} className="text-primary" />
                    Upload supporting documents to strengthen your pitch. All documents are encrypted and only visible to investors who have signed an NDA.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700 flex items-center gap-1">
                        <FileText size={16} />
                        Pitch Deck (PDF, max 15 slides)
                      </label>
                      <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                        <input
                          type="file"
                          name="pitchDeck"
                          id="pitchDeck"
                          onChange={handleChange}
                          accept=".pdf"
                          className="hidden"
                        />
                        <label htmlFor="pitchDeck" className="cursor-pointer flex flex-col items-center gap-2">
                          <Upload size={24} className="text-neutral-400" />
                          <span className="text-sm font-medium text-neutral-700">Click to upload</span>
                          <span className="text-xs text-neutral-500">PDF only, max 15MB</span>
                        </label>
                      </div>
                      {project?.supportingDocuments?.find(d => d.type === 'pitch_deck') && (
                        <div className="flex items-center gap-2 p-2 bg-neutral-50 rounded-lg text-sm">
                          <FileText size={16} className="text-primary" />
                          <span className="flex-1 truncate">Current: {project.supportingDocuments.find(d => d.type === 'pitch_deck')?.filename}</span>
                          <a href="#" className="text-primary hover:underline text-xs flex items-center gap-1">
                            <Download size={12} />
                            Download
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700 flex items-center gap-1">
                        <FileSpreadsheet size={16} />
                        Financial Model (Excel/CSV)
                      </label>
                      <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                        <input
                          type="file"
                          name="financialModel"
                          id="financialModel"
                          onChange={handleChange}
                          accept=".xlsx,.xls,.csv"
                          className="hidden"
                        />
                        <label htmlFor="financialModel" className="cursor-pointer flex flex-col items-center gap-2">
                          <Upload size={24} className="text-neutral-400" />
                          <span className="text-sm font-medium text-neutral-700">Click to upload</span>
                          <span className="text-xs text-neutral-500">Excel or CSV, max 10MB</span>
                        </label>
                      </div>
                      {project?.supportingDocuments?.find(d => d.type === 'financial_model') && (
                        <div className="flex items-center gap-2 p-2 bg-neutral-50 rounded-lg text-sm">
                          <FileSpreadsheet size={16} className="text-primary" />
                          <span className="flex-1 truncate">Current: {project.supportingDocuments.find(d => d.type === 'financial_model')?.filename}</span>
                          <a href="#" className="text-primary hover:underline text-xs flex items-center gap-1">
                            <Download size={12} />
                            Download
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700 flex items-center gap-1">
                        <Video size={16} />
                        Product Demo Video
                      </label>
                      <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                        <input
                          type="file"
                          name="productDemo"
                          id="productDemo"
                          onChange={handleChange}
                          accept="video/*"
                          className="hidden"
                        />
                        <label htmlFor="productDemo" className="cursor-pointer flex flex-col items-center gap-2">
                          <Upload size={24} className="text-neutral-400" />
                          <span className="text-sm font-medium text-neutral-700">Click to upload</span>
                          <span className="text-xs text-neutral-500">MP4, MOV, max 100MB</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700 flex items-center gap-1">
                        <FileText size={16} />
                        Market Validation
                      </label>
                      <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                        <input
                          type="file"
                          name="marketValidation"
                          id="marketValidation"
                          onChange={handleChange}
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                        />
                        <label htmlFor="marketValidation" className="cursor-pointer flex flex-col items-center gap-2">
                          <Upload size={24} className="text-neutral-400" />
                          <span className="text-sm font-medium text-neutral-700">Click to upload</span>
                          <span className="text-xs text-neutral-500">Customer interviews, surveys, pilot results</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700 flex items-center gap-1">
                        <FileArchive size={16} />
                        Legal Documents
                      </label>
                      <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                        <input
                          type="file"
                          name="legalDocs"
                          id="legalDocs"
                          onChange={handleChange}
                          accept=".pdf"
                          className="hidden"
                        />
                        <label htmlFor="legalDocs" className="cursor-pointer flex flex-col items-center gap-2">
                          <Upload size={24} className="text-neutral-400" />
                          <span className="text-sm font-medium text-neutral-700">Click to upload</span>
                          <span className="text-xs text-neutral-500">Registration, IP filings, contracts</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700 flex items-center gap-1">
                        <Users size={16} />
                        Team CVs
                      </label>
                      <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                        <input
                          type="file"
                          name="teamCVs"
                          id="teamCVs"
                          onChange={handleChange}
                          accept=".pdf"
                          multiple
                          className="hidden"
                        />
                        <label htmlFor="teamCVs" className="cursor-pointer flex flex-col items-center gap-2">
                          <Upload size={24} className="text-neutral-400" />
                          <span className="text-sm font-medium text-neutral-700">Click to upload</span>
                          <span className="text-xs text-neutral-500">Resumes of key team members</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Action Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mt-6 sticky bottom-4 z-30">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-600">
                <span className="font-semibold text-primary">{calculateQualityScore()}%</span> Quality Score
              </span>
              <span className="text-sm text-neutral-600">
                <span className="font-semibold">{formData.teamMembers.filter(t => t.name).length}</span> Team Members
              </span>
              <span className="text-sm text-neutral-600">
                <span className="font-semibold">{formData.images.length}</span> Images
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSaveDraft}
                variant="secondary"
                disabled={saving}
                icon={saving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
              >
                Save Draft
              </Button>
              
              <Button
                onClick={() => setPublishModalOpen(true)}
                variant="primary"
                disabled={saving}
              >
                {project?.status === 'live' ? 'Update Project' : 'Publish Project'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="bg-white p-8 rounded-xl max-w-md w-full shadow-xl">
            <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-error" />
            </div>
            
            <h2 className="text-2xl font-display font-bold text-center mb-2">
              Delete Project?
            </h2>
            
            <p className="text-neutral-600 text-center mb-6">
              Are you sure you want to delete "{project?.elevatorPitch?.tagline}"? This action cannot be undone. All associated data including conversations, bookmarks, and analytics will be permanently removed.
            </p>
            
            <div className="bg-amber-50 p-4 rounded-lg mb-6">
              <div className="flex items-start gap-2">
                <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  Investors who have bookmarked this project will no longer have access to it. Any ongoing conversations will be archived.
                </p>
              </div>
            </div>
            
            <div className="flex justify-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
              >
                Yes, Delete Project
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Modal */}
      {publishModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="bg-white p-8 rounded-xl max-w-lg w-full shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                <Eye size={24} className="text-primary" />
                Publish Project
              </h2>
              <button
                onClick={() => setPublishModalOpen(false)}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div 
                className={clsx(
                  "p-5 border-2 rounded-lg cursor-pointer transition-all",
                  publishAction === 'publish' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-neutral-200 hover:border-primary/50'
                )}
                onClick={() => setPublishAction('publish')}
              >
                <div className="flex items-start gap-3">
                  <div className={clsx(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5",
                    publishAction === 'publish' 
                      ? 'border-primary bg-primary' 
                      : 'border-neutral-400'
                  )}>
                    {publishAction === 'publish' && <CheckCircle2 size={14} className="text-white" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-lg mb-1">Publish Now</h3>
                    <p className="text-sm text-neutral-600">
                      Make your project immediately visible to all investors on the platform. 
                      Your project will appear in discovery feeds and search results.
                    </p>
                    {calculateQualityScore() < 70 && (
                      <div className="mt-3 flex items-center gap-2 text-amber-600 bg-amber-50 p-2 rounded-lg text-xs">
                        <AlertTriangle size={14} />
                        Quality score below 70%. Projects with higher scores get more visibility.
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div 
                className={clsx(
                  "p-5 border-2 rounded-lg cursor-pointer transition-all",
                  publishAction === 'review' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-neutral-200 hover:border-primary/50'
                )}
                onClick={() => setPublishAction('review')}
              >
                <div className="flex items-start gap-3">
                  <div className={clsx(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5",
                    publishAction === 'review' 
                      ? 'border-primary bg-primary' 
                      : 'border-neutral-400'
                  )}>
                    {publishAction === 'review' && <CheckCircle2 size={14} className="text-white" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-lg mb-1">Submit for Review</h3>
                    <p className="text-sm text-neutral-600">
                      Our team will review your project for quality and compliance before publishing. 
                      This typically takes 24-48 hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="flex items-start gap-2">
                <Shield size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-700">
                  <p className="font-semibold mb-1">Before publishing, verify:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>All required fields are complete</li>
                    <li>Images are professional and appropriate</li>
                    <li>No sensitive or confidential information in public sections</li>
                    <li>Funding amount and use of funds are realistic</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setPublishModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handlePublish}
                disabled={saving}
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Loader className="animate-spin" size={16} />
                    Publishing...
                  </span>
                ) : (
                  publishAction === 'publish' ? 'Publish Now' : 'Submit for Review'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProject;