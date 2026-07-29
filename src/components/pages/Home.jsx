import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Link } from "react-router-dom";
import {
  Award,
  BookOpen,
  Coffee,
  Users,
  ChevronRight,
  Star,
  Clock,
  Globe,
  ArrowRight
} from "lucide-react";

const Home = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".hero-elem", 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out", delay: 0.2 }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="w-full bg-[var(--bg-page)]">
      
      {/* Hero Section */}
      <section className="relative h-screen min-h-[800px] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/80 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Coffee Roasting Background" 
            className="w-full h-full object-cover scale-105 animate-[kenburns_20s_ease-out_forwards]"
          />
        </div>
        
        <div ref={heroRef} className="relative z-20 max-w-5xl mx-auto px-6 text-center">
          <div className="hero-elem inline-flex items-center gap-3 px-4 py-1.5 border border-[#C6A36A]/30 bg-[#1A1A1A]/50 text-[var(--brand-accent)] text-xs tracking-[0.2em] font-medium mb-10 uppercase backdrop-blur-sm rounded-full">
            <Award className="w-4 h-4" />
            <span>The Global Standard In Coffee Education</span>
          </div>
          <h1 className="hero-elem text-5xl md:text-7xl lg:text-8xl font-heading text-white mb-8 leading-[1.1] tracking-wide">
            Master The Art <br className="hidden md:block"/> 
            Of <span className="text-[var(--brand-accent)] italic">Specialty Coffee</span>
          </h1>
          <p className="hero-elem text-lg md:text-xl text-[var(--text-secondary)] mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Elevate your craft. From sensory science to commercial roastery management, train with industry champions in our state-of-the-art facilities.
          </p>
          <div className="hero-elem flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/products" className="btn-primary min-w-[220px]">
              Explore Programs
            </Link>
            <Link to="/inquiry" className="btn-secondary min-w-[220px] bg-white/10 text-white hover:bg-white/20 border-white/20 hover:border-white/40">
              Request Admissions
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-[var(--bg-page)] relative z-20 -mt-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[var(--bg-surface)] rounded-2xl p-12 md:p-16 border border-[var(--border-subtle)] grid grid-cols-2 md:grid-cols-4 gap-12 text-center shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-5xl font-heading font-bold text-[var(--text-primary)] mb-4">15<span className="text-[var(--brand-primary)]">+</span></p>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-[0.2em] font-medium">Years Excellence</p>
            </div>
            <div className="relative z-10">
              <p className="text-5xl font-heading font-bold text-[var(--text-primary)] mb-4">5K<span className="text-[var(--brand-primary)]">+</span></p>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-[0.2em] font-medium">Global Alumni</p>
            </div>
            <div className="relative z-10">
              <p className="text-5xl font-heading font-bold text-[var(--text-primary)] mb-4">100<span className="text-[var(--brand-primary)]">%</span></p>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-[0.2em] font-medium">Industry Placement</p>
            </div>
            <div className="relative z-10">
              <p className="text-5xl font-heading font-bold text-[var(--text-primary)] mb-4">4</p>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-[0.2em] font-medium">Intl Campuses</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-[var(--bg-page)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-sm text-[var(--brand-primary)] uppercase tracking-[0.2em] font-bold mb-6">The Brewista Advantage</h2>
              <h3 className="text-4xl lg:text-5xl font-heading text-[var(--text-primary)] font-bold leading-tight">
                Uncompromising Standards in<br/>Coffee Education.
              </h3>
            </div>
            <p className="text-[var(--text-secondary)] max-w-md text-lg leading-relaxed">
              Our curriculum bridges theoretical science with intensive practical training, preparing you for the highest echelons of the coffee industry.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-10 group hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl bg-[var(--brand-primary-bg)] flex items-center justify-center mb-8 transition-colors">
                <Coffee className="w-8 h-8 text-[var(--brand-primary)]" strokeWidth={2} />
              </div>
              <h4 className="text-xl font-heading font-bold text-[var(--text-primary)] mb-4">Elite Laboratories</h4>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Train on commercial multi-boiler espresso machines, fluid-bed and drum roasters utilized by the world's leading specialty cafes.
              </p>
            </div>
            <div className="card p-10 group hover:-translate-y-1 delay-100">
              <div className="w-16 h-16 rounded-2xl bg-[var(--brand-primary-bg)] flex items-center justify-center mb-8 transition-colors">
                <Users className="w-8 h-8 text-[var(--brand-primary)]" strokeWidth={2} />
              </div>
              <h4 className="text-xl font-heading font-bold text-[var(--text-primary)] mb-4">Master Instructors</h4>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Receive personalized guidance from World Barista Champions, certified Q-Graders, and deeply experienced sensory analysts.
              </p>
            </div>
            <div className="card p-10 group hover:-translate-y-1 delay-200">
              <div className="w-16 h-16 rounded-2xl bg-[var(--brand-primary-bg)] flex items-center justify-center mb-8 transition-colors">
                <Globe className="w-8 h-8 text-[var(--brand-primary)]" strokeWidth={2} />
              </div>
              <h4 className="text-xl font-heading font-bold text-[var(--text-primary)] mb-4">SCA Certification</h4>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Graduate with universally recognized Specialty Coffee Association diplomas, opening doors to careers across the globe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Preview Preview */}
      <section className="py-32 bg-[var(--bg-surface-alt)] border-y border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-sm text-[var(--brand-primary)] uppercase tracking-[0.2em] font-bold mb-6">Curriculum</h2>
              <h3 className="text-4xl lg:text-5xl font-heading text-[var(--text-primary)] font-bold">Featured Programs</h3>
            </div>
            <Link to="/products" className="hidden md:flex items-center text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] transition-colors uppercase tracking-widest text-xs font-bold no-underline group">
              View Complete Catalog <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Course 1 */}
            <Link to="/products" className="no-underline card p-0 flex flex-col group hover:-translate-y-1 border-0 overflow-hidden">
              <div className="h-[280px] overflow-hidden relative">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                <img 
                  src="https://images.unsplash.com/photo-1541167760496-1628856ab772?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Espresso making" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
                />
                <div className="absolute top-6 right-6 bg-[var(--bg-surface)]/90 backdrop-blur-sm border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold text-[10px] tracking-widest px-4 py-2 uppercase z-20 rounded-lg">
                  Foundation
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col bg-[var(--bg-surface)] relative">
                <div className="absolute top-0 left-8 px-4 py-2 bg-[var(--brand-primary)] text-white text-xs font-bold -translate-y-1/2 rounded-md">
                  $1,200
                </div>
                <div className="flex text-[var(--brand-accent)] mb-4 mt-2">
                  <Star className="w-4 h-4 fill-current mx-0.5" />
                  <Star className="w-4 h-4 fill-current mx-0.5" />
                  <Star className="w-4 h-4 fill-current mx-0.5" />
                  <Star className="w-4 h-4 fill-current mx-0.5" />
                  <Star className="w-4 h-4 fill-current mx-0.5" />
                  <span className="text-[var(--text-secondary)] text-xs ml-2 font-medium">(48)</span>
                </div>
                <h3 className="text-xl font-heading font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--brand-primary)] transition-colors">Barista Science Foundation</h3>
                <p className="text-[var(--text-secondary)] text-sm mb-8 flex-1 leading-relaxed">
                  Establish fundamental extraction theories, grasp daily machine calibration, and produce classic espresso-based beverages with precision.
                </p>
                <div className="flex items-center justify-between text-xs text-[var(--brand-primary)] uppercase tracking-wider font-bold border-t border-[var(--border-subtle)] pt-6">
                  <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> 2 Weeks</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">Details <ChevronRight className="w-3 h-3" /></span>
                </div>
              </div>
            </Link>

            {/* Course 2 */}
            <Link to="/products" className="no-underline card p-0 flex flex-col group hover:-translate-y-1 border-0 overflow-hidden">
              <div className="h-[280px] overflow-hidden relative">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                <img 
                  src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Coffee beans roasting" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
                />
                <div className="absolute top-6 right-6 bg-[var(--bg-surface)]/90 backdrop-blur-sm border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold text-[10px] tracking-widest px-4 py-2 uppercase z-20 rounded-lg">
                  Professional
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col bg-[var(--bg-surface)] relative">
                <div className="absolute top-0 left-8 px-4 py-2 bg-[var(--brand-primary)] text-white text-xs font-bold -translate-y-1/2 rounded-md">
                  $3,500
                </div>
                <div className="flex text-[var(--brand-accent)] mb-4 mt-2">
                  <Star className="w-4 h-4 fill-current mx-0.5" />
                  <Star className="w-4 h-4 fill-current mx-0.5" />
                  <Star className="w-4 h-4 fill-current mx-0.5" />
                  <Star className="w-4 h-4 fill-current mx-0.5" />
                  <Star className="w-4 h-4 fill-current mx-0.5" />
                  <span className="text-[var(--text-secondary)] text-xs ml-2 font-medium">(32)</span>
                </div>
                <h3 className="text-xl font-heading font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--brand-primary)] transition-colors">Master Roasting Professional</h3>
                <p className="text-[var(--text-secondary)] text-sm mb-8 flex-1 leading-relaxed">
                  Master thermodynamic profiling, sensory evaluation, and commercial production roasting utilizing industry-leading software.
                </p>
                <div className="flex items-center justify-between text-xs text-[var(--brand-primary)] uppercase tracking-wider font-bold border-t border-[var(--border-subtle)] pt-6">
                  <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> 4 Weeks</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">Details <ChevronRight className="w-3 h-3" /></span>
                </div>
              </div>
            </Link>

            {/* Course 3 */}
            <Link to="/products" className="no-underline card p-0 flex flex-col group hover:-translate-y-1 border-0 overflow-hidden">
              <div className="h-[280px] overflow-hidden relative">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                <img 
                  src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Latte art" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
                />
                <div className="absolute top-6 right-6 bg-[var(--bg-surface)]/90 backdrop-blur-sm border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold text-[10px] tracking-widest px-4 py-2 uppercase z-20 rounded-lg">
                  Intermediate
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col bg-[var(--bg-surface)] relative">
                <div className="absolute top-0 left-8 px-4 py-2 bg-[var(--brand-primary)] text-white text-xs font-bold -translate-y-1/2 rounded-md">
                  $800
                </div>
                <div className="flex text-[var(--brand-accent)] mb-4 mt-2">
                  <Star className="w-4 h-4 fill-current mx-0.5" />
                  <Star className="w-4 h-4 fill-current mx-0.5" />
                  <Star className="w-4 h-4 fill-current mx-0.5" />
                  <Star className="w-4 h-4 fill-current mx-0.5" />
                  <Star className="w-4 h-4 text-[var(--border-default)] mx-0.5" />
                  <span className="text-[var(--text-secondary)] text-xs ml-2 font-medium">(64)</span>
                </div>
                <h3 className="text-xl font-heading font-bold text-[var(--text-primary)] mb-3 group-hover:text-[var(--brand-primary)] transition-colors">Advanced Latte Art</h3>
                <p className="text-[var(--text-secondary)] text-sm mb-8 flex-1 leading-relaxed">
                  Perfect micro-foam texturing techniques and execute complex pour patterns including inverted tulips, swans, and multi-rosettas.
                </p>
                <div className="flex items-center justify-between text-xs text-[var(--brand-primary)] uppercase tracking-wider font-bold border-t border-[var(--border-subtle)] pt-6">
                  <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> 1 Week</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">Details <ChevronRight className="w-3 h-3" /></span>
                </div>
              </div>
            </Link>
          </div>
          
          <div className="mt-16 text-center md:hidden">
            <Link to="/products" className="btn-secondary w-full no-underline">
              View Complete Catalog
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-32 bg-[var(--bg-page)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-sm text-[var(--brand-primary)] uppercase tracking-[0.2em] font-bold mb-6">Success Stories</h2>
            <h3 className="text-4xl lg:text-5xl font-heading text-[var(--text-primary)] font-bold">Alumni Perspectives</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-[var(--bg-surface)] p-12 md:p-16 border border-[var(--border-subtle)] relative shadow-lg rounded-3xl">
              <span className="absolute top-12 left-12 text-6xl text-[var(--border-subtle)] font-serif leading-none">"</span>
              <p className="text-[var(--text-secondary)] font-medium leading-loose mb-10 relative z-10 text-lg">
                The Roasting Professional course completely transformed my approach to sourcing and profiling. I opened my own roastery six months after graduation and we recently won a national award.
              </p>
              <div className="flex items-center gap-6 border-t border-[var(--border-subtle)] pt-8">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" alt="Alumni" className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <h4 className="font-heading font-bold text-lg text-[var(--text-primary)] m-0 mb-1">James Dalton</h4>
                  <p className="text-xs text-[var(--brand-primary)] uppercase tracking-wider font-bold m-0">Founder, Latitude Roasters</p>
                </div>
              </div>
            </div>
            
            <div className="bg-[var(--bg-surface)] p-12 md:p-16 border border-[var(--border-subtle)] relative shadow-lg rounded-3xl">
              <span className="absolute top-12 left-12 text-6xl text-[var(--border-subtle)] font-serif leading-none">"</span>
              <p className="text-[var(--text-secondary)] font-medium leading-loose mb-10 relative z-10 text-lg">
                I started with absolutely no coffee experience. Through the comprehensive barista track, I gained the skills and confidence to secure a Head Barista position at a premier specialty cafe.
              </p>
              <div className="flex items-center gap-6 border-t border-[var(--border-subtle)] pt-8">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" alt="Alumni" className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <h4 className="font-heading font-bold text-lg text-[var(--text-primary)] m-0 mb-1">Maria Chen</h4>
                  <p className="text-xs text-[var(--brand-primary)] uppercase tracking-wider font-bold m-0">Head Barista, The Daily Grind</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden border-t border-[var(--border-subtle)]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[var(--brand-secondary-bg)] z-10" />
          <img 
            src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Barista" 
            className="w-full h-full object-cover grayscale opacity-20"
          />
        </div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-20 text-center">
          <BookOpen className="w-12 h-12 text-[var(--brand-secondary)] mx-auto mb-10" strokeWidth={2} />
          <h2 className="text-4xl md:text-5xl font-heading text-[var(--text-primary)] font-bold mb-8 leading-tight">Begin Your Pursuit<br/>Of Excellence.</h2>
          <p className="text-[var(--text-secondary)] mb-12 text-lg leading-relaxed max-w-2xl mx-auto">
            Our admissions directors are available for consultations. Discover which program aligns with your career aspirations and schedule a personalized campus tour.
          </p>
          <div className="flex justify-center">
            <Link to="/inquiry" className="btn-green text-base px-10 py-4 shadow-xl">
              Initiate Application
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
