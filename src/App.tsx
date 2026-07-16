import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionTemplate } from 'framer-motion';

// Characters set for Scramble effects
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~|}{[]:;?><";

/**
 * 1. ScrambleIn -- entrance reveal animation component
 */
interface ScrambleInProps {
  text: string;
  delay: number;
  triggered: boolean;
}

export const ScrambleIn: React.FC<ScrambleInProps> = ({ text, delay, triggered }) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (!triggered) {
      setDisplayText('');
      return;
    }

    const startTimeout = setTimeout(() => {
      let currentFrame = 0;
      const textLength = text.length;

      const interval = setInterval(() => {
        // Reveals left-to-right at 0.5 characters per frame
        const revealedCount = Math.floor(currentFrame * 0.5);

        if (revealedCount >= textLength) {
          setDisplayText(text);
          clearInterval(interval);
          return;
        }

        let result = '';
        for (let i = 0; i < textLength; i++) {
          if (text[i] === ' ') {
            result += ' ';
          } else if (i < revealedCount) {
            result += text[i];
          } else if (i < revealedCount + 3) {
            result += chars[Math.floor(Math.random() * chars.length)];
          } else {
            result += '';
          }
        }

        setDisplayText(result);
        currentFrame++;
      }, 25);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, delay, triggered]);

  return <span>{displayText || '\u00A0'}</span>;
};

/**
 * 2. ScrambleText -- hover-driven scramble component
 */
interface ScrambleTextProps {
  text: string;
  isHovered: boolean;
  className?: string;
}

export const ScrambleText: React.FC<ScrambleTextProps> = ({ text, isHovered, className }) => {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    if (!isHovered) {
      setDisplayText(text);
      return;
    }

    let currentFrame = 0;
    const textLength = text.length;

    const interval = setInterval(() => {
      // Reveals left-to-right at 4 frames per character (0.25 chars/frame)
      const revealedCount = Math.floor(currentFrame / 4);

      if (revealedCount >= textLength) {
        setDisplayText(text);
        clearInterval(interval);
        return;
      }

      let result = '';
      for (let i = 0; i < textLength; i++) {
        if (text[i] === ' ') {
          result += ' ';
        } else if (i < revealedCount) {
          result += text[i];
        } else {
          result += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      setDisplayText(result);
      currentFrame++;
    }, 25);

    return () => clearInterval(interval);
  }, [text, isHovered]);

  return <span className={className}>{displayText}</span>;
};

/**
 * 3. Custom SVG Logo -- 4-fold rotationally symmetric logo
 */
export const SynapseXLogo: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => {
  const path = "M 1.5,23 L 1.5,33 C 1.5,38.5 6,43 11.5,43 L 16.5,43 C 22,43 26.5,38.5 26.5,33 Q 28,28 33,26.5 C 38.5,26.5 43,22 43,16.5 L 43,11.5 C 43,6 38.5,1.5 33,1.5 L 23,1.5 Q 12,12 1.5,23 Z";
  return (
    <svg viewBox="-50 -50 100 100" className={className} fill="currentColor">
      <path d={path} />
      <path d={path} transform="rotate(90)" />
      <path d={path} transform="rotate(180)" />
      <path d={path} transform="rotate(270)" />
    </svg>
  );
};

/**
 * 4. Animated Hamburger -- spring hamburger line animation
 */
interface SquashHamburgerProps {
  isOpen: boolean;
  isMobile?: boolean;
}

