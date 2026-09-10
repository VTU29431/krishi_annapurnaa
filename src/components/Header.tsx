import React from 'react';
import {
  Phone,
  Volume2,
  VolumeX,
  Globe,
  LogIn,
  LogOut,
  User,
  Menu as MenuIcon,
  X,
  LayoutGrid,
  Sparkles,
  Printer,
} from 'lucide-react';
import { LanguageCode, UserRole, FarmerUser, MandiOfficerUser, Token } from '../types.ts';
import { LANGUAGES, TRANSLATIONS } from '../data/translations.ts';

interface HeaderProps {
  activeView: string;
  setActiveView: (view: string) => void;
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  isSocketConnected: boolean;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  farmerUser: FarmerUser | null;
  officerUser: MandiOfficerUser | null;
  activeToken?: Token | null;
  userEmail?: string | null;
  onLogin: (role?: 'farmer' | 'officer') => void;
  onLogout: (role?: 'farmer' | 'officer') => void;
  onOpenMenusModal?: () => void;
  onOpenChatModal?: () => void;
  onOpenPrintGatePass?: () => void;
  isAudioGuideActive: boolean;
  toggleAudioGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  lang,
  setLang,
  isSocketConnected,
  userRole,
  setUserRole,
  farmerUser,
  officerUser,
  activeToken,
  userEmail,
  onLogin,
  onLogout,
  onOpenMenusModal,
  onOpenChatModal,
  onOpenPrintGatePass,
  isAudioGuideActive,
  toggleAudioGuide,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Navigation tabs accessible only after authentication (hidden before login)
  const navTabs = React.useMemo(() => {
    if (farmerUser) {
      return [
        { id: 'home', label: 'Home', icon: '🌾' },
        { id: 'farmer', label: 'Book Slot & Token', icon: '🚜' },
        { id: 'crop-registration', label: 'How to Register Crop', icon: '📝' },
        { id: 'farmer-essentials', label: 'Farmer Essentials (MSP & Docs)', icon: '🌾' },
        { id: 'cold-storage', label: 'Cold Storage', icon: '❄️' },
      ];
    }
    if (officerUser) {
      return [
        { id: 'home', label: 'Home', icon: '🏢' },
        { id: 'officer', label: 'Officer Desk', icon: '🏢' },
        { id: 'cold-storage', label: 'Cold Storage', icon: '❄️' },
      ];
    }
    // Before login: do not show any tabs above
    return [];
  }, [farmerUser, officerUser]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* Tiranga National Tricolor Stripe */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-[#FF9933]"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-[#138808]"></div>
      </div>

      {/* Top Government Masthead */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-amber-400 font-bold text-sm">🏛️</span>
            <span className="font-medium text-slate-200 tracking-tight">
              {t.ministry}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="tel:18001801551"
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1.5"
            >
              <Phone className="w-3 h-3" />
              <span>{t.helpline}</span>
            </a>

            <button
              onClick={toggleAudioGuide}
              className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                isAudioGuideActive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Voice Guide for announcements and status"
            >
              {isAudioGuideActive ? (
                <>
                  <Volume2 className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>Audio Voice ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3 h-3 text-slate-400" />
                  <span>Audio Voice OFF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Identity */}
          <button
            onClick={() => setActiveView('home')}
            className="flex items-center space-x-3 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white text-xl shadow-md group-hover:scale-105 transition-transform">
              🌾
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  {t.portal_title}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  Govt. of India
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                {t.portal_sub}
              </p>
            </div>
          </button>

          {/* Desktop & Tablet Navigation Links - only shown when authenticated */}
          {navTabs.length > 0 && (
            <nav className="hidden lg:flex items-center space-x-1 text-xs">
              {navTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`px-3 py-2 rounded-lg font-semibold transition-all flex items-center space-x-1.5 ${
                    activeView === tab.id
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          )}

          {/* Right Action Tools */}
          <div className="flex items-center space-x-2">
            {/* Language Selector Dropdown */}
            <div className="relative flex items-center">
              <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as LanguageCode)}
                className="text-xs font-medium py-1.5 pl-7 pr-4 rounded-lg border border-slate-300 bg-white hover:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                title="Select Regional Language"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.native} ({l.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Print Gate Pass Button - Only shown when farmer is authenticated with an active booked token */}
            {farmerUser && activeToken && onOpenPrintGatePass && (
              <button
                onClick={onOpenPrintGatePass}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-xs shadow-sm transition-all flex items-center space-x-1.5 border border-emerald-300 hover:border-emerald-500"
                title="Print Mandi Digital E-Gate Pass"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-800" />
                <span className="hidden md:inline">Print Gate Pass</span>
                <span className="md:hidden">Pass</span>
              </button>
            )}

            {/* Authenticated Farmer / Mandi Officer Identity Pill & Logout */}
            {farmerUser ? (
              <div className="hidden sm:flex items-center space-x-1.5">
                <div
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs select-none"
                  title={`Verified Farmer: ${farmerUser.fullName} (${farmerUser.district}, ${farmerUser.state})`}
                >
                  <span className="text-sm">🌾</span>
                  <div>
                    <div className="font-extrabold text-[11px] leading-tight truncate max-w-[110px]">
                      {farmerUser.fullName}
                    </div>
                    <div className="text-[9px] text-emerald-800 font-mono">
                      Aadhaar ••••{farmerUser.aadhaar.slice(-4)}
                    </div>
                  </div>
                </div>

                <button
                  id="header-logout-farmer-btn"
                  onClick={() => onLogout('farmer')}
                  className="p-1.5 sm:px-2 sm:py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center space-x-1 transition-colors"
                  title="Logout Farmer Profile"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline text-[11px]">Logout</span>
                </button>
              </div>
            ) : officerUser ? (
              <div className="hidden sm:flex items-center space-x-1.5">
                <div
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-300 text-blue-950 text-xs select-none"
                  title={`Mandi Terminal: ${officerUser.mandiName} (${officerUser.officerId})`}
                >
                  <span className="text-sm">🏢</span>
                  <div>
                    <div className="font-extrabold text-[11px] leading-tight truncate max-w-[110px]">
                      {officerUser.mandiOfficeCode}
                    </div>
                    <div className="text-[9px] text-blue-800 font-mono">
                      {officerUser.officerId}
                    </div>
                  </div>
                </div>

                <button
                  id="header-logout-officer-btn"
                  onClick={() => onLogout('officer')}
                  className="p-1.5 sm:px-2 sm:py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center space-x-1 transition-colors"
                  title="Logout Mandi Officer Terminal"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline text-[11px]">Logout</span>
                </button>
              </div>
            ) : null}

            {/* Mobile Menu Toggle Button - only shown when authenticated navigation tabs exist */}
            {navTabs.length > 0 && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer - only shown when authenticated navigation tabs exist */}
      {isMobileMenuOpen && navTabs.length > 0 && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
          <div className="space-y-1">
            {navTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveView(tab.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2 ${
                  activeView === tab.id
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            {farmerUser && activeToken && onOpenPrintGatePass && (
              <button
                onClick={() => {
                  onOpenPrintGatePass();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 text-emerald-950 hover:bg-emerald-100 font-bold text-xs flex items-center justify-center space-x-2 border border-emerald-300"
              >
                <Printer className="w-4 h-4 text-emerald-800" />
                <span>Print Official Mandi E-Gate Pass</span>
              </button>
            )}

            {farmerUser ? (
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                <div className="flex items-center space-x-2 truncate">
                  <span>🌾</span>
                  <div className="truncate">
                    <div className="font-bold text-emerald-950 truncate">{farmerUser.fullName}</div>
                    <div className="text-[10px] text-emerald-800 font-mono">Aadhaar ••••{farmerUser.aadhaar.slice(-4)}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onLogout('farmer');
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold text-xs flex items-center space-x-1 hover:bg-rose-200 flex-shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : officerUser ? (
              <div className="flex items-center justify-between p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs">
                <div className="flex items-center space-x-2 truncate">
                  <span>🏢</span>
                  <div className="truncate">
                    <div className="font-bold text-blue-950 truncate">{officerUser.mandiOfficeCode}</div>
                    <div className="text-[10px] text-blue-800 font-mono truncate">{officerUser.officerName}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onLogout('officer');
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold text-xs flex items-center space-x-1 hover:bg-rose-200 flex-shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
};
