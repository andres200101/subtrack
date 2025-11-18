// ==============================================
// BANK INTEGRATION MODULE - bank-integration.js
// ==============================================
// Add to index.html: <script type="text/babel" src="js/bank-integration.js"></script>

window.BankIntegrationComponent = function({ user, supabase, onSubscriptionsImported, onClose }) {
    const [linkToken, setLinkToken] = React.useState(null);
    const [accessToken, setAccessToken] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [analyzing, setAnalyzing] = React.useState(false);
    const [bankConnected, setBankConnected] = React.useState(false);
    const [detectedSubs, setDetectedSubs] = React.useState([]);
    const [bankName, setBankName] = React.useState('');

    // API Base URL - Change in production
    const API_URL = 'http://localhost:8000/api';

    React.useEffect(() => {
        createLinkToken();
    }, []);

    const createLinkToken = async () => {
        try {
            const response = await fetch(`${API_URL}/create_link_token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id })
            });
            const data = await response.json();
            setLinkToken(data.link_token);
        } catch (error) {
            console.error('Error creating link token:', error);
            alert('Failed to initialize bank connection. Please try again.');
        }
    };

    const openPlaidLink = () => {
        if (!linkToken) {
            alert('Initializing connection...');
            return;
        }

        const handler = window.Plaid.create({
            token: linkToken,
            onSuccess: async (public_token, metadata) => {
                console.log('Plaid Link success:', metadata);
                setBankName(metadata.institution.name);
                await exchangePublicToken(public_token);
            },
            onExit: (err, metadata) => {
                if (err != null) {
                    console.error('Plaid Link error:', err);
                    alert('Bank connection cancelled or failed. Please try again.');
                }
            },
        });
        handler.open();
    };

    const exchangePublicToken = async (public_token) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/exchange_public_token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ public_token })
            });
            const data = await response.json();
            
            setAccessToken(data.access_token);
            
            // Save bank connection to database
            await saveBankConnection(data.access_token, data.item_id);
            
            // Fetch and analyze transactions
            await fetchTransactions(data.access_token);
            
        } catch (error) {
            console.error('Error exchanging token:', error);
            alert('Failed to connect to bank. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const saveBankConnection = async (access_token, item_id) => {
        try {
            await supabase.from('bank_connections').insert({
                user_id: user.id,
                access_token: access_token, // In production, encrypt this!
                item_id: item_id,
                institution_name: bankName,
                status: 'active'
            });
        } catch (error) {
            console.error('Error saving bank connection:', error);
        }
    };

    const fetchTransactions = async (token) => {
        setAnalyzing(true);
        setBankConnected(true);
        
        try {
            const today = new Date();
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            
            const response = await fetch(`${API_URL}/transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    access_token: token,
                    start_date: threeMonthsAgo.toISOString().split('T')[0],
                    end_date: today.toISOString().split('T')[0]
                })
            });
            const data = await response.json();
            
            // Detect subscriptions
            const detectResponse = await fetch(`${API_URL}/detect_subscriptions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactions: data.transactions })
            });
            const detected = await detectResponse.json();
            
            setDetectedSubs(detected.detected_subscriptions || []);
            
        } catch (error) {
            console.error('Error analyzing transactions:', error);
            alert('Failed to analyze transactions. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    const importSubscription = async (bankSub) => {
        try {
            const subData = {
                name: bankSub.name,
                cost: bankSub.cost,
                billing_cycle: bankSub.billing_cycle,
                category: bankSub.category,
                next_billing_date: bankSub.next_billing_estimate,
                description: `Auto-detected from ${bankName} (${bankSub.transaction_count} transactions)`,
                status: 'active',
                type: 'subscription',
                user_id: user.id,
                source: 'bank_import',
                bank_confidence: bankSub.confidence,
                bank_transaction_count: bankSub.transaction_count
            };
            
            await supabase.from('subscriptions').insert(subData);
            
            // Remove from detected list
            setDetectedSubs(detectedSubs.filter(s => s.name !== bankSub.name));
            
            // Notify parent
            if (onSubscriptionsImported) {
                onSubscriptionsImported();
            }
            
            alert(`✅ ${bankSub.name} added to your subscriptions!`);
            
        } catch (error) {
            console.error('Error importing subscription:', error);
            alert('Failed to import subscription. Please try again.');
        }
    };

    const importAllSubscriptions = async () => {
        if (confirm(`Import all ${detectedSubs.length} subscriptions?`)) {
            for (const sub of detectedSubs) {
                await importSubscription(sub);
            }
            alert(`✅ Successfully imported ${detectedSubs.length} subscriptions!`);
        }
    };

    const ignoreSubscription = (subName) => {
        setDetectedSubs(detectedSubs.filter(s => s.name !== subName));
    };

    // Icons
    const CreditCard = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
    const Check = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>;
    const RefreshCw = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
    const X = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    const TrendingUp = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
    const AlertCircle = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
    const Zap = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
    const DollarSign = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[70]" onClick={onClose}>
            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                            🏦 Bank Integration
                        </h2>
                        <p className="text-gray-600">Connect your bank to automatically detect subscriptions</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Not Connected State */}
                {!bankConnected && (
                    <div>
                        <div className="text-center mb-8">
                            <div className="text-6xl mb-4">🔗</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Connect Your Bank Securely
                            </h3>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                We'll analyze your transaction history to automatically find all your subscriptions
                            </p>
                        </div>

                        {/* Benefits */}
                        <div className="grid md:grid-cols-3 gap-4 mb-8">
                            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="text-green-600" size={20} />
                                    <h4 className="font-bold text-green-900">Instant Detection</h4>
                                </div>
                                <p className="text-sm text-green-700">Find all subscriptions in seconds</p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="text-blue-600" size={20} />
                                    <h4 className="font-bold text-blue-900">Find Hidden Charges</h4>
                                </div>
                                <p className="text-sm text-blue-700">Discover forgotten subscriptions</p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="text-purple-600" size={20} />
                                    <h4 className="font-bold text-purple-900">Track Spending</h4>
                                </div>
                                <p className="text-sm text-purple-700">See exactly what you pay</p>
                            </div>
                        </div>

                        <div className="text-center">
                            <button
                                onClick={openPlaidLink}
                                disabled={!linkToken || loading}
                                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-xl transition-all font-bold text-lg disabled:opacity-50"
                            >
                                {loading ? 'Connecting...' : '🔗 Connect Bank Account'}
                            </button>
                            <p className="text-xs text-gray-500 mt-4">
                                🔒 Secured by Plaid - Bank-level encryption
                            </p>
                        </div>
                    </div>
                )}

                {/* Connected - Analyzing */}
                {bankConnected && analyzing && (
                    <div className="text-center py-12">
                        <div className="animate-spin mx-auto mb-4 w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            Analyzing Transactions...
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Using AI to detect recurring subscription patterns
                        </p>
                        <div className="max-w-md mx-auto space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <RefreshCw size={16} className="animate-spin text-blue-600" />
                                <span>Scanning last 3 months of transactions...</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <RefreshCw size={16} className="animate-spin text-blue-600" />
                                <span>Identifying recurring payment patterns...</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <RefreshCw size={16} className="animate-spin text-blue-600" />
                                <span>Categorizing subscriptions...</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Connected - Results */}
                {bankConnected && !analyzing && (
                    <div>
                        {/* Success Header */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 mb-6">
                            <div className="flex items-center gap-3 text-white">
                                <Check size={28} />
                                <div>
                                    <h3 className="text-xl font-bold">Bank Connected!</h3>
                                    <p className="text-white/90">{bankName} • Found {detectedSubs.length} subscription{detectedSubs.length !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                        </div>

                        {/* Detected Subscriptions */}
                        {detectedSubs.length > 0 ? (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        🎯 Detected Subscriptions
                                    </h3>
                                    <button
                                        onClick={importAllSubscriptions}
                                        className="px-4 py-2 gradient-orange text-white rounded-lg hover:shadow-lg transition-all font-semibold text-sm"
                                    >
                                        Import All
                                    </button>
                                </div>

                                <div className="space-y-3 mb-6">
                                    {detectedSubs.map((sub, idx) => (
                                        <div key={idx} className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="font-bold text-gray-900">{sub.name}</h4>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                            sub.confidence === 'high' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                            {sub.confidence}
                                                        </span>
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                                            {sub.category}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-6 text-sm">
                                                        <div>
                                                            <span className="text-gray-600">Cost: </span>
                                                            <span className="font-bold text-blue-600">${sub.cost}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Billing: </span>
                                                            <span className="font-semibold">{sub.billing_cycle}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Charges: </span>
                                                            <span className="font-semibold">{sub.transaction_count}x</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => importSubscription(sub)}
                                                    className="flex-1 px-4 py-2 gradient-blue text-white rounded-lg hover:shadow-lg transition-all font-semibold text-sm"
                                                >
                                                    ✓ Import
                                                </button>
                                                <button
                                                    onClick={() => ignoreSubscription(sub.name)}
                                                    className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm"
                                                >
                                                    Ignore
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Summary */}
                                <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                                    <h4 className="font-bold text-orange-900 mb-1">💰 Total Monthly Impact</h4>
                                    <p className="text-2xl font-black text-orange-600">
                                        ${detectedSubs.reduce((sum, sub) => sum + parseFloat(sub.cost), 0).toFixed(2)}/month
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🎉</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    No Subscriptions Found
                                </h3>
                                <p className="text-gray-600">
                                    We didn't detect any recurring charges in your recent transactions.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Make it available globally
window.BankIntegration = window.BankIntegrationComponent;