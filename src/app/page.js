"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// ============================================
// ICON COMPONENTS (Inline SVGs for performance)
// ============================================

const Icons = {
    ChartBar: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    ),
    BookOpen: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
    ),
    TrendingUp: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
    ),
    Shield: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    ),
    Target: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5" />
        </svg>
    ),
    Zap: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    ),
    Award: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
    ),
    Play: () => (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
        </svg>
    ),
    Check: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ),
    ArrowRight: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    ),
    Users: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    ),
    Clock: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    Lock: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
    ),
    Menu: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    ),
    X: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
};

// ============================================
// ANIMATED COUNTER COMPONENT
// ============================================

function AnimatedCounter({ target, suffix = "", duration = 2000 }) {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.3 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        let startTime;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [isVisible, target, duration]);

    return (
        <span ref={ref} className="font-mono tabular-nums">
            {count.toLocaleString()}{suffix}
        </span>
    );
}

// ============================================
// SCROLL REVEAL COMPONENT
// ============================================

function ScrollReveal({ children, className = "", delay = 0 }) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => setIsVisible(true), delay);
                }
            },
            { threshold: 0.1, rootMargin: "50px" }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [delay]);

    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                } ${className}`}
        >
            {children}
        </div>
    );
}

// ============================================
// TRADING DASHBOARD ILLUSTRATION
// ============================================

function TradingDashboardIllustration() {
    return (
        <div className="relative w-full max-w-2xl mx-auto">
            {/* Main Dashboard Card */}
            <div className="bg-white rounded-2xl shadow-soft-xl border border-zinc-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-zinc-50 to-zinc-100/50 px-6 py-4 border-b border-zinc-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <div className="text-sm text-zinc-400 font-mono">Paper Trading Simulator</div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Balance Row */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-zinc-400 uppercase tracking-wide">Virtual Balance</p>
                            <p className="text-2xl font-bold text-zinc-900 font-mono">₹10,00,000</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-zinc-400 uppercase tracking-wide">Today's P&L</p>
                            <p className="text-xl font-semibold text-emerald-600 font-mono">+₹12,450</p>
                        </div>
                    </div>

                    {/* Mini Chart */}
                    <div className="h-24 bg-gradient-to-br from-zinc-50 to-zinc-100/50 rounded-xl flex items-end px-2 py-2 gap-1">
                        {[40, 55, 45, 60, 50, 70, 65, 80, 75, 85, 70, 90].map((h, i) => (
                            <div
                                key={i}
                                className={`flex-1 rounded-t transition-all duration-300 ${i === 11 ? 'bg-emerald-500' : 'bg-primary/40'
                                    }`}
                                style={{ height: `${h}%` }}
                            />
                        ))}
                    </div>

                    {/* Positions */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="font-medium text-zinc-700">NIFTY 24500 CE</span>
                            </div>
                            <span className="text-emerald-600 font-mono font-semibold">+₹8,200</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-rose-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                                <span className="font-medium text-zinc-700">BANKNIFTY 52000 PE</span>
                            </div>
                            <span className="text-rose-600 font-mono font-semibold">-₹2,150</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 border border-zinc-100 animate-float">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Icons.TrendingUp />
                    </div>
                    <div>
                        <p className="text-xs text-zinc-400">Win Rate</p>
                        <p className="font-bold text-zinc-900 font-mono">68%</p>
                    </div>
                </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3 border border-zinc-100 animate-float delay-200" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Icons.Award />
                    </div>
                    <div>
                        <p className="text-xs text-zinc-400">Lessons Done</p>
                        <p className="font-bold text-zinc-900 font-mono">24/30</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// NAVIGATION
// ============================================

function Navigation() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/90 backdrop-blur-lg shadow-sm" : "bg-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl overflow-hidden ">
                            <Image
                                src="/image.png"
                                alt="UrbanExchange Logo"
                                width={40}
                                height={40}
                                className="object-cover w-full h-full"
                            />
                        </div>
                        <span className="text-xl font-bold text-zinc-900">UrbanExchange</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-zinc-600 hover:text-zinc-900 transition-colors font-medium">Features</a>
                        <a href="#learning" className="text-zinc-600 hover:text-zinc-900 transition-colors font-medium">Learn</a>
                        <a href="#simulator" className="text-zinc-600 hover:text-zinc-900 transition-colors font-medium">Simulator</a>
                        <a href="#achievements" className="text-zinc-600 hover:text-zinc-900 transition-colors font-medium">Achievements</a>
                    </div>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link href="/login" className="px-4 py-2 text-zinc-700 hover:text-zinc-900 font-medium transition-colors">
                            Sign In
                        </Link>
                        <Link href="/signup" className="btn-primary text-sm">
                            Start Free
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-zinc-600"
                    >
                        {mobileMenuOpen ? <Icons.X /> : <Icons.Menu />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-zinc-100 py-4 space-y-2">
                        <a href="#features" className="block px-4 py-2 text-zinc-600 hover:bg-zinc-50 rounded-lg">Features</a>
                        <a href="#learning" className="block px-4 py-2 text-zinc-600 hover:bg-zinc-50 rounded-lg">Learn</a>
                        <a href="#simulator" className="block px-4 py-2 text-zinc-600 hover:bg-zinc-50 rounded-lg">Simulator</a>
                        <div className="px-4 pt-4 space-y-2">
                            <Link href="/login" className="block w-full text-center py-2 border border-zinc-200 rounded-xl font-medium">Sign In</Link>
                            <Link href="/signup" className="block w-full text-center btn-primary">Start Free</Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

// ============================================
// HERO SECTION
// ============================================

function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero bg-gradient-mesh overflow-hidden pt-20">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left Content */}
                    <div className="space-y-8">
                        <ScrollReveal>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium">
                                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                                100% Risk-Free Learning Environment
                            </div>
                        </ScrollReveal>

                        <ScrollReveal delay={100}>
                            <h1 className="text-zinc-900 leading-tight">
                                Learn Futures Trading
                                <span className="block text-gradient">Without Losing Real Money</span>
                            </h1>
                        </ScrollReveal>

                        <ScrollReveal delay={200}>
                            <p className="text-xl text-zinc-600 max-w-xl leading-relaxed">
                                Master futures trading through interactive lessons, real-market simulations,
                                and AI-powered feedback. Build confidence before you risk real capital.
                            </p>
                        </ScrollReveal>

                        <ScrollReveal delay={300}>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/signup" className="btn-primary inline-flex items-center justify-center gap-2 text-base">
                                    <Icons.Play />
                                    Start Learning Free
                                </Link>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal delay={400}>
                            <div className="flex items-center gap-6 pt-4">
                                {/* <div className="flex -space-x-3">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-primary to-violet-500 shadow-sm"></div>
                                    ))}
                                </div> */}
                                <div>
                                    <p className="text-sm text-zinc-500">Trusted by <span className="font-semibold text-zinc-900">50,000+</span> learners</p>
                                    <div className="flex items-center gap-1 text-amber-500">
                                        {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
                                        <span className="text-sm text-zinc-500 ml-1">4.9/5 rating</span>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* Right - Dashboard Illustration */}
                    <ScrollReveal delay={200} className="lg:pl-8">
                        <TradingDashboardIllustration />
                    </ScrollReveal>
                </div>
            </div>
        </section>
    );
}

// ============================================
// STATS SECTION
// ============================================

function StatsSection() {
    const stats = [
        { value: 50000, suffix: "+", label: "Active Learners", icon: Icons.Users },
        { value: 1000000, suffix: "+", label: "Simulated Trades", icon: Icons.ChartBar },
        { value: 100, suffix: "+", label: "Learning Modules", icon: Icons.BookOpen },
        { value: 68, suffix: "%", label: "Avg. Win Rate", icon: Icons.TrendingUp },
    ];

    return (
        <section className="py-12 bg-white border-y border-zinc-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <ScrollReveal key={index} delay={index * 100}>
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-primary/10 text-primary">
                                    <stat.icon />
                                </div>
                                <p className="text-3xl md:text-4xl font-bold text-zinc-900">
                                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                                </p>
                                <p className="text-sm text-zinc-500 mt-1">{stat.label}</p>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ============================================
// FEATURES SECTION
// ============================================

function FeaturesSection() {
    const features = [
        {
            icon: Icons.ChartBar,
            title: "Paper Trading Simulator",
            description: "Practice with virtual money using real market data. Execute Market & Limit orders without any risk.",
            color: "indigo",
        },
        {
            icon: Icons.BookOpen,
            title: "Visual Learning Modules",
            description: "Understand PnL, Margin, Leverage through interactive charts, sliders, and step-by-step animations.",
            color: "emerald",
        },
        {
            icon: Icons.TrendingUp,
            title: "Live Market Data",
            description: "Watch real-time price movements in an educational view designed for learning, not overwhelming.",
            color: "violet",
        },
        {
            icon: Icons.Target,
            title: "Trade Journaling",
            description: "Log every trade with notes, screenshots, and emotional tags. Build self-awareness habits.",
            color: "amber",
        },
        {
            icon: Icons.Zap,
            title: "Performance Analytics",
            description: "AI-generated insights on entry timing, risk-reward ratios, and common mistake patterns.",
            color: "rose",
        },
        {
            icon: Icons.Shield,
            title: "Risk Management",
            description: "Master Stop-Loss, Targets, and R:R ratios through hands-on practice scenarios.",
            color: "cyan",
        },
    ];

    const colorClasses = {
        indigo: "bg-primary/10 text-primary group-hover:bg-primary/20",
        emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
        violet: "bg-violet-50 text-violet-600 group-hover:bg-violet-100",
        amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
        rose: "bg-rose-50 text-rose-600 group-hover:bg-rose-100",
        cyan: "bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100",
    };

    return (
        <section id="features" className="section-padding bg-zinc-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-zinc-900 mb-4">Everything You Need to Master Futures</h2>
                    <p className="text-lg text-zinc-600">
                        From basics to advanced strategies, our platform combines education with hands-on practice.
                    </p>
                </ScrollReveal>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <ScrollReveal key={index} delay={index * 100}>
                            <div className="group bg-white rounded-2xl p-6 shadow-soft border border-zinc-100 card-hover h-full">
                                <div className={`icon-container mb-4 ${colorClasses[feature.color]}`}>
                                    <feature.icon />
                                </div>
                                <h3 className="text-xl font-semibold text-zinc-900 mb-2">{feature.title}</h3>
                                <p className="text-zinc-600 leading-relaxed">{feature.description}</p>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ============================================
// LEARNING PATH SECTION
// ============================================

function LearningSection() {
    const lessons = [
        { number: 1, title: "What is Futures Trading?", duration: "15 min", difficulty: "Beginner", completed: true },
        { number: 2, title: "Understanding Bid & Ask", duration: "12 min", difficulty: "Beginner", completed: true },
        { number: 3, title: "Market vs Limit Orders", duration: "18 min", difficulty: "Beginner", completed: false },
        { number: 4, title: "Margin & Leverage Explained", duration: "25 min", difficulty: "Intermediate", completed: false },
        { number: 5, title: "PnL Calculation Deep Dive", duration: "20 min", difficulty: "Intermediate", completed: false },
        { number: 6, title: "Risk Management Essentials", duration: "30 min", difficulty: "Intermediate", completed: false },
    ];

    const difficultyColors = {
        Beginner: "bg-emerald-100 text-emerald-700",
        Intermediate: "bg-amber-100 text-amber-700",
        Advanced: "bg-rose-100 text-rose-700",
    };

    return (
        <section id="learning" className="section-padding bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left Content */}
                    <ScrollReveal>
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-sm font-medium">
                                <Icons.BookOpen />
                                Structured Learning
                            </div>
                            <h2 className="text-zinc-900">Learn at Your Own Pace</h2>
                            <p className="text-lg text-zinc-600 leading-relaxed">
                                Progress through carefully designed modules that build on each other.
                                Each lesson combines visual explanations with interactive exercises.
                            </p>

                            <div className="space-y-4">
                                {["Charts & visual explanations", "Interactive sliders & calculators", "Quizzes to test understanding", "Progress tracking & badges"].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                                            <Icons.Check />
                                        </div>
                                        <span className="text-zinc-700">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <Link href="/signup" className="btn-primary inline-flex items-center gap-2 mt-4">
                                Start Learning
                                <Icons.ArrowRight />
                            </Link>
                        </div>
                    </ScrollReveal>

                    {/* Right - Lesson Cards */}
                    <ScrollReveal delay={200}>
                        <div className="space-y-3">
                            {lessons.map((lesson, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${lesson.completed
                                        ? "bg-emerald-50/50 border-emerald-200"
                                        : "bg-white border-zinc-100 hover:border-zinc-200 hover:shadow-soft"
                                        }`}
                                >
                                    <div
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${lesson.completed
                                            ? "bg-emerald-500 text-white"
                                            : "bg-zinc-100 text-zinc-500"
                                            }`}
                                    >
                                        {lesson.completed ? <Icons.Check /> : lesson.number}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-medium ${lesson.completed ? "text-emerald-700" : "text-zinc-900"}`}>
                                            {lesson.title}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-zinc-400 flex items-center gap-1">
                                                <Icons.Clock /> {lesson.duration}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColors[lesson.difficulty]}`}>
                                                {lesson.difficulty}
                                            </span>
                                        </div>
                                    </div>
                                    {lesson.completed && (
                                        <div className="text-emerald-500">
                                            <Icons.Check />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </section>
    );
}

// ============================================
// SIMULATOR PREVIEW SECTION
// ============================================

function SimulatorSection() {
    return (
        <section id="simulator" className="section-padding bg-gradient-to-b from-zinc-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-6">
                        <Icons.Zap />
                        Paper Trading
                    </div>
                    <h2 className="text-zinc-900 mb-4">Practice Without the Pressure</h2>
                    <p className="text-lg text-zinc-600">
                        Our simulation dashboard replicates real trading conditions with virtual capital.
                        Make mistakes, learn from them, and improve—all without financial risk.
                    </p>
                </ScrollReveal>

                <ScrollReveal delay={200}>
                    <div className="relative bg-white rounded-3xl shadow-soft-xl border border-zinc-100 overflow-hidden">
                        {/* Dashboard Header */}
                        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <span className="text-white/80 text-sm font-mono">Simulation Mode</span>
                                </div>
                                <div className="flex items-center gap-2 text-white/60 text-sm">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    Live Market Data
                                </div>
                            </div>
                        </div>

                        {/* Dashboard Content */}
                        <div className="grid md:grid-cols-3 gap-0 md:divide-x divide-zinc-100">
                            {/* Watchlist */}
                            <div className="p-6">
                                <h4 className="text-sm font-medium text-zinc-500 uppercase tracking-wide mb-4">Watchlist</h4>
                                <div className="space-y-3">
                                    {[
                                        { symbol: "NIFTY 24500 CE", bid: "245.50", ask: "246.00", change: "+2.5%" },
                                        { symbol: "NIFTY 24400 PE", bid: "180.25", ask: "180.75", change: "-1.2%" },
                                        { symbol: "BANKNIFTY 52000 CE", bid: "420.00", ask: "421.50", change: "+3.8%" },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                                            <div>
                                                <p className="font-medium text-zinc-900 text-sm">{item.symbol}</p>
                                                <div className="flex gap-3 mt-1 text-xs">
                                                    <span className="text-emerald-600 font-mono">Bid: {item.bid}</span>
                                                    <span className="text-rose-600 font-mono">Ask: {item.ask}</span>
                                                </div>
                                            </div>
                                            <span className={`text-sm font-mono ${item.change.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {item.change}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Panel */}
                            <div className="p-6 bg-zinc-50/50">
                                <h4 className="text-sm font-medium text-zinc-500 uppercase tracking-wide mb-4">Quick Order</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-zinc-500 block mb-1.5">Symbol</label>
                                        <div className="px-4 py-2.5 bg-white rounded-xl border border-zinc-200 text-sm font-medium">NIFTY 24500 CE</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-zinc-500 block mb-1.5">Quantity</label>
                                            <div className="px-4 py-2.5 bg-white rounded-xl border border-zinc-200 text-sm font-mono">50</div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-zinc-500 block mb-1.5">Price</label>
                                            <div className="px-4 py-2.5 bg-white rounded-xl border border-zinc-200 text-sm font-mono">₹245.50</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <button className="py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors">BUY</button>
                                        <button className="py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-colors">SELL</button>
                                    </div>
                                </div>
                            </div>

                            {/* Positions */}
                            <div className="p-6">
                                <h4 className="text-sm font-medium text-zinc-500 uppercase tracking-wide mb-4">Open Positions</h4>
                                <div className="space-y-3">
                                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-zinc-900 text-sm">NIFTY 24500 CE</span>
                                            <span className="text-xs bg-emerald-200 text-emerald-700 px-2 py-0.5 rounded">LONG</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-zinc-500">50 qty @ ₹238.50</span>
                                            <span className="text-emerald-600 font-mono font-semibold">+₹3,500</span>
                                        </div>
                                    </div>
                                    <div className="p-4 border border-zinc-100 rounded-xl bg-white">
                                        <p className="text-sm text-zinc-500 text-center">Virtual Balance: <span className="font-mono font-semibold text-zinc-900">₹9,96,500</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}

