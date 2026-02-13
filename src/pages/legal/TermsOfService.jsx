import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';

const TermsOfService = () => {
  return (
    <div className="pt-[72px] min-h-screen bg-neutral-50 pb-16">
      <div className="container-narrow max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Link
              to="/"
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-neutral-600" />
            </Link>
            <h1 className="text-3xl font-display font-bold flex items-center gap-3">
              <FileText size={32} className="text-primary" />
              Terms of Service
            </h1>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-neutral-500 border-b border-neutral-200 pb-6">
            <span>Last Updated: February 1, 2025</span>
            <span className="w-1 h-1 bg-neutral-300 rounded-full" />
            <span>Version 2.0</span>
            <span className="w-1 h-1 bg-neutral-300 rounded-full" />
            <span>Effective: Immediately</span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 prose prose-neutral max-w-none">
          <div className="bg-primary/5 p-6 rounded-lg mb-8 flex items-start gap-4">
            <Shield size={24} className="text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-display font-bold text-lg mb-2">Welcome to InnovateBridge</h3>
              <p className="text-neutral-700">
                By accessing or using InnovateBridge, you agree to be bound by these Terms of Service. 
                Please read them carefully.
              </p>
            </div>
          </div>

          <h2>1. Acceptance of Terms</h2>
          <p>
            InnovateBridge ("we," "us," "our") provides a platform connecting African innovators 
            ("Creators") with investors ("Investors"). By registering for or using the Service, 
            you agree to be bound by these Terms and our Privacy Policy. If you do not agree, 
            you may not access or use the Service.
          </p>

          <h2>2. Eligibility</h2>
          <p>
            You must be at least 18 years old to use the Service. By agreeing to these Terms, 
            you represent and warrant that:
          </p>
          <ul>
            <li>You have the legal capacity to enter into a binding contract</li>
            <li>You are not located in a country that is subject to sanctions</li>
            <li>You will provide accurate and complete information during registration</li>
            <li>You will maintain the security of your account credentials</li>
          </ul>

          <h2>3. Account Registration</h2>
          <p>
            To access certain features, you must register for an account. You agree to:
          </p>
          <ul>
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and promptly update your account information</li>
            <li>Keep your password confidential and not share your account</li>
            <li>Notify us immediately of any unauthorized access</li>
            <li>Accept responsibility for all activities under your account</li>
          </ul>

          <h2>4. Verification and KYC</h2>
          <p>
            As a regulated platform facilitating financial transactions, we require identity 
            verification for all users. You agree to:
          </p>
          <ul>
            <li>Provide valid government-issued identification</li>
            <li>Submit to additional verification checks as requested</li>
            <li>Allow us to share verification data with third-party service providers</li>
            <li>Update your verification documents when they expire</li>
          </ul>

          <div className="bg-amber-50 p-4 rounded-lg my-6">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                Failure to complete verification may result in restricted access or account suspension.
              </p>
            </div>
          </div>

          <h2>5. Creator Obligations</h2>
          <p>
            If you register as a Creator, you agree to:
          </p>
          <ul>
            <li>Provide accurate and truthful information about your project</li>
            <li>Not misrepresent your traction, revenue, or market opportunity</li>
            <li>Maintain confidentiality of investor information</li>
            <li>Respond to investor inquiries in a timely manner</li>
            <li>Honor commitments made through the platform</li>
            <li>Comply with all applicable laws and regulations</li>
          </ul>

          <h2>6. Investor Obligations</h2>
          <p>
            If you register as an Investor, you agree to:
          </p>
          <ul>
            <li>Provide accurate information about your investment capacity and accreditation</li>
            <li>Conduct your own due diligence before making investment decisions</li>
            <li>Maintain confidentiality of creator information</li>
            <li>Not use the platform for market research without genuine investment intent</li>
            <li>Comply with all applicable securities laws and regulations</li>
          </ul>

          <h2>7. Non-Disclosure Agreements</h2>
          <p>
            The platform facilitates NDAs between creators and investors. By signing an NDA:
          </p>
          <ul>
            <li>You agree to keep all confidential information private</li>
            <li>You will not share information with third parties without written consent</li>
            <li>You will use information solely for investment evaluation</li>
            <li>Electronic signatures are legally binding</li>
          </ul>

          <h2>8. Fees and Payments</h2>
          <p>
            InnovateBridge charges fees for certain services:
          </p>
          <ul>
            <li><strong>Creator Fees:</strong> 5% success fee on funds raised through the platform</li>
            <li><strong>Investor Fees:</strong> No fees for browsing or communication</li>
            <li><strong>Premium Features:</strong> Subscription fees may apply for advanced tools</li>
          </ul>
          <p>
            All fees are non-refundable except as required by law. We reserve the right to modify 
            fees with 30 days notice.
          </p>

          <h2>9. Intellectual Property</h2>
          <p>
            <strong>Your Content:</strong> You retain ownership of all content you submit. You grant 
            us a license to host, display, and analyze your content to provide the Service.
          </p>
          <p>
            <strong>Our IP:</strong> The Service, including our logo, design, and software, is owned 
            by InnovateBridge and protected by intellectual property laws.
          </p>

          <h2>10. Prohibited Activities</h2>
          <p>
            You may not:
          </p>
          <ul>
            <li>Use the Service for any illegal purpose</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Impersonate any person or entity</li>
            <li>Post false, misleading, or fraudulent information</li>
            <li>Attempt to gain unauthorized access to the Service</li>
            <li>Interfere with the proper functioning of the Service</li>
            <li>Scrape or data-mine the platform without permission</li>
          </ul>

          <h2>11. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice, for:
          </p>
          <ul>
            <li>Violation of these Terms</li>
            <li>Fraudulent or illegal activity</li>
            <li>Extended periods of inactivity</li>
            <li>At your request</li>
          </ul>
          <p>
            Upon termination, your right to access the Service ceases immediately.
          </p>

          <h2>12. Disclaimers</h2>
          <p>
            THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT WARRANT THAT:
          </p>
          <ul>
            <li>The Service will be uninterrupted or error-free</li>
            <li>Any projects will achieve their stated goals</li>
            <li>Investment returns are guaranteed</li>
            <li>User information is completely secure</li>
          </ul>

          <h2>13. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL INNOVATEBRIDGE BE LIABLE FOR 
            ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS 
            OF PROFITS, DATA, OR GOODWILL.
          </p>

          <h2>14. Indemnification</h2>
          <p>
            You agree to indemnify and hold InnovateBridge harmless from any claims arising from:
          </p>
          <ul>
            <li>Your use of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any law or third-party rights</li>
            <li>Your content posted on the Service</li>
          </ul>

          <h2>15. Governing Law</h2>
          <p>
            These Terms shall be governed by the laws of the Federal Republic of Nigeria, without 
            regard to its conflict of law provisions. Any disputes shall be resolved exclusively in 
            the courts of Lagos, Nigeria.
          </p>

          <h2>16. Changes to Terms</h2>
          <p>
            We may modify these Terms at any time. We will provide notice of material changes via 
            email or platform notification. Your continued use of the Service after changes 
            constitutes acceptance of the modified Terms.
          </p>

          <h2>17. Contact Information</h2>
          <p>
            For questions about these Terms, please contact us at:
          </p>
          <div className="bg-neutral-50 p-4 rounded-lg">
            <p className="mb-1"><strong>InnovateBridge Legal</strong></p>
            <p className="text-sm">legal@innovatebridge.com</p>
            <p className="text-sm">+234 (1) 234 5678</p>
            <p className="text-sm">24B Bishop Aboyade Cole Street, Victoria Island, Lagos, Nigeria</p>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <CheckCircle size={16} className="text-success" />
                By using InnovateBridge, you acknowledge that you have read and understand these Terms.
              </div>
              <Link to="/">
                <Button variant="ghost" size="small">
                  Return to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;