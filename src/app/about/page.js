"use client";

import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Navigation Bar (Simplified) */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-zinc-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="font-bold text-xl text-zinc-900">UrbanExchange</Link>
                    <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">Back to Home</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="pt-32 pb-20 bg-zinc-50 border-b border-zinc-100">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6">Empowering the Next Generation of Traders</h1>
                    <p className="text-xl text-zinc-600 leading-relaxed">
                        UrbanExchange is on a mission to democratize financial education through risk-free simulation and data-driven insights.
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto px-4 py-20">
                <div className="space-y-16">
                    <section>
                        <h2 className="text-2xl font-bold text-zinc-900 mb-4">Our Story</h2>
                        <p className="text-zinc-600 leading-relaxed">
                            Founded in 2026, UrbanExchange emerged from a simple observation: most aspiring traders fail not because they lack passion, but because they lack a safe environment to practice. Traditional platforms push beginners into high-risk trades immediately. We decided to change that. By combining professional-grade trading tools with a completely risk-free simulation environment, we've created a place where learning comes before earning.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-zinc-900 mb-4">Our Values</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                                <h3 className="font-semibold text-zinc-900 mb-2">Education First</h3>
                                <p className="text-sm text-zinc-600">We prioritize long-term skill development over short-term excitement.</p>
                            </div>
                            <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                                <h3 className="font-semibold text-zinc-900 mb-2">Transparency</h3>
                                <p className="text-sm text-zinc-600">No hidden agendas. We succeed only when our users learn and grow.</p>
                            </div>
                            <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                                <h3 className="font-semibold text-zinc-900 mb-2">Innovation</h3>
                                <p className="text-sm text-zinc-600">We constantly refine our simulation engine to match real-world market conditions.</p>
                            </div>
                            <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                                <h3 className="font-semibold text-zinc-900 mb-2">Community</h3>
                                <p className="text-sm text-zinc-600">Trading can be lonely. We're building a network of learners supporting learners.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
