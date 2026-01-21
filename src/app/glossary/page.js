"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function GlossaryPage() {
    const [activeLetter, setActiveLetter] = useState('A');
    const alphabet = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    const terms = [
        { term: "Ask Price", def: "The lowest price a seller is willing to accept for a security." },
        { term: "Bid Price", def: "The highest price a buyer is willing to pay for a security." },
        { term: "Call Option", def: "A financial contract that gives the buyer the right, but not the obligation, to buy a stock, bond, commodity or other asset or instrument at a specified price within a specific time period." },
        { term: "Derivative", def: "A financial security with a value that is reliant upon or derived from an underlying asset or group of assets." },
        { term: "Futures Contract", def: "A legal agreement to buy or sell a particular commodity asset, or security at a predetermined price at a specified time in the future." },
        { term: "Leverage", def: "The use of various financial instruments or borrowed capital—in other words, debt—to increase the potential return of an investment." },
        { term: "Long Position", def: "Buying a security with the expectation that the asset will rise in value." },
        { term: "Margin", def: "The money borrowed from a brokerage firm to purchase an investment." },
        { term: "Put Option", def: "An option contract giving the owner the right, but not the obligation, to sell a specified amount of an underlying security at a specified price within a specified time." },
        { term: "Short Position", def: "The sale of a security that is not owned by the seller, or that the seller has borrowed, with the expectation that the asset will fall in value." },
        { term: "Stop-Loss Order", def: "An order placed with a broker to buy or sell once the stock reaches a certain price." },
        { term: "Volatility", def: "A statistical measure of the dispersion of returns for a given security or market index." },
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
                <div className="max-w-3xl mx-auto px-4">
                    <h1 className="text-3xl font-bold text-zinc-900 mb-4">Trading Glossary</h1>
                    <p className="text-zinc-600">Essential terminology every futures trader needs to know.</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-12">
                {/* Alphabet Filter (Visual Only for now) */}
                <div className="flex flex-wrap gap-2 mb-12">
                    {alphabet.map(letter => (
                        <button key={letter} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${letter === 'A' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}>
                            {letter}
                        </button>
                    ))}
                </div>

                <div className="space-y-8">
                    {terms.map((item, i) => (
                        <div key={i} className="pb-8 border-b border-zinc-100 last:border-0">
                            <h3 className="text-xl font-bold text-zinc-900 mb-2">{item.term}</h3>
                            <p className="text-zinc-600 leading-relaxed">{item.def}</p>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
