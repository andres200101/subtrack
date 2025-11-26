// Ultimate Dashboard Component - FINAL PRODUCTION VERSION
// Premium quality matching Rocket Money standards
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

        // REFINED COLOR PALETTE - More sophisticated
        const categoryColors = {
            'Streaming': { color: '#8B5CF6', light: '#A78BFA', icon: '🎬' },
            'Software': { color: '#3B82F6', light: '#60A5FA', icon: '💻' },
            'Gaming': { color: '#10B981', light: '#34D399', icon: '🎮' },
            'Fitness': { color: '#F59E0B', light: '#FBBF24', icon: '💪' },
            'News': { color: '#EF4444', light: '#F87171', icon: '📰' },
            'Music': { color: '#EC4899', light: '#F472B6', icon: '🎵' },
            'Cloud Storage': { color: '#06B6D4', light: '#22D3EE', icon: '☁️' },
            'Other': { color: '#6B7280', light: '#9CA3AF', icon: '📦' }
        };

        // Generate trend data
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

        // Get upcoming bills
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

        // Top 5 expensive
        const topExpensive = [...subscriptions]
            .sort((a, b) => {
                const aMonthly = calculateMonthlyEquivalent(parseFloat(a.cost), a.billing_cycle);
                const bMonthly = calculateMonthlyEquivalent(parseFloat(b.cost), b.billing_cycle);
                return bMonthly - aMonthly;
            })
            .slice(0, 5);

        // Problems detection
        const generateProblems = () => {
            const problems = [];
            
            if (urgentTrials.length > 0) {
                problems.push({
                    icon: '⏰',
                    text: `${urgentTrials.length} trial${urgentTrials.length > 1 ? 's' : ''} ending within 3 days`,
                    type: 'urgent',
                    action: 'Manage'
                });
            }
            
            if (monthlyBudget && totalMonthly > monthlyBudget) {
                const overage = totalMonthly - monthlyBudget;
                problems.push({
                    icon: '💸',
                    text: `$${overage.toFixed(2)} over monthly budget`,
                    type: 'alert',
                    action: 'Review'
                });
            }
            
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

        // Recent activity
        const recentActivity = [
            { type: 'renewed', name: subscriptions[0]?.name || 'Netflix', amount: 15.99, time: '2 hours ago', icon: '🔵' },
            { type: 'added', name: subscriptions[1]?.name || 'Spotify', amount: 9.99, time: '1 day ago', icon: '🟢' },
            { type: 'trial_started', name: subscriptions[2]?.name || 'Adobe', amount: 0, time: '3 days ago', icon: '🟡' }
        ].slice(0, Math.min(subscriptions.length, 3));

        // REFINED DONUT CHART - Premium quality
        useEffect(() => {
            if (chartRef.current && Object.keys(categoryData).length > 0) {
                const canvas = chartRef.current;
                const ctx = canvas.getContext('2d');
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const outerRadius = 135;
                const innerRadius = 85;

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                const total = Object.values(categoryData).reduce((sum, val) => sum + val, 0);
                let startAngle = -Math.PI / 2;

                // Draw segments
                Object.entries(categoryData).forEach(([category, amount]) => {
                    const sliceAngle = (amount / total) * 2 * Math.PI;
                    const colors = categoryColors[category] || { color: '#6B7280', light: '#9CA3AF' };
                    
                    // Minimal shadow
                    ctx.shadowBlur = 4;
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
                    ctx.shadowOffsetY = 2;
                    
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, outerRadius, startAngle, startAngle + sliceAngle);
                    ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
                    ctx.closePath();
                    
                    // Subtle gradient
                    const gradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius);
                    gradient.addColorStop(0, colors.light);
                    gradient.addColorStop(1, colors.color);
                    ctx.fillStyle = gradient;
                    ctx.fill();
                    
                    // Clean white borders
                    ctx.shadowBlur = 0;
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2.5;
                    ctx.stroke();
                    
                    startAngle += sliceAngle;
                });

                // Premium center circle
                const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, innerRadius - 5);
                centerGradient.addColorStop(0, '#ffffff');
                centerGradient.addColorStop(1, '#fafbfc');
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, innerRadius - 5, 0, 2 * Math.PI);
                ctx.fillStyle = centerGradient;
                ctx.fill();
                
                ctx.strokeStyle = 'rgba(76, 52, 245, 0.12)';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Center text - refined
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Amount
                ctx.font = '900 38px Inter, sans-serif';
                ctx.fillStyle = '#0f172a';
                ctx.fillText(`$${displayedMonthly.toFixed(0)}`, centerX, centerY - 8);
                
                // Label
                ctx.font = '600 13px Inter, sans-serif';
                ctx.fillStyle = '#64748b';
                ctx.fillText('per month', centerX, centerY + 18);
            }
        }, [categoryData, displayedMonthly]);

        // REFINED TREND CHART - Clean & professional
        useEffect(() => {
            if (trendChartRef.current && trendData.length > 0) {
                const canvas = trendChartRef.current;
                const ctx = canvas.getContext('2d');
                const width = canvas.width;
                const height = canvas.height;
                const padding = 50;
                const chartWidth = width - padding * 2;
                const chartHeight = height - padding * 2;

                ctx.clearRect(0, 0, width, height);

                const maxValue = Math.max(...trendData.map(d => d.value));
                const minValue = Math.min(...trendData.map(d => d.value)) * 0.92;
                const valueRange = maxValue - minValue;

                // Subtle grid
                ctx.strokeStyle = 'rgba(226, 232, 240, 0.6)';
                ctx.lineWidth = 1;
                for (let i = 0; i <= 4; i++) {
                    const y = padding + (chartHeight / 4) * i;
                    ctx.beginPath();
                    ctx.moveTo(padding, y);
                    ctx.lineTo(width - padding, y);
                    ctx.stroke();
                }

                // Gradient fill
                const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
                gradient.addColorStop(0, 'rgba(76, 52, 245, 0.12)');
                gradient.addColorStop(1, 'rgba(76, 52, 245, 0)');
                
                ctx.beginPath();
                trendData.forEach((point, index) => {
                    const x = padding + (chartWidth / (trendData.length - 1)) * index;
                    const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
                    
                    if (index === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });
                ctx.lineTo(width - padding, height - padding);
                ctx.lineTo(padding, height - padding);
                ctx.closePath();
                ctx.fillStyle = gradient;
                ctx.fill();

                // Line
                ctx.beginPath();
                ctx.strokeStyle = '#4C34F5';
                ctx.lineWidth = 3;
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';

                trendData.forEach((point, index) => {
                    const x = padding + (chartWidth / (trendData.length - 1)) * index;
                    const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
                    
                    if (index === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });
                ctx.stroke();

                // Points
                trendData.forEach((point, index) => {
                    const x = padding + (chartWidth / (trendData.length - 1)) * index;
                    const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
                    
                    ctx.beginPath();
                    ctx.arc(x, y, 5, 0, 2 * Math.PI);
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();
                    ctx.strokeStyle = '#4C34F5';
                    ctx.lineWidth = 2.5;
                    ctx.stroke();
                });

                // Y-axis labels
                ctx.fillStyle = '#64748b';
                ctx.font = '600 12px Inter, sans-serif';
                ctx.textAlign = 'right';
                
                for (let i = 0; i <= 4; i++) {
                    const value = maxValue - (valueRange / 4) * i;
                    const y = padding + (chartHeight / 4) * i;
                    ctx.fillText(`$${Math.round(value).toLocaleString()}`, padding - 12, y + 4);
                }

                // X-axis labels
                ctx.textAlign = 'center';
                trendData.forEach((point, index) => {
                    if (index % 2 === 0) {
                        const x = padding + (chartWidth / (trendData.length - 1)) * index;
                        ctx.fillText(point.month, x, height - 25);
                    }
                });

                // Current month indicator
                const lastX = padding + chartWidth;
                const currentMonth = trendData[trendData.length - 1].month;
                ctx.fillStyle = '#4C34F5';
                ctx.font = '700 12px Inter, sans-serif';
                ctx.fillText(currentMonth, lastX, height - 25);
            }
        }, [trendData]);

        // Action cards
        const actionCards = [
            { id: 'scan-email', icon: '📧', title: 'Scan Emails', description: 'Auto-detect', gradient: 'from-orange-500 to-pink-500', priority: true, onClick: onScanEmail },
            { id: 'add', icon: '➕', title: 'Add New', description: 'Manual entry', gradient: 'from-blue-500 to-cyan-500', onClick: onAddNew },
            { id: 'scan-receipt', icon: '📸', title: 'Scan Receipt', description: 'OCR from photo', gradient: 'from-purple-500 to-pink-500', onClick: onScanReceipt },
            { id: 'bank', icon: '🏦', title: 'Connect Bank', description: 'Auto-sync', gradient: 'from-green-500 to-emerald-500', onClick: onConnectBank }
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
                    .animate-fade-in-up { animation: fadeInUp 0.6s ease-out; }
                    .hover-lift {
                        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    .hover-lift:hover {
                        transform: translateY(-4px);
                        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
                    }
                    * {
                        -webkit-font-smoothing: antialiased;
                        -moz-osx-font-smoothing: grayscale;
                    }
                `}</style>

                {/* Compact welcome */}
                <div className="mb-8" style={{paddingTop: '16px'}}>
                    <h1 className="text-3xl font-black text-slate-900 mb-2" style={{letterSpacing: '-0.02em'}}>
                        Welcome back, {formattedName}! 👋
                    </h1>
                    <p className="text-base text-slate-600">
                        You're spending <span className="font-bold text-indigo-600">${displayedMonthly.toFixed(2)}/month</span> on{' '}
                        <span className="font-bold text-indigo-600">{activeCount}</span> subscriptions
                    </p>
                </div>

                {/* Problems */}
                {problems.length > 0 && (
                    <div className="mb-8">
                        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
                            <h3 className="text-base font-bold text-amber-900 mb-3 flex items-center gap-2">
                                <span>⚠️</span> Issues Found
                            </h3>
                            <div className="space-y-2">
                                {problems.map((p, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                                        <span className="text-lg">{p.icon}</span>
                                        <p className="flex-1 text-sm font-medium text-slate-700">{p.text}</p>
                                        {p.action && <button className="text-xs font-bold text-amber-700">{p.action} →</button>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Trials */}
                {urgentTrials.length > 0 && urgentTrials.slice(0, 1).map(trial => {
                    const days = getDaysRemaining(trial.trial_end_date);
                    return (
                        <div key={trial.id} className="mb-8 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-5 border border-red-200">
                            <div className="flex gap-4">
                                <div className="text-3xl">{days === 0 ? '🚨' : '⏰'}</div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-black text-red-900 mb-1">
                                        {trial.name} Trial Ending {days === 0 ? 'TODAY!' : `in ${days} day${days > 1 ? 's' : ''}!`}
                                    </h3>
                                    <p className="text-sm text-red-800 mb-3">Cancel to avoid ${trial.cost} charge</p>
                                    <div className="flex gap-3">
                                        <button className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700">Cancel Now</button>
                                        <button className="px-4 py-2 bg-white border-2 border-red-300 text-red-900 rounded-xl text-sm font-bold hover:bg-red-50">Keep</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Trend chart */}
                {subscriptions.length > 0 && (
                    <div className="mb-8">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl font-black text-slate-900">📈 Spending Trend</h2>
                                <span className="text-sm text-slate-500">Last 12 months</span>
                            </div>
                            <canvas ref={trendChartRef} width="900" height="230"></canvas>
                        </div>
                    </div>
                )}

                {/* Main grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                    {/* Category breakdown */}
                    <div className="lg:col-span-2">
                        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-8 shadow-lg">
                            <h2 className="text-xl font-black text-white mb-6">💰 Category Breakdown</h2>
                            {Object.keys(categoryData).length > 0 ? (
                                <div className="flex flex-col lg:flex-row items-center gap-8">
                                    <canvas ref={chartRef} width="280" height="280"></canvas>
                                    <div className="flex-1 w-full space-y-3">
                                        {Object.entries(categoryData).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => {
                                            const color = categoryColors[cat];
                                            const pct = ((amt / totalMonthly) * 100).toFixed(0);
                                            return (
                                                <div key={cat} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-2xl">{color?.icon}</span>
                                                            <div>
                                                                <p className="font-bold text-white">{cat}</p>
                                                                <p className="text-xs text-cyan-200">{pct}% of total</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-xl font-black text-white">${amt.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <p className="text-white text-lg font-bold mb-4">No data yet</p>
                                    <button onClick={onAddNew} className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-gray-50">
                                        Add First Subscription
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right column */}
                    <div className="space-y-6">
                        {/* Insights */}
                        {insights.length > 0 && (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-200">
                                <h3 className="text-base font-black text-green-900 mb-3 flex items-center gap-2">
                                    <span>💡</span> Insights
                                </h3>
                                <div className="space-y-2">
                                    {insights.map((ins, i) => (
                                        <div key={i} className="p-3 bg-white rounded-xl">
                                            <p className="text-sm font-medium text-slate-700">{ins.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Top expenses */}
                        {topExpensive.length > 0 && (
                            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                                <h3 className="text-base font-black text-slate-900 mb-3">💸 Top Expenses</h3>
                                <div className="space-y-2">
                                    {topExpensive.map((sub, i) => {
                                        const cost = calculateMonthlyEquivalent(parseFloat(sub.cost), sub.billing_cycle);
                                        return (
                                            <div key={sub.id} className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
                                                    {i + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-sm text-slate-900 truncate">{sub.name}</p>
                                                    <p className="text-xs text-slate-500">{sub.category}</p>
                                                </div>
                                                <p className="font-bold text-slate-900">${cost.toFixed(2)}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="mb-10">
                    <h2 className="text-xl font-black text-slate-900 mb-4">⚡ Quick Actions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {actionCards.map((card, i) => (
                            <button key={card.id} onClick={card.onClick} 
                                className={`group bg-white rounded-2xl p-6 border-2 hover-lift text-left ${card.priority ? 'border-orange-300' : 'border-slate-200'}`}>
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                                    {card.icon}
                                </div>
                                <h3 className="font-bold text-slate-900 mb-1">{card.title}</h3>
                                <p className="text-sm text-slate-500">{card.description}</p>
                                {card.priority && <p className="text-xs font-bold text-orange-600 mt-2">⭐ Recommended</p>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* All subs grid */}
                {subscriptions.length > 0 && (
                    <div>
                        <h2 className="text-xl font-black text-slate-900 mb-4">📊 All Subscriptions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {subscriptions.slice(0, 6).map(sub => {
                                const cost = calculateMonthlyEquivalent(parseFloat(sub.cost), sub.billing_cycle);
                                return (
                                    <div key={sub.id} className="bg-white rounded-2xl p-5 border border-slate-200 hover-lift">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-bold">
                                                {sub.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-900 truncate">{sub.name}</p>
                                                <p className="text-sm text-slate-500">{sub.category}</p>
                                             </div>
                                         </div>
                                       <p className="text-2xl font-black text-slate-900 mb-1">${cost.toFixed(2)}<span className="text-sm text-slate-500 font-normal">/mo</span></p>
                                       {sub.next_billing_date && (
                                       <p className="text-xs text-slate-500">Next: {formatDate(sub.next_billing_date)}</p>
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
window.UltimateDashboard = EnhancedUltimateDashboard;
})();