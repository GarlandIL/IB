import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  UserPlus, Building2, TrendingUp, Mail, Phone, Shield, Upload,
  CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Loader, X,
  FileText, CreditCard, Briefcase, Award, Linkedin, Twitter, Facebook,
  Globe, MapPin, Users, Target, DollarSign, Calendar, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import Button from '../components/common/Button';
import { clsx } from 'clsx';

const SignUp = () => {
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState(searchParams.get('type') || '');
  const [subType, setSubType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationCodes, setVerificationCodes] = useState({ email: '', phone: '' });
  const [verificationSent, setVerificationSent] = useState({ email: false, phone: false });
  const [verified, setVerified] = useState({ email: false, phone: false });
  
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '', phone: '',
    termsAccepted: false, privacyAccepted: false, ndaAccepted: false,
    fullName: '', dateOfBirth: '',
    governmentIdType: '', governmentIdNumber: '', governmentIdFile: null,
    addressProofType: '', addressProofFile: null,
    businessName: '', businessRegistrationType: '', businessRegistrationNumber: '', businessRegistrationFile: null,
    taxId: '', bankAccount: '',
    professionalTitle: '', linkedInProfile: '', companyWebsite: '',
    accreditedInvestorProof: null, bankStatements: null,
    photo: null, logo: null, bio: '', location: '', country: '', city: '',
    website: '', linkedIn: '', twitter: '', facebook: '',
    sector: '', targetMarkets: [], languages: [], sdgs: [], fundingModels: [],
    referees: [{ name: '', organization: '', email: '', phone: '' }],
    organization: '', teamSize: '', investmentRangeMin: '', investmentRangeMax: '',
    investmentStages: [], sectors: [], countries: [], geographicFocus: '',
    urbanRuralFocus: '', impactThemes: [], investmentModels: [], aum: ''
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const sectors = ['AgriTech', 'FinTech', 'HealthTech', 'EdTech', 'CleanTech', 'E-Commerce', 'Logistics', 'PropTech'];
  const africanCountries = ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Rwanda', 'Senegal', 'Ethiopia', 'Tanzania', 'Uganda', 'Egypt'];
  const languages = ['English', 'French', 'Swahili', 'Arabic', 'Hausa', 'Yoruba', 'Igbo', 'Amharic', 'Zulu', 'Afrikaans'];
  
  const sdgOptions = [
    { id: 1, name: 'No Poverty' }, { id: 2, name: 'Zero Hunger' }, { id: 3, name: 'Good Health' },
    { id: 4, name: 'Quality Education' }, { id: 5, name: 'Gender Equality' }, { id: 7, name: 'Clean Energy' },
    { id: 8, name: 'Decent Work' }, { id: 9, name: 'Innovation' }, { id: 10, name: 'Reduced Inequalities' },
    { id: 13, name: 'Climate Action' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'file') {
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

  const handleRefereeChange = (index, field, value) => {
    const newReferees = [...formData.referees];
    newReferees[index][field] = value;
    setFormData({ ...formData, referees: newReferees });
  };

  const addReferee = () => {
    setFormData({
      ...formData,
      referees: [...formData.referees, { name: '', organization: '', email: '', phone: '' }]
    });
  };

  const removeReferee = (index) => {
    const newReferees = formData.referees.filter((_, i) => i !== index);
    setFormData({ ...formData, referees: newReferees });
  };

  const sendEmailVerification = () => {
    console.log('Sending email verification to:', formData.email);
    setVerificationSent({ ...verificationSent, email: true });
  };

  const sendPhoneVerification = () => {
    console.log('Sending SMS verification to:', formData.phone);
    setVerificationSent({ ...verificationSent, phone: true });
  };

  const verifyEmail = () => {
    if (verificationCodes.email === '123456') {
      setVerified({ ...verified, email: true });
      setError('');
    } else {
      setError('Invalid email verification code');
    }
  };

  const verifyPhone = () => {
    if (verificationCodes.phone === '789012') {
      setVerified({ ...verified, phone: true });
      setError('');
    } else {
      setError('Invalid phone verification code');
    }
  };

  const validateStep = () => {
    setError('');
    
    switch (currentStep) {
      case 1: return userType ? true : (setError('Please select a user type'), false);
      case 2:
        if (!formData.email || !formData.password || !formData.confirmPassword || !formData.phone) {
          setError('Please fill in all fields'); return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match'); return false;
        }
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters'); return false;
        }
        if (!formData.termsAccepted || !formData.privacyAccepted || !formData.ndaAccepted) {
          setError('You must accept all terms and policies'); return false;
        }
        return true;
      case 3: return verified.email && verified.phone ? true : (setError('Please verify both email and phone number'), false);
      case 4: return subType ? true : (setError('Please select your category'), false);
      case 5:
        if (!formData.fullName || !formData.dateOfBirth) {
          setError('Please fill in all required fields'); return false;
        }
        if (!formData.governmentIdType || !formData.governmentIdNumber) {
          setError('Government ID is required'); return false;
        }
        return true;
      case 6:
        if (userType === 'creator') {
          if (!formData.bio || !formData.location || !formData.sector) {
            setError('Please complete your profile'); return false;
          }
        } else {
          if (!formData.bio || !formData.location || formData.sectors.length === 0) {
            setError('Please complete your profile'); return false;
          }
        }
        return true;
      default: return true;
    }
  };

  const handleNext = () => validateStep() && (setCurrentStep(currentStep + 1), setError(''));
  const handleBack = () => setCurrentStep(currentStep - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    
    setLoading(true);

    try {
      const newUser = {
        id: `user_${Date.now()}`,
        email: formData.email,
        phone: formData.phone,
        type: userType,
        subType: subType,
        verified: true,
        emailVerified: verified.email,
        phoneVerified: verified.phone,
        identityVerified: true,
        uniqueId: `KRN-${userType === 'creator' ? 'CR' : 'INV'}-${Math.floor(100000 + Math.random() * 900000)}`,
        identityDocuments: {
          governmentId: {
            type: formData.governmentIdType,
            number: formData.governmentIdNumber,
            verified: true,
            uploadedAt: new Date().toISOString()
          }
        },
        profile: {
          fullName: formData.fullName,
          dateOfBirth: formData.dateOfBirth,
          photo: formData.photo ? URL.createObjectURL(formData.photo) : `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
          bio: formData.bio,
          location: formData.location,
          country: formData.country,
          city: formData.city,
          website: formData.website,
          socialMedia: {
            linkedin: formData.linkedIn,
            twitter: formData.twitter,
            facebook: formData.facebook
          },
          ...(userType === 'creator' ? {
            company: formData.businessName,
            logo: formData.logo ? URL.createObjectURL(formData.logo) : null,
            sector: formData.sector,
            targetMarkets: formData.targetMarkets,
            languages: formData.languages,
            sdgs: formData.sdgs,
            fundingModel: formData.fundingModels,
            referees: formData.referees.filter(r => r.name && r.email)
          } : {
            organization: formData.organization,
            logo: formData.logo ? URL.createObjectURL(formData.logo) : null,
            professionalTitle: formData.professionalTitle,
            teamSize: parseInt(formData.teamSize) || 0,
            investmentRange: [parseInt(formData.investmentRangeMin) || 0, parseInt(formData.investmentRangeMax) || 0],
            investmentStages: formData.investmentStages,
            sectors: formData.sectors,
            countries: formData.countries,
            geographicFocus: formData.geographicFocus,
            urbanRuralFocus: formData.urbanRuralFocus,
            impactThemes: formData.impactThemes,
            investmentModels: formData.investmentModels,
            aum: parseInt(formData.aum) || 0
          })
        },
        onboardingCompleted: true,
        tutorialCompleted: false,
        createdAt: new Date().toISOString()
      };

      await usersAPI.create(newUser);
      login(newUser);
      navigate(userType === 'creator' ? '/creator/dashboard?welcome=true' : '/investor/dashboard?welcome=true');
    } catch (err) {
      console.error('Signup error:', err);
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex justify-between items-center mb-12 relative">
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-neutral-200 z-0" />
      {[1, 2, 3, 4, 5, 6].map((step) => (
        <div key={step} className="flex flex-col items-center gap-3 z-10 bg-white px-4">
          <div className={clsx(
            "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300",
            currentStep >= step ? 'bg-primary text-white' : 'bg-neutral-200 text-neutral-600',
            currentStep > step && 'bg-success text-white'
          )}>
            {currentStep > step ? <CheckCircle size={16} /> : step}
          </div>
          <span className={clsx(
            "text-xs font-medium",
            currentStep === step ? 'text-primary font-semibold' : 'text-neutral-600'
          )}>
            {step === 1 && 'User Type'}
            {step === 2 && 'Registration'}
            {step === 3 && 'Verification'}
            {step === 4 && 'Category'}
            {step === 5 && 'Identity'}
            {step === 6 && 'Profile'}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-6 bg-gradient-to-br from-amber-50 to-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(200,75,49,0.05)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(212,165,116,0.05)_0%,transparent_50%)]" />
      
      <div className="relative z-10 w-full max-w-3xl">
        <div className="bg-white p-10 rounded-xl shadow-xl border border-neutral-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold mb-2 bg-gradient-to-r from-primary to-clay bg-clip-text text-transparent">
              Join InnovateBridge
            </h1>
            <p className="text-neutral-600">Complete your registration in {6 - currentStep + 1} steps</p>
          </div>

          <StepIndicator />

          {error && (
            <div className="flex items-center gap-3 bg-primary/10 border border-primary text-primary p-4 rounded-md mb-6">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={currentStep === 6 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
            
            {/* Step 1: Choose User Type */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { type: 'creator', icon: <TrendingUp size={32} />, title: "I'm a Creator", desc: "I have an innovative project seeking funding" },
                  { type: 'investor', icon: <Users size={32} />, title: "I'm an Investor", desc: "I want to invest in African innovation" }
                ].map((option) => (
                  <div 
                    key={option.type}
                    className={clsx(
                      "relative p-8 bg-neutral-50 border-2 rounded-md cursor-pointer transition-all text-center",
                      userType === option.type 
                        ? 'bg-white border-primary shadow-[0_0_0_3px_rgba(200,75,49,0.1)]' 
                        : 'border-neutral-200 hover:bg-white hover:border-neutral-300'
                    )}
                    onClick={() => setUserType(option.type)}
                  >
                    <div className="text-4xl mb-4 text-primary">{option.icon}</div>
                    <div className="font-display font-bold text-lg text-neutral-900 mb-2">{option.title}</div>
                    <div className="text-sm text-neutral-600">{option.desc}</div>
                    {userType === option.type && (
                      <CheckCircle size={20} className="absolute top-4 right-4 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Step 2: Basic Registration */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-display font-semibold text-sm text-neutral-700">
                    <Mail size={16} /> Email Address *
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-display font-semibold text-sm text-neutral-700">
                    <Phone size={16} /> Phone Number *
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+234-xxx-xxx-xxxx"
                    required
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
                  />
                  <small className="text-neutral-500 text-xs">Include country code (e.g., +234 for Nigeria)</small>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-display font-semibold text-sm text-neutral-700">
                    <Lock size={16} /> Password *
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                    required
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-display font-semibold text-sm text-neutral-700">
                    <Lock size={16} /> Confirm Password *
                  </label>
                  <input
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    required
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="termsAccepted" name="termsAccepted" checked={formData.termsAccepted} onChange={handleChange} className="w-4 h-4 accent-primary" />
                    <label htmlFor="termsAccepted" className="text-sm text-neutral-700">
                      I agree to the <Link to="/terms" target="_blank" className="text-primary font-semibold hover:underline">Terms of Service</Link> *
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="privacyAccepted" name="privacyAccepted" checked={formData.privacyAccepted} onChange={handleChange} className="w-4 h-4 accent-primary" />
                    <label htmlFor="privacyAccepted" className="text-sm text-neutral-700">
                      I agree to the <Link to="/privacy" target="_blank" className="text-primary font-semibold hover:underline">Privacy Policy</Link> *
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="ndaAccepted" name="ndaAccepted" checked={formData.ndaAccepted} onChange={handleChange} className="w-4 h-4 accent-primary" />
                    <label htmlFor="ndaAccepted" className="text-sm text-neutral-700">
                      I agree to the <Link to="/nda-policy" target="_blank" className="text-primary font-semibold hover:underline">NDA Policy</Link> *
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Email & Phone Verification */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="p-6 bg-neutral-50 rounded-lg border-2 border-neutral-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Mail size={24} className="text-primary" />
                    <h3 className="font-display font-bold text-lg">Email Verification</h3>
                  </div>
                  <p className="text-sm mb-4">Email: <strong className="font-display">{formData.email}</strong></p>
                  
                  {!verificationSent.email ? (
                    <Button type="button" onClick={sendEmailVerification} fullWidth>
                      Send Verification Code
                    </Button>
                  ) : !verified.email ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={verificationCodes.email}
                        onChange={(e) => setVerificationCodes({ ...verificationCodes, email: e.target.value })}
                        maxLength={6}
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
                      />
                      <div className="flex gap-2">
                        <Button type="button" onClick={verifyEmail} fullWidth>
                          Verify Email
                        </Button>
                        <Button type="button" variant="ghost" onClick={sendEmailVerification}>
                          Resend
                        </Button>
                      </div>
                      <small className="text-amber-600">Demo code: 123456</small>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle size={24} />
                      <span className="font-semibold">Email Verified!</span>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-neutral-50 rounded-lg border-2 border-neutral-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Phone size={24} className="text-primary" />
                    <h3 className="font-display font-bold text-lg">Phone Verification</h3>
                  </div>
                  <p className="text-sm mb-4">Phone: <strong className="font-display">{formData.phone}</strong></p>
                  
                  {!verificationSent.phone ? (
                    <Button type="button" onClick={sendPhoneVerification} fullWidth>
                      Send SMS Code
                    </Button>
                  ) : !verified.phone ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={verificationCodes.phone}
                        onChange={(e) => setVerificationCodes({ ...verificationCodes, phone: e.target.value })}
                        maxLength={6}
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
                      />
                      <div className="flex gap-2">
                        <Button type="button" onClick={verifyPhone} fullWidth>
                          Verify Phone
                        </Button>
                        <Button type="button" variant="ghost" onClick={sendPhoneVerification}>
                          Resend
                        </Button>
                      </div>
                      <small className="text-amber-600">Demo code: 789012</small>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle size={24} />
                      <span className="font-semibold">Phone Verified!</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: User Sub-Type */}
            {currentStep === 4 && (
              <div className="space-y-2">
                <label className="block font-display font-semibold text-sm text-neutral-700 mb-2">
                  {userType === 'creator' ? 'What best describes you? *' : 'Investor Type *'}
                </label>
                <select
                  value={subType}
                  onChange={(e) => setSubType(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/10"
                >
                  <option value="">Select...</option>
                  {userType === 'creator' ? (
                    <>
                      <option value="startup">Startup (0-2 years)</option>
                      <option value="sme">SME (2-10 years)</option>
                      <option value="existing">Existing Business (10+ years)</option>
                      <option value="ngo">NGO/Social Enterprise</option>
                    </>
                  ) : (
                    <>
                      <option value="angel">Angel Investor</option>
                      <option value="vc">Venture Capital</option>
                      <option value="corporate">Corporate Investor</option>
                    </>
                  )}
                </select>
              </div>
            )}

            {/* Step 5: Identity Verification */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h3 className="flex items-center gap-2 text-xl font-display font-bold">
                  <Shield size={20} className="text-primary" />
                  Identity Verification
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block font-display font-semibold text-sm text-neutral-700">Full Legal Name *</label>
                    <input name="fullName" type="text" value={formData.fullName} onChange={handleChange} required className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary" />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-display font-semibold text-sm text-neutral-700">Date of Birth *</label>
                    <input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block font-display font-semibold text-sm text-neutral-700">Government ID Type *</label>
                    <select name="governmentIdType" value={formData.governmentIdType} onChange={handleChange} required className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary">
                      <option value="">Select...</option>
                      <option value="passport">Passport</option>
                      <option value="national_id">National ID</option>
                      <option value="drivers_license">Driver's License</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block font-display font-semibold text-sm text-neutral-700">ID Number *</label>
                    <input name="governmentIdNumber" type="text" value={formData.governmentIdNumber} onChange={handleChange} required className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-display font-semibold text-sm text-neutral-700">
                    <Upload size={16} /> Upload Government ID (Front & Back)
                  </label>
                  <input name="governmentIdFile" type="file" onChange={handleChange} accept="image/*,application/pdf" className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark" />
                  <small className="text-neutral-500 text-xs">Supported formats: JPG, PNG, PDF. Max size: 5MB</small>
                </div>

                {userType === 'creator' && ['startup', 'sme', 'existing'].includes(subType) && (
                  <>
                    <h4 className="font-display font-bold text-lg mt-4">Business Information</h4>
                    <div className="space-y-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">Business/Company Name</label>
                      <input name="businessName" type="text" value={formData.businessName} onChange={handleChange} className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block font-display font-semibold text-sm text-neutral-700">Registration Type</label>
                        <select name="businessRegistrationType" value={formData.businessRegistrationType} onChange={handleChange} className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary">
                          <option value="">Select...</option>
                          <option value="cac">CAC (Corporate Affairs Commission)</option>
                                                   <option value="business_permit">Business Permit</option>
                          <option value="llc">LLC</option>
                          <option value="cooperative">Cooperative</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block font-display font-semibold text-sm text-neutral-700">Registration Number</label>
                        <input
                          name="businessRegistrationNumber"
                          type="text"
                          value={formData.businessRegistrationNumber}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 font-display font-semibold text-sm text-neutral-700">
                        <Upload size={16} /> Upload Business Registration Certificate
                      </label>
                      <input
                        name="businessRegistrationFile"
                        type="file"
                        onChange={handleChange}
                        accept="image/*,application/pdf"
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                      />
                    </div>
                  </>
                )}

                {userType === 'investor' && subType === 'angel' && (
                  <>
                    <h4 className="font-display font-bold text-lg mt-4">Accredited Investor Verification</h4>
                    
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 font-display font-semibold text-sm text-neutral-700">
                        <Upload size={16} /> Upload Bank Statements (Last 3 months)
                      </label>
                      <input
                        name="accreditedInvestorProof"
                        type="file"
                        onChange={handleChange}
                        accept="application/pdf"
                        multiple
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                      />
                      <small className="text-neutral-500 text-xs">Required to show liquid assets for accreditation</small>
                    </div>

                    <div className="space-y-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">LinkedIn Profile URL</label>
                      <input
                        name="linkedInProfile"
                        type="url"
                        value={formData.linkedInProfile}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/yourprofile"
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 6: Profile Completion */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <h3 className="text-xl font-display font-bold">Complete Your Profile</h3>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-display font-semibold text-sm text-neutral-700">
                    <Upload size={16} /> Profile Photo *
                  </label>
                  <input
                    name="photo"
                    type="file"
                    onChange={handleChange}
                    accept="image/*"
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                  />
                  <small className="text-neutral-500 text-xs">Professional headshot recommended</small>
                </div>

                {userType === 'creator' ? (
                  <>
                    <div className="space-y-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">Your Bio *</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Tell us about yourself and your mission (200 words)"
                        rows={4}
                        maxLength={1000}
                        required
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary resize-vertical min-h-[100px]"
                      />
                      <small className="text-neutral-500 text-xs">{formData.bio.length}/1000 characters</small>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block font-display font-semibold text-sm text-neutral-700">Country *</label>
                        <select
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                        >
                          <option value="">Select...</option>
                          {africanCountries.map(country => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block font-display font-semibold text-sm text-neutral-700">City *</label>
                        <input
                          name="city"
                          type="text"
                          value={formData.city}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">Primary Sector *</label>
                      <select
                        name="sector"
                        value={formData.sector}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                      >
                        <option value="">Select...</option>
                        {sectors.map(sector => (
                          <option key={sector} value={sector}>{sector}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">Target Markets</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {africanCountries.map(country => (
                          <button
                            key={country}
                            type="button"
                            className={clsx(
                              "inline-flex items-center gap-1.5 px-3 py-1.5 border-2 rounded-full text-xs font-medium transition-all",
                              formData.targetMarkets?.includes(country)
                                ? 'bg-primary border-primary text-white'
                                : 'bg-white border-neutral-300 text-neutral-700 hover:border-primary hover:bg-primary/5'
                            )}
                            onClick={() => handleMultiSelect('targetMarkets', country)}
                          >
                            {country}
                            {formData.targetMarkets?.includes(country) && <X size={14} />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">Languages Spoken</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {languages.map(lang => (
                          <button
                            key={lang}
                            type="button"
                            className={clsx(
                              "inline-flex items-center gap-1.5 px-3 py-1.5 border-2 rounded-full text-xs font-medium transition-all",
                              formData.languages?.includes(lang)
                                ? 'bg-primary border-primary text-white'
                                : 'bg-white border-neutral-300 text-neutral-700 hover:border-primary hover:bg-primary/5'
                            )}
                            onClick={() => handleMultiSelect('languages', lang)}
                          >
                            {lang}
                            {formData.languages?.includes(lang) && <X size={14} />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">SDG Alignment (Select 3-5)</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {sdgOptions.map(sdg => (
                          <button
                            key={sdg.id}
                            type="button"
                            className={clsx(
                              "inline-flex items-center gap-1.5 px-3 py-1.5 border-2 rounded-full text-xs font-medium transition-all",
                              formData.sdgs?.includes(sdg.id)
                                ? 'bg-primary border-primary text-white'
                                : 'bg-white border-neutral-300 text-neutral-700 hover:border-primary hover:bg-primary/5',
                              !formData.sdgs?.includes(sdg.id) && formData.sdgs?.length >= 5 && 'opacity-50 cursor-not-allowed'
                            )}
                            onClick={() => handleMultiSelect('sdgs', sdg.id)}
                            disabled={!formData.sdgs?.includes(sdg.id) && formData.sdgs?.length >= 5}
                          >
                            SDG {sdg.id}: {sdg.name}
                            {formData.sdgs?.includes(sdg.id) && <X size={14} />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">Preferred Funding Models</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['equity', 'revenue-share', 'convertible-debt', 'grant'].map(model => (
                          <button
                            key={model}
                            type="button"
                            className={clsx(
                              "inline-flex items-center gap-1.5 px-3 py-1.5 border-2 rounded-full text-xs font-medium transition-all",
                              formData.fundingModels?.includes(model)
                                ? 'bg-primary border-primary text-white'
                                : 'bg-white border-neutral-300 text-neutral-700 hover:border-primary hover:bg-primary/5'
                            )}
                            onClick={() => handleMultiSelect('fundingModels', model)}
                          >
                            {model.replace('-', ' ').toUpperCase()}
                            {formData.fundingModels?.includes(model) && <X size={14} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">Organization Name *</label>
                      <input
                        name="organization"
                        type="text"
                        value={formData.organization}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">Professional Title *</label>
                      <input
                        name="professionalTitle"
                        type="text"
                        value={formData.professionalTitle}
                        onChange={handleChange}
                        placeholder="e.g., Managing Partner, Investment Director"
                        required
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">Professional Bio *</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Share your investment philosophy and experience (200 words)"
                        rows={4}
                        maxLength={1000}
                        required
                        className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary resize-vertical min-h-[100px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block font-display font-semibold text-sm text-neutral-700">Country *</label>
                        <select
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                        >
                          <option value="">Select...</option>
                          {africanCountries.map(country => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block font-display font-semibold text-sm text-neutral-700">City *</label>
                        <input
                          name="city"
                          type="text"
                          value={formData.city}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block font-display font-semibold text-sm text-neutral-700">Investment Range Min (USD)</label>
                        <input
                          name="investmentRangeMin"
                          type="number"
                          value={formData.investmentRangeMin}
                          onChange={handleChange}
                          placeholder="10000"
                          className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block font-display font-semibold text-sm text-neutral-700">Investment Range Max (USD)</label>
                        <input
                          name="investmentRangeMax"
                          type="number"
                          value={formData.investmentRangeMax}
                          onChange={handleChange}
                          placeholder="100000"
                          className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">Investment Stages</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['pre-seed', 'seed', 'series-a', 'series-b', 'growth'].map(stage => (
                          <button
                            key={stage}
                            type="button"
                            className={clsx(
                              "inline-flex items-center gap-1.5 px-3 py-1.5 border-2 rounded-full text-xs font-medium transition-all",
                              formData.investmentStages?.includes(stage)
                                ? 'bg-primary border-primary text-white'
                                : 'bg-white border-neutral-300 text-neutral-700 hover:border-primary hover:bg-primary/5'
                            )}
                            onClick={() => handleMultiSelect('investmentStages', stage)}
                          >
                            {stage.toUpperCase()}
                            {formData.investmentStages?.includes(stage) && <X size={14} />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">Sector Preferences *</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {sectors.map(sector => (
                          <button
                            key={sector}
                            type="button"
                            className={clsx(
                              "inline-flex items-center gap-1.5 px-3 py-1.5 border-2 rounded-full text-xs font-medium transition-all",
                              formData.sectors?.includes(sector)
                                ? 'bg-primary border-primary text-white'
                                : 'bg-white border-neutral-300 text-neutral-700 hover:border-primary hover:bg-primary/5'
                            )}
                            onClick={() => handleMultiSelect('sectors', sector)}
                          >
                            {sector}
                            {formData.sectors?.includes(sector) && <X size={14} />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">Geographic Focus</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {africanCountries.map(country => (
                          <button
                            key={country}
                            type="button"
                            className={clsx(
                              "inline-flex items-center gap-1.5 px-3 py-1.5 border-2 rounded-full text-xs font-medium transition-all",
                              formData.countries?.includes(country)
                                ? 'bg-primary border-primary text-white'
                                : 'bg-white border-neutral-300 text-neutral-700 hover:border-primary hover:bg-primary/5'
                            )}
                            onClick={() => handleMultiSelect('countries', country)}
                          >
                            {country}
                            {formData.countries?.includes(country) && <X size={14} />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block font-display font-semibold text-sm text-neutral-700">SDG Priorities</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {sdgOptions.map(sdg => (
                          <button
                            key={sdg.id}
                            type="button"
                            className={clsx(
                              "inline-flex items-center gap-1.5 px-3 py-1.5 border-2 rounded-full text-xs font-medium transition-all",
                              formData.sdgs?.includes(sdg.id)
                                ? 'bg-primary border-primary text-white'
                                : 'bg-white border-neutral-300 text-neutral-700 hover:border-primary hover:bg-primary/5'
                            )}
                            onClick={() => handleMultiSelect('sdgs', sdg.id)}
                          >
                            SDG {sdg.id}
                            {formData.sdgs?.includes(sdg.id) && <X size={14} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <label className="block font-display font-semibold text-sm text-neutral-700">Website</label>
                  <input
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://yourwebsite.com"
                    className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                  />
                </div>

                <h4 className="font-display font-bold text-lg">Social Media Links</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block font-display font-semibold text-sm text-neutral-700">LinkedIn</label>
                    <input
                      name="linkedIn"
                      type="url"
                      value={formData.linkedIn}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-display font-semibold text-sm text-neutral-700">Twitter</label>
                    <input
                      name="twitter"
                      type="url"
                      value={formData.twitter}
                      onChange={handleChange}
                      placeholder="https://twitter.com/..."
                      className="w-full px-4 py-3 border-2 border-neutral-200 rounded-md focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 mt-6 border-t-2 border-neutral-200">
              <div className="flex gap-4">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBack}
                    icon={<ArrowLeft size={18} />}
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    // Save draft functionality
                    console.log('Save draft');
                  }}
                  icon={<FileText size={18} />}
                >
                  Save Draft
                </Button>
              </div>
              
              {currentStep < 6 ? (
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  icon={<ArrowRight size={18} />}
                  iconPosition="right"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  disabled={loading}
                  icon={loading ? <Loader className="animate-spin" size={20} /> : <UserPlus size={20} />}
                  iconPosition="right"
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </Button>
              )}
            </div>
          </form>

          <div className="mt-8 pt-6 text-center border-t border-neutral-200">
            <p className="text-neutral-600 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:text-primary-dark hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;