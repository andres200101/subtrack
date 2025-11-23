// ==============================================
// AURABILIO MAIN APP - app.js
// Clean, organized main application logic
// ==============================================

const { useState, useEffect } = React;

// Supabase Client Setup
const createSupabaseClient = (url, key) => {
    return {
        auth: {
            signUp: async ({ email, password }) => {
                const res = await fetch(`${url}/auth/v1/signup`, {
                    method: 'POST',
                    headers: { 'apikey': key, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                return { data, error: data.error ? data : null };
            },
            signInWithPassword: async ({ email, password }) => {
                const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
                    method: 'POST',
                    headers: { 'apikey': key, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                return { data, error: data.error ? data : null };
            },
            signOut: async (token) => {
                await fetch(`${url}/auth/v1/logout`, {
                    method: 'POST',
                    headers: { 'apikey': key, 'Authorization': `Bearer ${token}` }
                });
                return { error: null };
            },
            getSession: () => {
                const session = localStorage.getItem('supabase_session');
                return { data: { session: session ? JSON.parse(session) : null } };
            }
        },
        from: (table) => {
            const session = JSON.parse(localStorage.getItem('supabase_session') || '{}');
            const token = session.access_token;
            
            return {
                select: (columns = '*') => {
                    let queryUrl = `${url}/rest/v1/${table}?select=${columns}`;
                    
                    return {
                        eq: async (column, value) => {
                            const res = await fetch(`${queryUrl}&${column}=eq.${value}`, {
                                headers: {
                                    'apikey': key,
                                    'Authorization': `Bearer ${token}`
                                }
                            });
                            const data = await res.json();
                            return { data: Array.isArray(data) && data.length > 0 ? data : null, error: null };
                        },
                        then: async (resolve) => {
                            const res = await fetch(queryUrl, {
                                headers: {
                                    'apikey': key,
                                    'Authorization': `Bearer ${token}`
                                }
                            });
                            const data = await res.json();
                            resolve({ data, error: null });
                        }
                    };
                },
                insert: async (values) => {
                    const res = await fetch(`${url}/rest/v1/${table}`, {
                        method: 'POST',
                        headers: {
                            'apikey': key,
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=representation'
                        },
                        body: JSON.stringify(values)
                    });
                    const data = await res.json();
                    return { data, error: null };
                },
                update: (values) => ({
                    eq: async (column, value) => {
                        const res = await fetch(`${url}/rest/v1/${table}?${column}=eq.${value}`, {
                            method: 'PATCH',
                            headers: {
                                'apikey': key,
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                                'Prefer': 'return=representation'
                            },
                            body: JSON.stringify(values)
                        });
                        const data = await res.json();
                        return { data, error: null };
                    }
                }),
                delete: () => ({
                    eq: async (column, value) => {
                        await fetch(`${url}/rest/v1/${table}?${column}=eq.${value}`, {
                            method: 'DELETE',
                            headers: {
                                'apikey': key,
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        return { error: null };
                    }
                })
            };
        }
    };
};

// Main App Component
function AurabilioApp() {
    // Supabase State
    const [supabaseUrl, setSupabaseUrl] = useState('');
    const [supabaseKey, setSupabaseKey] = useState('');
    const [supabase, setSupabase] = useState(null);
    const [showConfig, setShowConfig] = useState(false);
    
    // Auth State
    const [user, setUser] = useState(null);
    const [isPro, setIsPro] = useState(false);
    const [authView, setAuthView] = useState('login');
    const [authLoading, setAuthLoading] = useState(false);
    const [authError, setAuthError] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Data State
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentView, setCurrentView] = useState('dashboard');

    // Initialize Supabase on mount
    useEffect(() => {
        const savedUrl = localStorage.getItem('supabase_url');
        const savedKey = localStorage.getItem('supabase_key');
        
        if (savedUrl && savedKey) {
            setSupabaseUrl(savedUrl);
            setSupabaseKey(savedKey);
            const client = createSupabaseClient(savedUrl, savedKey);
            setSupabase(client);
            
            const session = client.auth.getSession().data.session;
            if (session) {
                setUser(session.user);
                checkProStatus(session.user.id);
            }
        } else {
            setShowConfig(true);
        }
    }, []);

    // Load subscriptions when user changes
    useEffect(() => {
        if (user && supabase) {
            loadSubscriptions();
        }
    }, [user, supabase]);

    // Save Supabase config
    const saveConfig = () => {
        if (!supabaseUrl || !supabaseKey) {
            alert('Please enter both URL and Key');
            return;
        }
        
        localStorage.setItem('supabase_url', supabaseUrl);
        localStorage.setItem('supabase_key', supabaseKey);
        const client = createSupabaseClient(supabaseUrl, supabaseKey);
        setSupabase(client);
        setShowConfig(false);
    };

    // Check Pro Status
    const checkProStatus = (userId) => {
        const proStatus = localStorage.getItem(`pro_${userId}`);
        setIsPro(proStatus === 'true');
    };

    // Auth Handlers
    const handleSignUp = async (e) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthError('');

        if (!email || !password) {
            setAuthError('Please enter email and password');
            setAuthLoading(false);
            return;
        }

        if (password.length < 6) {
            setAuthError('Password must be at least 6 characters');
            setAuthLoading(false);
            return;
        }

        const { data, error } = await supabase.auth.signUp({ email, password });
        
        if (error) {
            setAuthError(error.message || 'Sign up failed');
            setAuthLoading(false);
            return;
        }

        if (data.user) {
            const session = { user: data.user, access_token: data.access_token };
            localStorage.setItem('supabase_session', JSON.stringify(session));
            setUser(data.user);
            setEmail('');
            setPassword('');
        }
        
        setAuthLoading(false);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthError('');

        if (!email || !password) {
            setAuthError('Please enter email and password');
            setAuthLoading(false);
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
            setAuthError(error.message || 'Login failed');
            setAuthLoading(false);
            return;
        }

        if (data.user && data.access_token) {
            const session = { user: data.user, access_token: data.access_token };
            localStorage.setItem('supabase_session', JSON.stringify(session));
            setUser(data.user);
            checkProStatus(data.user.id);
            setEmail('');
            setPassword('');
        }
        
        setAuthLoading(false);
    };

    const handleLogout = async () => {
        const session = supabase.auth.getSession().data.session;
        if (session) {
            await supabase.auth.signOut(session.access_token);
        }
        localStorage.removeItem('supabase_session');
        setUser(null);
        setSubscriptions([]);
        setIsPro(false);
    };

    // Load Subscriptions
    const loadSubscriptions = async () => {
        if (!supabase || !user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase.from('subscriptions').select('*');
            if (!error && data) {
                setSubscriptions(Array.isArray(data) ? data : []);
            } else {
                setSubscriptions([]);
            }
        } catch (err) {
            console.error('Load error:', err);
            setSubscriptions([]);
        }
        setLoading(false);
    };

    // Add Subscription Handler
    const handleAddSubscription = async (subData) => {
        if (!supabase || !user) return;
        setLoading(true);
        try {
            const newSub = {
                ...subData,
                user_id: user.id,
                created_at: new Date().toISOString()
            };
            const { data, error } = await supabase.from('subscriptions').insert([newSub]);
            if (!error) {
                await loadSubscriptions();
            }
        } catch (err) {
            console.error('Add subscription error:', err);
        }
        setLoading(false);
    };

    // Edit Subscription Handler
    const handleEditSubscription = async (id, subData) => {
        if (!supabase || !user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase.from('subscriptions').update(subData).eq('id', id);
            if (!error) {
                await loadSubscriptions();
            }
        } catch (err) {
            console.error('Edit subscription error:', err);
        }
        setLoading(false);
    };

    // Delete Subscription Handler
    const handleDeleteSubscription = async (id) => {
        if (!supabase || !user) return;
        if (!confirm('Are you sure you want to delete this subscription?')) return;
        setLoading(true);
        try {
            const { error } = await supabase.from('subscriptions').delete().eq('id', id);
            if (!error) {
                await loadSubscriptions();
            }
        } catch (err) {
            console.error('Delete subscription error:', err);
        }
        setLoading(false);
    };

    // Calculate totals
    const totalMonthly = subscriptions.reduce((sum, sub) => {
        return sum + (window.helpers?.calculateMonthlyEquivalent?.(parseFloat(sub.cost), sub.billing_cycle) || parseFloat(sub.cost));
    }, 0);
    const totalYearly = totalMonthly * 12;

    // Get trials
    const trials = subscriptions.filter(sub => sub.type === 'trial');

    // Render content based on current view
    const renderContent = () => {
        switch (currentView) {
            case 'dashboard':
                return window.UltimateDashboard ? (
                    <window.UltimateDashboard
                        user={user}
                        subscriptions={subscriptions}
                        trials={trials}
                        totalMonthly={totalMonthly}
                        totalYearly={totalYearly}
                        monthlyBudget={null}
                        cancelledSubscriptions={[]}
                        onNavigate={setCurrentView}
                        onAddNew={() => setCurrentView('subscriptions')}
                        onScanEmail={() => console.log('Open email scanner')}
                        onScanReceipt={() => console.log('Open receipt scanner')}
                        onConnectBank={() => console.log('Open bank integration')}
                        onEnableAutopilot={() => console.log('Open autopilot')}
                        onViewAnalytics={() => setCurrentView('analytics')}
                        onSetBudget={() => console.log('Open budget modal')}
                        onViewSharing={() => console.log('Open sharing')}
                        onUpgrade={() => console.log('Open upgrade modal')}
                        isPro={isPro}
                        calculateMonthlyEquivalent={window.helpers?.calculateMonthlyEquivalent}
                        getDaysRemaining={window.helpers?.getDaysRemaining}
                        formatDate={window.helpers?.formatDate}
                    />
                ) : (
                    <div className="space-y-6">
                        <div className="text-center py-8">
                            <h1 className="text-4xl font-black mb-4 text-tangaroa">Dashboard Overview</h1>
                            <p className="text-lynch mb-8">Track all your subscriptions in one place</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="card-frosted p-6 text-center">
                                <div className="text-5xl mb-4">💳</div>
                                <h3 className="font-bold text-xl mb-2 text-tangaroa">Active Subscriptions</h3>
                                <p className="text-3xl font-black gradient-text">{subscriptions.length}</p>
                            </div>
                            <div className="card-frosted p-6 text-center">
                                <div className="text-5xl mb-4">💰</div>
                                <h3 className="font-bold text-xl mb-2 text-tangaroa">Monthly Total</h3>
                                <p className="text-3xl font-black gradient-text">${totalMonthly.toFixed(2)}</p>
                            </div>
                            <div className="card-frosted p-6 text-center">
                                <div className="text-5xl mb-4">🎁</div>
                                <h3 className="font-bold text-xl mb-2 text-tangaroa">Active Trials</h3>
                                <p className="text-3xl font-black gradient-text">{trials.length}</p>
                            </div>
                        </div>

                        <div className="card-frosted p-6">
                            <h2 className="text-2xl font-bold mb-4 text-tangaroa">Recent Subscriptions</h2>
                            {subscriptions.length === 0 ? (
                                <p className="text-lynch text-center py-8">No subscriptions yet. Add your first one!</p>
                            ) : (
                                <div className="space-y-3">
                                    {subscriptions.slice(0, 5).map(sub => (
                                        <div key={sub.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                                            <div>
                                                <h3 className="font-bold text-tangaroa">{sub.name}</h3>
                                                <p className="text-sm text-lynch">{sub.billing_cycle}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-tangaroa">${parseFloat(sub.cost).toFixed(2)}</p>
                                                <p className="text-xs text-lynch">{sub.category}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'subscriptions':
                return window.SubscriptionsList ? (
                    <window.SubscriptionsList
                        subscriptions={subscriptions}
                        onAdd={handleAddSubscription}
                        onEdit={handleEditSubscription}
                        onDelete={handleDeleteSubscription}
                        loading={loading}
                    />
                ) : <div className="text-center py-16 text-lynch">Loading subscriptions component...</div>;

            case 'trials':
                return window.TrialsView ? (
                    <window.TrialsView
                        trials={trials}
                        onConvert={handleEditSubscription}
                        onDelete={handleDeleteSubscription}
                    />
                ) : <div className="text-center py-16 text-lynch">Loading trials component...</div>;

            case 'analytics':
                return window.AnalyticsView ? (
                    <window.AnalyticsView
                        subscriptions={subscriptions}
                        totalMonthly={totalMonthly}
                        totalYearly={totalYearly}
                    />
                ) : <div className="text-center py-16 text-lynch">Loading analytics component...</div>;

            case 'settings':
                return (
                    <div className="max-w-2xl mx-auto">
                        <div className="card-frosted p-8">
                            <h2 className="text-3xl font-black mb-6 text-tangaroa">Settings</h2>
                            
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold mb-3 text-tangaroa">Account Information</h3>
                                    <p className="text-lynch mb-2">Email: {user.email}</p>
                                    <p className="text-lynch">Status: {isPro ? '⭐ Pro User' : 'Free User'}</p>
                                </div>

                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="font-bold mb-3 text-tangaroa">Supabase Configuration</h3>
                                    <button
                                        onClick={() => setShowConfig(true)}
                                        className="btn btn-ghost"
                                    >
                                        Update Credentials
                                    </button>
                                </div>

                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="font-bold mb-3 text-tangaroa">Data Management</h3>
                                    <button
                                        onClick={loadSubscriptions}
                                        className="btn btn-ghost mr-3"
                                    >
                                        Refresh Data
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-bold mb-4 text-tangaroa">View not found</h2>
                        <button onClick={() => setCurrentView('dashboard')} className="btn btn-primary">
                            Go to Dashboard
                        </button>
                    </div>
                );
        }
    };

    // Config Modal
    if (showConfig) {
        return (
            <div className="min-h-screen bg-catskill-white flex items-center justify-center p-4">
                <div className="card-frosted rounded-2xl p-8 max-w-md w-full shadow-2xl">
                    <div className="flex justify-center mb-6">
                        <img src="/images/aurabilio.svg" alt="Aurabilio" style={{ height: '80px' }} />
                    </div>
                    <h2 className="text-2xl font-bold text-tangaroa mb-2 text-center">Setup Required</h2>
                    <p className="text-lynch mb-6 text-center">Enter your Supabase credentials</p>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-tangaroa mb-2">Supabase URL</label>
                            <input 
                                type="text" 
                                value={supabaseUrl}
                                onChange={(e) => setSupabaseUrl(e.target.value)}
                                placeholder="https://xxxxx.supabase.co"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-picton-blue focus:ring-2 focus:ring-picton-blue/20 outline-none"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-tangaroa mb-2">Supabase Anon Key</label>
                            <input 
                                type="text" 
                                value={supabaseKey}
                                onChange={(e) => setSupabaseKey(e.target.value)}
                                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-picton-blue focus:ring-2 focus:ring-picton-blue/20 outline-none"
                            />
                        </div>
                    </div>
                    
                    <button 
                        onClick={saveConfig}
                        className="w-full mt-6 btn btn-primary"
                    >
                        Save & Continue
                    </button>
                    
                    {user && (
                        <button 
                            onClick={() => setShowConfig(false)}
                            className="w-full mt-3 btn btn-ghost"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Auth Screen
    if (!user) {
        return (
            <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
                <div className="card-frosted rounded-2xl p-8 max-w-md w-full shadow-2xl">
                    <div className="flex justify-center mb-6">
                        <img src="/images/aurabilio.svg" alt="Aurabilio" style={{ height: '60px' }} />
                    </div>
                    <p className="text-center text-lynch mb-8">Take control of your subscriptions</p>

                    {authError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                            {authError}
                        </div>
                    )}

                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => { setAuthView('login'); setAuthError(''); }}
                            className={`flex-1 py-3 rounded-2xl font-semibold transition-all ${
                                authView === 'login'
                                    ? 'gradient-primary text-white'
                                    : 'bg-gray-100 text-gray-600'
                            }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => { setAuthView('signup'); setAuthError(''); }}
                            className={`flex-1 py-3 rounded-2xl font-semibold transition-all ${
                                authView === 'signup'
                                    ? 'gradient-primary text-white'
                                    : 'bg-gray-100 text-gray-600'
                            }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={authView === 'login' ? handleLogin : handleSignUp} className="space-y-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-picton-blue focus:ring-2 focus:ring-picton-blue/20 outline-none"
                            required
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-picton-blue focus:ring-2 focus:ring-picton-blue/20 outline-none"
                            required
                        />

                        <button
                            type="submit"
                            disabled={authLoading}
                            className="w-full btn btn-accent"
                        >
                            {authLoading ? 'Please wait...' : authView === 'login' ? 'Login' : 'Create Account'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Main App Layout
    return (
        <div className="min-h-screen bg-catskill-white">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img src="/images/aurabilio.svg" alt="Aurabilio" style={{ height: '40px' }} />
                            <div>
                                <h1 className="text-xl font-black text-tangaroa">Aurabilio</h1>
                                <p className="text-xs text-lynch">Subscription Manager</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-tangaroa">${totalMonthly.toFixed(2)}/mo</p>
                                <p className="text-xs text-lynch">${totalYearly.toFixed(2)}/year</p>
                            </div>
                            <button onClick={handleLogout} className="btn btn-ghost text-sm">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8 overflow-x-auto">
                        {['dashboard', 'subscriptions', 'trials', 'analytics', 'settings'].map(view => (
                            <button
                                key={view}
                                onClick={() => setCurrentView(view)}
                                className={`py-4 px-2 border-b-2 font-medium text-sm capitalize whitespace-nowrap ${
                                    currentView === view
                                        ? 'border-picton-blue text-picton-blue'
                                        : 'border-transparent text-lynch hover:text-tangaroa hover:border-gray-300'
                                }`}
                            >
                                {view}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading && currentView !== 'dashboard' ? (
                    <div className="text-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-picton-blue mx-auto"></div>
                        <p className="text-lynch mt-4">Loading...</p>
                    </div>
                ) : (
                    renderContent()
                )}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <p className="text-center text-lynch text-sm">
                        © 2024 Aurabilio. Manage your subscriptions with ease.
                    </p>
                </div>
            </footer>
        </div>
    );
}

// Render App
ReactDOM.render(<AurabilioApp />, document.getElementById('root'));