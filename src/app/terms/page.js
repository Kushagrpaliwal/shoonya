"use client";

import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
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
                    <h1 className="text-3xl font-bold text-zinc-900 mb-4">Terms of Service</h1>
                    <p className="text-zinc-500">Last Updated: January 21, 2026</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-16">
                <div className="prose prose-zinc max-w-none">
                    <h3>1. Acceptance of Terms</h3>
                    <p>By accessing or using UrbanExchange, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>

                    <h3>2. Educational Purpose Only (No Real Money)</h3>
                    <p><strong>IMPORTANT:</strong> UrbanExchange is strictly an educational platform. All trading on this platform is simulated. No real money is involved, and no real financial assets are bought or sold. Performance on this platform does not guarantee future results in real-world trading.</p>

                    <h3>3. User Accounts</h3>
                    <p>You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account.</p>

                    <h3>4. Prohibited Conduct</h3>
                    <p>You agree not to use the services for any illegal purpose or to violate any laws in your jurisdiction.</p>

                    <h3>5. Disclaimer of Warranties</h3>
                    <p>The services are provided "as is" without warranties of any kind, whether express or implied.</p>
                </div>
            </div>
        </main>
    );
}
