import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database, Mail, Globe } from 'lucide-react';
import Button from '../../components/common/Button';

const PrivacyPolicy = () => {
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
              <Shield size={32} className="text-primary" />
              Privacy Policy
            </h1>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-neutral-500 border-b border-neutral-200 pb-6">
            <span>Last Updated: February 1, 2025</span>
            <span className="w-1 h-1 bg-neutral-300 rounded-full" />
            <span>Version 2.1</span>
            <span className="w-1 h-1 bg-neutral-300 rounded-full" />
            <span>GDPR & NDPR Compliant</span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 prose prose-neutral max-w-none">
          <div className="bg-primary/5 p-6 rounded-lg mb-8">
            <div className="flex items-start gap-4">
              <Lock size={24} className="text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-display font-bold text-lg mb-2">Our Commitment to Privacy</h3>
                <p className="text-neutral-700">
                  Your privacy is critically important to us. InnovateBridge is designed to protect 
                  the sensitive information shared between innovators and investors. This policy 
                  explains how we collect, use, and safeguard your data.
                </p>
              </div>
            </div>
          </div>

          <h2>1. Information We Collect</h2>
          
          <h3>1.1 Information You Provide</h3>
          <ul>
            <li><strong>Account Information:</strong> Name, email, phone number, password</li>
            <li><strong>Identity Verification:</strong> Government ID, date of birth, address proof</li>
            <li><strong>Profile Information:</strong> Photo, bio, professional history, social media links</li>
            <li><strong>Business Information:</strong> Company registration, tax ID, financial information</li>
            <li><strong>Project Information:</strong> Pitch decks, financial models, business plans</li>
            <li><strong>Communications:</strong> Messages, meeting recordings, document shares</li>
          </ul>

          <h3>1.2 Information Automatically Collected</h3>
          <ul>
            <li><strong>Usage Data:</strong> Pages visited, features used, time spent</li>
            <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
            <li><strong>Cookies:</strong> Session cookies, preference cookies, analytics cookies</li>
            <li><strong>Location Data:</strong> Approximate location based on IP</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <ul>
            <li><strong>Provide the Service:</strong> Facilitate connections between creators and investors</li>
            <li><strong>Verification:</strong> Verify identity and prevent fraud</li>
            <li><strong>Communication:</strong> Enable messaging, meetings, and document sharing</li>
            <li><strong>Improvement:</strong> Analyze usage to enhance platform features</li>
            <li><strong>Legal Compliance:</strong> Comply with KYC/AML regulations</li>
            <li><strong>Security:</strong> Protect against unauthorized access and abuse</li>
          </ul>

          <div className="bg-blue-50 p-4 rounded-lg my-6">
            <div className="flex items-start gap-3">
              <Eye size={20} className="text-blue-600 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-semibold mb-1">NDA-Protected Information</p>
                <p>
                  Confidential project information (detailed pitches, financials, documents) is 
                  encrypted and only accessible to investors who have signed a valid NDA. We never 
                  share this information with third parties without explicit consent.
                </p>
              </div>
            </div>
          </div>

          <h2>3. Legal Basis for Processing (GDPR)</h2>
          <p>
            For users in the European Economic Area, we process personal data under the following legal bases:
          </p>
          <ul>
            <li><strong>Contract Performance:</strong> To provide our services under our Terms</li>
            <li><strong>Legal Obligation:</strong> To comply with KYC/AML requirements</li>
            <li><strong>Legitimate Interests:</strong> To improve our platform and prevent fraud</li>
            <li><strong>Consent:</strong> For marketing communications and optional features</li>
          </ul>

          <h2>4. Data Sharing and Disclosure</h2>
          
          <h3>4.1 With Other Users</h3>
          <ul>
            <li>Your profile information is visible to other registered users</li>
            <li>Project information is shared according to your privacy settings</li>
            <li>Messages and shared documents are visible to conversation participants</li>
          </ul>

          <h3>4.2 With Service Providers</h3>
          <ul>
            <li><strong>Verification Services:</strong> Identity verification partners</li>
            <li><strong>Cloud Infrastructure:</strong> AWS/Azure for hosting and storage</li>
            <li><strong>Analytics:</strong> Usage tracking and performance monitoring</li>
            <li><strong>Customer Support:</strong> Help desk and ticketing systems</li>
          </ul>

          <h3>4.3 Legal Requirements</h3>
          <p>
            We may disclose your information if required by law, subpoena, or other legal process, 
            or if necessary to protect the rights, property, or safety of InnovateBridge, our users, 
            or the public.
          </p>

          <h2>5. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data:
          </p>
          <ul>
            <li><strong>Encryption:</strong> AES-256 for data at rest, TLS 1.3 for data in transit</li>
            <li><strong>Access Controls:</strong> Role-based permissions and multi-factor authentication</li>
            <li><strong>Audit Logs:</strong> Comprehensive logging of all access to sensitive data</li>
            <li><strong>Regular Audits:</strong> Third-party security assessments and penetration testing</li>
            <li><strong>Incident Response:</strong> 24/7 monitoring and breach notification procedures</li>
          </ul>

          <h2>6. Data Retention</h2>
          <p>
            We retain your information for as long as your account is active or as needed to 
            provide services. Specific retention periods:
          </p>
          <ul>
            <li><strong>Account Information:</strong> Until account deletion + 30 days</li>
            <li><strong>Verification Documents:</strong> 5 years (regulatory requirement)</li>
            <li><strong>Messages:</strong> 7 years (contract-related communications)</li>
            <li><strong>Usage Logs:</strong> 90 days</li>
            <li><strong>Deleted Content:</strong> 30 days (recovery window)</li>
          </ul>

          <h2>7. Your Rights</h2>
          
          <h3>7.1 Access and Portability</h3>
          <p>
            You can request a copy of your personal data in a structured, commonly used format.
          </p>

          <h3>7.2 Correction</h3>
          <p>
            You can update your profile information directly or request corrections.
          </p>

          <h3>7.3 Deletion</h3>
          <p>
            You can delete your account and request erasure of your personal data, subject to 
            legal retention requirements.
          </p>

          <h3>7.4 Objection and Restriction</h3>
          <p>
            You can object to processing for direct marketing and request restriction of processing 
            in certain circumstances.
          </p>

          <div className="bg-neutral-50 p-4 rounded-lg my-6">
            <p className="text-sm font-semibold mb-2">To exercise your rights:</p>
            <p className="text-sm">Email: privacy@innovatebridge.com</p>
            <p className="text-sm">Subject: "Data Subject Request"</p>
            <p className="text-sm mt-2">
              We will respond within 30 days. Verification of identity may be required.
            </p>
          </div>

          <h2>8. International Data Transfers</h2>
          <p>
            InnovateBridge operates globally. Your data may be transferred to and processed in 
            countries other than your own. We ensure appropriate safeguards are in place:
          </p>
          <ul>
            <li>EU Standard Contractual Clauses for EEA transfers</li>
            <li>Adequacy decisions where applicable</li>
            <li>Binding Corporate Rules with our service providers</li>
          </ul>

          <h2>9. Children's Privacy</h2>
          <p>
            Our Service is not directed to individuals under 18. We do not knowingly collect 
            personal information from minors. If you become aware that a child has provided us 
            with personal information, please contact us immediately.
          </p>

          <h2>10. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to:
          </p>
          <ul>
            <li><strong>Essential:</strong> Authentication, security, and platform functionality</li>
            <li><strong>Preferences:</strong> Remember your settings and preferences</li>
            <li><strong>Analytics:</strong> Understand how you use our platform</li>
            <li><strong>Marketing:</strong> Deliver relevant advertisements (with consent)</li>
          </ul>
          <p>
            You can control cookies through your browser settings. Disabling essential cookies may 
            affect platform functionality.
          </p>

          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy to reflect changes in our practices or legal 
            requirements. We will notify you of material changes via email or platform notification 
            at least 30 days before they take effect.
          </p>

          <h2>12. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or our data practices:
          </p>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="bg-neutral-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Mail size={16} className="text-primary" />
                <span className="font-display font-semibold">Data Protection Officer</span>
              </div>
              <p className="text-sm">dpo@innovatebridge.com</p>
              <p className="text-sm">+234 (1) 234 5679</p>
            </div>
            <div className="bg-neutral-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Globe size={16} className="text-primary" />
                <span className="font-display font-semibold">Physical Address</span>
              </div>
              <p className="text-sm">24B Bishop Aboyade Cole Street</p>
              <p className="text-sm">Victoria Island, Lagos, Nigeria</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Database size={16} className="text-success" />
                Your privacy is our priority. We are committed to protecting your data.
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

export default PrivacyPolicy;