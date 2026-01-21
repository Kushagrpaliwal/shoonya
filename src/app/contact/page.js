"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <main className="min-h-screen bg-white">
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-zinc-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="font-bold text-xl text-zinc-900">UrbanExchange</Link>
                    <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">Back to Home</Link>
                </div>
            </nav>

            <div className="pt-32 pb-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16">
                        <div>
                            <h1 className="text-4xl font-bold text-zinc-900 mb-6">Get in Touch</h1>
                            <p className="text-lg text-zinc-600 mb-8">
                                Have questions about our platform or suggestions for improvement? We'd love to hear from you.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-zinc-900">Email</h3>
                                        <p className="text-zinc-600">support@urbanexchange.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-zinc-900">Address</h3>
                                        <p className="text-zinc-600">
                                            123 Innovation Drive<br />
                                            Tech Park, Sector 62<br />
                                            Noida, UP 201301
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-50 p-8 rounded-2xl border border-zinc-100">
                            {submitted ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-zinc-900 mb-2">Message Sent!</h3>
                                    <p className="text-zinc-600">Thanks for reaching out. We'll get back to you shortly.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Name</label>
                                        <input type="text" className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
                                        <input type="email" className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Subject</label>
                                        <select className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none">
                                            <option>General Inquiry</option>
                                            <option>Support</option>
                                            <option>Feedback</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Message</label>
                                        <textarea rows="4" className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" required></textarea>
                                    </div>
                                    <button type="submit" className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg transition-colors">
                                        Send Message
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
