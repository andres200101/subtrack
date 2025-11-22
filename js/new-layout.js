// AURABILIO NEW LAYOUT COMPONENT
// Professional sidebar navigation with fixed stats panel

window.AurabilioLayout = ({ children, user, totalMonthly, totalYearly, subscriptions, trials, monthlyBudget, onNavigate, currentView, onLogout }) => {
    const { useState } = React;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

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

    // Navigation items
    const navSections = [
        {
            title: 'Overview',
            items: [
                { id: 'dashboard', icon: '📊', label: 'Dashboard', badge: null },
                { id: 'subscriptions', icon: '💳', label: 'Subscriptions', badge: activeCount },
                { id: 'trials', icon: '🎁', label: 'Free Trials', badge: urgentTrials > 0 ? urgentTrials : null },
                { id: 'timeline', icon: '📅', label: 'Timeline', badge: null }
            ]
        },
        {
            title: 'Manage',
            items: [
                { id: 'budget', icon: '💰', label: 'Budget', badge: null },
                { id: 'sharing', icon: '👥', label: 'Sharing', badge: null },
                { id: 'autopilot', icon: '🤖', label: 'Autopilot', badge: null },
                { id: 'analytics', icon: '📈', label: 'Analytics', badge: null }
            ]
        },
        {
            title: 'Tools',
            items: [
                { id: 'scan-email', icon: '📧', label: 'Scan Emails', badge: null },
                { id: 'scan-receipt', icon: '📸', label: 'Scan Receipt', badge: null },
                { id: 'bank', icon: '🏦', label: 'Connect Bank', badge: null },
                { id: 'negotiate', icon: '✨', label: 'AI Negotiate', badge: null }
            ]
        }
    ];

    return (
        <div className="app-container">
            {/* SIDEBAR */}
            <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                {/* Logo */}
                <div className="sidebar-logo">
                    <img src="/images/aurabilio.svg" alt="Aurabilio" />
                    <div className="sidebar-logo-text">Aurabilio</div>
                </div>

                {/* Navigation */}
                <div className="sidebar-nav">
                    {navSections.map((section, idx) => (
                        <div key={idx} className="nav-section">
                            <div className="nav-section-title">{section.title}</div>
                            {section.items.map(item => (
                                <div
                                    key={item.id}
                                    className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                                    onClick={() => onNavigate(item.id)}
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
                </div>

                {/* User Profile */}
                <div style={{
                    padding: 'var(--space-xl)',
                    borderTop: '1px solid rgba(153, 252, 250, 0.1)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-md)',
                        marginBottom: 'var(--space-md)'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--anakiwa) 0%, var(--astronaut) 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: 'var(--text-lg)'
                        }}>
                            {user?.email?.[0].toUpperCase() || 'U'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                color: 'white',
                                fontWeight: '600',
                                fontSize: 'var(--text-sm)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {user?.email?.split('@')[0] || 'User'}
                            </div>
                            <div style={{
                                color: 'var(--pigeon-post)',
                                fontSize: 'var(--text-xs)'
                            }}>
                                {user?.email || 'user@example.com'}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        style={{
                            width: '100%',
                            padding: 'var(--space-sm) var(--space-md)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: 'var(--radius-lg)',
                            color: '#ff6b6b',
                            fontWeight: '600',
                            fontSize: 'var(--text-sm)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 'var(--space-sm)'
                        }}
                    >
                        <span>🚪</span>
                        Logout
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="main-content">
                {/* TOP BAR */}
                <div className="topbar">
                    <div className="topbar-search">
                        <span className="topbar-search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search subscriptions... (Press '/' to focus)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="topbar-actions">
                        <button className="topbar-button" title="Command Palette (⌘K)">
                            ⚡
                        </button>
                        <button className="topbar-button" title="Notifications">
                            🔔
                            {urgentTrials > 0 && (
                                <span className="topbar-button-badge">{urgentTrials}</span>
                            )}
                        </button>
                        <button className="topbar-button" title="Settings">
                            ⚙️
                        </button>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="content-wrapper">
                    {children}
                </div>
            </div>

            {/* QUICK STATS PANEL */}
            <div className="quick-stats">
                <h3 style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: '700',
                    marginBottom: 'var(--space-xl)',
                    color: 'var(--text-primary)'
                }}>
                    Quick Stats
                </h3>

                {/* Monthly Spending */}
                <div className="stat-card">
                    <div className="stat-label">Monthly Spending</div>
                    <div className="stat-value">${totalMonthly.toFixed(2)}</div>
                    <div style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-secondary)',
                        marginTop: 'var(--space-xs)'
                    }}>
                        ${totalYearly.toFixed(2)}/year
                    </div>
                </div>

                {/* Budget Progress */}
                {budgetStatus && (
                    <div className="stat-card">
                        <div className="stat-label">Budget Status</div>
                        <div style={{
                            marginTop: 'var(--space-md)',
                            marginBottom: 'var(--space-sm)'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: 'var(--space-xs)',
                                fontSize: 'var(--text-sm)',
                                fontWeight: '600'
                            }}>
                                <span>{budgetStatus.percentage.toFixed(0)}% used</span>
                                <span style={{
                                    color: budgetStatus.remaining >= 0 ? 'var(--success)' : 'var(--danger)'
                                }}>
                                    ${Math.abs(budgetStatus.remaining).toFixed(2)} {budgetStatus.remaining >= 0 ? 'left' : 'over'}
                                </span>
                            </div>
                            <div style={{
                                height: '8px',
                                background: 'var(--surface-hover)',
                                borderRadius: 'var(--radius-full)',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    height: '100%',
                                    width: `${Math.min(budgetStatus.percentage, 100)}%`,
                                    background: budgetStatus.percentage > 100
                                        ? 'linear-gradient(90deg, var(--danger) 0%, #ff6b6b 100%)'
                                        : budgetStatus.percentage > 90
                                        ? 'linear-gradient(90deg, var(--warning) 0%, #fbbf24 100%)'
                                        : 'linear-gradient(90deg, var(--success) 0%, #34d399 100%)',
                                    transition: 'all 0.5s ease'
                                }}></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Active Subscriptions */}
                <div className="stat-card">
                    <div className="stat-label">Active Subs</div>
                    <div className="stat-value">{activeCount}</div>
                </div>

                {/* Trials Ending Soon */}
                {urgentTrials > 0 && (
                    <div className="stat-card" style={{
                        background: 'linear-gradient(135deg, #fee2e2 0%, #fef3c7 100%)',
                        border: '2px solid var(--danger)',
                        animation: 'pulse 2s infinite'
                    }}>
                        <div className="stat-label" style={{ color: 'var(--danger)' }}>
                            ⚠️ Urgent Trials
                        </div>
                        <div className="stat-value" style={{
                            background: 'linear-gradient(135deg, var(--danger) 0%, var(--warning) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            {urgentTrials}
                        </div>
                        <div style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--danger)',
                            marginTop: 'var(--space-xs)',
                            fontWeight: '600'
                        }}>
                            Ending in 3 days or less!
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div style={{ marginTop: 'var(--space-2xl)' }}>
                    <h4 style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: 'var(--text-secondary)',
                        marginBottom: 'var(--space-lg)'
                    }}>
                        Quick Actions
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                            <span>➕</span>
                            Add Subscription
                        </button>
                        <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                            <span>📧</span>
                            Scan Emails
                        </button>
                        <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                            <span>📊</span>
                            View Analytics
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};