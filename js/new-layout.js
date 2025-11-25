// ==============================================
// AURABILIO POLISHED 3-COLUMN LAYOUT - REFINED
// Right panel as overlay drawer (CRITICAL FIX)
// Compact banners, yearly total, unified styling
// ==============================================

window.AurabilioLayout = ({ 
    children, 
    user, 
    totalMonthly = 0, 
    totalYearly = 0, 
    subscriptions = [], 
    trials = [], 
    monthlyBudget, 
    onNavigate, 
    currentView, 
    onLogout,
    isPro 
}) => {
    const { useState, useEffect } = React;
    
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem('aurabilio_sidebar_collapsed');
        return saved === 'true';
    });
    
    // RIGHT PANEL NOW USES OVERLAY STATE (NOT COLLAPSED)
    const [rightPanelOpen, setRightPanelOpen] = useState(false);
    
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('aurabilio_sidebar_collapsed', sidebarCollapsed);
    }, [sidebarCollapsed]);

    // Close right panel on ESC key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && rightPanelOpen) {
                setRightPanelOpen(false);
            }
        };
        
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [rightPanelOpen]);

    // Calculate stats
    const monthlyChange = 234;
    const changePercent = 4.2;
    const activeCount = subscriptions.length;
    const trialsCount = trials.length;
    const urgentTrials = trials.filter(t => {
        const daysLeft = Math.ceil((new Date(t.trial_end_date) - new Date()) / (1000 * 60 * 60 * 24));
        return daysLeft <= 3 && daysLeft >= 0;
    }).length;

    const budgetPercent = monthlyBudget ? Math.round((totalMonthly / monthlyBudget) * 100) : null;

    // SVG Icons
    const ChevronLeft = ({ size = 20 }) => (
        React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
            React.createElement('polyline', { points: '15 18 9 12 15 6' })
        )
    );

    const ChevronRight = ({ size = 20 }) => (
        React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
            React.createElement('polyline', { points: '9 18 15 12 9 6' })
        )
    );

    const Menu = ({ size = 24 }) => (
        React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
            React.createElement('line', { x1: 3, y1: 12, x2: 21, y2: 12 }),
            React.createElement('line', { x1: 3, y1: 6, x2: 21, y2: 6 }),
            React.createElement('line', { x1: 3, y1: 18, x2: 21, y2: 18 })
        )
    );

    const X = ({ size = 24 }) => (
        React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
            React.createElement('line', { x1: 18, y1: 6, x2: 6, y2: 18 }),
            React.createElement('line', { x1: 6, y1: 6, x2: 18, y2: 18 })
        )
    );

    const Bell = ({ size = 20 }) => (
        React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
            React.createElement('path', { d: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' }),
            React.createElement('path', { d: 'M13.73 21a2 2 0 0 1-3.46 0' })
        )
    );

    const User = ({ size = 20 }) => (
        React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
            React.createElement('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
            React.createElement('circle', { cx: 12, cy: 7, r: 4 })
        )
    );

    const BarChart = ({ size = 20 }) => (
        React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
            React.createElement('line', { x1: 12, y1: 20, x2: 12, y2: 10 }),
            React.createElement('line', { x1: 18, y1: 20, x2: 18, y2: 4 }),
            React.createElement('line', { x1: 6, y1: 20, x2: 6, y2: 16 })
        )
    );

    // Navigation
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
        },
        {
            title: 'SYSTEM',
            items: [
                { id: 'settings', icon: '⚙️', label: 'Settings' }
            ]
        }
    ];

    return React.createElement('div', { 
        className: 'h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden' 
    },
        // Styles
        React.createElement('style', null, `
            .sidebar-transition { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
            .hover-glow:hover { box-shadow: 0 0 20px rgba(76, 52, 245, 0.3); }
            
            /* Right panel overlay styles */
            .quick-stats {
                position: fixed;
                right: 0;
                top: 64px;
                bottom: 0;
                width: 320px;
                background: white;
                border-left: 1px solid #e2e8f0;
                padding: 24px;
                overflow-y: auto;
                z-index: 45;
                transform: translateX(100%);
                transition: transform 180ms cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.08);
            }
            
            .quick-stats.show {
                transform: translateX(0);
            }
            
            .rightpanel-backdrop {
                position: fixed;
                inset: 0;
                top: 64px;
                background: rgba(0, 0, 0, 0.4);
                z-index: 44;
                display: none;
                animation: fadeIn 0.2s ease-out;
            }
            
            .rightpanel-backdrop.show {
                display: block;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
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
                .quick-stats {
                    display: none;
                }
                .rightpanel-backdrop {
                    display: none !important;
                }
            }
        `),

        // RIGHT PANEL BACKDROP
        rightPanelOpen && React.createElement('div', {
            className: 'rightpanel-backdrop show',
            onClick: () => setRightPanelOpen(false)
        }),

        // TOP BAR
        React.createElement('header', { 
            className: 'h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-6 z-50 shadow-sm' 
        },
            React.createElement('div', { className: 'flex items-center gap-4' },
                React.createElement('button', {
                    onClick: () => setMobileMenuOpen(!mobileMenuOpen),
                    className: 'lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors'
                }, mobileMenuOpen ? React.createElement(X, { size: 24 }) : React.createElement(Menu, { size: 24 })),
                
                React.createElement('div', { 
                    className: 'flex items-center gap-3 cursor-pointer',
                    onClick: () => onNavigate('dashboard')
                },
                    React.createElement('div', { className: 'w-10 h-10 bg-gradient-to-br from-indigo-900 to-blue-800 rounded-xl flex items-center justify-center text-xl shadow-lg' }, '🌀'),
                    React.createElement('div', { className: 'hidden sm:block' },
                        React.createElement('div', { className: 'font-black text-lg text-indigo-950' }, 'Aurabilio'),
                        React.createElement('div', { className: 'text-xs text-slate-600 font-semibold' }, 'Subscription Manager')
                    )
                )
            ),

            // Stats Rail with YEARLY TOTAL
            React.createElement('div', { className: 'stats-rail hidden md:flex items-center gap-4 px-6 py-2 bg-indigo-50/80 rounded-full border border-indigo-100' },
                React.createElement('div', { className: 'flex items-center gap-2' },
                    React.createElement('span', { className: 'text-lg' }, '💰'),
                    React.createElement('div', { className: 'flex items-baseline gap-1' },
                        React.createElement('span', { className: 'font-black text-indigo-950' }, `$${totalMonthly.toFixed(0)}`),
                        React.createElement('span', { className: 'text-xs text-green-600 font-bold' }, `▲${changePercent}%`)
                    )
                ),
                React.createElement('div', { className: 'w-px h-6 bg-indigo-200' }),
                React.createElement('div', { className: 'flex items-center gap-2' },
                    React.createElement('span', { className: 'text-lg' }, '💳'),
                    React.createElement('span', { className: 'font-black text-indigo-950' }, activeCount)
                ),
                React.createElement('div', { className: 'w-px h-6 bg-indigo-200' }),
                React.createElement('div', { className: 'flex items-center gap-2' },
                    React.createElement('span', { className: 'text-lg' }, '🎁'),
                    React.createElement('span', { className: 'font-black text-indigo-950' }, trialsCount)
                ),
                // NEW: YEARLY TOTAL
                React.createElement('div', { className: 'w-px h-6 bg-indigo-200' }),
                React.createElement('div', { className: 'flex items-center gap-2' },
                    React.createElement('span', { className: 'text-sm text-slate-600' }, 'Yearly:'),
                    React.createElement('span', { className: 'font-black text-indigo-950 text-sm' }, 
                        `$${totalYearly.toFixed(0)}`
                    )
                )
            ),

            React.createElement('div', { className: 'flex items-center gap-2' },
                React.createElement('button', { 
                    className: 'relative p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600',
                    onClick: () => setRightPanelOpen(!rightPanelOpen),
                    title: 'Quick Stats'
                },
                    React.createElement(BarChart, { size: 20 })
                ),
                React.createElement('button', { className: 'relative p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600' },
                    React.createElement(Bell, { size: 20 }),
                    urgentTrials > 0 && React.createElement('span', { className: 'absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center' }, urgentTrials)
                ),
                React.createElement('button', { onClick: onLogout, className: 'p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600' }, React.createElement(User, { size: 20 }))
            )
        ),

        // MAIN LAYOUT
        React.createElement('div', { className: 'flex-1 flex overflow-hidden' },
            // SIDEBAR
            React.createElement('aside', {
                className: `sidebar-transition bg-gradient-to-b from-indigo-950 to-blue-900 flex-col border-r border-indigo-800/30 hidden lg:flex ${sidebarCollapsed ? 'w-20' : 'w-64'}`
            },
                React.createElement('nav', { className: 'flex-1 overflow-y-auto py-6 px-3 space-y-6' },
                    navSections.map((section, idx) =>
                        React.createElement('div', { key: idx },
                            !sidebarCollapsed && React.createElement('div', { className: 'px-3 mb-2 text-xs font-bold text-indigo-300/60 tracking-wider' }, section.title),
                            React.createElement('div', { className: 'space-y-1' },
                                section.items.map(item =>
                                    React.createElement('button', {
                                        key: item.id,
                                        onClick: () => onNavigate(item.id),
                                        className: `w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all relative group ${currentView === item.id ? 'bg-cyan-400/20 text-white' : 'text-indigo-200 hover:bg-white/10 hover:text-white'}`,
                                        title: sidebarCollapsed ? item.label : ''
                                    },
                                        currentView === item.id && React.createElement('div', { className: 'absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r-full' }),
                                        React.createElement('span', { className: 'text-xl flex-shrink-0' }, item.icon),
                                        !sidebarCollapsed && React.createElement(React.Fragment, null,
                                            React.createElement('span', { className: 'font-semibold text-sm flex-1 text-left' }, item.label),
                                            item.badge > 0 && React.createElement('span', { className: 'px-2 py-0.5 bg-cyan-400 text-indigo-950 rounded-full text-xs font-bold' }, item.badge)
                                        )
                                    )
                                )
                            )
                        )
                    )
                ),

                React.createElement('div', { className: 'p-4 border-t border-indigo-800/30' },
                    React.createElement('button', {
                        onClick: () => setSidebarCollapsed(!sidebarCollapsed),
                        className: 'w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white font-semibold',
                        title: sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
                    },
                        sidebarCollapsed ? React.createElement(ChevronRight, { size: 20 }) : React.createElement(React.Fragment, null,
                            React.createElement(ChevronLeft, { size: 20 }),
                            React.createElement('span', { className: 'text-sm' }, 'Collapse')
                        )
                    )
                )
            ),

            // MAIN CONTENT
            React.createElement('main', { className: 'flex-1 overflow-y-auto' },
                React.createElement('div', { className: 'max-w-7xl mx-auto p-6 lg:p-8' }, children)
            ),

            // RIGHT PANEL - OVERLAY DRAWER
            React.createElement('aside', {
                className: `quick-stats ${rightPanelOpen ? 'show' : ''}`
            },
                React.createElement('div', { className: 'flex items-center justify-between mb-6' },
                    React.createElement('h3', { className: 'font-bold text-indigo-950' }, 'Quick Stats'),
                    React.createElement('button', {
                        onClick: () => setRightPanelOpen(false),
                        className: 'p-1.5 hover:bg-slate-100 rounded-lg transition-colors',
                        title: 'Close panel'
                    }, React.createElement(X, { size: 18 }))
                ),

                React.createElement('div', { className: 'space-y-4' },
                    // Monthly Total Card
                    React.createElement('div', { 
                        className: 'relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 hover:shadow-lg transition-all group' 
                    },
                        React.createElement('div', { className: 'absolute top-0 right-0 text-6xl opacity-5 transform group-hover:scale-110 transition-transform' }, '💰'),
                        React.createElement('div', { className: 'relative' },
                            React.createElement('p', { className: 'text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2' }, 'Monthly Total'),
                            React.createElement('p', { className: 'text-4xl font-black bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent mb-2' }, `$${totalMonthly.toFixed(2)}`),
                            React.createElement('div', { className: 'flex items-center gap-2 text-sm mb-2' },
                                React.createElement('span', { className: 'text-green-600 font-bold' }, `↑ $${monthlyChange}`),
                                React.createElement('span', { className: 'text-slate-500' }, 'from last month')
                            ),
                            React.createElement('div', { className: 'text-sm text-indigo-600 font-semibold' }, `$${totalYearly.toFixed(2)}/year`)
                        )
                    ),

                    // Active Subs Card
                    React.createElement('div', { 
                        className: 'relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 hover:shadow-lg transition-all group' 
                    },
                        React.createElement('div', { className: 'absolute top-0 right-0 text-6xl opacity-5 transform group-hover:scale-110 transition-transform' }, '💳'),
                        React.createElement('div', { className: 'relative' },
                            React.createElement('p', { className: 'text-xs font-bold uppercase tracking-wider text-blue-600 mb-2' }, 'Active Subscriptions'),
                            React.createElement('p', { className: 'text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent' }, activeCount),
                            !isPro && activeCount >= 5 && React.createElement('p', { className: 'text-xs text-orange-600 font-semibold mt-2' }, '⚠️ Free limit reached')
                        )
                    ),

                    // Budget Card (if set)
                    budgetPercent && React.createElement('div', { 
                        className: `relative overflow-hidden rounded-2xl p-6 border hover:shadow-lg transition-all group ${budgetPercent > 100 ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'}` 
                    },
                        React.createElement('div', { className: 'absolute top-0 right-0 text-6xl opacity-5 transform group-hover:scale-110 transition-transform' }, '📊'),
                        React.createElement('div', { className: 'relative' },
                            React.createElement('p', { className: `text-xs font-bold uppercase tracking-wider mb-2 ${budgetPercent > 100 ? 'text-red-600' : 'text-green-600'}` }, 'Budget Status'),
                            React.createElement('p', { className: `text-4xl font-black ${budgetPercent > 100 ? 'text-red-600' : 'text-green-600'}` }, `${budgetPercent}%`),
                            React.createElement('p', { className: `text-sm font-semibold mt-2 ${budgetPercent > 100 ? 'text-red-700' : 'text-green-700'}` }, 
                                budgetPercent > 100 ? `$${(totalMonthly - monthlyBudget).toFixed(2)} over budget` : `$${(monthlyBudget - totalMonthly).toFixed(2)} remaining`
                            )
                        )
                    ),

                    // Quick Actions
                    React.createElement('div', { className: 'space-y-2 pt-4' },
                        React.createElement('p', { className: 'text-xs font-bold uppercase tracking-wider text-slate-600 mb-3' }, 'Quick Actions'),
                        React.createElement('button', { 
                            className: 'w-full p-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 group' 
                        },
                            React.createElement('span', { className: 'text-xl' }, '📧'),
                            React.createElement('span', null, 'Scan Emails'),
                            React.createElement('span', { className: 'text-xs opacity-90' }, 'Auto-detect')
                        ),
                        React.createElement('button', { className: 'w-full p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2' }, 
                            '➕ Add New'
                        ),
                        React.createElement('button', { className: 'w-full p-3 bg-white border-2 border-slate-200 hover:border-indigo-300 text-slate-700 rounded-xl font-bold transition-all flex items-center justify-center gap-2' }, 
                            '📊 Analytics'
                        )
                    ),

                    // Last Updated Timestamp
                    React.createElement('div', { className: 'pt-4 text-center' },
                        React.createElement('p', { className: 'text-xs text-slate-500' },
                            'Last synced: ',
                            React.createElement('span', { className: 'font-semibold text-slate-700' }, '2 minutes ago'),
                            ' ',
                            React.createElement('span', { className: 'cursor-pointer hover:text-indigo-600' }, '↻')
                        )
                    )
                )
            )
        ),

        // Mobile Menu
        mobileMenuOpen && React.createElement(React.Fragment, null,
            React.createElement('div', { className: 'mobile-menu-overlay lg:hidden', onClick: () => setMobileMenuOpen(false) }),
            React.createElement('div', { className: `mobile-sidebar lg:hidden bg-gradient-to-b from-indigo-950 to-blue-900 ${mobileMenuOpen ? 'open' : ''}` },
                React.createElement('nav', { className: 'p-6 space-y-6' },
                    navSections.map((section, idx) =>
                        React.createElement('div', { key: idx },
                            React.createElement('div', { className: 'px-3 mb-2 text-xs font-bold text-indigo-300/60 tracking-wider' }, section.title),
                            React.createElement('div', { className: 'space-y-1' },
                                section.items.map(item =>
                                    React.createElement('button', {
                                        key: item.id,
                                        onClick: () => { onNavigate(item.id); setMobileMenuOpen(false); },
                                        className: `w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${currentView === item.id ? 'bg-cyan-400/20 text-white' : 'text-indigo-200 hover:bg-white/10'}`
                                    },
                                        React.createElement('span', { className: 'text-xl' }, item.icon),
                                        React.createElement('span', { className: 'font-semibold text-sm' }, item.label),
                                        item.badge > 0 && React.createElement('span', { className: 'px-2 py-0.5 bg-cyan-400 text-indigo-950 rounded-full text-xs font-bold ml-auto' }, item.badge)
                                    )
                                )
                            )
                        )
                    )
                )
            )
        )
    );
};