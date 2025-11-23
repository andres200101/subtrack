// ==============================================
// ULTIMATE DASHBOARD V2 - PREMIUM FINTECH DESIGN
// Implements all feedback from design document
// ==============================================

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

    // Animated counter for numbers
    const [displayedMonthly, setDisplayedMonthly] = useState(0);
    const [displayedYearly, setDisplayedYearly] = useState(0);

    useEffect(() => {
        // Count-up animation
        const duration = 1000;
        const steps = 60;
        const monthlyIncrement = totalMonthly / steps;
        const yearlyIncrement = totalYearly / steps;
        let currentStep = 0;

        const interval = setInterval(() => {
            currentStep++;
            setDisplayedMonthly(Math.min(monthlyIncrement * currentStep, totalMonthly));
            setDisplayedYearly(Math.min(yearlyIncrement * currentStep, totalYearly));

            if (currentStep >= steps) {
                clearInterval(interval);
            }
        }, duration / steps);

        return () => clearInterval(interval);
    }, [totalMonthly, totalYearly]);

    // Extract first name from email
    const firstName = user?.email?.split('@')[0]?.split('.')[0] || 'there';
    const formattedName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

    // Calculate stats
    const urgentTrials = trials.filter(t => getDaysRemaining(t.trial_end_date) <= 3);
    const activeCount = subscriptions.length;
    const savingsYearly = cancelledSubscriptions?.reduce((sum, sub) => 
        sum + (calculateMonthlyEquivalent(parseFloat(sub.cost), sub.billing_cycle) * 12), 0
    ) || 0;

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
        'Streaming': { color: '#9333ea', icon: '🎬' },
        'Software': { color: '#3b82f6', icon: '💻' },
        'Gaming': { color: '#10b981', icon: '🎮' },
        'Fitness': { color: '#f59e0b', icon: '💪' },
        'News': { color: '#ef4444', icon: '📰' },
        'Music': { color: '#ec4899', icon: '🎵' },
        'Cloud Storage': { color: '#06b6d4', icon: '☁️' },
        'Other': { color: '#6b7280', icon: '📦' }
    };

    // Draw enhanced chart with glow
    const chartRef = useRef(null);
    const [chartDrawn, setChartDrawn] = useState(false);

    useEffect(() => {
        if (chartRef.current && Object.keys(categoryData).length > 0 && !chartDrawn) {
            const canvas = chartRef.current;
            const ctx = canvas.getContext('2d');
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = 180;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const total = Object.values(categoryData).reduce((sum, val) => sum + val, 0);

            // Draw segments with glow
            let startAngle = -Math.PI / 2;
            Object.entries(categoryData).forEach(([category, amount]) => {
                const sliceAngle = (amount / total) * 2 * Math.PI;
                const categoryColor = categoryColors[category]?.color || '#6b7280';
                
                // Glow effect
                ctx.shadowBlur = 20;
                ctx.shadowColor = categoryColor;
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
                ctx.lineTo(centerX, centerY);
                ctx.fillStyle = categoryColor;
                ctx.fill();
                
                ctx.shadowBlur = 0;
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 4;
                ctx.stroke();
                
                startAngle += sliceAngle;
            });

            // Center circle with gradient
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 110);
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(1, '#f7fbfb');
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, 110, 0, 2 * Math.PI);
            ctx.fillStyle = gradient;
            ctx.fill();
            
            ctx.strokeStyle = 'rgba(153, 252, 250, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Center text with gradient
            const textGradient = ctx.createLinearGradient(centerX - 60, centerY, centerX + 60, centerY);
            textGradient.addColorStop(0, '#000952');
            textGradient.addColorStop(1, '#2f4080');
            
            ctx.fillStyle = textGradient;
            ctx.font = 'bold 48px Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`$${displayedMonthly.toFixed(0)}`, centerX, centerY - 15);
            
            ctx.font = '16px Inter';
            ctx.fillStyle = '#6f7d9e';
            ctx.fillText('per month', centerX, centerY + 20);

            setChartDrawn(true);
        }
    }, [categoryData, chartDrawn, displayedMonthly]);

    // Service logos mapping (simplified - in production, use actual images)
    const getServiceLogo = (name) => {
        const logos = {
            'Netflix': '🔴',
            'Spotify': '🟢',
            'Hulu': '🟩',
            'Disney+': '🔵',
            'Amazon Prime': '🟠',
            'YouTube': '🔴',
            'Adobe': '🔴',
            'Microsoft': '🟦',
            'Google': '🔵',
            'Apple': '⚫'
        };
        return logos[name] || '📦';
    };

    // Enhanced action cards with glassmorphism
    const actionCards = [
        {
            id: 'add',
            icon: '➕',
            title: 'Add New',
            description: 'Add subscription manually',
            gradient: 'from-blue-500 to-cyan-500',
            onClick: onAddNew
        },
        {
            id: 'scan-email',
            icon: '📧',
            title: 'Scan Emails',
            description: 'Auto-detect from Gmail',
            gradient: 'from-red-500 to-pink-500',
            onClick: onScanEmail
        },
        {
            id: 'scan-receipt',
            icon: '📸',
            title: 'Scan Receipt',
            description: 'OCR from photo',
            gradient: 'from-purple-500 to-pink-500',
            onClick: onScanReceipt
        },
        {
            id: 'bank',
            icon: '🏦',
            title: 'Connect Bank',
            description: 'Auto-sync transactions',
            gradient: 'from-green-500 to-emerald-500',
            onClick: onConnectBank
        }
    ];

    return (
        <div className="max-w-7xl mx-auto pb-12">
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideInLeft {
                    from { opacity: 0; transform: translateX(-30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.8; }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.6s ease-out;
                }
                .animate-slide-in-left {
                    animation: slideInLeft 0.5s ease-out;
                }
                .hover-lift {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .hover-lift:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 30px rgba(0, 9, 82, 0.12);
                }
                .glassmorphic {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(40px) saturate(180%);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                }
            `}</style>

            {/* REDESIGNED WELCOME HEADER - Clean, No Gradient */}
            <div className="mb-10 animate-fade-in-up">
                <h1 className="text-5xl font-black mb-2 text-[#03093b]">
                    Welcome back, {formattedName}! <span className="inline-block animate-[wave_0.5s_ease-in-out]" style={{animation: 'wave 0.5s ease-in-out', transformOrigin: '70% 70%'}}>👋</span>
                </h1>
                <p className="text-2xl text-[#6f7d9e]">
                    You're spending <span className="font-bold text-[#000952]">${displayedMonthly.toFixed(2)}/month</span> on <span className="font-bold text-[#000952]">{activeCount}</span> subscriptions
                </p>
            </div>

            {/* URGENT TRIAL ALERTS - Floating Cards, Not Banners */}
            {urgentTrials.length > 0 && (
                <div className="mb-8 space-y-4">
                    {urgentTrials.slice(0, 2).map((trial, index) => {
                        const daysLeft = getDaysRemaining(trial.trial_end_date);
                        return (
                            <div 
                                key={trial.id}
                                className="relative overflow-hidden rounded-3xl p-6 border-2 hover-lift animate-fade-in-up"
                                style={{
                                    background: 'linear-gradient(135deg, #fee2e2 0%, #fef3c7 100%)',
                                    borderColor: daysLeft === 0 ? '#dc2626' : '#f59e0b',
                                    animationDelay: `${index * 100}ms`,
                                    boxShadow: '0 20px 60px rgba(239, 68, 68, 0.2)'
                                }}
                            >
                                <div className="absolute top-0 right-0 text-9xl opacity-5">⚠️</div>
                                <div className="relative flex items-start gap-4">
                                    <div className="text-5xl">{daysLeft === 0 ? '🚨' : '⏰'}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-2xl font-black text-[#7c2d12]">
                                                {trial.name} Trial Ending {daysLeft === 0 ? 'TODAY!' : `in ${daysLeft} day${daysLeft > 1 ? 's' : ''}!`}
                                            </h3>
                                            {daysLeft === 0 && (
                                                <span className="px-4 py-2 bg-red-600 text-white rounded-full text-sm font-bold animate-pulse">
                                                    URGENT
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-lg text-[#92400e] mb-4">
                                            Cancel now to avoid ${trial.cost} charge on {formatDate(trial.trial_end_date)}
                                        </p>
                                        <div className="flex gap-3">
                                            <button className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold hover:shadow-xl transition-all transform hover:scale-105">
                                                Cancel Trial Now
                                            </button>
                                            <button className="px-6 py-3 bg-white text-[#7c2d12] border-2 border-[#92400e] rounded-xl font-bold hover:bg-[#fef3c7] transition-all">
                                                Keep & Pay ${trial.cost}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* MAIN GRID - Enhanced Chart + Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* LEFT: Enhanced Spending Chart */}
                <div className="lg:col-span-2 animate-fade-in-up" style={{animationDelay: '200ms'}}>
                    <div className="relative rounded-3xl p-10 overflow-hidden"
                         style={{
                             background: 'linear-gradient(135deg, #000952 0%, #2f4080 100%)',
                             boxShadow: '0 20px 60px rgba(0, 9, 82, 0.3)'
                         }}>
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#99fcfa] opacity-10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#99fcfa] opacity-10 rounded-full blur-3xl"></div>
                        
                        <h2 className="text-3xl font-black mb-8 text-white relative z-10">💰 Your Spending</h2>
                        
                        <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
                            <div className="relative">
                                <canvas ref={chartRef} width="400" height="400" style={{filter: 'drop-shadow(0 10px 30px rgba(153, 252, 250, 0.4))'}}></canvas>
                            </div>

                            {/* Glassmorphic Legend */}
                            <div className="flex-1 w-full space-y-3">
                                {Object.entries(categoryData).sort((a, b) => b[1] - a[1]).map(([category, amount], index) => {
                                    const catColor = categoryColors[category];
                                    return (
                                        <div 
                                            key={category}
                                            className="glassmorphic p-4 rounded-2xl hover-lift"
                                            style={{
                                                animationDelay: `${index * 100}ms`,
                                                animation: 'slideInLeft 0.5s ease-out',
                                                border: `1px solid rgba(153, 252, 250, 0.2)`
                                            }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-3xl">{catColor?.icon}</span>
                                                    <span className="font-bold text-white">{category}</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-xl text-white">${amount.toFixed(2)}</p>
                                                    <p className="text-sm text-[#99fcfa]">
                                                        {((amount / totalMonthly) * 100).toFixed(0)}%
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Enhanced Stats Cards with Sparklines & Trends */}
                <div className="space-y-4">
                    {/* Monthly Total with Trend */}
                    <div className="relative overflow-hidden rounded-2xl p-6 hover-lift animate-fade-in-up"
                         style={{
                             background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)',
                             border: '2px solid #c7d2fe',
                             boxShadow: '0 4px 24px rgba(99, 102, 241, 0.12)',
                             animationDelay: '300ms'
                         }}>
                        <div className="absolute top-0 right-0 text-8xl opacity-5">💰</div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#4338ca] mb-2">MONTHLY TOTAL</p>
                        <p className="text-5xl font-black mb-2" style={{
                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            ${displayedMonthly.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-green-600 font-bold text-sm flex items-center">
                                ↓ $234 <span className="text-xs ml-1 text-gray-600">from last month</span>
                            </span>
                        </div>
                        <div className="text-sm text-[#6366f1]">${displayedYearly.toFixed(2)}/year</div>
                        {/* Mini Progress Bar */}
                        {budgetStatus && (
                            <div className="mt-4">
                                <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] transition-all duration-1000"
                                        style={{width: `${Math.min(budgetStatus.percentage, 100)}%`}}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                    {budgetStatus.percentage.toFixed(0)}% of budget used
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Active Subs with Alert */}
                    <div className="relative overflow-hidden rounded-2xl p-6 hover-lift animate-fade-in-up"
                         style={{
                             background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)',
                             border: '2px solid #bfdbfe',
                             boxShadow: '0 4px 24px rgba(59, 130, 246, 0.12)',
                             animationDelay: '400ms'
                         }}>
                        <div className="absolute top-0 right-0 text-8xl opacity-5">💳</div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#1e40af] mb-2">ACTIVE SUBS</p>
                        <p className="text-5xl font-black mb-2" style={{
                            background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {activeCount}
                        </p>
                        {!isPro && activeCount >= 5 && (
                            <div className="mt-3 p-3 bg-orange-100 border border-orange-300 rounded-xl">
                                <p className="text-xs font-bold text-orange-800 flex items-center gap-2">
                                    ⚠️ Free limit reached
                                </p>
                                <button className="mt-2 w-full px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-xs font-bold hover:shadow-lg transition-all">
                                    Upgrade to Pro
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Money Saved */}
                    <div className="relative overflow-hidden rounded-2xl p-6 hover-lift animate-fade-in-up"
                         style={{
                             background: 'linear-gradient(135deg, #d1fae5 0%, #d1f4e0 100%)',
                             border: '2px solid #a7f3d0',
                             boxShadow: '0 4px 24px rgba(16, 185, 129, 0.12)',
                             animationDelay: '500ms'
                         }}>
                        <div className="absolute top-0 right-0 text-8xl opacity-5">💸</div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#065f46] mb-2">MONEY SAVED</p>
                        <p className="text-5xl font-black mb-2" style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            ${savingsYearly.toFixed(0)}
                        </p>
                        <p className="text-sm text-[#059669]">this year</p>
                    </div>
                </div>
            </div>

            {/* QUICK ACTIONS - Glassmorphic Cards */}
            <div className="mb-10">
                <h2 className="text-3xl font-black mb-6 text-[#03093b]">⚡ Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {actionCards.map((card, index) => (
                        <button
                            key={card.id}
                            onClick={card.onClick}
                            className="glassmorphic rounded-3xl p-8 text-left hover-lift group relative overflow-hidden border-2 border-transparent"
                            style={{
                                animationDelay: `${index * 100}ms`,
                                animation: 'fadeInUp 0.6s ease-out forwards',
                                opacity: 0
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(153, 252, 250, 0.5)';
                                e.currentTarget.style.boxShadow = '0 20px 60px rgba(99, 102, 241, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'transparent';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                            <div className="relative z-10">
                                <div className={`w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-4xl transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}
                                     style={{boxShadow: '0 10px 30px rgba(99, 102, 241, 0.2)'}}>
                                    {card.icon}
                                </div>
                                <h3 className="font-black text-xl text-[#03093b] mb-2 group-hover:text-[#000952] transition-colors">{card.title}</h3>
                                <p className="text-sm text-[#6f7d9e] group-hover:text-[#282f58] transition-colors">{card.description}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* RECENT SUBSCRIPTIONS - Enhanced Cards */}
            {subscriptions.length > 0 && (
                <div>
                    <h2 className="text-3xl font-black mb-6 text-[#03093b]">📊 Recent Subscriptions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {subscriptions.slice(0, 6).map((sub, index) => {
                            const monthlyCost = calculateMonthlyEquivalent(parseFloat(sub.cost), sub.billing_cycle);
                            return (
                                <div 
                                    key={sub.id}
                                    className="glassmorphic rounded-3xl p-6 hover-lift border-2 border-transparent"
                                    style={{
                                        animationDelay: `${index * 100}ms`,
                                        animation: 'fadeInUp 0.6s ease-out forwards',
                                        opacity: 0
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(153, 252, 250, 0.5)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = 'transparent';
                                    }}
                                >
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-black text-white">
                                            {getServiceLogo(sub.name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-lg text-[#03093b] truncate">{sub.name}</h3>
                                            <p className="text-sm text-[#6f7d9e]">{sub.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-baseline justify-between mb-2">
                                        <span className="text-3xl font-black text-[#000952]">${monthlyCost.toFixed(2)}</span>
                                        <span className="text-sm text-[#6f7d9e]">/month</span>
                                    </div>
                                    {sub.next_billing_date && (
                                        <div className="mt-3 p-3 bg-white/50 rounded-xl">
                                            <p className="text-xs font-semibold text-[#6f7d9e] flex items-center gap-2">
                                                📅 Next: {formatDate(sub.next_billing_date)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Wave animation for emoji */}
            <style>{`
                @keyframes wave {
                    0% { transform: rotate(0deg); }
                    10% { transform: rotate(14deg); }
                    20% { transform: rotate(-8deg); }
                    30% { transform: rotate(14deg); }
                    40% { transform: rotate(-4deg); }
                    50% { transform: rotate(10deg); }
                    60% { transform: rotate(0deg); }
                    100% { transform: rotate(0deg); }
                }
            `}</style>
        </div>
    );
};