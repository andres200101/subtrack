// ==============================================
// AURABILIO COMPLETE 3-COLUMN LAYOUT COMPONENT
// Sidebar | Main Content | Right Panel
// ==============================================

window.AurabilioLayout = ({ 
    children, 
    user, 
    totalMonthly, 
    totalYearly, 
    subscriptions, 
    trials, 
    monthlyBudget, 
    onNavigate, 
    currentView, 
    onLogout,
    isPro 
}) => {
    const { useState } = React;
    
    const [sidebarState, setSidebarState] = useState('full'); // 'full', 'collapsed', 'hidden'
    const [rightPanelOpen, setRightPanelOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

    // Calculate stats
    const activeCount = subscriptions.length;
    const trialsCount = trials.length;
    const urgentTrials = trials.filter(t => {
        const daysLeft = Math.ceil((new Date(t.trial_end_date) - new Date()) / (1000 * 60 * 60 * 24));
        return daysLeft <= 3;
    }).length;

    const budgetStatus = monthlyBudget ? {
        percentage: (totalMonthly / monthlyBudget) * 100,
        remaining: monthlyBudget - totalMonthly
    } : null;

    // Navigation sections
    const navSections = [
        {
            title: 'Core',
            items: [
                { id: 'dashboard', icon: '📊', label: 'Dashboard', badge: null },
                { id: 'subscriptions', icon: '💳', label: 'Subscriptions', badge: activeCount },
                { id: 'trials', icon: '🎁', label: 'Trials', badge: urgentTrials > 0 ? urgentTrials : null },
                { id: 'timeline', icon: '📅', label: 'Timeline', badge: null }
            ]
        },
        {
            title: 'Finance',
            items: [
                { id: 'budget', icon: '💰', label: 'Budget', badge: null },
                { id: 'analytics', icon: '📈', label: 'Analytics', badge: null }
            ]
        },
        {
            title: 'Tools',
            items: [
                { id: 'autopilot', icon: '🤖', label: 'Autopilot', badge: isPro ? '✨' : null },
                { id: 'sharing', icon: '👥', label: 'Sharing', badge: null }
            ]
        },
        {
            title: 'System',
            items: [
                { id: 'settings', icon: '⚙️', label: 'Settings', badge: null }
            ]
        }
    ];

    // Command Palette shortcut
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setCommandPaletteOpen(true);
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Toggle sidebar states
    const toggleSidebar = () => {
        const states = ['full', 'collapsed', 'hidden'];
        const currentIndex = states.indexOf(sidebarState);
        const nextIndex = (currentIndex + 1) % states.length;
        setSidebarState(states[nextIndex]);
    };

    return (
        <div className={`app-container sidebar-${sidebarState} ${!rightPanelOpen ? 'rightpanel-hidden' : ''}`}>
            {/* TOP BAR - Spans all 3 columns */}
            <header className="topbar">
                <div className="topbar-left">
                    <button 
                        className="topbar-button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        style={{ display: 'none' }}
                    >
                        ☰
                    </button>
                    
                    <a href="#" className="topbar-logo" onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }}>
                        <div className="topbar-logo-icon">🌀</div>
                        <div className="topbar-logo-text">
                            <span className="topbar-logo-title">Aurabilio</span>
                            <span className="topbar-logo-subtitle">Subscription Manager</span>
                        </div>
                    </a>
                </div>

                <div className="topbar-center">
                    {/* Command Palette Trigger */}
                    <button 
                        className="topbar-button"
                        onClick={() => setCommandPaletteOpen(true)}
                        title="Command Palette (⌘K)"
                    >
                        💬
                    </button>

                    {/* Search */}
                    <div className="topbar-search">
                        <span className="topbar-search-icon">🔍</span>
                        <input 
                            type="text" 
                            placeholder="Search subscriptions..."
                            onFocus={() => setCommandPaletteOpen(true)}
                        />
                    </div>

                    {/* Stats Rail */}
                    <div className="topbar-stats-rail">
                        <div className="topbar-stat">
                            <span className="topbar-stat-icon">💰</span>
                            <span>
                                <span className="topbar-stat-value">${totalMonthly.toFixed(0)}</span>
                                <span className="topbar-stat-change"> ▲4.2%</span>
                            </span>
                        </div>
                        <div className="topbar-stat">
                            <span className="topbar-stat-icon">💳</span>
                            <span className="topbar-stat-value">{activeCount}</span>
                        </div>
                        <div className="topbar-stat">
                            <span className="topbar-stat-icon">🎁</span>
                            <span className="topbar-stat-value">{trialsCount}</span>
                        </div>
                        {budgetStatus && (
                            <div className="topbar-stat">
                                <span className="topbar-stat-icon">📊</span>
                                <span className="topbar-stat-value">{budgetStatus.percentage.toFixed(0)}%</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="topbar-right">
                    <div className="topbar-actions">
                        <button className="topbar-button" title="Notifications">
                            🔔
                            {urgentTrials > 0 && (
                                <span className="topbar-button-badge">{urgentTrials}</span>
                            )}
                        </button>
                        
                        <button className="topbar-button" title="User Account">
                            👤
                        </button>
                    </div>
                </div>
            </header>

            {/* SIDEBAR - Left Column */}
            <aside className={`sidebar ${sidebarState} ${mobileMenuOpen ? 'show' : ''}`}>
                <div className="sidebar-logo">
                    <img src="/images/aurabilio.svg" alt="Aurabilio" />
                    <span className="sidebar-logo-text">Aurabilio</span>
                </div>

                <nav className="sidebar-nav">
                    {navSections.map((section, idx) => (
                        <div key={idx} className="nav-section">
                            <div className="nav-section-title">{section.title}</div>
                            {section.items.map(item => (
                                <div
                                    key={item.id}
                                    className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                                    onClick={() => {
                                        onNavigate(item.id);
                                        setMobileMenuOpen(false);
                                    }}
                                >
                                    <span className="nav-item-icon">{item.icon}</span>
                                    <span className="nav-item-label">{item.label}</span>
                                    {item.badge && (
                                        <span className="nav-item-badge">{item.badge}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-toggle" onClick={toggleSidebar}>
                    {sidebarState === 'full' && '< ▸'}
                    {sidebarState === 'collapsed' && '▸ >'}
                    {sidebarState === 'hidden' && '▸▸'}
                </div>
            </aside>

            {/* MAIN CONTENT - Center Column */}
            <main className="main-content">
                <div className="content-wrapper">
                    {children}
                </div>
            </main>

            {/* RIGHT PANEL - Right Column */}
            <aside className={`quick-stats ${!rightPanelOpen ? 'hidden' : ''}`}>
                <div className="quick-stats-header">
                    <h3 className="quick-stats-title">Quick Stats</h3>
                    <button 
                        className="quick-stats-collapse"
                        onClick={() => setRightPanelOpen(!rightPanelOpen)}
                    >
                        ›
                    </button>
                </div>

                {/* Monthly Spending */}
                <div className="stat-card">
                    <div className="stat-label">Monthly Spending</div>
                    <div className="stat-value">${totalMonthly.toFixed(2)}</div>
                    <div className="stat-change">↑ $234 from last month</div>
                </div>

                {/* Active Subscriptions */}
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)' }}>
                    <div className="stat-label">Active Subscriptions</div>
                    <div className="stat-value">{activeCount}</div>
                    {!isPro && activeCount >= 5 && (
                        <div className="stat-change" style={{ color: '#fbbf24' }}>⚠️ Free limit reached</div>
                    )}
                </div>

                {/* Budget Status */}
                {budgetStatus && (
                    <div className="stat-card" style={{ 
                        background: budgetStatus.percentage > 100 
                            ? 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)'
                            : 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
                    }}>
                        <div className="stat-label">Budget Status</div>
                        <div className="stat-value">{budgetStatus.percentage.toFixed(0)}%</div>
                        <div className="stat-change">
                            {budgetStatus.remaining >= 0 
                                ? `$${budgetStatus.remaining.toFixed(0)} remaining`
                                : `$${Math.abs(budgetStatus.remaining).toFixed(0)} over`
                            }
                        </div>
                    </div>
                )}

                {/* Urgent Trials */}
                {urgentTrials > 0 && (
                    <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' }}>
                        <div className="stat-label">⚠️ Urgent Trials</div>
                        <div className="stat-value">{urgentTrials}</div>
                        <div className="stat-change">Ending in 3 days or less!</div>
                    </div>
                )}

                {/* Quick Actions */}
                <div style={{ marginTop: 'var(--space-8)' }}>
                    <h4 style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-semibold)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: 'var(--text-secondary)',
                        marginBottom: 'var(--space-4)'
                    }}>
                        Quick Actions
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                            <span>➕</span> Add New
                        </button>
                        <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                            <span>📧</span> Scan Emails
                        </button>
                        <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                            <span>📊</span> Analytics
                        </button>
                    </div>
                </div>

                {/* Upcoming Bills */}
                <div style={{ marginTop: 'var(--space-8)' }}>
                    <h4 style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-semibold)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: 'var(--text-secondary)',
                        marginBottom: 'var(--space-4)'
                    }}>
                        Next 7 Days
                    </h4>
                    <div style={{ 
                        background: 'var(--glass-bg)',
                        backdropFilter: 'var(--glass-blur)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--radius-xl)',
                        padding: 'var(--space-4)',
                        fontSize: 'var(--text-sm)'
                    }}>
                        {subscriptions.slice(0, 5).map(sub => {
                            const nextDate = sub.next_billing_date || sub.trial_end_date;
                            if (!nextDate) return null;
                            
                            const daysUntil = Math.ceil((new Date(nextDate) - new Date()) / (1000 * 60 * 60 * 24));
                            if (daysUntil > 7) return null;
                            
                            return (
                                <div key={sub.id} style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    padding: 'var(--space-2) 0',
                                    borderBottom: '1px solid var(--gray-200)'
                                }}>
                                    <span style={{ fontWeight: 'var(--font-semibold)' }}>{sub.name}</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>
                                        {daysUntil === 0 ? 'Today' : `${daysUntil}d`}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </aside>

            {/* BOTTOM NAVIGATION - Mobile only */}
            <nav className="bottom-nav" style={{ display: 'none' }}>
                <a href="#" className={`bottom-nav-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }}>
                    <span className="bottom-nav-icon">📊</span>
                    <span>Dashboard</span>
                </a>
                <a href="#" className={`bottom-nav-item ${currentView === 'subscriptions' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onNavigate('subscriptions'); }}>
                    <span className="bottom-nav-icon">💳</span>
                    <span>Subs</span>
                </a>
                <a href="#" className={`bottom-nav-item ${currentView === 'trials' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onNavigate('trials'); }}>
                    <span className="bottom-nav-icon">🎁</span>
                    <span>Trials</span>
                </a>
                <a href="#" className={`bottom-nav-item ${currentView === 'settings' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onNavigate('settings'); }}>
                    <span className="bottom-nav-icon">⚙️</span>
                    <span>Settings</span>
                </a>
            </nav>

            {/* Command Palette */}
            {commandPaletteOpen && window.CommandPalette && (
                <window.CommandPalette
                    subscriptions={subscriptions}
                    onCommand={(cmd) => {
                        console.log('Command:', cmd);
                        setCommandPaletteOpen(false);
                    }}
                    onClose={() => setCommandPaletteOpen(false)}
                />
            )}

            {/* Mobile Menu Backdrop */}
            {mobileMenuOpen && (
                <div 
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 'var(--z-modal-backdrop)',
                        display: 'none'
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
        </div>
    );
};

// Make responsive adjustments via CSS
const style = document.createElement('style');
style.textContent = `
    @media (max-width: 768px) {
        .sidebar { display: none; }
        .bottom-nav { display: flex !important; }
        .sidebar.show { 
            display: flex !important; 
            position: fixed;
            left: 0;
            top: 60px;
            bottom: 64px;
            width: 260px;
            z-index: 50;
        }
        .topbar-button[title="User Account"] { display: flex !important; }
    }
`;
document.head.appendChild(style);