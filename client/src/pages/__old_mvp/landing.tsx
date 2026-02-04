import { useNavigate } from "react-router-dom";
import { Check, ChevronRight, Calendar, Users, DollarSign, MapPin } from "lucide-react";
import { VibeSwitcher } from "../../components/__old_mvp/vibe-switcher";
import { TriplePhoneDemo } from "../../components/__old_mvp/triple-phone/TriplePhoneDemo";
import { SecondPhoneRowDemo } from "../../components/__old_mvp/triple-phone/SecondPhoneRowDemo";
import mascotImage from "../../assets/__old_mvp/DISASTERBIRD_1766980970764.PNG";
import { useEffect, useRef, useState } from "react";

/**
 * ============================================================================
 * LANDING PAGE - BORING GOLF
 * ============================================================================
 * 
 * DESIGN PHILOSOPHY (from DESIGN_SYSTEM.md):
 * - "Planning a golf trip inside a beautifully printed planner that became software"
 * - Feels like a high-end golf clubhouse
 * - Calm, Premium, Editorial, Trustworthy
 * - Private club-grade planning tool
 * 
 * COLOR FOUNDATION:
 * - Background: Warm off-white paper tone (#F6F3EE)
 * - Primary ink: #111827
 * - Secondary text: #4B5563
 * - Muted metadata: #9CA3AF
 * - Action: Blue 600 (#2563EB)
 * 
 * ============================================================================
 */

// Custom hook for fade-in on scroll
function useFadeInOnScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

