"use client";

import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
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
                    <h1 className="text-3xl font-bold text-zinc-900 mb-4">Privacy Policy</h1>
                    <p className="text-zinc-500">Last Updated: January 21, 2026</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-16">
                <div className="prose prose-zinc max-w-none">
                    <h3>1. Information We Collect</h3>
                    <p>We collect information you provide directly to us when you create an account, specifically your email address and name. We also collect data regarding your usage of our simulation tools to improve the educational experience.</p>

                    <h3>2. How We Use Your Information</h3>
                    <p>We use the information we collect to operate, maintain, and improve our services, such as tracking your progress through learning modules and generating performance analytics for your simulated trades.</p>

                    <h3>3. Data Security</h3>
                    <p>We implement appropriate technical and organizational measures to protect the security of your personal information. However, please note that no system is completely secure.</p>

                    <h3>4. Cookies and Tracking</h3>
                    <p>We use cookies to maintain your session and preference settings. You can control cookie usage through your browser settings.</p>

                    <h3>5. Contact Us</h3>
                    <p>If you have any questions about this Privacy Policy, please contact us at privacy@urbanexchange.com.</p>
                </div>
            </div>
        </main>
    );
}
