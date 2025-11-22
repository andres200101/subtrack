// Masonry Grid Layout Component for Aurabilio
// Makes subscription cards flow like Pinterest/Masonry style

window.MasonryGrid = ({ children, columns = 3, gap = 16, className = '' }) => {
    const [columnHeights, setColumnHeights] = React.useState([]);
    const containerRef = React.useRef(null);
    
    React.useEffect(() => {
        // Initialize column heights
        setColumnHeights(new Array(columns).fill(0));
    }, [columns]);
    
    const getColumnStyle = (index) => {
        if (!columnHeights.length) return {};
        
        // Find shortest column
        const minHeight = Math.min(...columnHeights);
        const columnIndex = columnHeights.indexOf(minHeight);
        
        return {
            gridColumn: columnIndex + 1,
            gridRow: 'auto'
        };
    };
    
    return (
        <div 
            ref={containerRef}
            className={`masonry-grid ${className}`}
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: `${gap}px`,
                gridAutoRows: 'auto',
                alignItems: 'start'
            }}
        >
            {children}
        </div>
    );
};

// Enhanced Subscription Card with animations
window.MasonrySubscriptionCard = ({ 
    subscription, 
    onEdit, 
    onCancel, 
    onDelete,
    onNegotiate,
    onVirtualCard,
    calculateMonthlyEquivalent,
    formatDate,
    getPriceHistory,
    index 
}) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);
    
    const monthlyCost = calculateMonthlyEquivalent(parseFloat(subscription.cost), subscription.billing_cycle);
    const yearlyCost = monthlyCost * 12;
    const priceHistory = getPriceHistory ? getPriceHistory(subscription) : [];
    const hasRecentIncrease = priceHistory.length > 0 && priceHistory[priceHistory.length - 1]?.change_amount > 0;
    
    // Generate unique gradient for each card
    const gradients = [
        'from-blue-50 to-cyan-50 border-blue-200',
        'from-purple-50 to-pink-50 border-purple-200',
        'from-green-50 to-emerald-50 border-green-200',
        'from-orange-50 to-yellow-50 border-orange-200',
        'from-red-50 to-pink-50 border-red-200',
        'from-indigo-50 to-purple-50 border-indigo-200',
        'from-teal-50 to-cyan-50 border-teal-200',
        'from-rose-50 to-pink-50 border-rose-200'
    ];
    
    const cardGradient = gradients[index % gradients.length];
    
    // Category colors
    const categoryColors = {
        'Streaming': 'bg-purple-100 text-purple-700 border-purple-300',
        'Software': 'bg-blue-100 text-blue-700 border-blue-300',
        'Gaming': 'bg-green-100 text-green-700 border-green-300',
        'Fitness': 'bg-red-100 text-red-700 border-red-300',
        'News': 'bg-orange-100 text-orange-700 border-orange-300',
        'Music': 'bg-pink-100 text-pink-700 border-pink-300',
        'Cloud Storage': 'bg-cyan-100 text-cyan-700 border-cyan-300',
        'Other': 'bg-gray-100 text-gray-700 border-gray-300'
    };
    
    return (
        <div 
            className={`bg-gradient-to-br ${cardGradient} rounded-2xl border-2 overflow-hidden hover-lift transition-all duration-300 ${
                isHovered ? 'shadow-2xl scale-105' : 'shadow-md'
            }`}
            style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Header */}
            <div className="p-5 border-b-2 border-white/50 bg-white/30 backdrop-blur-sm">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-primary-text mb-2 leading-tight">
                            {subscription.name}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${categoryColors[subscription.category] || categoryColors['Other']}`}>
                                {subscription.category}
                            </span>
                            {hasRecentIncrease && (
                                <span className="px-3 py-1 bg-red-100 text-red-700 border-2 border-red-300 rounded-full text-xs font-bold animate-pulse">
                                    📈 Price Up!
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Cost Display */}
                <div className="bg-white/60 rounded-xl p-4 mb-3 border-2 border-white/80">
                    <div className="flex items-baseline justify-between mb-1">
                        <span className="text-2xl font-black text-primary-deep">
                            ${subscription.cost}
                        </span>
                        <span className="text-sm text-gray-600 font-semibold">
                            / {subscription.billing_cycle}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>${monthlyCost.toFixed(2)}/month</span>
                        <span>${yearlyCost.toFixed(0)}/year</span>
                    </div>
                </div>
                
                {subscription.next_billing_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/40 rounded-lg px-3 py-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <span className="font-medium">Next: {formatDate(subscription.next_billing_date)}</span>
                    </div>
                )}
            </div>
            
            {/* Expandable Details */}
            <div className="p-4">
                {subscription.description && (
                    <p className="text-sm text-gray-700 mb-3 bg-white/40 rounded-lg p-3">
                        {subscription.description}
                    </p>
                )}
                
                {/* Price History Preview */}
                {priceHistory.length > 0 && (
                    <div className="mb-3 bg-white/40 rounded-lg p-3">
                        <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-semibold text-gray-700">Price History</span>
                            <span className="text-gray-600">{priceHistory.length} changes</span>
                        </div>
                        <div className="h-12 flex items-end gap-1">
                            {priceHistory.slice(-5).map((change, idx) => {
                                const isIncrease = change.change_amount > 0;
                                const height = Math.abs(change.change_percentage) * 2;
                                return (
                                    <div 
                                        key={idx}
                                        className={`flex-1 ${isIncrease ? 'bg-red-400' : 'bg-green-400'} rounded-t`}
                                        style={{ height: `${Math.min(height, 100)}%` }}
                                        title={`${isIncrease ? '+' : ''}$${change.change_amount.toFixed(2)}`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
                
                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={() => onEdit(subscription)}
                        className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-colors flex items-center justify-center"
                        title="Edit"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                        </svg>
                    </button>
                    
                    {onNegotiate && (
                        <button
                            onClick={() => onNegotiate(subscription)}
                            className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl transition-colors flex items-center justify-center"
                            title="Negotiate"
                        >
                            ✨
                        </button>
                    )}
                    
                    {onVirtualCard && (
                        <button
                            onClick={() => onVirtualCard(subscription)}
                            className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl transition-colors flex items-center justify-center"
                            title="Virtual Card"
                        >
                            💳
                        </button>
                    )}
                    
                    <button
                        onClick={() => onCancel(subscription)}
                        className="p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-xl transition-colors flex items-center justify-center"
                        title="Cancel"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                    
                    <button
                        onClick={() => onDelete(subscription.id)}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors flex items-center justify-center"
                        title="Delete"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .masonry-grid {
        animation: fadeIn 0.5s ease-out;
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    
    /* Responsive columns */
    @media (max-width: 768px) {
        .masonry-grid {
            grid-template-columns: repeat(1, 1fr) !important;
        }
    }
    
    @media (min-width: 769px) and (max-width: 1024px) {
        .masonry-grid {
            grid-template-columns: repeat(2, 1fr) !important;
        }
    }
`;
document.head.appendChild(style);

console.log('✅ Masonry Grid Component Loaded');