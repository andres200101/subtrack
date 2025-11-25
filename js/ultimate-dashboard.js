// Ultimate Dashboard Component - REFINED VERSION
// Compact banners, Problems Detected card, refined charts
(function() {
    const { useState, useEffect, useRef } = React;

    const EnhancedUltimateDashboard = ({ 
        user, 
        subscriptions = [], 
        trials = [], 
        totalMonthly = 0, 
        totalYearly = 0,
        monthlyBudget,
        cancelledSubscriptions = [],
        onNavigate,
        onAddNew,
        onScanEmail,
        onScanReceipt,
        onConnectBank,
        isPro,
        calculateMonthlyEquivalent = (cost, cycle) => parseFloat(cost),
        getDaysRemaining = (date) => Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24)),
        formatDate = (date) => new Date(date).toLocaleDateString()
    }) => {
        const [displayedMonthly, setDisplayedMonthly] = useState(0);
        const chartRef = useRef(null);
        const trendChartRef = useRef(null);

        // Animated count-up
        useEffect(() => {
            const duration = 1000;
            const steps = 60;
            const increment = totalMonthly / steps;
            let currentStep = 0;

            const interval = setInterval(() => {
                currentStep++;
                setDisplayedMonthly(Math.min(increment * currentStep, totalMonthly));
                if (currentStep >= steps) clearInterval(interval);
            }, duration / steps);

            return () => clearInterval(interval);
        }, [totalMonthly]);

        // Extract first name
        const firstName = user?.email?.split('@')[0]?.split('.')[0] || 'there';
        const formattedName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

        // Calculate stats
        const urgentTrials = trials.filter(t => getDaysRemaining(t.trial_end_date) <= 3);
        const activeCount = subscriptions.length;

        // Category breakdown
        const categoryData = {};
        subscriptions.forEach(sub => {
            const monthly = calculateMonthlyEquivalent(parseFloat(sub.cost), sub.billing_cycle);
            categoryData[sub.category] = (categoryData[sub.category] || 0) + monthly;
        });

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

        // Generate mock 12-month trend data
        const generateTrendData = () => {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const currentMonth = new Date().getMonth();
            const data = [];
            
            for (let i = 11; i >= 0; i--) {
                const monthIndex = (currentMonth - i + 12) % 12;
                const baseValue = totalMonthly * (0.7 + Math.random() * 0.4);
                data.push({
                    month: months[monthIndex],
                    value: i === 0 ? totalMonthly : baseValue
                });
            }
            return data;
        };

        const trendData = generateTrendData();

        // Get upcoming bills (next 7 days)
        const getUpcomingBills = () => {
            const today = new Date();
            const upcoming = subscriptions
                .filter(sub => sub.next_billing_date)
                .map(sub => ({
                    ...sub,
                    daysUntil: Math.ceil((new Date(sub.next_billing_date) - today) / (1000 * 60 * 60 * 24))
                }))
                .filter(sub => sub.daysUntil >= 0 && sub.daysUntil <= 7)
                .sort((a, b) => a.daysUntil - b.daysUntil)
                .slice(0, 5);
            return upcoming;
        };

        const upcomingBills = getUpcomingBills();

        // Get top 5 most expensive
        const topExpensive = [...subscriptions]
            .sort((a, b) => {
                const aMonthly = calculateMonthlyEquivalent(parseFloat(a.cost), a.billing_cycle);
                const bMonthly = calculateMonthlyEquivalent(parseFloat(b.cost), b.billing_cycle);
                return bMonthly - aMonthly;
            })
            .slice(0, 5);

        // PROBLEMS DETECTED
        const generateProblems = () => {
            const problems = [];
            
            // Urgent trials
            if (urgentTrials.length > 0) {
                problems.push({
                    icon: '⏰',
                    text: `${urgentTrials.length} trial${urgentTrials.length > 1 ? 's' : ''} ending within 3 days`,
                    type: 'urgent',
                    action: 'Manage'
                });
            }
            
            // Budget overrun
            if (monthlyBudget && totalMonthly > monthlyBudget) {
                const overage = totalMonthly - monthlyBudget;
                problems.push({
                    icon: '💸',
                    text: `$${overage.toFixed(2)} over monthly budget`,
                    type: 'alert',
                    action: 'Review'
                });
            }
            
            // Unused subscriptions (mock)
            const potentiallyUnused = subscriptions.filter(sub => 
                sub.last_used && getDaysRemaining(sub.last_used) < -60
            );
            if (potentiallyUnused.length > 0) {
                problems.push({
                    icon: '⚠️',
                    text: `${potentiallyUnused.length} subscription${potentiallyUnused.length > 1 ? 's' : ''} unused for 60+ days`,
                    type: 'warning',
                    action: 'Review'
                });
            }
            
            return problems;
        };

        const problems = generateProblems();

        // Smart insights
        const generateInsights = () => {
            const insights = [];
            
            // Savings achievement
            if (cancelledSubscriptions.length > 0) {
                const totalSaved = cancelledSubscriptions.reduce((sum, sub) => 
                    sum + calculateMonthlyEquivalent(parseFloat(sub.cost), sub.billing_cycle), 0
                );
                insights.push({
                    icon: '🎉',
                    text: `You've saved $${totalSaved.toFixed(2)}/month by cancelling ${cancelledSubscriptions.length} subscription${cancelledSubscriptions.length > 1 ? 's' : ''}`,
                    type: 'success',
                    action: null
                });
            }
            
            // Category concentration
            const topCategory = Object.entries(categoryData).sort((a, b) => b[1] - a[1])[0];
            if (topCategory) {
                const percent = ((topCategory[1] / totalMonthly) * 100).toFixed(0);
                if (percent > 50) {
                    insights.push({
                        icon: '📊',
                        text: `${percent}% of spending is on ${topCategory[0]}`,
                        type: 'info',
                        action: 'View'
                    });
                }
            }
            
            return insights.slice(0, 2);
        };

        const insights = generateInsights();

        // Recent activity (mock)
        const recentActivity = [
            { type: 'renewed', name: subscriptions[0]?.name || 'Netflix', amount: 15.99, time: '2 hours ago', icon: '🔵' },
            { type: 'added', name: subscriptions[1]?.name || 'Spotify', amount: 9.99, time: '1 day ago', icon: '🟢' },
            { type: 'trial_started', name: subscriptions[2]?.name || 'Adobe', amount: 0, time: '3 days ago', icon: '🟡' }
        ].slice(0, Math.min(subscriptions.length, 3));

        // Draw category donut chart (REFINED - reduced glow)
        useEffect(() => {
            if (chartRef.current && Object.keys(categoryData).length > 0) {
                const canvas = chartRef.current;
                const ctx = canvas.getContext('2d');
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const radius = 140;

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                const total = Object.values(categoryData).reduce((sum, val) => sum + val, 0);

                let startAngle = -Math.PI / 2;
                Object.entries(categoryData).forEach(([category, amount]) => {
                    const sliceAngle = (amount / total) * 2 * Math.PI;
                    const categoryColor = categoryColors[category]?.color || '#6b7280';
                    
                    // REDUCED shadow blur from 15 to 10
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = categoryColor + '40'; // Added 40 for transparency
                    
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
                    ctx.lineTo(centerX, centerY);
                    ctx.fillStyle = categoryColor;
                    ctx.fill();
                    
                    ctx.shadowBlur = 0;
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 3;
                    ctx.stroke();
                    
                    startAngle += sliceAngle;
                });

                // Center circle
                const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 85);
                gradient.addColorStop(0, '#ffffff');
                gradient.addColorStop(1, '#f8fafc');
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, 85, 0, 2 * Math.PI);
                ctx.fillStyle = gradient;
                ctx.fill();
                
                ctx.strokeStyle = 'rgba(76, 52, 245, 0.2)'; // Changed from cyan to primary
                ctx.lineWidth = 2;
                ctx.stroke();

                // Center text
                ctx.fillStyle = '#0f172a';
                ctx.font = 'bold 36px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`$${displayedMonthly.toFixed(0)}`, centerX, centerY - 10);
                
                ctx.font = '14px Inter, sans-serif';
                ctx.fillStyle = '#64748b';
                ctx.fillText('per month', centerX, centerY + 15);
            }
        }, [categoryData, displayedMonthly]);

        // Draw trend line chart (with subtle grid)
        useEffect(() => {
            if (trendChartRef.current && trendData.length > 0) {
                const canvas = trendChartRef.current;
                const ctx = canvas.getContext('2d');
                const width = canvas.width;
                const height = canvas.height;
                const padding = 40;
                const chartWidth = width - padding * 2;
                const chartHeight = height - padding * 2;

                ctx.clearRect(0, 0, width, height);

                const maxValue = Math.max(...trendData.map(d => d.value));
                const minValue = Math.min(...trendData.map(d => d.value)) * 0.9;
                const valueRange = maxValue - minValue;

                // Draw grid lines (SUBTLE - opacity 0.5)
                ctx.strokeStyle = 'rgba(226, 232, 240, 0.5)';
                ctx.lineWidth = 1;
                for (let i = 0; i <= 4; i++) {
                    const y = padding + (chartHeight / 4) * i;
                    ctx.beginPath();
                    ctx.moveTo(padding, y);
                    ctx.lineTo(width - padding, y);
                    ctx.stroke();
                }

                // Draw line
                ctx.beginPath();
                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 3;
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';

                trendData.forEach((point, index) => {
                    const x = padding + (chartWidth / (trendData.length - 1)) * index;
                    const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
                    
                    if (index === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                });
                ctx.stroke();

                // Draw gradient fill
                const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
                gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
                gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
                
                ctx.beginPath();
                trendData.forEach((point, index) => {
                    const x = padding + (chartWidth / (trendData.length - 1)) * index;
                    const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
                    
                    if (index === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                });
                ctx.lineTo(width - padding, height - padding);
                ctx.lineTo(padding, height - padding);
                ctx.closePath();
                ctx.fillStyle = gradient;
                ctx.fill();

                // Draw points
                trendData.forEach((point, index) => {
                    const x = padding + (chartWidth / (trendData.length - 1)) * index;
                    const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
                    
                    ctx.beginPath();
                    ctx.arc(x, y, 4, 0, 2 * Math.PI);
                    ctx.fillStyle = '#3b82f6';
                    ctx.fill();
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                });

                // Draw month labels
                ctx.fillStyle = '#64748b';
                ctx.font = '12px Inter, sans-serif';
                ctx.textAlign = 'center';
                trendData.forEach((point, index) => {
                    if (index % 2 === 0) {
                        const x = padding + (chartWidth / (trendData.length - 1)) * index;
                        ctx.fillText(point.month, x, height - 15);
                    }
                });

                // Draw value labels
                ctx.textAlign = 'right';
                for (let i = 0; i <= 4; i++) {
                    const value = maxValue - (valueRange / 4) * i;
                    const y = padding + (chartHeight / 4) * i;
                    ctx.fillText(`$${value.toFixed(0)}`, padding - 10, y + 4);
                }
            }
        }, [trendData]);

        // Quick action cards
        const actionCards = [
            {
                id: 'scan-email',
                icon: '📧',
                title: 'Scan Emails',
                description: 'Auto-detect',
                gradient: 'from-red-500 to-pink-500',
                priority: true,
                onClick: onScanEmail
            },
            {
                id: 'add',
                icon: '➕',
                title: 'Add New',
                description: 'Manual entry',
                gradient: 'from-blue-500 to-cyan-500',
                onClick: onAddNew
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
                description: 'Auto-sync',
                gradient: 'from-green-500 to-emerald-500',
                onClick: onConnectBank
            }
        ];

        const getDayLabel = (days) => {
            if (days === 0) return 'Today';
            if (days === 1) return 'Tomorrow';
            return `in ${days} days`;
        };

        return (
            <div className="max-w-7xl mx-auto pb-12">
                <style>{`
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.8; }
                    }
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
                    .animate-fade-in-up {
                        animation: fadeInUp 0.6s ease-out;
                    }
                    .hover-lift {
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    .hover-lift:hover {
                        transform: translateY(-4px);
                        box-shadow: 0 10px 30px rgba(0, 9, 82, 0.12);
                    }
                    /* COMPACT WELCOME HEADER */
                    .welcome-header {
                        padding: 14px 0 !important;
                        margin-bottom: 24px;
                    }
                    .welcome-header h1 {
                        font-size: 28px !important;
                        margin-bottom: 4px !important;
                        line-height: 1.4;
                    }
                    .welcome-header p {
                        font-size: 15px !important;
                        line-height: 1.55;
                    }
                `}</style>

                {/* COMPACT WELCOME HEADER (REDUCED 30-40%) */}
                <div className="welcome-header animate-fade-in-up">
                    <div className="flex items-baseline gap-3 mb-1">
                        <h1 className="text-3xl font-black text-indigo-950">
                            Welcome back, {formattedName}!
                        </h1>
                        <span 
                            className="inline-block text-2xl" 
                            style={{
                                animation: 'wave 0.5s ease-in-out',
                                transformOrigin: '70% 70%'
                            }}
                        >
                            👋
                        </span>
                    </div>
                    <p className="text-base text-slate-600">
                        You're spending <span className="font-bold text-indigo-900">${displayedMonthly.toFixed(2)}/month</span> on{' '}
                        <span className="font-bold text-indigo-900">{activeCount}</span> subscriptions
                    </p>
                </div>

                {/* PROBLEMS DETECTED CARD */}
                {problems.length > 0 && (
                    <div className="mb-8 animate-fade-in-up">
                        <div className="bg-yellow-50 rounded-3xl p-6 border-2 border-yellow-200">
                            <h3 className="text-lg font-black text-yellow-900 mb-4 flex items-center gap-2">
                                <span>🚨</span>
                                Problems Detected
                            </h3>
                            <div className="space-y-3">
                                {problems.map((problem, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-yellow-100"
                                    >
                                        <span className="text-xl">{problem.icon}</span>
                                        <p className="flex-1 font-semibold text-sm text-slate-800">{problem.text}</p>
                                        {problem.action && (
                                            <button className="text-xs font-bold text-yellow-700 hover:text-yellow-800 transition-colors">
                                                {problem.action} →
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* URGENT TRIAL ALERTS (COMPACT) */}
                {urgentTrials.length > 0 && (
                    <div className="mb-8 space-y-4">
                        {urgentTrials.slice(0, 2).map((trial, index) => {
                            const daysLeft = getDaysRemaining(trial.trial_end_date);
                            return (
                                <div 
                                    key={trial.id}
                                    className="trial-alert relative overflow-hidden rounded-3xl p-5 border-2 hover-lift animate-fade-in-up"
                                    style={{
                                        background: 'linear-gradient(135deg, #fee2e2 0%, #fef3c7 100%)',
                                        borderColor: daysLeft === 0 ? '#dc2626' : '#f59e0b',
                                        animationDelay: `${index * 100}ms`,
                                        boxShadow: '0 10px 30px rgba(239, 68, 68, 0.15)'
                                    }}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="text-3xl">{daysLeft === 0 ? '🚨' : '⏰'}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-black text-red-900">
                                                    {trial.name} Trial Ending {daysLeft === 0 ? 'TODAY!' : `in ${daysLeft} day${daysLeft > 1 ? 's' : ''}!`}
                                                </h3>
                                                {daysLeft === 0 && (
                                                    <span className="px-2 py-1 bg-red-600 text-white rounded-full text-xs font-bold animate-pulse">
                                                        URGENT
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-red-800 mb-3">
                                                Cancel now to avoid ${trial.cost} charge on {formatDate(trial.trial_end_date)}
                                            </p>
                                            <div className="flex gap-3">
                                                <button className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold hover:shadow-xl transition-all text-sm">
                                                    Cancel Trial Now
                                                </button>
                                                <button className="px-4 py-2 bg-white text-red-900 border-2 border-red-300 rounded-xl font-bold hover:bg-red-50 transition-all text-sm">
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

                {/* SPENDING TREND CHART */}
                {subscriptions.length > 0 && (
                    <div className="mb-8 animate-fade-in-up" style={{animationDelay: '100ms'}}>
                        <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-200">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-black text-indigo-950">📈 Spending Trend</h2>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-slate-600">Last 12 months</span>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <span className="text-slate-500">Monthly spend</span>
                                    </div>
                                </div>
                            </div>
                            <canvas ref={trendChartRef} width="900" height="250"></canvas>
                        </div>
                    </div>
                )}

                {/* MAIN GRID - Charts + Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    {/* LEFT: Category Breakdown Chart */}
                    <div className="lg:col-span-2 animate-fade-in-up" style={{animationDelay: '200ms'}}>
                        <div className="relative rounded-3xl p-10 overflow-hidden bg-gradient-to-br from-indigo-950 to-blue-900 shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400 opacity-10 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400 opacity-10 rounded-full blur-3xl"></div>
                            
                            <h2 className="text-2xl font-black mb-8 text-white relative z-10">💰 Category Breakdown</h2>
                            
                            {Object.keys(categoryData).length > 0 ? (
                                <div className="flex flex-col lg:flex-row items-center gap-8 relative z-10">
                                    <div className="relative">
                                        <canvas ref={chartRef} width="300" height="300" style={{filter: 'drop-shadow(0 5px 15px rgba(153, 252, 250, 0.2))'}}></canvas>
                                    </div>

                                    <div className="flex-1 w-full space-y-3">
                                        {Object.entries(categoryData).sort((a, b) => b[1] - a[1]).map(([category, amount]) => {
                                            const catColor = categoryColors[category];
                                            return (
                                                <div 
                                                    key={category}
                                                    className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl hover-lift border border-white/20"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-2xl">{catColor?.icon}</span>
                                                            <span className="font-bold text-white">{category}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-black text-lg text-white">${amount.toFixed(2)}</p>
                                                            <p className="text-xs text-cyan-300">
                                                                {((amount / totalMonthly) * 100).toFixed(0)}%
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-16 relative z-10">
                                    <div className="text-6xl mb-4">📊</div>
                                    <p className="text-white text-xl font-bold mb-2">No spending data yet</p>
                                    <p className="text-cyan-200 mb-6">Add your first subscription to see spending trends</p>
                                    <button 
                                        onClick={onAddNew}
                                        className="px-6 py-3 bg-cyan-400 text-indigo-950 rounded-xl font-bold hover:bg-cyan-300 transition-all"
                                    >
                                        ➕ Add Your First Subscription
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Smart Insights + Top Expenses */}
                    <div className="space-y-6 animate-fade-in-up" style={{animationDelay: '300ms'}}>
                        {/* Smart Insights */}
                        {insights.length > 0 && (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 border-2 border-green-200 shadow-lg">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-2xl">💡</span>
                                    <h3 className="text-xl font-black text-green-900">Smart Insights</h3>
                                </div>
                                <div className="space-y-3">
                                    {insights.map((insight, index) => (
                                        <div 
                                            key={index}
                                            className="p-4 bg-white rounded-2xl border border-green-100"
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="text-xl flex-shrink-0">{insight.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-slate-800 mb-2">{insight.text}</p>
                                                    {insight.action && (
                                                        <button className="text-xs font-bold text-green-600 hover:text-green-700">
                                                            {insight.action} →
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Top 5 Most Expensive */}
                        {topExpensive.length > 0 && (
                            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-lg">
                                <h3 className="text-lg font-black text-indigo-950 mb-4">💸 Top Expenses</h3>
                                <div className="space-y-3">
                                    {topExpensive.map((sub, index) => {
                                        const monthlyCost = calculateMonthlyEquivalent(parseFloat(sub.cost), sub.billing_cycle);
                                        return (
                                            <div key={sub.id} className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-sm">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm text-slate-800 truncate">{sub.name}</p>
                                                    <p className="text-xs text-slate-500">{sub.category}</p>
                                                </div>
                                                <p className="font-black text-indigo-900">${monthlyCost.toFixed(2)}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Budget Progress (if set) */}
                        {monthlyBudget && (
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 border-2 border-blue-200 shadow-lg">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-2xl">🎯</span>
                                    <h3 className="text-lg font-black text-blue-900">Budget Goal</h3>
                                </div>
                                <div className="mb-4">
                                    <div className="flex items-baseline justify-between mb-2">
                                        <span className="text-3xl font-black text-blue-900">
                                            ${totalMonthly.toFixed(0)}
                                        </span>
                                        <span className="text-sm text-blue-700">
                                            of ${monthlyBudget.toFixed(0)}
                                        </span>
                                    </div>
                                    <div className="h-3 bg-white rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000"
                                            style={{ width: `${Math.min((totalMonthly / monthlyBudget) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <p className="text-xs text-blue-700">
                                    {totalMonthly > monthlyBudget ? 
                                        `$${(totalMonthly - monthlyBudget).toFixed(2)} over budget` :
                                        `$${(monthlyBudget - totalMonthly).toFixed(2)} remaining`
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* UPCOMING BILLS TIMELINE */}
                {upcomingBills.length > 0 && (
                    <div className="mb-10 animate-fade-in-up" style={{animationDelay: '400ms'}}>
                        <h2 className="text-2xl font-black mb-6 text-indigo-950">📅 Upcoming Bills (Next 7 Days)</h2>
                        <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-lg">
                            <div className="space-y-4">
                                {upcomingBills.map((bill) => {
                                    const monthlyCost = calculateMonthlyEquivalent(parseFloat(bill.cost), bill.billing_cycle);
                                    return (
                                        <div key={bill.id} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                                            <div className="flex-shrink-0 w-16 text-center">
                                                <p className="text-2xl font-black text-indigo-900">
                                                    {new Date(bill.next_billing_date).getDate()}
                                                </p>
                                                <p className="text-xs font-semibold text-slate-500 uppercase">
                                                    {new Date(bill.next_billing_date).toLocaleDateString('en-US', { month: 'short' })}
                                                </p>
                                            </div>
                                            <div className="h-12 w-px bg-slate-200"></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-800">{bill.name}</p>
                                                <p className="text-sm text-slate-500">{getDayLabel(bill.daysUntil)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-indigo-900">${monthlyCost.toFixed(2)}</p>
                                                <p className="text-xs text-slate-500">{bill.billing_cycle}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* QUICK ACTIONS */}
                <div className="mb-10">
                    <h2 className="text-2xl font-black mb-6 text-indigo-950">⚡ Quick Actions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {actionCards.map((card, index) => (
                            <button
                                key={card.id}
                                onClick={card.onClick}
                                className={`relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-3xl p-6 text-left hover-lift group border-2 ${
                                    card.priority ? 'border-red-300 shadow-lg shadow-red-200' : 'border-transparent'
                                }`}
                                style={{
                                    animationDelay: `${index * 100}ms`,
                                    animation: 'fadeInUp 0.6s ease-out forwards'
                                }}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                                <div className="relative z-10">
                                    <div className={`w-14 h-14 mb-4 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-3xl transform group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-lg`}>
                                        {card.icon}
                                    </div>
                                    <h3 className="font-black text-lg text-indigo-950 mb-1">{card.title}</h3>
                                    <p className="text-sm text-slate-600">{card.description}</p>
                                    {card.priority && (
                                        <div className="mt-2 text-xs font-bold text-red-600 flex items-center gap-1">
                                            ✨ Recommended
                                        </div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* RECENT ACTIVITY FEED */}
                {recentActivity.length > 0 && (
                    <div className="mb-10 animate-fade-in-up" style={{animationDelay: '500ms'}}>
                        <h2 className="text-2xl font-black mb-6 text-indigo-950">🔔 Recent Activity</h2>
                        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-lg">
                            <div className="space-y-4">
                                {recentActivity.map((activity, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                                        <span className="text-3xl">{activity.icon}</span>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800">
                                                {activity.type === 'renewed' && `${activity.name} renewed`}
                                                {activity.type === 'added' && `Added ${activity.name}`}
                                                {activity.type === 'trial_started' && `Started ${activity.name} trial`}
                                            </p>
                                            <p className="text-sm text-slate-500">{activity.time}</p>
                                        </div>
                                        {activity.amount > 0 && (
                                            <p className="font-black text-lg text-red-600">-${activity.amount}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ALL SUBSCRIPTIONS GRID */}
                {subscriptions.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-black mb-6 text-indigo-950">📊 All Subscriptions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {subscriptions.slice(0, 6).map((sub, index) => {
                                const monthlyCost = calculateMonthlyEquivalent(parseFloat(sub.cost), sub.billing_cycle);
                                return (
                                    <div 
                                        key={sub.id}
                                        className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 hover-lift border-2 border-transparent hover:border-cyan-200"
                                        style={{
                                            animationDelay: `${index * 100}ms`,
                                            animation: 'fadeInUp 0.6s ease-out forwards'
                                        }}
                                    >
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-black text-white shadow-lg">
                                                {sub.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-base text-indigo-950 truncate">{sub.name}</h3>
                                                <p className="text-sm text-slate-600">{sub.category}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-baseline justify-between mb-2">
                                            <span className="text-2xl font-black text-indigo-950">${monthlyCost.toFixed(2)}</span>
                                            <span className="text-sm text-slate-500">/month</span>
                                        </div>
                                        {sub.next_billing_date && (
                                            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                                <p className="text-xs font-semibold text-slate-600 flex items-center gap-2">
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
            </div>
        );
    };

    // Expose to window
    window.UltimateDashboard = EnhancedUltimateDashboard;
})();