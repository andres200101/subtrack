// Masonry Grid Component for Aurabilio
// Provides a beautiful, Pinterest-style layout for subscriptions

window.MasonryGrid = ({ subscriptions, trials, onEdit, onCancel, onDelete, onNegotiate, calculateMonthlyEquivalent, getDaysRemaining, formatDate, loading }) => {
    const { useState } = React;
    const [hoveredCard, setHoveredCard] = useState(null);
    const [viewMode, setViewMode] = useState('masonry'); // 'masonry' or 'list'

    // Color schemes for different categories
    const categoryColors = {
        'Streaming': { bg: 'from-purple-50 to-purple-100', border: 'border-purple-300', accent: 'text-purple-600', icon: '🎬' },
        'Software': { bg: 'from-blue-50 to-blue-100', border: 'border-blue-300', accent: 'text-blue-600', icon: '💻' },
        'Gaming': { bg: 'from-green-50 to-green-100', border: 'border-green-300', accent: 'text-green-600', icon: '🎮' },
        'Fitness': { bg: 'from-orange-50 to-orange-100', border: 'border-orange-300', accent: 'text-orange-600', icon: '💪' },
        'News': { bg: 'from-red-50 to-red-100', border: 'border-red-300', accent: 'text-red-600', icon: '📰' },
        'Music': { bg: 'from-pink-50 to-pink-100', border: 'border-pink-300', accent: 'text-pink-600', icon: '🎵' },
        'Cloud Storage': { bg: 'from-cyan-50 to-cyan-100', border: 'border-cyan-300', accent: 'text-cyan-600', icon: '☁️' },
        'Other': { bg: 'from-gray-50 to-gray-100', border: 'border-gray-300', accent: 'text-gray-600', icon: '📦' }
    };

    // Get color scheme for category
    const getCategoryStyle = (category) => {
        return categoryColors[category] || categoryColors['Other'];
    };

    // Calculate card height class based on content
    const getCardHeightClass = (sub) => {
        const hasDescription = sub.description && sub.description.length > 50;
        const hasNextBilling = sub.next_billing_date;
        const isTrial = sub.type === 'trial';
        
        if (isTrial) return 'h-80'; // Trials need more space
        if (hasDescription && hasNextBilling) return 'h-72';
        if (hasDescription || hasNextBilling) return 'h-64';
        return 'h-56'; // Base height
    };

    // Render subscription card
    const SubscriptionCard = ({ sub, index }) => {
        const categoryStyle = getCategoryStyle(sub.category);
        const monthlyCost = calculateMonthlyEquivalent(parseFloat(sub.cost), sub.billing_cycle);
        const yearlyCost = monthlyCost * 12;
        const isHovered = hoveredCard === sub.id;
        const isTrial = sub.type === 'trial';
        const daysLeft = isTrial ? getDaysRemaining(sub.trial_end_date) : null;

        return (
            <div
                className={`relative group ${getCardHeightClass(sub)} cursor-pointer`}
                onMouseEnter={() => setHoveredCard(sub.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ 
                    animationDelay: `${index * 50}ms`,
                    animation: 'fadeInUp 0.5s ease-out forwards',
                    opacity: 0
                }}
            >
                <div className={`h-full card-frosted bg-gradient-to-br ${categoryStyle.bg} rounded-2xl border-2 ${categoryStyle.border} overflow-hidden transition-all duration-300 ${
                    isHovered ? 'shadow-2xl scale-105 -translate-y-2' : 'shadow-md hover:shadow-xl'
                }`}>
                    {/* Trial Badge */}
                    {isTrial && (
                        <div className="absolute top-0 right-0 z-10">
                            <div className={`px-4 py-2 rounded-bl-2xl font-bold text-white text-sm ${
                                daysLeft <= 1 ? 'bg-red-600 animate-pulse' :
                                daysLeft <= 3 ? 'bg-orange-500' :
                                'bg-yellow-500'
                            }`}>
                                🎁 {daysLeft}d left
                            </div>
                        </div>
                    )}

                    {/* Category Icon */}
                    <div className="absolute top-4 left-4 text-4xl opacity-20">
                        {categoryStyle.icon}
                    </div>

                    {/* Content */}
                    <div className="relative h-full flex flex-col p-6">
                        {/* Header */}
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-primary-text mb-1 pr-20 line-clamp-2">
                                {sub.name}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 ${categoryStyle.accent} bg-white/50 text-xs rounded-full font-semibold`}>
                                    {sub.category}
                                </span>
                                {sub.billing_cycle === 'Yearly' && (
                                    <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-semibold">
                                        💰 Annual
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        {sub.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-3 flex-grow">
                                {sub.description}
                            </p>
                        )}

                        {/* Pricing */}
                        <div className="mt-auto">
                            <div className="flex items-end justify-between mb-3">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Cost</p>
                                    <p className="text-3xl font-black text-primary-text">
                                        ${sub.cost}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        per {sub.billing_cycle.toLowerCase()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 mb-1">Monthly</p>
                                    <p className={`text-lg font-bold ${categoryStyle.accent}`}>
                                        ${monthlyCost.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        ${yearlyCost.toFixed(0)}/year
                                    </p>
                                </div>
                            </div>

                            {/* Next Billing / Trial End */}
                            {isTrial ? (
                                <div className={`p-2 rounded-xl ${
                                    daysLeft <= 3 ? 'bg-red-100 border border-red-300' : 'bg-yellow-100 border border-yellow-300'
                                }`}>
                                    <p className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                        ⏰ Trial ends {formatDate(sub.trial_end_date)}
                                    </p>
                                </div>
                            ) : sub.next_billing_date && (
                                <div className="p-2 bg-white/50 rounded-xl border border-gray-200">
                                    <p className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                        📅 Next billing: {formatDate(sub.next_billing_date)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Hover Actions */}
                    <div className={`absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center gap-2 p-4 transition-all duration-300 ${
                        isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(sub);
                            }}
                            className="p-3 bg-white text-primary-deep rounded-xl hover:bg-gray-100 transition-colors"
                            title="Edit"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                            </svg>
                        </button>

                        {onNegotiate && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onNegotiate(sub);
                                }}
                                className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                                title="Negotiate"
                            >
                                ✨
                            </button>
                        )}

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onCancel(sub);
                            }}
                            className="p-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors"
                            title="Cancel"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(sub.id);
                            }}
                            className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                            title="Delete"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            {/* View Toggle */}
            <div className="flex items-center justify-end gap-2 mb-6">
                <button
                    onClick={() => setViewMode('masonry')}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                        viewMode === 'masonry'
                            ? 'gradient-primary text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    <svg className="inline-block w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7"/>
                        <rect x="14" y="3" width="7" height="7"/>
                        <rect x="14" y="14" width="7" height="7"/>
                        <rect x="3" y="14" width="7" height="7"/>
                    </svg>
                    Grid View
                </button>
                <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                        viewMode === 'list'
                            ? 'gradient-primary text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    <svg className="inline-block w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="8" y1="6" x2="21" y2="6"/>
                        <line x1="8" y1="12" x2="21" y2="12"/>
                        <line x1="8" y1="18" x2="21" y2="18"/>
                        <line x1="3" y1="6" x2="3.01" y2="6"/>
                        <line x1="3" y1="12" x2="3.01" y2="12"/>
                        <line x1="3" y1="18" x2="3.01" y2="18"/>
                    </svg>
                    List View
                </button>
                <button
                    onClick={() => setViewMode('timeline')}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                        viewMode === 'timeline'
                            ? 'gradient-primary text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    <svg className="inline-block w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    Timeline View
                </button>
            </div>

            {/* Masonry Grid */}
            {viewMode === 'masonry' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-min">
                    {/* Trials First */}
                    {trials.map((trial, index) => (
                        <SubscriptionCard key={trial.id} sub={trial} index={index} />
                    ))}
                    
                    {/* Regular Subscriptions */}
                    {subscriptions.filter(s => s.type !== 'trial').map((sub, index) => (
                        <SubscriptionCard key={sub.id} sub={sub} index={trials.length + index} />
                    ))}
                </div>
            ) : (
                /* List View */
                <div className="space-y-3">
                    {[...trials, ...subscriptions.filter(s => s.type !== 'trial')].map((sub, index) => {
                        const categoryStyle = getCategoryStyle(sub.category);
                        const monthlyCost = calculateMonthlyEquivalent(parseFloat(sub.cost), sub.billing_cycle);
                        const isTrial = sub.type === 'trial';
                        const daysLeft = isTrial ? getDaysRemaining(sub.trial_end_date) : null;

                        return (
                            <div 
                                key={sub.id}
                                className={`flex items-center justify-between p-4 card-frosted bg-gradient-to-r ${categoryStyle.bg} rounded-2xl border-2 ${categoryStyle.border} hover:shadow-lg transition-all`}
                                style={{ 
                                    animationDelay: `${index * 30}ms`,
                                    animation: 'fadeInUp 0.3s ease-out forwards',
                                    opacity: 0
                                }}
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="text-3xl">
                                        {categoryStyle.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-primary-text">{sub.name}</h3>
                                            <span className={`px-2 py-0.5 ${categoryStyle.accent} bg-white/50 text-xs rounded-full font-semibold`}>
                                                {sub.category}
                                            </span>
                                            {isTrial && (
                                                <span className={`px-2 py-0.5 text-white text-xs rounded-full font-semibold ${
                                                    daysLeft <= 1 ? 'bg-red-600 animate-pulse' :
                                                    daysLeft <= 3 ? 'bg-orange-500' :
                                                    'bg-yellow-500'
                                                }`}>
                                                    🎁 {daysLeft}d left
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-semibold">${sub.cost}</span> / {sub.billing_cycle}
                                            {sub.next_billing_date && ` • Next: ${formatDate(sub.next_billing_date)}`}
                                            {isTrial && ` • Ends: ${formatDate(sub.trial_end_date)}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right mr-4">
                                        <p className="text-xs text-gray-500">Monthly</p>
                                        <p className={`text-xl font-bold ${categoryStyle.accent}`}>
                                            ${monthlyCost.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onEdit(sub)}
                                            className="p-2 text-gray-600 hover:text-primary-deep hover:bg-white/50 rounded-xl transition-colors"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                                            </svg>
                                        </button>
                                        {onNegotiate && (
                                            <button
                                                onClick={() => onNegotiate(sub)}
                                                className="p-2 text-gray-600 hover:text-purple-600 hover:bg-white/50 rounded-xl transition-colors"
                                                title="Negotiate"
                                            >
                                                ✨
                                            </button>
                                        )}
                                        <button
                                            onClick={() => onCancel(sub)}
                                            className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-white/50 rounded-xl transition-colors"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="18" y1="6" x2="6" y2="18"/>
                                                <line x1="6" y1="6" x2="18" y2="18"/>
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => onDelete(sub.id)}
                                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-white/50 rounded-xl transition-colors"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="3 6 5 6 21 6"/>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};