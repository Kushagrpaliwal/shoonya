"use client";

import React from 'react';
import Link from 'next/link';

export default function FAQPage() {
    const faqs = [
        {
            q: "Is UrbanExchange free to use?",
            a: "Yes! Our core features, including the paper trading simulator and basic learning modules, are completely free to use. We believe financial education should be accessible to everyone."
        },
        {
            q: "Do I trade with real money here?",
            a: "No. UrbanExchange is strictly a simulation platform. You trade with virtual currency ('paper money') to practice without any financial risk."
        },
        {
            q: "Is the market data real-time?",
            a: "Yes, our simulation environment uses real-time market data to provide the most realistic practice experience possible."
        },
        {
            q: "Can I reset my virtual account balance?",
            a: "Absolutely. If you blow up your virtual account (which is a great learning experience!), you can reset your balance from your account settings at any time."
        },
        {
            q: "Is this suitable for complete beginners?",
            a: "Yes! We have a dedicated 'Basics' track designed specifically for those who have never traded before. We explain concepts simply without jargon."
        }
    ];

    return (
        <main className="min-h-screen bg-white">
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-zinc-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="font-bold text-xl text-zinc-900">UrbanExchange</Link>
                    <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">Back to Home</Link>
                </div>
            </nav>

            <div className="pt-32 pb-12 bg-zinc-50 border-b border-zinc-100">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h1 className="text-3xl font-bold text-zinc-900 mb-4">Frequently Asked Questions</h1>
                    <p className="text-zinc-600">Common questions about UrbanExchange and our simulation platform.</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-16">
                <div className="space-y-8">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm">
                            <h3 className="text-lg font-bold text-zinc-900 mb-3">{faq.q}</h3>
                            <p className="text-zinc-600 leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center bg-indigo-50 rounded-2xl p-8">
                    <h3 className="text-xl font-bold text-zinc-900 mb-2">Still have questions?</h3>
                    <p className="text-zinc-600 mb-6">Can't find the answer you're looking for? Our team is here to help.</p>
                    <Link href="/contact" className="inline-block px-6 py-3 bg-zinc-900 text-white font-medium rounded-lg hover:bg-zinc-800 transition-colors">
                        Contact Support
                    </Link>
                </div>
            </div>
        </main>
    );
}