export const SquashHamburger: React.FC<SquashHamburgerProps> = ({ isOpen, isMobile = false }) => {
  const containerWidth = isMobile ? 15 : 18;
  const containerHeight = isMobile ? 10 : 12;
  const barHeight = isMobile ? 1.2 : 1.5;

  const topVariants = {
    closed: { y: 0, rotate: 0 },
    open: { y: (containerHeight - barHeight) / 2, rotate: 45 }
  };
  const middleVariants = {
    closed: { opacity: 1, scale: 1 },
    open: { opacity: 0, scale: 0 }
  };
  const bottomVariants = {
    closed: { y: 0, rotate: 0 },
    open: { y: -(containerHeight - barHeight) / 2, rotate: -45 }
  };

  const springConfig = { type: 'spring', stiffness: 300, damping: 20 } as const;

  return (
    <div 
      className="relative flex flex-col justify-between"
      style={{ width: containerWidth, height: containerHeight }}
    >
      <motion.span
        variants={topVariants}
        animate={isOpen ? 'open' : 'closed'}
        transition={springConfig}
        className="absolute left-0 w-full bg-white origin-center"
        style={{ height: barHeight, top: 0 }}
      />
      <motion.span
        variants={middleVariants}
        animate={isOpen ? 'open' : 'closed'}
        transition={springConfig}
        className="absolute left-0 w-full bg-white origin-center"
        style={{ height: barHeight, top: (containerHeight - barHeight) / 2 }}
      />
      <motion.span
        variants={bottomVariants}
        animate={isOpen ? 'open' : 'closed'}
        transition={springConfig}
        className="absolute left-0 w-full bg-white origin-center"
        style={{ height: barHeight, bottom: 0 }}
      />
    </div>
  );
};

/**
 * Main App Component
 */
