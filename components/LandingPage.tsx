import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Shield,
  TrendingUp,
  Zap,
  Play,
  Building2,
  Link as LinkIcon,
  BarChart3,
  Rocket,
  Mail,
  Phone
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0f16] via-[#14161b] to-[#0b0f16] text-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-[#0b0f16]/80 backdrop-blur-xl border-b transition-all duration-300 ${isScrolled ? 'border-white/10 shadow-2xl shadow-black/50' : 'border-white/5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold bg-gradient-to-r from-[#00e599] to-[#00b377] bg-clip-text text-transparent">
                🇦🇺 Aussie Agents
              </div>
              <span className="text-xs px-2 py-1 bg-[#00e599]/10 text-[#00e599] rounded-full border border-[#00e599]/20">
                Enterprise Automation
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#demo" className="text-sm text-gray-300 hover:text-[#00e599] transition-colors">Live Demo</a>
              <a href="#how-it-works" className="text-sm text-gray-300 hover:text-[#00e599] transition-colors">How It Works</a>
              <a href="#pricing" className="text-sm text-gray-300 hover:text-[#00e599] transition-colors">Pricing</a>
              <button
                onClick={handleGetStarted}
                className="px-4 py-2 bg-gradient-to-r from-[#00e599] to-[#00b377] text-black font-medium rounded-lg hover:shadow-lg hover:shadow-[#00e599]/20 transition-all"
              >
                Launch App
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00e599]/10 rounded-full border border-[#00e599]/20 mb-8 animate-pulse">
              <span className="text-sm font-medium text-[#00e599]">🇦🇺 Built for Australian Businesses</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Stop Guessing.
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#00e599] to-[#00b377] bg-clip-text text-transparent">
                Start Proving.
              </span>
            </h1>

            <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              We plug into your business systems, analyze your real workflows with AI, and show you exactly where automation will save you money—backed by your own data.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={handleGetStarted}
                className="group px-8 py-4 bg-gradient-to-r from-[#00e599] to-[#00b377] text-black font-semibold rounded-xl hover:shadow-2xl hover:shadow-[#00e599]/30 transition-all flex items-center gap-2 text-lg"
              >
                Get Free Analysis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all flex items-center gap-2 text-lg">
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                <div className="text-4xl font-bold text-[#00e599] mb-2">$2.4M</div>
                <div className="text-sm text-gray-400">Saved for Clients</div>
              </div>
              <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                <div className="text-4xl font-bold text-[#00e599] mb-2">127</div>
                <div className="text-sm text-gray-400">Businesses Optimized</div>
              </div>
              <div className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                <div className="text-4xl font-bold text-[#00e599] mb-2">3.2x</div>
                <div className="text-sm text-gray-400">Average ROI</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#14161b] to-[#0b0f16]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-[#00e599] uppercase tracking-wide">LIVE DEMO</span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-4 mb-6">See It In Action</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Watch how Aussie Agents transforms your business in under 5 minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
              <Clock className="w-12 h-12 text-[#00e599] mb-4" />
              <h3 className="text-2xl font-bold mb-2">5 Minutes</h3>
              <p className="text-gray-400">From signup to actionable insights</p>
            </div>
            <div className="p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
              <Shield className="w-12 h-12 text-[#00e599] mb-4" />
              <h3 className="text-2xl font-bold mb-2">100% Secure</h3>
              <p className="text-gray-400">Read-only OAuth, enterprise-grade encryption</p>
            </div>
            <div className="p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
              <BarChart3 className="w-12 h-12 text-[#00e599] mb-4" />
              <h3 className="text-2xl font-bold mb-2">Data-Driven</h3>
              <p className="text-gray-400">Every recommendation backed by real numbers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Companies */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wide mb-12">
            Trusted by Australia's Leading Companies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-60">
            <div className="text-2xl font-bold text-gray-400">Canva</div>
            <div className="text-2xl font-bold text-gray-400">Atlassian</div>
            <div className="text-2xl font-bold text-gray-400">SafetyCulture</div>
            <div className="text-2xl font-bold text-gray-400">Employment Hero</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">How It Works</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Four simple steps to transform your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative group">
              <div className="p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-[#00e599]/50 transition-all h-full">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-[#00e599] to-[#00b377] rounded-full flex items-center justify-center text-black font-bold text-xl">
                  1
                </div>
                <LinkIcon className="w-10 h-10 text-[#00e599] mb-6 mt-4" />
                <h3 className="text-xl font-bold mb-3">Connect Systems</h3>
                <p className="text-gray-400 mb-4">
                  Securely link your CRM, payments, and project tools with one-click OAuth integration.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00e599]/10 rounded-full border border-[#00e599]/20">
                  <Clock className="w-4 h-4 text-[#00e599]" />
                  <span className="text-sm text-[#00e599] font-medium">2 minutes</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-[#00e599]/50 transition-all h-full">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-[#00e599] to-[#00b377] rounded-full flex items-center justify-center text-black font-bold text-xl">
                  2
                </div>
                <Zap className="w-10 h-10 text-[#00e599] mb-6 mt-4" />
                <h3 className="text-xl font-bold mb-3">AI Analysis</h3>
                <p className="text-gray-400 mb-4">
                  Our AI examines 30 days of data to identify bottlenecks and automation opportunities.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00e599]/10 rounded-full border border-[#00e599]/20">
                  <TrendingUp className="w-4 h-4 text-[#00e599]" />
                  <span className="text-sm text-[#00e599] font-medium">Real-time</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-[#00e599]/50 transition-all h-full">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-[#00e599] to-[#00b377] rounded-full flex items-center justify-center text-black font-bold text-xl">
                  3
                </div>
                <BarChart3 className="w-10 h-10 text-[#00e599] mb-6 mt-4" />
                <h3 className="text-xl font-bold mb-3">Get Your Quote</h3>
                <p className="text-gray-400 mb-4">
                  Receive a detailed report with ROI calculations and transparent pricing options.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00e599]/10 rounded-full border border-[#00e599]/20">
                  <Zap className="w-4 h-4 text-[#00e599]" />
                  <span className="text-sm text-[#00e599] font-medium">Instant</span>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative group">
              <div className="p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-[#00e599]/50 transition-all h-full">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-[#00e599] to-[#00b377] rounded-full flex items-center justify-center text-black font-bold text-xl">
                  4
                </div>
                <Rocket className="w-10 h-10 text-[#00e599] mb-6 mt-4" />
                <h3 className="text-xl font-bold mb-3">We Build It</h3>
                <p className="text-gray-400 mb-4">
                  Fast implementation with live tracking of every dollar and hour saved.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00e599]/10 rounded-full border border-[#00e599]/20">
                  <Clock className="w-4 h-4 text-[#00e599]" />
                  <span className="text-sm text-[#00e599] font-medium">2-4 weeks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0b0f16] to-[#14161b]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Choose the perfect plan for your business
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter */}
            <div className="p-8 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-[#00e599]/30 transition-all">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$497</span>
                <span className="text-gray-400"> /month</span>
              </div>
              <p className="text-gray-400 mb-6">Perfect for small teams testing automation</p>
              <button className="w-full px-6 py-3 bg-white/10 border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition-all mb-6">
                Get Started
              </button>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#00e599] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">3 automated workflows</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#00e599] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">3 system integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#00e599] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">Email support</span>
                </li>
              </ul>
            </div>

            {/* Professional - Most Popular */}
            <div className="relative p-8 bg-gradient-to-br from-[#00e599]/20 to-[#00b377]/10 backdrop-blur-sm border-2 border-[#00e599] rounded-2xl shadow-2xl shadow-[#00e599]/20 scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#00e599] to-[#00b377] text-black text-sm font-bold rounded-full">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Professional</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$997</span>
                <span className="text-gray-400"> /month</span>
              </div>
              <p className="text-gray-400 mb-6">Best for growing Australian businesses</p>
              <button
                onClick={handleGetStarted}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#00e599] to-[#00b377] text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-[#00e599]/30 transition-all mb-6"
              >
                Start Free Trial →
              </button>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#00e599] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">10 automated workflows</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#00e599] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">7 system integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#00e599] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">Priority support + calls</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#00e599] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">Weekly reports</span>
                </li>
              </ul>
            </div>

            {/* Enterprise */}
            <div className="p-8 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-[#00e599]/30 transition-all">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$2,497</span>
                <span className="text-gray-400"> /month</span>
              </div>
              <p className="text-gray-400 mb-6">For companies serious about scaling</p>
              <button className="w-full px-6 py-3 bg-white/10 border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition-all mb-6">
                Contact Sales
              </button>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#00e599] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">Unlimited workflows</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#00e599] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">Unlimited integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#00e599] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">Dedicated account manager</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Stop Bleeding Money.
            <br />
            <span className="bg-gradient-to-r from-[#00e599] to-[#00b377] bg-clip-text text-transparent">
              Start Proving ROI.
            </span>
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Get a free analysis worth $997. See exactly where you're wasting time and money.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleGetStarted}
              className="group px-8 py-4 bg-gradient-to-r from-[#00e599] to-[#00b377] text-black font-semibold rounded-xl hover:shadow-2xl hover:shadow-[#00e599]/30 transition-all flex items-center gap-2 text-lg"
            >
              Get Free Analysis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all text-lg">
              Book Demo Call
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00e599]" />
              No credit card
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00e599]" />
              5-min setup
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00e599]" />
              Results in 48h
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#00e599] to-[#00b377] bg-clip-text text-transparent">
              🇦🇺 Aussie Agents
            </div>
            <p className="text-sm text-gray-500 mb-4">
              © 2024 Aussie Agents. Built in Australia, for Australia. 🇦🇺
            </p>
            <p className="text-xs text-gray-600">
              Enterprise Business Automation • ABN: XX XXX XXX XXX
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
