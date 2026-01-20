"use client";
import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  ClipboardList,
  Calendar,
  Receipt,
  BarChart3,
  ArrowRight
} from "lucide-react";

export default function ReportsPage() {
  const reports = [
    {
      name: "Summary Report",
      path: "/user/summaryreport",
      icon: FileText,
      desc: "Comprehensive overview of your trading P&L, win rate, and performance metrics.",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      name: "Ledger",
      path: "/user/ledger",
      icon: ClipboardList,
      desc: "Detailed chronological record of all credits, debits, and balance history.",
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    },
    {
      name: "Session Summary",
      path: "/user/session",
      icon: Calendar,
      desc: "Daily trading review with timeline, best/worst trades, and session insights.",
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-gray-800" />
            Reports Center
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Analyze your trading performance and financial health
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {reports.map((report) => (
            <Link key={report.name} href={report.path}>
              <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer h-full border-2 border-transparent hover:border-gray-200">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className={`p-4 rounded-xl ${report.bg}`}>
                      <report.icon className={`h-8 w-8 ${report.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-between">
                        {report.name}
                        <ArrowRight className="h-5 w-5 text-gray-300 opacity-0 group-hover:opacity-100" />
                      </h3>
                      <p className="text-gray-500 leading-relaxed">
                        {report.desc}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}