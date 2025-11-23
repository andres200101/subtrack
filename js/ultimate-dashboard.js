// ULTIMATE DASHBOARD - One page with everything
// Big circular chart + action cards + recent activity + urgent alerts

window.UltimateDashboard = ({ 
    user, 
    subscriptions, 
    trials, 
    totalMonthly, 
    totalYearly, 
    monthlyBudget,
    cancelledSubscriptions,
    onNavigate,
    onAddNew,
    onScanEmail,
    onScanReceipt,
    onConnectBank,
    onEnableAutopilot,
    onViewAnalytics,
    onSetBudget,
    onViewSharing,
    onUpgrade,
    isPro,
    calculateMonthlyEquivalent,
    getDaysRemaining,
    formatDate
}) => {
    const { useState, useEffect, useRef } = React;

    // Calculate stats
    const urgentTrials = trials.filter(t => getDaysRemaining(t.trial_end_date) <= 3);
    const activeCount = subscriptions.length;
    const savingsYearly = cancelledSubscriptions.reduce((sum, sub) => 
        sum + (calculateMonthlyEquivalent(parseFloat(sub.cost), sub.billing_cycle) * 12), 0
    );

    const budgetStatus = monthlyBudget ? {
        percentage: (totalMonthly / monthlyBudget) * 100,
        remaining: monthlyBudget - totalMonthly,
        isOver: totalMonthly > monthlyBudget
    } : null;

    // Category breakdown for chart
    const getCategoryData = () => {
        const categoryTotals = {};
        subscriptions.forEach(sub => {
            const monthly = calculateMonthlyEquivalent(parseFloat(sub.cost), sub.billing_cycle);
            categoryTotals[sub.category] = (categoryTotals[sub.category] || 0) + monthly;
        });
        return categoryTotals;
    };

    const categoryData = getCategoryData();
    const categoryColors = {
        'Streaming': '#9333ea',
        'Software': '#3b82f6',
        'Gaming': '#10b981',
        'Fitness': '#f59e0b',
        'News': '#ef4444',
        'Music': '#ec4899',
        'Cloud Storage': '#06b6d4',
        'Other': '#6b7280'
    };

    // Draw chart
    const chartRef = useRef(null);
    const [chartDrawn, setChartDrawn] = useState(false);

    useEffect(() => {
        if (chartRef.current && Object.keys(categoryData).length > 0 && !chartDrawn) {
            const canvas = chartRef.current;
            const ctx = canvas.getContext('2d');
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = 140;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Calculate total
            const total = Object.values(categoryData).reduce((sum, val) => sum + val, 0);

            // Draw segments
            let startAngle = -Math.PI / 2;
            Object.entries(categoryData).forEach(([category, amount]) => {
                const sliceAngle = (amount / total) * 2 * Math.PI;
                
                // Draw slice
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
                ctx.lineTo(centerX, centerY);
                ctx.fillStyle = categoryColors[category] || '#6b7280';
                ctx.fill();
                
                // White border
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 3;
                ctx.stroke();
                
                startAngle += sliceAngle;
            });

            // Center circle (donut hole)
            ctx.beginPath();
            ctx.arc(centerX, centerY, 90, 0, 2 * Math.PI);
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            // Center text
            ctx.fillStyle = '#000952';
            ctx.font = 'bold 32px Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`$${totalMonthly.toFixed(0)}`, centerX, centerY - 10);
            
            ctx.font = '14px Inter';
            ctx.fillStyle = '#6b7280';
            ctx.fillText('per month', centerX, centerY + 15);

            setChartDrawn(true);
        }
    }, [categoryData, chartDrawn]);

    // Action cards config
    const actionCards = [
        {
            id: 'add',
            icon: '➕',
            title: 'Add New',
            description: 'Add subscription manually',
            color: 'from-blue-500 to-cyan-500',
            onClick: onAddNew,
            badge: null
        },
        {
            id: 'scan-email',
            icon: '📧',
            title: 'Scan Emails',
            description: 'Auto-detect from Gmail',
            color: 'from-red-500 to-pink-500',
            onClick: onScanEmail,
            badge: null
        },
        {
            id: 'scan-receipt',
            icon: '📸',
            title: 'Scan Receipt',
            description: 'OCR from photo',
            color: 'from-purple-500 to-pink-500',
            onClick: onScanReceipt,
            badge: null
        },
        {
            id: 'bank',
            icon: '🏦',
            title: 'Connect Bank',
            description: 'Auto-sync transactions',
            color: 'from-green-500 to-emerald-500',
            onClick: onConnectBank,
            badge: null
        },
        {
            id: 'autopilot',
            icon: '🤖',
            title: 'Autopilot',
            description: 'AI monitoring',
            color: 'from-indigo-500 to-purple-500',
            onClick: onEnableAutopilot,
            badge: 'AI'
        },
        {
            id: 'analytics',
            icon: '📊',
            title: 'Analytics',
            description: 'Deep insights',
            color: 'from-orange-500 to-red-500',
            onClick: onViewAnalytics,
            badge: null
        },
        {
            id: 'budget',
            icon: '💰',
            title: 'Set Budget',
            description: 'Track spending limits',
            color: 'from-yellow-500 to-orange-500',
            onClick: onSetBudget,
            badge: budgetStatus && budgetStatus.isOver ? '!' : null
        },
        {
            id: 'sharing',
            icon: '👥',
            title: 'Share & Split',
            description: 'Save up to 75%',
            color: 'from-cyan-500 to-blue-500',
            onClick: onViewSharing,
            badge: null
        }
    ];

    // Recent activity (last 5 subscriptions added/modified)
    const recentActivity = [...subscriptions]
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        .slice(0, 5);

    return (
        <div className="max-w-7xl mx-auto pb-12">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Welcome back, {user?.email?.split('@')[0] || 'there'}! 👋
                </h1>
                <p className="text-xl text-gray-600">Here's your subscription overview</p>
            </div>

            {/* URGENT ALERTS SECTION */}
            {(urgentTrials.length > 0 || (budgetStatus && budgetStatus.isOver)) && (
                <div className="mb-8 space-y-4">
                    {/* Urgent Trials */}
                    {urgentTrials.length > 0 && (
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-2xl p-6 animate-pulse">
                            <div className="flex items-start gap-4">
                                <div className="text-4xl">⚠️</div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-red-900 mb-2">
                                        {urgentTrials.length} Trial{urgentTrials.length > 1 ? 's' : ''} Ending Soon!
                                    </h3>
                                    <p className="text-red-800 mb-3">
                                        Cancel now to avoid being charged
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {urgentTrials.map(trial => (
                                            <span key={trial.id} className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-semibold">
                                                {trial.name} - {getDaysRemaining(trial.trial_end_date)}d left
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Over Budget Alert */}
                    {budgetStatus && budgetStatus.isOver && (
                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="text-4xl">💸</div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-orange-900 mb-2">
                                        Over Budget by ${Math.abs(budgetStatus.remaining).toFixed(2)}!
                                    </h3>
                                    <p className="text-orange-800">
                                        You're spending {budgetStatus.percentage.toFixed(0)}% of your monthly budget. Consider canceling some subscriptions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* LEFT: Spending Chart */}
                <div className="lg:col-span-2">
                    <div className="card-frosted rounded-3xl p-8 border-2 border-gray-200">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900">💰 Your Spending</h2>
                        
                        <div className="flex flex-col lg:flex-row items-center gap-8">
                            {/* Chart */}
                            <div className="relative">
                                <canvas ref={chartRef} width="320" height="320"></canvas>
                            </div>

                            {/* Legend */}
                            <div className="flex-1 w-full">
                                <div className="space-y-3">
                                    {Object.entries(categoryData).sort((a, b) => b[1] - a[1]).map(([category, amount]) => (
                                        <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="w-4 h-4 rounded-full"
                                                    style={{ backgroundColor: categoryColors[category] }}
                                                ></div>
                                                <span className="font-semibold text-gray-900">{category}</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">${amount.toFixed(2)}</p>
                                                <p className="text-xs text-gray-500">
                                                    {((amount / totalMonthly) * 100).toFixed(0)}%
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Quick Stats */}
                <div className="space-y-4">
                    {/* Monthly */}
                    <div className="card-frosted rounded-2xl p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                        <p className="text-sm text-purple-700 font-semibold mb-2">MONTHLY TOTAL</p>
                        <p className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            ${totalMonthly.toFixed(2)}
                        </p>
                        <p className="text-sm text-purple-600 mt-1">${totalYearly.toFixed(2)}/year</p>
                    </div>

                    {/* Active Subs */}
                    <div className="card-frosted rounded-2xl p-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                        <p className="text-sm text-blue-700 font-semibold mb-2">ACTIVE SUBS</p>
                        <p className="text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            {activeCount}
                        </p>
                        {!isPro && activeCount >= 5 && (
                            <p className="text-xs text-orange-600 mt-2 font-semibold">⚠️ Free limit reached</p>
                        )}
                    </div>

                    {/* Money Saved */}
                    <div className="card-frosted rounded-2xl p-6 border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                        <p className="text-sm text-green-700 font-semibold mb-2">MONEY SAVED</p>
                        <p className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            ${savingsYearly.toFixed(0)}
                        </p>
                        <p className="text-sm text-green-600 mt-1">this year</p>
                    </div>
                </div>
            </div>

            {/* ACTION CARDS GRID */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">⚡ Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {actionCards.map((card, index) => (
                        <button
                            key={card.id}
                            onClick={card.onClick}
                            className={`relative card-frosted rounded-2xl p-6 text-left transition-all hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-opacity-50 group overflow-hidden`}
                            style={{
                                animationDelay: `${index * 50}ms`,
                                animation: 'fadeInUp 0.5s ease-out forwards',
                                opacity: 0
                            }}
                        >
                            {/* Gradient background on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                            
                            {/* Content */}
                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`text-4xl p-3 rounded-xl bg-gradient-to-br ${card.color} bg-opacity-10`}>
                                        {card.icon}
                                    </div>
                                    {card.badge && (
                                        <span className={`px-2 py-1 bg-gradient-to-r ${card.color} text-white text-xs font-bold rounded-full`}>
                                            {card.badge}
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">{card.title}</h3>
                                <p className="text-sm text-gray-600">{card.description}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* RECENT ACTIVITY */}
            {recentActivity.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">🕐 Recent Activity</h2>
                    <div className="card-frosted rounded-2xl p-6 border-2 border-gray-200">
                        <div className="space-y-3">
                            {recentActivity.map((sub, index) => (
                                <div 
                                    key={sub.id} 
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                    style={{
                                        animationDelay: `${index * 50}ms`,
                                        animation: 'fadeInLeft 0.5s ease-out forwards',
                                        opacity: 0
                                    }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                                            {sub.name[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{sub.name}</p>
                                            <p className="text-sm text-gray-600">
                                                {sub.category} • ${sub.cost}/{sub.billing_cycle}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                        Active
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* UPGRADE CTA (if not pro) */}
            {!isPro && (
                <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-3xl p-1">
                    <div className="card-frosted rounded-3xl p-8 text-center">
                        <div className="text-6xl mb-4">🚀</div>
                        <h3 className="text-3xl font-black mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Unlock Everything with Pro
                        </h3>
                        <p className="text-gray-600 mb-6 text-lg">
                            Unlimited subscriptions • Email alerts • AI Autopilot • Priority support
                        </p>
                        <button
                            onClick={onUpgrade}
                            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105"
                        >
                            ⚡ Upgrade to Pro - $5/month
                        </button>
                    </div>
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
                @keyframes fadeInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `}</style>
        </div>
    );
};