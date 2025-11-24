import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Menu, X, Bell, User, Search } from 'lucide-react';

const AurabilioEnhancedLayout = ({ 
    user, 
    subscriptions = [], 
    trials = [], 
    totalMonthly = 0, 
    totalYearly = 0,
    monthlyBudget,
    onNavigate,
    currentView,
    onLogout,
    isPro,
    children 
}) => {
    // Load saved state from localStorage
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem('aurabilio_sidebar_collapsed');
        return saved === 'true';
    });
    
    const [rightPanelCollapsed, setRightPanelCollapsed] = useState(() => {
        const saved = localStorage.getItem('aurabilio_rightpanel_collapsed');
        return saved === 'true';
    });
    
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Save state changes
    useEffect(() => {
        localStorage.setItem('aurabilio_sidebar_collapsed', sidebarCollapsed);
    }, [sidebarCollapsed]);

    useEffect(() => {
        localStorage.setItem('aurabilio_rightpanel_collapsed', rightPanelCollapsed);
    }, [rightPanelCollapsed]);

    // Calculate stats
    const monthlyChange = 234;
    const changePercent = 4.2;
    const activeCount = subscriptions.length;
    const trialsCount = trials.length;
    const urgentTrials = trials.filter(t => {
        const daysLeft = Math.ceil((new Date(t.trial_end_date) - new Date()) / (1000 * 60 * 60 * 24));
        return daysLeft <= 3 && daysLeft >= 0;
    }).length;

    // Navigation sections
    const navSections = [
        {
            title: 'CORE',
            items: [
                { id: 'dashboard', icon: '📊', label: 'Dashboard' },
                { id: 'subscriptions', icon: '💳', label: 'Subscriptions', badge: activeCount },
                { id: 'trials', icon: '🎁', label: 'Trials', badge: trialsCount },
                { id: 'timeline', icon: '📅', label: 'Timeline' }
            ]
        },
        {
            title: 'FINANCE',
            items: [
                { id: 'budget', icon: '💰', label: 'Budget' },
                { id: 'analytics', icon: '📈', label: 'Analytics' }
            ]
        }
    ];

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
            <style>{`
                .sidebar-transition {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .hover-glow:hover {
                    box-shadow: 0 0 20px rgba(153, 252, 250, 0.3);
                }

                @media (max-width: 1024px) {
                    .stats-rail { display: none !important; }
                }

                @media (max-width: 768px) {
                    .mobile-menu-overlay {
                        position: fixed;
                        inset: 0;
                        background: rgba(0, 0, 0, 0.5);
                        z-index: 40;
                    }
                    .mobile-sidebar {
                        position: fixed;
                        left: 0;
                        top: 64px;
                        bottom: 0;
                        width: 260px;
                        z-index: 50;
                        transform: translateX(-100%);
                        transition: transform 0.3s ease;
                    }
                    .mobile-sidebar.open {
                        transform: translateX(0);
                    }
                }
            `}</style>

            {/* TOP BAR */}
            <header className="h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-6 z-50 shadow-sm">
                {/* Left: Logo + Mobile Menu */}
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-900 to-blue-800 rounded-xl flex items-center justify-center text-xl shadow-lg">
                            🌀
                        </div>
                        <div className="hidden sm:block">
                            <div className="font-black text-lg text-indigo-950">Aurabilio</div>
                            <div className="text-xs text-slate-600 font-semibold">Subscription Manager</div>
                        </div>
                    </div>
                </div>

                {/* Center: Consolidated Stats Rail */}
                <div className="stats-rail hidden md:flex items-center gap-4 px-6 py-2 bg-indigo-50/80 rounded-full border border-indigo-100">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">💰</span>
                        <div className="flex items-baseline gap-1">
                            <span className="font-black text-indigo-950">${totalMonthly.toFixed(0)}</span>
                            <span className="text-xs text-green-600 font-bold">↓{changePercent}%</span>
                        </div>
                    </div>
                    
                    <div className="w-px h-6 bg-indigo-200"></div>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-lg">💳</span>
                        <span className="font-black text-indigo-950">{activeCount}</span>
                    </div>
                    
                    <div className="w-px h-6 bg-indigo-200"></div>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-lg">🎁</span>
                        <span className="font-black text-indigo-950">{trialsCount}</span>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
                        <Bell size={20} />
                        {urgentTrials > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {urgentTrials}
                            </span>
                        )}
                    </button>
                    <button 
                        onClick={onLogout}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
                    >
                        <User size={20} />
                    </button>
                </div>
            </header>

            {/* MAIN LAYOUT */}
            <div className="flex-1 flex overflow-hidden">
                {/* LEFT SIDEBAR */}
                <aside 
                    className={`sidebar-transition bg-gradient-to-b from-indigo-950 to-blue-900 flex-col border-r border-indigo-800/30 hidden lg:flex ${
                        sidebarCollapsed ? 'w-20' : 'w-64'
                    }`}
                >
                    {/* Nav Items */}
                    <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
                        {navSections.map((section, idx) => (
                            <div key={idx}>
                                {!sidebarCollapsed && (
                                    <div className="px-3 mb-2 text-xs font-bold text-indigo-300/60 tracking-wider">
                                        {section.title}
                                    </div>
                                )}
                                <div className="space-y-1">
                                    {section.items.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => onNavigate(item.id)}
                                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all relative group ${
                                                currentView === item.id
                                                    ? 'bg-cyan-400/20 text-white'
                                                    : 'text-indigo-200 hover:bg-white/10 hover:text-white'
                                            }`}
                                            title={sidebarCollapsed ? item.label : ''}
                                        >
                                            {currentView === item.id && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r-full"></div>
                                            )}
                                            <span className="text-xl flex-shrink-0">{item.icon}</span>
                                            {!sidebarCollapsed && (
                                                <>
                                                    <span className="font-semibold text-sm flex-1 text-left">{item.label}</span>
                                                    {item.badge > 0 && (
                                                        <span className="px-2 py-0.5 bg-cyan-400 text-indigo-950 rounded-full text-xs font-bold">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>

                    {/* Collapse Toggle */}
                    <div className="p-4 border-t border-indigo-800/30">
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white font-semibold"
                            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            {sidebarCollapsed ? (
                                <ChevronRight size={20} />
                            ) : (
                                <>
                                    <ChevronLeft size={20} />
                                    <span className="text-sm">Collapse</span>
                                </>
                            )}
                        </button>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto p-6 lg:p-8">
                        {children}
                    </div>
                </main>

                {/* RIGHT PANEL */}
                <aside 
                    className={`sidebar-transition bg-white border-l border-slate-200 flex-col hidden xl:flex ${
                        rightPanelCollapsed ? 'w-0 opacity-0' : 'w-80'
                    }`}
                >
                    {!rightPanelCollapsed && (
                        <>
                            {/* Header */}
                            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                                <h3 className="font-bold text-indigo-950">Quick Stats</h3>
                                <button
                                    onClick={() => setRightPanelCollapsed(true)}
                                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                                    title="Collapse panel"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {/* Monthly Total - 20% Lighter */}
                                <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 hover:shadow-md transition-shadow">
                                    <div className="absolute top-0 right-0 text-6xl opacity-5">💰</div>
                                    <div className="relative">
                                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
                                            Monthly Total
                                        </p>
                                        <p className="text-4xl font-black bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent mb-2">
                                            ${totalMonthly.toFixed(2)}
                                        </p>
                                        <div className="flex items-center gap-2 text-sm mb-2">
                                            <span className="text-green-600 font-bold">↓ ${monthlyChange}</span>
                                            <span className="text-slate-500">from last month</span>
                                        </div>
                                        <div className="text-sm text-indigo-600">
                                            ${totalYearly.toFixed(2)}/year
                                        </div>
                                    </div>
                                </div>

                                {/* Active Subscriptions */}
                                <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 hover:shadow-md transition-shadow">
                                    <div className="absolute top-0 right-0 text-6xl opacity-5">💳</div>
                                    <div className="relative">
                                        <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
                                            Active Subscriptions
                                        </p>
                                        <p className="text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                            {activeCount}
                                        </p>
                                    </div>
                                </div>

                                {/* Quick Actions - Scan Emails Prominent */}
                                <div className="space-y-2 pt-4">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                                        Quick Actions
                                    </p>
                                    
                                    {/* Scan Emails - PROMOTED */}
                                    <button className="w-full p-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 group">
                                        <span className="text-xl">📧</span>
                                        <span>Scan Emails</span>
                                        <span className="text-xs opacity-80 group-hover:opacity-100">Auto-detect</span>
                                    </button>
                                    
                                    <button className="w-full p-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                        ➕ Add New
                                    </button>
                                    
                                    <button className="w-full p-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                        📊 Analytics
                                    </button>
                                </div>

                                {/* Next 7 Days - Enhanced Empty State */}
                                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                                    <p className="text-xs font-bold uppercase tracking-wider text-green-700 mb-3">
                                        Next 7 Days
                                    </p>
                                    <div className="text-center py-4">
                                        <p className="text-3xl mb-2">🎉</p>
                                        <p className="font-bold text-green-800 mb-1">
                                            No upcoming charges
                                        </p>
                                        <p className="text-sm text-green-600">
                                            You're all set!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </aside>

                {/* Right Panel Expand Button */}
                {rightPanelCollapsed && (
                    <button
                        onClick={() => setRightPanelCollapsed(false)}
                        className="hidden xl:flex items-center justify-center w-8 bg-white border-l border-slate-200 hover:bg-slate-50 transition-colors"
                        title="Expand panel"
                    >
                        <ChevronLeft size={18} className="text-slate-600" />
                    </button>
                )}
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <>
                    <div className="mobile-menu-overlay lg:hidden" onClick={() => setMobileMenuOpen(false)} />
                    <div className={`mobile-sidebar lg:hidden bg-gradient-to-b from-indigo-950 to-blue-900 ${mobileMenuOpen ? 'open' : ''}`}>
                        <nav className="p-6 space-y-6">
                            {navSections.map((section, idx) => (
                                <div key={idx}>
                                    <div className="px-3 mb-2 text-xs font-bold text-indigo-300/60 tracking-wider">
                                        {section.title}
                                    </div>
                                    <div className="space-y-1">
                                        {section.items.map(item => (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    onNavigate(item.id);
                                                    setMobileMenuOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                                                    currentView === item.id
                                                        ? 'bg-cyan-400/20 text-white'
                                                        : 'text-indigo-200 hover:bg-white/10'
                                                }`}
                                            >
                                                <span className="text-xl">{item.icon}</span>
                                                <span className="font-semibold text-sm">{item.label}</span>
                                                {item.badge > 0 && (
                                                    <span className="px-2 py-0.5 bg-cyan-400 text-indigo-950 rounded-full text-xs font-bold ml-auto">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </nav>
                    </div>
                </>
            )}
        </div>
    );
};

window.AurabilioLayout = AurabilioEnhancedLayout;

export default AurabilioEnhancedLayout;