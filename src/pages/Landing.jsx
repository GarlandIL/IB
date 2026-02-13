import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, TrendingUp, Users, Globe, Shield, Zap, Heart,
  CheckCircle, Star, Mail, ExternalLink, Award, Target, Eye,
  Twitter, Linkedin, Facebook
} from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';

const Landing = () => {
  const [email, setEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const stats = [
    { value: '$2.5M+', label: 'Funding Raised' },
    { value: '150+', label: 'Projects Funded' },
    { value: '80+', label: 'Active Investors' },
    { value: '12', label: 'African Countries' }
  ];

  const features = [
    {
      icon: <Shield size={32} />,
      title: 'Secure & Verified',
      description: 'Multi-layer verification ensures authentic projects and credible investors'
    },
    {
      icon: <Zap size={32} />,
      title: 'Fast Matching',
      description: 'AI-powered algorithms connect the right projects with the right investors'
    },
    {
      icon: <Globe size={32} />,
      title: 'Pan-African Reach',
      description: 'Access opportunities across all African markets from one platform'
    },
    {
      icon: <Heart size={32} />,
      title: 'Impact-Driven',
      description: 'Track your social and environmental impact alongside financial returns'
    }
  ];

  const testimonials = [
    {
      quote: "InnovateBridge connected us with investors who truly understand the African market. We raised $150K in just 3 months.",
      author: "Amara Okoro",
      role: "CEO, AgroConnect",
      image: "https://i.pravatar.cc/100?img=1",
      rating: 5
    },
    {
      quote: "As an investor, I've found incredible opportunities I would never have discovered otherwise. The platform's due diligence is exceptional.",
      author: "Kwame Mensah",
      role: "Angel Investor",
      image: "https://i.pravatar.cc/100?img=12",
      rating: 5
    },
    {
      quote: "The quality of projects and the ease of engagement has made InnovateBridge our go-to platform for African startup investments.",
      author: "David Nkosi",
      role: "Managing Director, Impact Ventures",
      image: "https://i.pravatar.cc/100?img=33",
      rating: 5
    }
  ];

  const partners = [
    { name: "African Development Bank", logo: "https://via.placeholder.com/150/0066CC/ffffff?text=AfDB" },
    { name: "Tony Elumelu Foundation", logo: "https://via.placeholder.com/150/E31E24/ffffff?text=TEF" },
    { name: "Seedstars", logo: "https://via.placeholder.com/150/00A651/ffffff?text=Seedstars" },
    { name: "Y Combinator", logo: "https://via.placeholder.com/150/FB651E/ffffff?text=YC" },
    { name: "500 Global", logo: "https://via.placeholder.com/150/00AEEF/ffffff?text=500" },
    { name: "Endeavor", logo: "https://via.placeholder.com/150/0033A0/ffffff?text=Endeavor" }
  ];

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    setNewsletterSubmitted(true);
    setEmail('');
    setTimeout(() => setNewsletterSubmitted(false), 5000);
  };

  return (
    <div className="pt-[72px]">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-amber-50 to-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(200,75,49,0.08)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(212,165,116,0.08)_0%,transparent_50%)]" />
        </div>
        <div className="container relative z-10">
          <motion.div 
            className="max-w-[900px] py-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-[clamp(2.5rem,6vw,5rem)] leading-[1.1] mb-8 tracking-tight">
              Connecting African <br />
              <span className="text-gradient">Innovation</span> with <br />
              <span className="text-gradient">Global Capital</span>
            </h1>
            <p className="text-[clamp(1.125rem,2vw,1.5rem)] text-neutral-600 mb-10 max-w-[600px] leading-relaxed">
              Bridge the gap between visionary creators and impact-driven investors. 
              Build the future of Africa, one connection at a time.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link to="/signup?type=creator">
                <Button size="large" icon={<TrendingUp size={20} />} iconPosition="right">
                  Join as Creator
                </Button>
              </Link>
              <Link to="/signup?type=investor">
                <Button variant="secondary" size="large" icon={<Users size={20} />} iconPosition="right">
                  Join as Investor
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center p-6"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="font-display text-[clamp(2.5rem,4vw,3.5rem)] font-extrabold bg-gradient-to-r from-primary to-clay bg-clip-text text-transparent mb-1">
                  {stat.value}
                </div>
                <div className="font-display font-semibold text-neutral-600 uppercase tracking-wider text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 bg-neutral-50">
        <div className="container">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2>About InnovateBridge</h2>
            <p className="text-xl text-neutral-600">Our commitment to transforming Africa's innovation ecosystem</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div 
              className="bg-white p-10 rounded-lg shadow-sm"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-primary mb-6">
                <Target size={48} />
              </div>
              <h3 className="text-2xl font-display font-bold mb-4">Our Mission</h3>
              <p className="text-neutral-700 leading-relaxed">
                To bridge the gap between visionary African creators and impact-driven investors, 
                fostering sustainable economic growth and social development across the continent. 
                We provide a secure, transparent platform that democratizes access to capital and 
                connects innovative solutions with the resources they need to scale.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-10 rounded-lg shadow-sm"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-primary mb-6">
                <Eye size={48} />
              </div>
              <h3 className="text-2xl font-display font-bold mb-4">Our Vision</h3>
              <p className="text-neutral-700 leading-relaxed">
                A thriving African innovation ecosystem where every groundbreaking idea has access 
                to the capital and support needed to create meaningful impact. We envision a future 
                where African entrepreneurs drive global innovation, creating millions of jobs and 
                solving the continent's most pressing challenges through technology and innovation.
              </p>
            </motion.div>
          </div>

          <motion.div 
            className="mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-display font-bold text-center mb-8">Our Core Values</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Trust & Transparency', desc: 'Building confidence through rigorous verification and clear communication' },
                { title: 'Impact First', desc: 'Prioritizing social and environmental returns alongside financial success' },
                { title: 'Inclusivity', desc: 'Creating opportunities for innovators across all African nations' },
                { title: 'Innovation', desc: 'Continuously improving our platform to serve our community better' }
              ].map((value, i) => (
                <div key={i} className="flex gap-3 p-4 bg-white rounded-lg">
                  <CheckCircle size={24} className="text-primary flex-shrink-0" />
                  <div>
                    <h4 className="font-display font-bold text-neutral-900">{value.title}</h4>
                    <p className="text-sm text-neutral-600">{value.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2>Why InnovateBridge?</h2>
            <p className="text-xl text-neutral-600">Built specifically for the African innovation ecosystem</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-white p-8 rounded-lg shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-primary transition-all border border-transparent"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <div className="w-16 h-16 bg-linear-to-r from-primary to-primary-light text-white rounded-md flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-display font-bold mb-2">{feature.title}</h3>
                <p className="text-neutral-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-neutral-50">
        <div className="container">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2>Trusted by Innovators & Investors</h2>
            <p className="text-xl text-neutral-600">Join hundreds of successful connections across Africa</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-250 mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                className="bg-neutral-50 p-8 rounded-lg border-l-4 border-primary"
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex gap-1 text-primary mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-lg leading-relaxed text-neutral-700 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <img src={testimonial.image} alt={testimonial.author} className="w-14 h-14 rounded-full object-cover border-3 border-primary" />
                  <div>
                    <div className="font-display font-bold text-lg text-neutral-900">{testimonial.author}</div>
                    <div className="text-sm text-neutral-600">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2>Trusted Partners & Supporters</h2>
            <p className="text-xl text-neutral-600">Working together to build Africa's innovation future</p>
          </motion.div>
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {partners.map((partner, index) => (
              <motion.div
                key={index}
                className="opacity-70 hover:opacity-100 transition-opacity"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <img src={partner.logo} alt={partner.name} className="max-w-full h-auto mx-auto" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-neutral-50">
        <div className="container px-4 mx-auto">
          <div className="max-w-[600px] mx-auto text-center">
            {/* Icon – color primary, margin-bottom 3rem (var(--space-xl)) */}
            <div className="text-primary mb-12">
              <Mail size={48} className="mx-auto" />
            </div>

            {/* Heading – margin-bottom 1rem (var(--space-sm)) */}
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Stay Updated
            </h2>

            {/* Description – color neutral-600, margin-bottom 3rem (var(--space-xl)) */}
            <p className="text-lg text-neutral-600 mb-12">
              Get the latest news about African innovation, funding opportunities, and success stories
            </p>

            {newsletterSubmitted ? (
              <div className="flex items-center justify-center gap-4 p-6 bg-success text-white rounded-md">
                <CheckCircle size={24} />
                <p className="font-medium">Thank you for subscribing! Check your email for confirmation.</p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-6">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full sm:flex-1 px-6 py-4 text-base border-2 border-neutral-200 rounded-md font-body focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition"
                />
                <Button type="submit" size="large" className="w-full sm:w-auto whitespace-nowrap">
                  Subscribe
                </Button>
              </form>
            )}

            {/* Privacy text – text-sm, color neutral-400 */}
            <p className="text-sm text-neutral-400 mt-6">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-linear-to-r from-primary to-clay relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
        <div className="container relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center text-white py-16"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-white text-4xl md:text-5xl font-display font-bold mb-4">Ready to Bridge the Gap?</h2>
            <p className="text-xl mb-8 opacity-95">Join Africa's premier innovation funding platform today</p>
            <Link to="/signup">
              <Button size="large" variant="primary" icon={<ArrowRight size={20} />} iconPosition="right" className="bg-white text-primary hover:bg-neutral-100">
                Get Started Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 font-display font-extrabold text-2xl mb-4">
                <span className="text-3xl">🌉</span>
                <span className="bg-gradient-to-r from-primary to-clay bg-clip-text text-transparent">
                  InnovateBridge
                </span>
              </div>
              <p className="text-neutral-400 mb-6">
                Connecting African innovation with global capital
              </p>
              <div className="flex gap-4">
                <a href="https://twitter.com/innovatebridge" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-primary transition-colors">
                  <Twitter size={20} />
                </a>
                <a href="https://linkedin.com/company/innovatebridge" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-primary transition-colors">
                  <Linkedin size={20} />
                </a>
                <a href="https://facebook.com/innovatebridge" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-primary transition-colors">
                  <Facebook size={20} />
                </a>
              </div>
            </div>

            {[
              {
                title: 'For Creators',
                links: [
                  { label: 'Create Account', to: '/signup?type=creator' },
                  { label: 'Browse Investors', to: '/discover' },
                  { label: 'Learning Resources', to: '/resources' },
                  { label: 'FAQ', to: '/faq' }
                ]
              },
              {
                title: 'For Investors',
                links: [
                  { label: 'Create Account', to: '/signup?type=investor' },
                  { label: 'Discover Projects', to: '/discover' },
                  { label: 'Due Diligence Guide', to: '/due-diligence' },
                  { label: 'Impact Reporting', to: '/impact-reporting' }
                ]
              },
              {
                title: 'Company',
                links: [
                  { label: 'About Us', to: '/about' },
                  { label: 'Contact', to: '/contact' },
                  { label: 'Careers', to: '/careers' },
                  { label: 'Press Kit', to: '/press' }
                ]
              },
              {
                title: 'Legal',
                links: [
                  { label: 'Terms of Service', to: '/terms' },
                  { label: 'Privacy Policy', to: '/privacy' },
                  { label: 'NDA Policy', to: '/nda-policy' },
                  { label: 'Cookie Policy', to: '/cookie-policy' }
                ]
              }
            ].map((section, i) => (
              <div key={i} className="lg:col-span-1">
                <h4 className="font-display font-bold text-lg mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <Link to={link.to} className="text-neutral-400 hover:text-primary transition-colors text-sm">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-neutral-800 text-center text-neutral-400 text-sm">
            <p>&copy; 2025 InnovateBridge. All rights reserved.</p>
            <p className="mt-2">Building the future of African innovation, together.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;