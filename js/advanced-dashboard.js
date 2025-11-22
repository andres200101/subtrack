// ==============================================
// ADVANCED DASHBOARD - advanced-dashboard.js
// Circular charts, animated stats, modern hero section
// ==============================================

window.AdvancedDashboardComponent = function({ 
    subscriptions,
    trials,
    totalMonthly,
    totalYearly,
    monthlyBudget,
    user,
    isPro,
    onUpgrade,
    calculateSavings,
    getCategoryData,
    calculateMonthlyEquivalent
}) {
    const [animatedTotal, setAnimatedTotal] = React.useState(0);
    const [activeChart, setActiveChart] = React.useState('category');

    // Animate numbers on mount
    React.useEffect(() => {
        let start = 0;
        const end = totalMonthly;
        const duration = 1500;
        const increment = end / (duration / 16);
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setAnimatedTotal(end);
                clearInterval(timer);
            } else {
                setAnimatedTotal(start);
            }
        }, 16);
        
        return () => clearInterval(timer);
    }, [totalMonthly]);

    // Calculate category percentages
    const categoryData = getCategoryData();
    const categoryArray = Object.entries(categoryData).map(([name, amount]) => ({
        name,
        amount,
        percentage: (amount / totalMonthly) * 100
    })).sort((a, b) => b.amount - a.amount);

    // Color palette for categories
    const colors = [
        { primary: '#F27B40', light: '#FFE5D9', gradient: 'from-orange-500 to-orange-600' },
        { primary: '#005691', light: '#E1F5FE', gradient: 'from-blue-600 to-blue-700' },
        { primary: '#17BEBB', light: '#E0F2F1', gradient: 'from-teal-500 to-teal-600' },
        { primary: '#4CAF50', light: '#E8F5E9', gradient: 'from-green-500 to-green-600' },
        { primary: '#FF6B6B', light: '#FFEBEE', gradient: 'from-red-500 to-red-600' },
        { primary: '#4ECDC4', light: '#E0F7FA', gradient: 'from-cyan-500 to-cyan-600' },
        { primary: '#FFE66D', light: '#FFFDE7', gradient: 'from-yellow-500 to-yellow-600' },
        { primary: '#A8E6CF', light: '#F1F8E9', gradient: 'from-lime-500 to-lime-600' }
    ];

    // Budget status
    const getBudgetStatus = () => {
        if (!monthlyBudget) return null;
        const percentUsed = (totalMonthly / monthlyBudget) * 100;
        const remaining = monthlyBudget - totalMonthly;
        return {
            percentUsed: Math.min(percentUsed, 100),
            remaining,
            isOverBudget: totalMonthly > monthlyBudget,
            status: percentUsed >= 100 ? 'danger' : percentUsed >= 90 ? 'warning' : 'good'
        };
    };

    const budgetStatus = getBudgetStatus();

    // Icons
    const TrendingUp = ({ size = 24 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
        </svg>
    );

    const DollarSign = ({ size = 24 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
    );

    const PieChart = ({ size = 24 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
            <path d="M22 12A10 10 0 0 0 12 2v10z"/>
        </svg>
    );

    const Calendar = ({ size = 24 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
    );

    const Zap = ({ size = 24 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
    );

    const Gift = ({ size = 24 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 12 20 22 4 22 4 12"/>
            <rect x="2" y="7" width="20" height="5"/>
            <line x1="12" y1="22" x2="12" y2="7"/>
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
        </svg>
    );

    return (
        <div className="space-y-6">
            {/* Hero Section - Glassmorphic Design */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-deep via-primary-astronaut to-primary-mid p-8 shadow-2xl">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden opacity-20">
                    <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary-bright rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary-light rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="relative z-10">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <h1 className="text-4xl lg:text-5xl font-black text-white">
                                    Welcome back, {user.email.split('@')[0]}! 👋
                                </h1>
                                {isPro && (
                                    <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold rounded-full shadow-lg flex items-center gap-2 animate-pulse">
                                        <Zap size={16} />
                                        PRO
                                    </span>
                                )}
                            </div>
                            <p className="text-white/80 text-lg">Here's your subscription overview</p>
                        </div>

                        {!isPro && (
                            <button
                                onClick={onUpgrade}
                                className="group relative px-8 py-4 bg-gradient-to-r from-primary-bright to-primary-light text-primary-deep rounded-2xl font-bold shadow-2xl hover:shadow-primary-bright/50 transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
                            >
                                <Zap size={24} className="group-hover:animate-bounce" />
                                <span>Upgrade to Pro</span>
                                <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                            </button>
                        )}
                    </div>

                    {/* Main Stats Grid with Circular Progress */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Total Monthly - Large Circular Chart */}
                        <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-white/70 text-sm font-medium mb-1">Monthly Total</p>
                                    <h2 className="text-5xl font-black text-white">
                                        ${animatedTotal.toFixed(2)}
                                    </h2>
                                    {monthlyBudget && (
                                        <p className="text-white/60 text-xs mt-1">
                                            of ${monthlyBudget.toFixed(2)} budget
                                        </p>
                                    )}
                                </div>
                                
                                {/* Circular Progress for Budget */}
                                {budgetStatus && (
                                    <div className="relative w-32 h-32">
                                        <svg className="transform -rotate-90 w-32 h-32">
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="56"
                                                stroke="rgba(255,255,255,0.1)"
                                                strokeWidth="12"
                                                fill="none"
                                            />
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="56"
                                                stroke={budgetStatus.status === 'danger' ? '#ef4444' : budgetStatus.status === 'warning' ? '#f59e0b' : '#10b981'}
                                                strokeWidth="12"
                                                fill="none"
                                                strokeDasharray={`${2 * Math.PI * 56}`}
                                                strokeDashoffset={`${2 * Math.PI * 56 * (1 - budgetStatus.percentUsed / 100)}`}
                                                strokeLinecap="round"
                                                className="transition-all duration-1000"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-2xl font-black text-white">
                                                    {budgetStatus.percentUsed.toFixed(0)}%
                                                </div>
                                                <div className="text-xs text-white/60">used</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {budgetStatus && (
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-white/70">
                                            {budgetStatus.isOverBudget ? 'Over budget' : 'Remaining'}
                                        </span>
                                        <span className={`font-bold ${budgetStatus.isOverBudget ? 'text-red-400' : 'text-green-400'}`}>
                                            ${Math.abs(budgetStatus.remaining).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Yearly Total */}
                        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                    <TrendingUp size={28} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-white/80 text-sm font-medium">Yearly Total</p>
                                    <h3 className="text-3xl font-black text-white">${totalYearly.toFixed(0)}</h3>
                                </div>
                            </div>
                            <div className="pt-3 border-t border-white/20">
                                <p className="text-white/70 text-xs">Annual commitment</p>
                            </div>
                        </div>

                        {/* Active Subscriptions */}
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                    <Calendar size={28} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-white/80 text-sm font-medium">Active</p>
                                    <h3 className="text-3xl font-black text-white">
                                        {subscriptions.length}
                                        {!isPro && <span className="text-xl text-white/60">/5</span>}
                                    </h3>
                                </div>
                            </div>
                            <div className="pt-3 border-t border-white/20">
                                <p className="text-white/70 text-xs">
                                    {trials.length > 0 && `${trials.length} trial${trials.length > 1 ? 's' : ''} active`}
                                    {trials.length === 0 && 'No trials'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white/60 text-xs mb-1">Avg per Sub</p>
                                    <p className="text-2xl font-bold text-white">
                                        ${subscriptions.length > 0 ? (totalMonthly / subscriptions.length).toFixed(2) : '0.00'}
                                    </p>
                                </div>
                                <DollarSign className="text-white/40" size={32} />
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white/60 text-xs mb-1">Money Saved</p>
                                    <p className="text-2xl font-bold text-green-400">
                                        ${calculateSavings().yearly.toFixed(0)}
                                    </p>
                                </div>
                                <TrendingUp className="text-green-400" size={32} />
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white/60 text-xs mb-1">Categories</p>
                                    <p className="text-2xl font-bold text-white">
                                        {categoryArray.length}
                                    </p>
                                </div>
                                <PieChart className="text-white/40" size={32} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Breakdown - Circular Charts */}
            {categoryArray.length > 0 && (
                <div className="card-frosted rounded-2xl p-8 shadow-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-primary-text flex items-center gap-3">
                                <PieChart size={28} />
                                Spending by Category
                            </h2>
                            <p className="text-gray-600 mt-1">Visual breakdown of your subscriptions</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categoryArray.map((category, index) => {
                            const color = colors[index % colors.length];
                            const circumference = 2 * Math.PI * 45;
                            const strokeDashoffset = circumference - (category.percentage / 100) * circumference;

                            return (
                                <div key={category.name} className="group">
                                    <div className={`bg-gradient-to-br ${color.gradient} rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105`}>
                                        <div className="flex flex-col items-center">
                                            {/* Circular Chart */}
                                            <div className="relative w-32 h-32 mb-4">
                                                <svg className="transform -rotate-90 w-32 h-32">
                                                    <circle
                                                        cx="64"
                                                        cy="64"
                                                        r="45"
                                                        stroke="rgba(255,255,255,0.2)"
                                                        strokeWidth="10"
                                                        fill="none"
                                                    />
                                                    <circle
                                                        cx="64"
                                                        cy="64"
                                                        r="45"
                                                        stroke="white"
                                                        strokeWidth="10"
                                                        fill="none"
                                                        strokeDasharray={circumference}
                                                        strokeDashoffset={strokeDashoffset}
                                                        strokeLinecap="round"
                                                        className="transition-all duration-1000"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="text-center">
                                                        <div className="text-2xl font-black text-white">
                                                            {category.percentage.toFixed(0)}%
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Category Info */}
                                            <h3 className="text-white font-bold text-lg mb-2 text-center">
                                                {category.name}
                                            </h3>
                                            <div className="text-center">
                                                <p className="text-3xl font-black text-white mb-1">
                                                    ${category.amount.toFixed(2)}
                                                </p>
                                                <p className="text-white/80 text-sm">
                                                    per month
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Trial Alert - If applicable */}
            {trials.length > 0 && (
                <div className="bg-gradient-to-r from-yellow-100 via-orange-100 to-red-100 border-2 border-orange-300 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-orange-500 rounded-full shadow-lg">
                            <Gift size={32} className="text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-orange-900 mb-1">
                                {trials.length} Free Trial{trials.length > 1 ? 's' : ''} Active
                            </h3>
                            <p className="text-orange-800">
                                Don't forget to cancel before they convert to paid subscriptions!
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-black text-orange-600">
                                ${trials.reduce((sum, t) => sum + parseFloat(t.cost), 0).toFixed(0)}
                            </div>
                            <p className="text-sm text-orange-700">at stake</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

window.AdvancedDashboard = window.AdvancedDashboardComponent;