export default function Landing() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  
  // Fade-in on scroll for key sections
  const heroFade = useFadeInOnScroll();
  const featuresFade = useFadeInOnScroll();

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    let rafId: number;
    
    const handleScroll = () => {
      // Nav shadow on scroll
      setIsScrolled(window.scrollY > 10);
      
      // Hide nav on scroll down, show on scroll up
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setNavVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setNavVisible(true);
      }
      lastScrollY.current = currentScrollY;
      
      // Parallax effect (Option B: JS scroll transform)
      if (!prefersReducedMotion) {
        rafId = requestAnimationFrame(() => {
          // Clamp values to prevent extreme movement
          const topoOffset = Math.min(currentScrollY * 0.06, 200);
          const washOffset = Math.min(currentScrollY * 0.03, 100);
          
          document.documentElement.style.setProperty('--parallax-topo', `${topoOffset}px`);
          document.documentElement.style.setProperty('--parallax-wash', `${washOffset}px`);
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="pageShell">
      {/* Background Layers (z-index 1-3) */}
      <div className="paperGrain" aria-hidden="true" />
      <div className="topoLayer" aria-hidden="true" />
      <div className="lightWash" aria-hidden="true" />

      {/* Content Stack (z-index 10) */}
      <main className="contentStack">
        {/* Navigation - Frosted glass effect */}
        <nav 
          className={`sticky top-0 z-50 transition-all duration-200 ${
            isScrolled ? 'shadow-card' : ''
          } ${navVisible ? 'translate-y-0' : '-translate-y-full'}`}
          style={{ 
            background: 'rgba(246, 243, 238, 0.92)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          }}
        >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <a 
            onClick={(e) => { e.preventDefault(); navigate('/'); }} 
            href="/" 
            className="font-serif text-2xl text-ink cursor-pointer hover:opacity-80 transition-opacity"
          >
            <span className="font-semibold">boring</span> golf<span style={{ color: 'var(--bg-accent)' }}>.</span>
          </a>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-meta text-ink-secondary hover:text-ink transition-colors">Features</a>
            <a href="#about" className="text-meta text-ink-secondary hover:text-ink transition-colors">About</a>
            <a href="#pricing" className="text-meta text-ink-secondary hover:text-ink transition-colors">Pricing</a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <VibeSwitcher />
            <button 
              onClick={() => navigate('/signin')} 
              className="text-meta font-medium text-ink-secondary hover:text-ink transition-colors px-3 py-2"
            >
              Sign in
            </button>
            <button 
              onClick={() => navigate('/my-trips')} 
              className="text-white text-meta font-medium px-5 py-2.5 rounded-input transition-all duration-fast hover:opacity-90"
              style={{ backgroundColor: 'var(--bg-accent)' }}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        ref={heroFade.ref}
        className={`relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28 fade-in-section ${heroFade.isVisible ? 'is-visible' : ''}`}
      >
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div>
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/60 border border-border-soft rounded-pill mb-6">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-micro text-ink-secondary">Private Beta • Invite Only</span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-[3.5rem] md:text-[4rem] leading-[1.1] text-ink mb-6">
              Golf trips so smooth<br />
              they're <em style={{ color: 'var(--bg-accent)' }}>boring</em>
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-ink-secondary leading-relaxed mb-8 max-w-lg">
              The logistics operating system for golf trips. Stop juggling spreadsheets, 
              group texts, and "who owes what." Plan once, play forever.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-12">
              <button
                onClick={() => navigate('/my-trips')}
                className="group flex items-center gap-2 bg-ink hover:bg-ink/90 text-ink-inverse px-6 py-3.5 rounded-input font-medium transition-all duration-fast"
              >
                Plan Your Trip
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/trip-designer')}
                className="flex items-center gap-2 bg-white/80 hover:bg-white border border-border-default text-ink px-6 py-3.5 rounded-input font-medium transition-all duration-fast"
              >
                See How It Works
              </button>
            </div>

            {/* Trust Signals */}
            <div className="flex items-center gap-6 text-ink-muted text-meta">
              <span>✓ Free to start</span>
              <span>✓ No credit card</span>
              <span>✓ Cancel anytime</span>
            </div>
          </div>

          {/* Right - Mascot */}
          <div className="relative flex justify-center">
            <div className="relative">
              <img 
                src={mascotImage} 
                alt="Boring Golf Mascot - A relaxed bird golfer" 
                className="w-full max-w-sm drop-shadow-xl"
                style={{
                  filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.15))',
                }}
              />
              {/* Ground shadow */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-4 rounded-full"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.2) 0%, transparent 70%)',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Wave Divider - Hero to Dark Section */}
      <div className="relative z-10">
        <svg 
          viewBox="0 0 1440 80" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto block"
          preserveAspectRatio="none"
        >
          <path 
            d="M0 80V60C240 20 480 0 720 20C960 40 1200 60 1440 40V80H0Z" 
            fill="rgba(26, 47, 35, 0.85)"
          />
        </svg>
      </div>

      {/* ON-TRIP SECTION: Live Feed, Leaderboard, Ledger - DARK BACKGROUND */}
      <section 
        className="relative z-10 py-16 md:py-24"
        style={{ background: 'rgba(26, 47, 35, 0.85)', marginTop: '-1px' }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <TriplePhoneDemo />
        </div>
      </section>

      {/* "You're not a travel agent" Section - DARK BACKGROUND */}
      <section 
        ref={featuresFade.ref}
        id="features"
        className={`relative z-10 py-20 fade-in-section ${featuresFade.isVisible ? 'is-visible' : ''}`}
        style={{ background: 'rgba(26, 47, 35, 0.85)' }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left - Features List */}
            <div>
              <h2 className="font-serif text-3xl md:text-4xl text-white mb-6">
                You're not a travel agent
              </h2>
              <p className="text-lg text-white/70 leading-relaxed mb-8">
                Someone always ends up managing the trip. Spreadsheets, group texts, 
                'who owes what.' Not anymore.
              </p>
              
              <ul className="space-y-4">
                {[
                  'Automated tee time coordination across multiple courses',
                  'Flight tracking with automatic shuttle adjustments',
                  'Lodging & roommate pairing without the drama',
                  'Split costs fairly—payment requests sent automatically',
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[var(--bg-accent)] flex-shrink-0 mt-0.5" />
                    <span className="text-white/90">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right - Heading */}
            <div className="text-center md:text-right">
              <h2 className="font-serif text-4xl md:text-5xl text-white leading-tight">
                Built for the guy who always ends up planning the trip
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* Wave Divider - Dark to Light */}
      <div className="relative z-10" style={{ marginTop: '-1px' }}>
        <svg 
          viewBox="0 0 1440 80" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto block"
          preserveAspectRatio="none"
          style={{ transform: 'rotate(180deg)' }}
        >
          <path 
            d="M0 80V60C240 20 480 0 720 20C960 40 1200 60 1440 40V80H0Z" 
            fill="rgba(26, 47, 35, 0.85)"
          />
        </svg>
      </div>

      {/* PRE-TRIP SECTION: Trip Designer, Itinerary, Roster - ON PAPER TEXTURE */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <div className="flex justify-center gap-16 text-micro font-semibold text-ink-muted uppercase tracking-wider">
              <span>Trip Designer</span>
              <span>Itinerary</span>
              <span>Roster</span>
            </div>
          </div>
          <SecondPhoneRowDemo />
        </div>
      </section>

      {/* Wave Divider - Light to Dark Footer */}
      <div className="relative z-10">
        <svg 
          viewBox="0 0 1440 60" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto block"
          preserveAspectRatio="none"
        >
          <path 
            d="M0 60V40C360 60 720 20 1080 40C1260 50 1350 55 1440 50V60H0Z" 
            fill="rgba(26, 47, 35, 0.85)"
          />
        </svg>
      </div>

        {/* Footer */}
        <footer 
          className="relative z-10 py-16"
          style={{ background: 'rgba(26, 47, 35, 0.85)', marginTop: '-1px' }}
        >
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-12">
              {/* Brand */}
              <div className="md:col-span-1">
                <a href="/" className="font-serif text-xl text-white mb-4 block">
                  boring golf<span className="text-[var(--bg-accent)]">.</span>
                </a>
                <p className="text-meta text-white/60 leading-relaxed">
                  The logistics operating system for golf trips. Built by golfers 
                  who were tired of the chaos.
                </p>
              </div>

              {/* Links */}
              {[
                { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'API'] },
                { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
                { title: 'Legal', links: ['Privacy', 'Terms', 'Security'] },
              ].map((section, i) => (
                <div key={i}>
                  <h4 className="text-micro uppercase tracking-wider text-white/40 mb-4">{section.title}</h4>
                  <ul className="space-y-3">
                    {section.links.map((link, j) => (
                      <li key={j}>
                        <a href="#" className="text-meta text-white/70 hover:text-[var(--bg-accent)] transition-colors">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom */}
            <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap justify-between items-center gap-4">
              <span className="text-meta text-white/40">© 2025 Boring Golf. All rights reserved.</span>
              <span className="text-meta text-white/40">Made with ♥ in Chicago</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