export default function App() {
  const [entranceComplete, setEntranceComplete] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Hover states for ScrambleText
  const [hoveredLogo, setHoveredLogo] = useState(false);
  const [hoveredAbout, setHoveredAbout] = useState(false);
  const [hoveredMetrics, setHoveredMetrics] = useState(false);
  const [hoveredDownload, setHoveredDownload] = useState(false);

  // References for video seeking logic
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const lastMouseX = useRef<number | null>(null);
  const videoDuration = useRef<number>(0);
  const isSeeking = useRef<boolean>(false);
  const nextSeekTime = useRef<number>(0);

  // Scroll tracking for Section 2
  const cinematicSectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cinematicSectionRef,
    offset: ["start end", "end start"]
  });

  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 15,
    damping: 32,
    mass: 1.8
  });

  const yScaleValue = useTransform(smoothScrollProgress, [0, 1], [60, -120]);
  const textOpacity = useTransform(smoothScrollProgress, [0.3, 0.5], [0, 1]);
  const transformTemplate = useMotionTemplate`rotateX(24deg) translateY(${yScaleValue}px) translateZ(15px)`;

  // Initialize Entrance sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      setEntranceComplete(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Video metadata loader
  const handleLoadedMetadata = () => {
    if (heroVideoRef.current) {
      videoDuration.current = heroVideoRef.current.duration || 5; // fallback 5s
    }
  };

  // seeked callback to chain seeks smoothly
  const handleSeeked = () => {
    isSeeking.current = false;
    if (heroVideoRef.current) {
      const diff = Math.abs(heroVideoRef.current.currentTime - nextSeekTime.current);
      if (diff > 0.02) {
        isSeeking.current = true;
        heroVideoRef.current.currentTime = nextSeekTime.current;
      }
    }
  };

  // Mouse move horizontal scrub handler
  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroVideoRef.current || !videoDuration.current) return;
    
    if (lastMouseX.current === null) {
      lastMouseX.current = e.clientX;
      return;
    }

    const deltaX = e.clientX - lastMouseX.current;
    lastMouseX.current = e.clientX;

    // Calculate time adjustment delta (sensitivity factor = 0.8)
    const timeDelta = (deltaX / window.innerWidth) * videoDuration.current * 0.8;
    
    // Target seek position bounds
    const targetTime = Math.max(0, Math.min(videoDuration.current, nextSeekTime.current + timeDelta));
    nextSeekTime.current = targetTime;

    if (!isSeeking.current) {
      isSeeking.current = true;
      heroVideoRef.current.currentTime = targetTime;
    }
  };

  const handleHeroMouseLeave = () => {
    lastMouseX.current = null;
  };

  // Scroll to helper
  const scrollTo = (offset: number) => {
    window.scrollTo({
      top: offset,
      behavior: 'smooth'
    });
    setIsMenuOpen(false);
  };

  return (
    <div className="w-full relative select-none" style={{ fontFamily: '"Space Mono", monospace' }}>
      
      {/* Fixed Navbar */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={entranceComplete ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed top-0 left-0 w-full h-20 z-50 flex items-center justify-between px-4 sm:px-6 md:px-8 pointer-events-none"
      >
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Logo Pill */}
          <motion.div
            onMouseEnter={() => setHoveredLogo(true)}
            onMouseLeave={() => setHoveredLogo(false)}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.22)" }}
            whileTap={{ scale: 0.98 }}
            className={`h-9 sm:h-12 px-3 sm:px-5 flex items-center gap-2 backdrop-blur-md rounded-[10px] sm:rounded-[14px] bg-white/15 border border-white/5 cursor-pointer transition-all duration-300 ${isMenuOpen ? 'hidden md:flex' : 'flex'}`}
          >
            <SynapseXLogo className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <ScrambleText text="SynapseX" isHovered={hoveredLogo} className="text-white text-xs sm:text-base font-medium tracking-tight" />
          </motion.div>

          {/* Expanding Menu Pill */}
          <motion.div
            animate={{ width: isMenuOpen ? (window.innerWidth < 640 ? '220px' : '290px') : (window.innerWidth < 640 ? '36px' : '48px') }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 } as const}
            className="h-9 sm:h-12 bg-white/15 backdrop-blur-md rounded-[10px] sm:rounded-[14px] border border-white/5 flex items-center overflow-hidden"
          >
            {/* Hamburger Button trigger */}
            <button
              onClick={() => setIsMenuOpen(open => !open)}
              className={`flex items-center justify-center rounded-[8px] sm:rounded-[11px] focus:outline-none transition-colors ${isMenuOpen ? 'w-7 h-7 sm:w-9 sm:h-9 bg-white/10 hover:bg-white/20 ml-1 sm:ml-1.5' : 'w-9 h-9 sm:w-12 sm:h-12'}`}
            >
              <SquashHamburger isOpen={isMenuOpen} isMobile={window.innerWidth < 640} />
            </button>

            {/* Menu Links */}
            {isMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.2 }}
                className="flex items-center gap-4 sm:gap-6 pl-4 sm:pl-6"
              >
                <button
                  onMouseEnter={() => setHoveredAbout(true)}
                  onMouseLeave={() => setHoveredAbout(false)}
                  onClick={() => scrollTo(window.innerHeight)}
                  className="text-white/85 hover:text-white text-xs sm:text-[15px]"
                >
                  <ScrambleText text="About" isHovered={hoveredAbout} />
                </button>
                <button
                  onMouseEnter={() => setHoveredMetrics(true)}
                  onMouseLeave={() => setHoveredMetrics(false)}
                  onClick={() => scrollTo(window.innerHeight * 2)}
                  className="text-white/85 hover:text-white text-xs sm:text-[15px]"
                >
                  <ScrambleText text="Metrics" isHovered={hoveredMetrics} />
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Download App Button */}
        <div className="pointer-events-auto">
          <motion.button
            onMouseEnter={() => setHoveredDownload(true)}
            onMouseLeave={() => setHoveredDownload(false)}
            whileHover={{ scale: 1.03, backgroundColor: "#e2e2e6" }}
            whileTap={{ scale: 0.97 }}
            className="h-9 sm:h-12 px-3.5 sm:px-6 bg-white text-black rounded-full flex items-center gap-2 font-medium text-xs sm:text-[14px]"
          >
            <i className="bi bi-apple text-[14px] sm:text-[16px]"></i>
            <ScrambleText text="Download" isHovered={hoveredDownload} />
          </motion.button>
        </div>
      </motion.header>

      {/* SECTION 1: Hero */}
      <section 
        id="hero"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
        className="relative w-full h-screen h-[100dvh] flex flex-col justify-end overflow-hidden px-4 sm:px-6 md:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12 bg-black border-b border-white/5"
      >
        {/* Scrubbed Background Video */}
        <video 
          ref={heroVideoRef}
          onLoadedMetadata={handleLoadedMetadata}
          onSeeked={handleSeeked}
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_083515_290e5a10-0b95-41af-a5e2-32b6389baa4d.mp4"
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
          muted
          playsInline
        />

        {/* Faint Dot Grid overlay */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none opacity-[0.05]"
          style={{ background: 'radial-gradient(#ffffff 1px, transparent 1px) 0 0/24px 24px' }}
        />

        {/* Large background watermark text */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center select-none"
          style={{ transform: 'translateY(50px)' }}
        >
          <span 
            className="font-black text-transparent uppercase tracking-[-4px] opacity-10 bg-clip-text"
            style={{ 
              fontFamily: '"Anton SC", sans-serif',
              fontSize: 'clamp(120px, 30vw, 521px)',
              backgroundImage: 'radial-gradient(circle, rgba(142,127,148,0) 0%, #8E7F94 70%)',
              WebkitBackgroundClip: 'text'
            }}
          >
            TRANSCENDENCE
          </span>
        </div>

        {/* Hero Bottom content stream */}
        <div className="relative z-20 w-full flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          
          {/* Left Block */}
          <div className="flex flex-col gap-4">
            <h1 className="text-white font-light leading-[0.95] tracking-[-0.03em] text-[clamp(40px,10vw,100px)]">
              <ScrambleIn text="Brain" delay={200} triggered={entranceComplete} />
              <br />
              <ScrambleIn text="And Body" delay={500} triggered={entranceComplete} />
            </h1>

            <motion.p
              initial={{ y: 25, opacity: 0 }}
              animate={entranceComplete ? { y: 0, opacity: 1 } : { y: 25, opacity: 0 }}
              transition={{ duration: 0.9, ease: [0.215, 0.610, 0.355, 1.0], delay: 0.2 }}
              className="max-w-sm text-[13px] sm:text-[15px] text-white/60 leading-relaxed font-mono-custom"
            >
              Built at the intersection of neuroscience and artificial intelligence. SynapseX continuously maps neural pathways, cognitive load, and physiological states into a single adaptive intelligence layer.
            </motion.p>
          </div>

          {/* Right Block */}
          <div>
            <h1 className="text-white font-light leading-[0.95] tracking-[-0.03em] text-[clamp(40px,10vw,100px)] text-left md:text-right">
              <ScrambleIn text="One" delay={700} triggered={entranceComplete} />
              <br />
              <ScrambleIn text="Network" delay={1000} triggered={entranceComplete} />
            </h1>
          </div>

        </div>
      </section>

      {/* SECTION 2: Cinematic Text */}
      <section 
        ref={cinematicSectionRef}
        className="relative w-full h-screen h-[100dvh] flex items-center justify-center overflow-hidden bg-black border-b border-white/5"
      >
        {/* Autoplay Background Video */}
        <video 
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_092455_089c54f8-3b03-4966-9df1-e9746063d0ef.mp4"
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
          autoPlay
          muted
          loop
          playsInline
        />

        {/* Top Dark gradient boundary */}
        <div className="absolute top-0 left-0 w-full h-[180px] bg-gradient-to-b from-[#010103] to-transparent z-10 pointer-events-none" />

        {/* Cinematic Content Box (3D Tilt Transform) */}
        <div className="relative z-20 w-full max-w-5xl px-6 sm:px-12 flex justify-center" style={{ perspective: '400px' }}>
          <motion.p
            style={{ 
              transform: transformTemplate,
              opacity: textOpacity
            }}
            className="font-sans-custom font-normal text-[20px] sm:text-[30px] md:text-[36px] lg:text-[42px] text-white leading-[1.35] tracking-[-0.02em] select-none text-center"
          >
            A neural-AI interface built on the architecture of the human nervous system. SynapseX translates synaptic activity into computational intelligence. Every signal becomes measurable, structured, and visible. It continuously reconstructs internal state as a dynamic neural map. Biological noise is filtered into actionable cognitive patterns.
          </motion.p>
        </div>
      </section>

      {/* SECTION 3: Metrics */}
      <section 
        id="metrics"
        className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black border-b border-white/5 pt-32 pb-32 px-6"
      >
        {/* Autoplay Background Video */}
        <video 
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_095810_ecea3dd2-fc5e-4e41-8696-4219290b6589.mp4"
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
          autoPlay
          muted
          loop
          playsInline
        />

        {/* Inner container grid */}
        <div className="relative z-20 w-full max-w-6xl flex flex-col items-center">
          
          {/* Subtitle indicator */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.2 }}
            className="text-white/40 text-[13px] sm:text-[14px] tracking-[0.2em] uppercase mb-20 text-center font-mono-custom"
          >
            Performance Metrics
          </motion.p>

          {/* Grid indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 w-full">
            
            {/* Metric 1 */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0 }}
              className="flex flex-col items-center md:items-start text-center md:text-left"
            >
              <span className="text-white text-[clamp(48px,10vw,96px)] font-light tracking-[-0.04em] leading-none">2.4ms</span>
              <span className="text-white/40 text-[13px] sm:text-[15px] mt-4 tracking-wide font-mono-custom">Synaptic Latency</span>
            </motion.div>

            {/* Metric 2 */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="flex flex-col items-center md:items-start text-center md:text-left"
            >
              <span className="text-white text-[clamp(48px,10vw,96px)] font-light tracking-[-0.04em] leading-none">99.7%</span>
              <span className="text-white/40 text-[13px] sm:text-[15px] mt-4 tracking-wide font-mono-custom">Signal Accuracy</span>
            </motion.div>

            {/* Metric 3 */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col items-center md:items-start text-center md:text-left"
            >
              <span className="text-white text-[clamp(48px,10vw,96px)] font-light tracking-[-0.04em] leading-none">140B</span>
              <span className="text-white/40 text-[13px] sm:text-[15px] mt-4 tracking-wide font-mono-custom">Neural Parameters</span>
            </motion.div>

          </div>
        </div>
      </section>

      {/* SECTION 4: Technology / Adaptive Intelligence */}
      <section 
        id="technology"
        className="relative w-full h-screen h-[100dvh] flex flex-col justify-between overflow-hidden px-8 sm:px-12 md:px-16 py-12 sm:py-16 bg-black border-b border-white/5"
      >
        {/* Autoplay Background Video */}
        <video 
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_095750_32a52ce0-2005-45c9-9093-41f03fde9530.mp4"
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
          autoPlay
          muted
          loop
          playsInline
        />

        {/* Top Feature descriptors */}
        <div className="relative z-20 flex flex-col md:flex-row md:justify-between md:items-start gap-6 w-full">
          
          <motion.h2
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.0 }}
            className="text-white font-light text-[clamp(36px,8vw,72px)] leading-[0.95] tracking-[-0.03em]"
          >
            Adaptive
            <br />
            Intelligence
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.0, delay: 0.2 }}
            className="text-white/50 text-[13px] sm:text-[15px] leading-relaxed max-w-xs md:text-right md:pt-2 font-mono-custom"
          >
            The system learns your neural baseline within 72 hours. From there, every cognitive state is mapped, predicted, and optimized in real time.
          </motion.p>
        </div>

        {/* Empty Spacer */}
        <div className="flex-1" />

        {/* Technology Columns list (Staggered fade-up) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
          }}
          className="relative z-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 w-full"
        >
          {/* Tech 1 */}
          <motion.div 
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.7 } } }}
            className="flex flex-col"
          >
            <h3 className="text-white text-[14px] sm:text-[16px] font-normal mb-2 uppercase tracking-wide">Cortical Mapping</h3>
            <p className="text-white/40 text-[12px] sm:text-[14px] leading-relaxed">Real-time spatial reconstruction of active neural regions.</p>
          </motion.div>

          {/* Tech 2 */}
          <motion.div 
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.7 } } }}
            className="flex flex-col"
          >
            <h3 className="text-white text-[14px] sm:text-[16px] font-normal mb-2 uppercase tracking-wide">Signal Isolation</h3>
            <p className="text-white/40 text-[12px] sm:text-[14px] leading-relaxed">Separates cognitive intent from biological noise.</p>
          </motion.div>

          {/* Tech 3 */}
          <motion.div 
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.7 } } }}
            className="flex flex-col"
          >
            <h3 className="text-white text-[14px] sm:text-[16px] font-normal mb-2 uppercase tracking-wide">State Prediction</h3>
            <p className="text-white/40 text-[12px] sm:text-[14px] leading-relaxed">Anticipates cognitive transitions before they occur.</p>
          </motion.div>

          {/* Tech 4 */}
          <motion.div 
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.7 } } }}
            className="flex flex-col"
          >
            <h3 className="text-white text-[14px] sm:text-[16px] font-normal mb-2 uppercase tracking-wide">Loop Feedback</h3>
            <p className="text-white/40 text-[12px] sm:text-[14px] leading-relaxed">Closed-loop adjustment based on outcome correlation.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 5: Architecture (Pure Black Background) */}
      <section 
        id="architecture"
        className="w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black border-b border-white/5 px-6 py-32"
      >
        <div className="w-full max-w-3xl flex flex-col items-center text-center">
          
          {/* Header block fade-up */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.0 }}
            className="flex flex-col items-center"
          >
            <span className="text-white/40 text-[13px] sm:text-[14px] tracking-[0.2em] uppercase mb-8 font-mono-custom">Architecture</span>
            <h2 className="text-white font-light text-[clamp(28px,6vw,56px)] leading-[1.15] tracking-[-0.02em] mb-10">
              Three layers. Zero friction.
            </h2>
            <p className="text-white/45 text-[15px] sm:text-[17px] leading-relaxed max-w-xl">
              Sensor layer captures raw bioelectric signals. Processing layer isolates intent. Interface layer delivers structured output to any connected system.
            </p>
          </motion.div>

          {/* Layer stacked cards list */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="mt-20 flex flex-col items-center gap-4 w-full"
          >
            
            {/* Card 1 */}
            <div className="w-full max-w-md h-[72px] border border-white/10 rounded-lg flex items-center justify-between px-6 bg-white/[0.01]">
              <span className="text-white/30 text-[12px] tracking-[0.15em] uppercase font-mono-custom">Layer 1</span>
              <span className="text-white text-[16px] sm:text-[18px] font-light">Capture</span>
            </div>

            {/* Card 2 */}
            <div className="w-full max-w-md h-[72px] border border-white/10 rounded-lg flex items-center justify-between px-6 bg-white/[0.01]">
              <span className="text-white/30 text-[12px] tracking-[0.15em] uppercase font-mono-custom">Layer 2</span>
              <span className="text-white text-[16px] sm:text-[18px] font-light">Process</span>
            </div>

            {/* Card 3 */}
            <div className="w-full max-w-md h-[72px] border border-white/10 rounded-lg flex items-center justify-between px-6 bg-white/[0.01]">
              <span className="text-white/30 text-[12px] tracking-[0.15em] uppercase font-mono-custom">Layer 3</span>
              <span className="text-white text-[16px] sm:text-[18px] font-light">Interface</span>
            </div>

          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-black overflow-hidden border-t border-white/5">
        <div className="flex flex-col md:flex-row min-h-[400px]">
          
          {/* Left panel: Background Video */}
          <div className="w-full md:w-1/2 h-[300px] md:h-auto relative overflow-hidden">
            <video 
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_080203_fd7f4f85-3a86-4837-8192-85e7bfe68e75.mp4"
              className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
              autoPlay
              muted
              loop
              playsInline
            />
          </div>

          {/* Right panel: Details details */}
          <div className="w-full md:w-1/2 flex flex-col justify-between p-10 sm:p-16">
            
            {/* Top row */}
            <div>
              <div className="flex items-center gap-2 mb-8 text-white/70">
                <SynapseXLogo className="w-4.5 h-4.5" />
                <span className="text-[15px] font-medium tracking-tight">SynapseX</span>
              </div>
              <p className="text-white/40 text-[14px] sm:text-[15px] leading-relaxed max-w-sm font-mono-custom">
                The next evolution of human-machine interaction. Built for those who refuse to be limited by biology alone.
              </p>
            </div>

            {/* Bottom copyright row */}
            <div>
              <p className="text-white/25 text-[12px] mt-12 font-mono-custom">
                (c) 2026 SynapseX Labs. All rights reserved.
              </p>
            </div>

          </div>

        </div>
      </footer>

    </div>
  );
}
