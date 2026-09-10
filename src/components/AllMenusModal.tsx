import React, { useState } from 'react';
import {
  X,
  Search,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ALL_MENUS } from '../data/mockData.ts';

interface AllMenusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, subTarget?: string) => void;
}

export const AllMenusModal: React.FC<AllMenusModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredMenus = ALL_MENUS.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.desc.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-extrabold text-base">All National Portal Modules & Services (25+)</h2>
              <p className="text-xs text-slate-400">Complete Directory of Government Procurement Capabilities</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Filter Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by keyword, role, or feature name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs py-2.5 pl-9 pr-4 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Directory Grid */}
        <div className="p-6 overflow-y-auto space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredMenus.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.view, item.subTarget);
                  onClose();
                }}
                className="text-left p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all flex items-start justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                      {item.id}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-emerald-700">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-xs text-slate-900 group-hover:text-emerald-900">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-2" />
              </button>
            ))}
          </div>

          {filteredMenus.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-xs">
              No matching modules found. Try a different search query.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition-colors"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
};
