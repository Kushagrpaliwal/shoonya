"use client";

import React from 'react';
import Link from 'next/link';

export default function DocsPage() {
    return (
        <main className="min-h-screen bg-white">
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-zinc-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="font-bold text-xl text-zinc-900">UrbanExchange</Link>
                    <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">Back to Home</Link>
                </div>
            </nav>

            <div className="pt-32 pb-12 bg-zinc-50 border-b border-zinc-100">
                <div className="max-w-3xl mx-auto px-4">
                    <h1 className="text-3xl font-bold text-zinc-900 mb-4">Documentation</h1>
                    <p className="text-zinc-600">Guides and references for using the UrbanExchange platform.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-4 gap-8">
                <div className="space-y-1">
                    <h3 className="font-semibold text-zinc-900 mb-3 px-3">Getting Started</h3>
                    <Link href="#" className="block px-3 py-2 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg">Account Setup</Link>
                    <Link href="#" className="block px-3 py-2 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg">Platform Tour</Link>
                    <Link href="#" className="block px-3 py-2 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-lg">First Trade</Link>
                </div>

                <div className="md:col-span-3 space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold text-zinc-900 mb-4">Platform Overview</h2>
                        <p className="text-zinc-600 leading-relaxed mb-6">
                            UrbanExchange provides a comprehensive suite of tools for learning futures trading.
                            Our platform consists of three main components: the Learning Modules, the Simulation Dashboard,
                            and the Analytics Engine.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="p-4 border border-zinc-200 rounded-xl">
                                <h4 className="font-semibold text-zinc-900 mb-2">Simulation Dashboard</h4>
                                <p className="text-sm text-zinc-500">Learn how to place orders, manage positions, and read the tape.</p>
                            </div>
                            <div className="p-4 border border-zinc-200 rounded-xl">
                                <h4 className="font-semibold text-zinc-900 mb-2">Risk Management</h4>
                                <p className="text-sm text-zinc-500">Understanding stop losses, target prices, and position sizing.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