// ============================================
// ACHIEVEMENTS SECTION
// ============================================

function AchievementsSection() {
    const badges = [
        { name: "First Trade", icon: "🎯", description: "Execute your first paper trade", earned: true },
        { name: "Risk Master", icon: "🛡️", description: "Set SL on 10 consecutive trades", earned: true },
        { name: "Profit Streak", icon: "🔥", description: "5 profitable trades in a row", earned: false },
        { name: "Knowledge Seeker", icon: "📚", description: "Complete all beginner modules", earned: false },
        { name: "Sharp Shooter", icon: "🏹", description: "Achieve 70% win rate", earned: false },
        { name: "Trading Pro", icon: "🏆", description: "Reach Level 10", earned: false },
    ];

    return (
        <section id="achievements" className="section-padding bg-gradient-to-b from-white to-zinc-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left - Badges Grid */}
                    <ScrollReveal>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {badges.map((badge, index) => (
                                <div
                                    key={index}
                                    className={`relative p-4 rounded-2xl text-center transition-all duration-300 ${badge.earned
                                        ? "bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 shadow-glow"
                                        : "bg-zinc-100/50 border border-zinc-200 opacity-60"
                                        }`}
                                >
                                    <div className="text-4xl mb-2 filter drop-shadow-sm">{badge.icon}</div>
                                    <p className={`font-medium text-sm ${badge.earned ? "text-zinc-900" : "text-zinc-500"}`}>
                                        {badge.name}
                                    </p>
                                    {badge.earned && (
                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs">
                                            ✓
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollReveal>

                    {/* Right Content */}
                    <ScrollReveal delay={200}>
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-full text-amber-700 text-sm font-medium">
                                <Icons.Award />
                                Gamification
                            </div>
                            <h2 className="text-zinc-900">Earn While You Learn</h2>
                            <p className="text-lg text-zinc-600 leading-relaxed">
                                Stay motivated with our achievement system. Earn badges, build streaks,
                                and level up as you master new trading concepts and strategies.
                            </p>

                            {/* Progress Example */}
                            <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-soft">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-sm text-zinc-500">Current Level</p>
                                        <p className="text-2xl font-bold text-zinc-900">Level 3 — Apprentice</p>
                                    </div>
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary/20">
                                        3
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-500">Progress to Level 4</span>
                                        <span className="font-mono text-zinc-700">2,400 / 3,000 XP</span>
                                    </div>
                                    <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
                                        <div className="h-full w-4/5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </section>
    );
}

// ============================================
// TRUST SECTION
// ============================================

function TrustSection() {
    const trustPoints = [
        {
            icon: Icons.Lock,
            title: "No Real Money Required",
            description: "All trading is simulated with virtual currency. Learn without any financial risk.",
        },
        {
            icon: Icons.Shield,
            title: "Educational Focus",
            description: "We emphasize learning and skill-building over profit chasing or gambling behavior.",
        },
        {
            icon: Icons.Users,
            title: "Transparent Methodology",
            description: "Our curriculum is based on proven trading concepts and industry best practices.",
        },
    ];

    return (
        <section className="section-padding bg-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <ScrollReveal className="text-center mb-12">
                    <h2 className="text-zinc-900 mb-4">Safe, Educational, Transparent</h2>
                    <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
                        UrbanExchange is designed for learning. We believe in empowering traders with
                        knowledge and practice, not pushing risky behavior.
                    </p>
                </ScrollReveal>

                <div className="grid md:grid-cols-3 gap-8">
                    {trustPoints.map((point, index) => (
                        <ScrollReveal key={index} delay={index * 100}>
                            <div className="text-center space-y-4">
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-100 text-zinc-600">
                                    <point.icon />
                                </div>
                                <h4 className="font-semibold text-zinc-900">{point.title}</h4>
                                <p className="text-zinc-600 text-sm leading-relaxed">{point.description}</p>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>

                <ScrollReveal delay={400} className="mt-12 p-6 bg-amber-50 border border-amber-100 rounded-2xl">
                    <p className="text-center text-sm text-amber-800">
                        <strong>Disclaimer:</strong> UrbanExchange is an educational platform.
                        Trading futures involves significant risk and is not suitable for everyone.
                        Always understand the risks before trading with real money.
                    </p>
                </ScrollReveal>
            </div>
        </section>
    );
}

// ============================================
// CTA SECTION
// ============================================

function CTASection() {
    return (
        <section className="py-20 bg-gradient-to-br from-primary via-primary to-violet-700 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <ScrollReveal>
                    <h2 className="text-white text-3xl md:text-4xl font-bold mb-6">
                        Ready to Master Futures Trading?
                    </h2>
                    <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto">
                        Join thousands of learners who are building their trading skills in a
                        risk-free environment. Start your journey today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/signup" className="px-8 py-4 bg-white text-primary rounded-xl font-semibold  transition-all duration-200 hover:-translate-y-0.5 shadow-xl">
                            Start Learning Free
                        </Link>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}

// ============================================
// FOOTER
// ============================================

function Footer() {
    return (
        <footer className="bg-zinc-900 text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10">
                                <Image
                                    src="/image.png"
                                    alt="UrbanExchange Logo"
                                    width={40}
                                    height={40}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            <span className="text-xl font-bold">UrbanExchange</span>
                        </div>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Master futures trading through interactive education and risk-free simulation.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h5 className="font-semibold mb-4 text-zinc-300">Platform</h5>
                        <ul className="space-y-2 text-sm text-zinc-400">
                            <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                            <li><a href="#learning" className="hover:text-white transition-colors">Learning Modules</a></li>
                            <li><a href="#simulator" className="hover:text-white transition-colors">Paper Trading</a></li>
                            <li><a href="#achievements" className="hover:text-white transition-colors">Achievements</a></li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="font-semibold mb-4 text-zinc-300">Resources</h5>
                        <ul className="space-y-2 text-sm text-zinc-400">
                            <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                            <li><Link href="/glossary" className="hover:text-white transition-colors">Trading Glossary</Link></li>
                            <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                            <li><Link href="/faqs" className="hover:text-white transition-colors">FAQs</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="font-semibold mb-4 text-zinc-300">Company</h5>
                        <ul className="space-y-2 text-sm text-zinc-400">
                            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-zinc-500">
                        © 2026 UrbanExchange. All rights reserved. Educational purposes only.
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm">Twitter</a>
                        <a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm">LinkedIn</a>
                        <a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm">Discord</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// ============================================
// MOBILE BOTTOM NAV (for mobile)
// ============================================

function MobileBottomNav() {
    return (
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 backdrop-blur-lg border-t border-zinc-100 z-50 safe-area-pb">
            <div className="flex items-center justify-around py-3">
                <a href="#features" className="flex flex-col items-center gap-1 text-zinc-400">
                    <Icons.ChartBar />
                    <span className="text-[10px]">Features</span>
                </a>
                <a href="#learning" className="flex flex-col items-center gap-1 text-zinc-400">
                    <Icons.BookOpen />
                    <span className="text-[10px]">Learn</span>
                </a>
                <Link href="/user/trading" className="flex flex-col items-center gap-1 -mt-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-accent flex items-center justify-center shadow-lg shadow-primary/20">
                        <Icons.Play />
                    </div>
                    <span className="text-[10px] text-primary font-medium">Trade</span>
                </Link>
                <a href="#achievements" className="flex flex-col items-center gap-1 text-zinc-400">
                    <Icons.Award />
                    <span className="text-[10px]">Badges</span>
                </a>
                <Link href="/login" className="flex flex-col items-center gap-1 text-zinc-400">
                    <Icons.Users />
                    <span className="text-[10px]">Account</span>
                </Link>
            </div>
        </div>
    );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function HomePage() {
    return (
        <main className="min-h-screen bg-white">
            <Navigation />
            <HeroSection />
            <StatsSection />
            <FeaturesSection />
            <LearningSection />
            <SimulatorSection />
            <AchievementsSection />
            <TrustSection />
            <CTASection />
            <Footer />
            <MobileBottomNav />
        </main>
    );
}