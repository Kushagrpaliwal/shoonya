"use client";

import React from 'react';
import Link from 'next/link';

export default function BlogPage() {
    const posts = [
        {
            title: "Understanding Leveraged Trading: Risks and Rewards",
            excerpt: "Leverage can amplify your gains, but it can also magnify your losses. Here's what you need to know before you trade on margin.",
            date: "Jan 20, 2026",
            category: "Education",
            readTime: "5 min read"
        },
        {
            title: "The Psychology of Trading: Mastering Your Emotions",
            excerpt: "Fear and greed are the trader's worst enemies. Learn techniques to maintain discipline and stick to your trading plan.",
            date: "Jan 18, 2026",
            category: "Psychology",
            readTime: "8 min read"
        },
        {
            title: "Technical Analysis 101: Reading Candlestick Patterns",
            excerpt: "A beginner's guide to identifying common candlestick patterns and understanding what they signal about market sentiment.",
            date: "Jan 15, 2026",
            category: "Strategy",
            readTime: "6 min read"
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

            <div className="pt-32 pb-20 bg-zinc-50 border-b border-zinc-100">
                <div className="max-w-3xl mx-auto px-4">
                    <h1 className="text-4xl font-bold text-zinc-900 mb-6">UrbanExchange Blog</h1>
                    <p className="text-xl text-zinc-600">Insights, strategies, and market analysis for the modern trader.</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-20">
                <div className="grid gap-12">
                    {posts.map((post, index) => (
                        <article key={index} className="group">
                            <div className="flex items-center gap-3 text-sm text-zinc-500 mb-3">
                                <span className="text-indigo-600 font-medium">{post.category}</span>
                                <span>•</span>
                                <span>{post.date}</span>
                                <span>•</span>
                                <span>{post.readTime}</span>
                            </div>
                            <h2 className="text-2xl font-bold text-zinc-900 mb-3 group-hover:text-indigo-600 transition-colors">
                                <Link href="#">{post.title}</Link>
                            </h2>
                            <p className="text-zinc-600 leading-relaxed mb-4">{post.excerpt}</p>
                            <Link href="#" className="text-indigo-600 font-medium hover:text-indigo-700 inline-flex items-center gap-1">
                                Read Article
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </Link>
                        </article>
                    ))}
                </div>
            </div>
        </main>
    );
}
