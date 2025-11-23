// ==============================================
// ENHANCED SUBSCRIPTION CARDS V2
// Premium fintech design with logos, colors, and microinteractions
// ==============================================

const { useState } = React;

window.SubscriptionsList = function SubscriptionsList({ subscriptions, onAdd, onEdit, onDelete, loading }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingSub, setEditingSub] = useState(null);
    const [hoveredCard, setHoveredCard] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        cost: '',
        billing_cycle: 'Monthly',
        category: 'Streaming',
        type: 'subscription',
        next_billing_date: '',
        description: ''
    });

    const categories = ['Streaming', 'Software', 'Gaming', 'Fitness', 'News', 'Music', 'Cloud Storage', 'Other'];
    const billingCycles = ['Weekly', 'Monthly', 'Quarterly', 'Yearly'];

    // Service branding (logos and colors)
    const serviceBranding = {
        'Netflix': { color: '#E50914', logo: '🔴', pattern: 'diagonal-lines' },
        'Spotify': { color: '#1DB954', logo: '🟢', pattern: 'dots' },
        'Hulu': { color: '#1CE783', logo: '🟩', pattern: 'diagonal-lines' },
        'Disney+': { color: '#113CCF', logo: '🔵', pattern: 'stars' },
        'Disney Plus': { color: '#113CCF', logo: '🔵', pattern: 'stars' },
        'Amazon Prime': { color: '#00A8E1', logo: '🟦', pattern: 'diagonal-lines' },
        'YouTube Premium': { color: '#FF0000', logo: '▶️', pattern: 'dots' },
        'HBO Max': { color: '#7D26CD', logo: '🟣', pattern: 'diagonal-lines' },
        'Apple': { color: '#000000', logo: '🍎', pattern: 'dots' },
        'Adobe': { color: '#FF0000', logo: '🔴', pattern: 'diagonal-lines' },
        'Microsoft': { color: '#00A4EF', logo: '🟦', pattern: 'windows' },
        'Google': { color: '#4285F4', logo: '🔵', pattern: 'dots' },
        'Dropbox': { color: '#0061FF', logo: '📦', pattern: 'dots' },
        'Zoom': { color: '#2D8CFF', logo: '📹', pattern: 'diagonal-lines' }
    };

    const getBranding = (name) => {
        return serviceBranding[name] || { color: '#6366f1', logo: '📦', pattern: 'dots' };
    };

    // Calculate days until next billing
    const getDaysUntil = (date) => {
        if (!date) return null;
        const now = new Date();
        const billing = new Date(date);
        const diff = Math.ceil((billing - now) / (1000 * 60 * 60 * 24));
        return Math.max(0, diff);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.cost) {
            alert('Please fill in name and cost');
            return;
        }

        const subData = {
            name: formData.name,
            cost: parseFloat(formData.cost),
            billing_cycle: formData.billing_cycle,
            category: formData.category,
            type: formData.type,
            next_billing_date: formData.next_billing_date || null,
            description: formData.description || ''
        };

        if (editingSub) {
            await onEdit(editingSub.id, subData);
            setEditingSub(null);
        } else {
            await onAdd(subData);
        }

        resetForm();
        setShowAddModal(false);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            cost: '',
            billing_cycle: 'Monthly',
            category: 'Streaming',
            type: 'subscription',
            next_billing_date: '',
            description: ''
        });
    };

    const handleEdit = (sub) => {
        setEditingSub(sub);
        setFormData({
            name: sub.name,
            cost: sub.cost.toString(),
            billing_cycle: sub.billing_cycle,
            category: sub.category,
            type: sub.type,
            next_billing_date: sub.next_billing_date || '',
            description: sub.description || ''
        });
        setShowAddModal(true);
    };

    const handleCancelEdit = () => {
        setEditingSub(null);
        resetForm();
        setShowAddModal(false);
    };

    return (
        <div className="space-y-6">
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes countdownPulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                .pattern-diagonal-lines {
                    background-image: repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 10px,
                        rgba(255, 255, 255, 0.05) 10px,
                        rgba(255, 255, 255, 0.05) 20px
                    );
                }
                .pattern-dots {
                    background-image: radial-gradient(
                        rgba(255, 255, 255, 0.1) 1px,
                        transparent 1px
                    );
                    background-size: 20px 20px;
                }
                .pattern-stars {
                    background-image: 
                        radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 1px, transparent 1px),
                        radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 1px, transparent 1px);
                    background-size: 30px 30px;
                }
                .hover-lift-card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .hover-lift-card:hover {
                    transform: translateY(-8px) scale(1.02);
                    box-shadow: 0 20px 60px rgba(0, 9, 82, 0.15);
                }
            `}</style>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-[#03093b]">My Subscriptions</h1>
                    <p className="text-xl text-[#6f7d9e] mt-2">{subscriptions.length} active subscriptions</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-4 bg-gradient-to-r from-[#000952] to-[#2f4080] text-white rounded-2xl font-bold hover:shadow-2xl transition-all transform hover:scale-105 flex items-center gap-2"
                >
                    <span className="text-2xl">➕</span>
                    Add Subscription
                </button>
            </div>

            {/* Subscriptions Grid */}
            {loading ? (
                <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#99fcfa] border-t-[#000952] mx-auto"></div>
                    <p className="text-[#6f7d9e] mt-4 text-lg">Loading subscriptions...</p>
                </div>
            ) : subscriptions.length === 0 ? (
                <div className="rounded-3xl p-16 text-center"
                     style={{
                         background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(247,251,251,0.95) 100%)',
                         backdropFilter: 'blur(20px)',
                         border: '1px solid rgba(0, 9, 82, 0.1)',
                         boxShadow: '0 4px 24px rgba(0, 9, 82, 0.06)'
                     }}>
                    <div className="text-8xl mb-6">💳</div>
                    <h3 className="text-3xl font-black text-[#03093b] mb-3">No subscriptions yet</h3>
                    <p className="text-xl text-[#6f7d9e] mb-8">Start tracking your subscriptions to take control of your spending</p>
                    <button 
                        onClick={() => setShowAddModal(true)} 
                        className="px-8 py-4 bg-gradient-to-r from-[#99fcfa] to-[#6de6e4] text-[#000952] rounded-2xl font-black text-lg hover:shadow-2xl transition-all transform hover:scale-105"
                    >
                        Add Your First Subscription
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subscriptions.map((sub, index) => {
                        const monthlyEquivalent = window.helpers?.calculateMonthlyEquivalent?.(
                            parseFloat(sub.cost), 
                            sub.billing_cycle
                        ) || parseFloat(sub.cost);
                        const branding = getBranding(sub.name);
                        const daysUntil = getDaysUntil(sub.next_billing_date);
                        const isHovered = hoveredCard === sub.id;

                        return (
                            <div 
                                key={sub.id}
                                className="relative hover-lift-card rounded-3xl overflow-hidden"
                                style={{
                                    animationDelay: `${index * 80}ms`,
                                    animation: 'fadeInUp 0.6s ease-out forwards',
                                    opacity: 0,
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(247,251,251,0.95) 100%)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(0, 9, 82, 0.1)',
                                    boxShadow: '0 4px 24px rgba(0, 9, 82, 0.06)'
                                }}
                                onMouseEnter={() => setHoveredCard(sub.id)}
                                onMouseLeave={() => setHoveredCard(null)}
                            >
                                {/* Branded Header with Pattern */}
                                <div 
                                    className={`p-6 pattern-${branding.pattern} relative overflow-hidden`}
                                    style={{ backgroundColor: branding.color }}
                                >
                                    <div className="absolute top-0 right-0 text-9xl opacity-10">{branding.logo}</div>
                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="text-2xl font-black text-white mb-2 drop-shadow-lg">
                                                    {sub.name}
                                                </h3>
                                                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full font-semibold">
                                                    {sub.category}
                                                </span>
                                            </div>
                                            <div className="text-5xl transform transition-transform duration-300" style={{
                                                transform: isHovered ? 'rotate(10deg) scale(1.2)' : 'rotate(0) scale(1)'
                                            }}>
                                                {branding.logo}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    {/* Price Display */}
                                    <div className="mb-4">
                                        <div className="flex items-baseline justify-between mb-2">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider text-[#b8bfd9] mb-1">Cost</p>
                                                <p className="text-4xl font-black" style={{
                                                    background: 'linear-gradient(135deg, #000952 0%, #99fcfa 100%)',
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent'
                                                }}>
                                                    ${parseFloat(sub.cost).toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-[#b8bfd9] mb-1">per {sub.billing_cycle.toLowerCase()}</p>
                                                {sub.billing_cycle !== 'Monthly' && (
                                                    <p className="text-sm font-bold text-[#2f4080]">
                                                        ${monthlyEquivalent.toFixed(2)}/mo
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Yearly Cost */}
                                        <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                                            <p className="text-xs text-[#6f7d9e] flex items-center justify-between">
                                                <span className="font-semibold">Yearly impact:</span>
                                                <span className="font-black text-[#000952]">${(monthlyEquivalent * 12).toFixed(0)}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Next Billing with Countdown */}
                                    {sub.next_billing_date && (
                                        <div className="mb-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl border-2 border-gray-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-xs font-bold uppercase tracking-wider text-[#6f7d9e]">Next Billing</p>
                                                {daysUntil !== null && daysUntil <= 7 && (
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                        daysUntil <= 3 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-yellow-100 text-yellow-700'
                                                    }`} style={daysUntil <= 3 ? {animation: 'countdownPulse 1s infinite'} : {}}>
                                                        {daysUntil === 0 ? 'TODAY!' : `${daysUntil}d`}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm font-bold text-[#03093b]">
                                                📅 {window.helpers?.formatDate?.(sub.next_billing_date) || sub.next_billing_date}
                                            </p>
                                            {daysUntil !== null && (
                                                <p className="text-xs text-[#6f7d9e] mt-1">
                                                    {daysUntil === 0 ? 'Charges today' : 
                                                     daysUntil === 1 ? 'Charges tomorrow' :
                                                     `In ${daysUntil} days`}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Description */}
                                    {sub.description && (
                                        <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                                            <p className="text-sm text-[#6f7d9e] line-clamp-2">{sub.description}</p>
                                        </div>
                                    )}

                                    {/* Action Buttons - Hover to reveal */}
                                    <div className={`grid grid-cols-3 gap-2 transition-all duration-300 ${
                                        isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                                    }`}>
                                        <button
                                            onClick={() => handleEdit(sub)}
                                            className="p-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-colors font-semibold text-sm flex items-center justify-center gap-1"
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => {/* Negotiate handler */}}
                                            className="p-3 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl transition-colors font-semibold text-sm flex items-center justify-center gap-1"
                                            title="Negotiate Price"
                                        >
                                            ✨
                                        </button>
                                        <button
                                            onClick={() => onDelete(sub.id)}
                                            className="p-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors font-semibold text-sm flex items-center justify-center gap-1"
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>

                                    {/* Always visible edit/delete for mobile */}
                                    <div className={`flex gap-2 mt-3 md:hidden`}>
                                        <button
                                            onClick={() => handleEdit(sub)}
                                            className="flex-1 px-4 py-2 bg-white border-2 border-gray-300 text-[#03093b] rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => onDelete(sub.id)}
                                            className="flex-1 px-4 py-2 bg-white border-2 border-red-300 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-50 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Modal - Enhanced */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-[fadeIn_0.2s_ease-out]">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-[slideUp_0.3s_ease-out]"
                         style={{
                             border: '1px solid rgba(153, 252, 250, 0.3)',
                             boxShadow: '0 25px 50px rgba(0, 9, 82, 0.25)'
                         }}>
                        <h2 className="text-3xl font-black text-[#03093b] mb-6">
                            {editingSub ? '✏️ Edit Subscription' : '➕ Add New Subscription'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-[#03093b] mb-2">
                                    Service Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Netflix, Spotify, etc."
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#99fcfa] focus:ring-4 focus:ring-[#99fcfa]/20 outline-none transition-all"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-[#03093b] mb-2">
                                        Cost *
                                    </label>
                                    <input
                                        type="number"
                                        name="cost"
                                        value={formData.cost}
                                        onChange={handleInputChange}
                                        placeholder="9.99"
                                        step="0.01"
                                        min="0"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#99fcfa] focus:ring-4 focus:ring-[#99fcfa]/20 outline-none transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#03093b] mb-2">
                                        Billing Cycle
                                    </label>
                                    <select
                                        name="billing_cycle"
                                        value={formData.billing_cycle}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#99fcfa] focus:ring-4 focus:ring-[#99fcfa]/20 outline-none transition-all"
                                    >
                                        {billingCycles.map(cycle => (
                                            <option key={cycle} value={cycle}>{cycle}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#03093b] mb-2">
                                    Category
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#99fcfa] focus:ring-4 focus:ring-[#99fcfa]/20 outline-none transition-all"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#03093b] mb-2">
                                    Next Billing Date
                                </label>
                                <input
                                    type="date"
                                    name="next_billing_date"
                                    value={formData.next_billing_date}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#99fcfa] focus:ring-4 focus:ring-[#99fcfa]/20 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#03093b] mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Add any notes..."
                                    rows="3"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#99fcfa] focus:ring-4 focus:ring-[#99fcfa]/20 outline-none resize-none transition-all"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-[#03093b] rounded-xl font-bold hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#000952] to-[#2f4080] text-white rounded-xl font-bold hover:shadow-2xl transition-all transform hover:scale-105"
                                >
                                    {editingSub ? 'Update' : 'Add'} Subscription
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};