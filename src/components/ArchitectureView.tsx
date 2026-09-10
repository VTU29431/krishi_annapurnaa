import React, { useState } from 'react';
import {
  Layers,
  Database,
  Radio,
  Server,
  Code2,
  RefreshCw,
} from 'lucide-react';
import { DashboardStats } from '../types.ts';

interface ArchitectureViewProps {
  stats: DashboardStats;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({ stats }) => {
  const [isPinging, setIsPinging] = useState(false);
  const [latency, setLatency] = useState<number>(24);

  const handlePingDb = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      await fetch('/api/health');
      const end = performance.now();
      setLatency(Math.round(end - start));
    } catch (err) {
      console.error(err);
    } finally {
      setIsPinging(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-8 rounded-2xl shadow-lg border border-slate-800">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
            <Layers className="w-3.5 h-3.5" />
            <span>National Scale Enterprise Procurement Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            System Architecture & Technical Specifications
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Full-stack decoupled architecture utilizing Node.js, Socket.io real-time synchronization, and a resilient Google Cloud Relational Database.
          </p>
        </div>
      </div>

      {/* Real-time Telemetry Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Database className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-slate-900 text-sm">
                Google Cloud Enterprise Database Cluster
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-xs text-slate-500">
              Region: <code>asia-southeast1</code> • Engine: Cloud Relational • Pooling: Active
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs">
          <div>
            <span className="text-slate-500">RTT Latency:</span>
            <span className="ml-1 font-bold font-mono text-emerald-700">{latency} ms</span>
          </div>
          <div>
            <span className="text-slate-500">Total Tokens Stored:</span>
            <span className="ml-1 font-bold font-mono text-slate-900">{stats.totalTokens}</span>
          </div>
          <button
            onClick={handlePingDb}
            disabled={isPinging}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold flex items-center space-x-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
            <span>Ping Cluster</span>
          </button>
        </div>
      </div>

      {/* Core Differentiation Matrix */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="font-extrabold text-slate-900 text-base">
          What Sets Krishi Annapurna Apart from Existing Systems
        </h2>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Capability</th>
                <th className="p-3">Legacy Mandi Portals</th>
                <th className="p-3 text-emerald-800 bg-emerald-50/50">Krishi Annapurna (This System)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-3 font-semibold text-slate-900">Token Scheduling</td>
                <td className="p-3 text-slate-500">Static daily date stamp without slot time</td>
                <td className="p-3 font-bold text-emerald-900 bg-emerald-50/30">
                  Dynamic 30-min staggered arrival windows to flatten rush
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Queue Visibility</td>
                <td className="p-3 text-slate-500">None; physical standing required in truck</td>
                <td className="p-3 font-bold text-emerald-900 bg-emerald-50/30">
                  Live countdown ("12 ahead", "35 min wait") via Socket.io
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Center Congestion</td>
                <td className="p-3 text-slate-500">One center jams to 100% while nearby sits idle</td>
                <td className="p-3 font-bold text-emerald-900 bg-emerald-50/30">
                  GIS load-balancer automatically reroutes traffic with fuel savings
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Token Calling</td>
                <td className="p-3 text-slate-500">Manual paper shouting at weighbridge gate</td>
                <td className="p-3 font-bold text-emerald-900 bg-emerald-50/30">
                  Digital loudspeaker announcement via browser SpeechSynthesis + push
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Database & Security</td>
                <td className="p-3 text-slate-500">Fragmented regional batch flat files</td>
                <td className="p-3 font-bold text-emerald-900 bg-emerald-50/30">
                  Cloud Relational Database with ACID transaction safety & Drizzle ORM
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3-Tier Enterprise Architecture Flow */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="font-extrabold text-slate-900 text-base">
          3-Tier Enterprise Architecture Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tier 1 */}
          <div className="p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/30 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Code2 className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Tier 1: Presentation & Client
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              React 19 + Tailwind + Socket.io Client
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>• Responsive single-page application</li>
              <li>• Multi-language support (14 Indian languages)</li>
              <li>• Canvas-rendered 2D QR Gate Passes</li>
              <li>• Web SpeechSynthesis API audio announcements</li>
              <li>• Mobile-first offline-friendly design</li>
            </ul>
          </div>

          {/* Tier 2 */}
          <div className="p-5 rounded-2xl border-2 border-blue-500 bg-blue-50/30 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <Server className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-800">
              Tier 2: Real-time & Application
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Node.js + Express + Socket.io Engine
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>• Bidirectional WebSocket event distribution</li>
              <li>• Real-time token creation and calling broadcasts</li>
              <li>• Wait-time regression and slot allocator</li>
              <li>• Firebase Auth & Admin SDK verification</li>
              <li>• RESTful API proxy for cloud services</li>
            </ul>
          </div>

          {/* Tier 3 */}
          <div className="p-5 rounded-2xl border-2 border-purple-500 bg-purple-50/30 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-purple-800">
              Tier 3: Database & Persistence
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Google Cloud Enterprise Database + Drizzle ORM
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>• Provisioned in region <code>asia-southeast1</code></li>
              <li>• ACID transactional guarantees for token ordering</li>
              <li>• Connection pooling via high-throughput driver</li>
              <li>• Drizzle ORM type-safe schema & migrations</li>
              <li>• Audit logs for DBT payments & quality assays</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
