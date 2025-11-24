import React, { useState, useEffect, useRef } from 'react';

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

    // Draw chart
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
                
                ctx.shadowBlur = 15;
                ctx.shadowColor = categoryColor;
                
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
            
            ctx.strokeStyle = 'rgba(153, 252, 250, 0.3)';
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

    // Quick action cards
    const actionCards = [
        {
            id: 'scan-email',
            icon: '📧',
            title: 'Scan Emails',
            description: 'Auto-detect subscriptions',
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
            `}</style>

            {/* COMPACT WELCOME HEADER - 25% Shorter */}
            <div className="mb-8 animate-fade-in-up">
                <div className="flex items-baseline gap-3 mb-2">
                    <h1 className="text-4xl font-black text-indigo-950">
                        Welcome back, {formattedName}!
                    </h1>
                    <span 
                        className="inline-block text-3xl" 
                        style={{
                            animation: 'wave 0.5s ease-in-out',
                            transformOrigin: '70% 70%'
                        }}
                    >
                        👋
                    </span>
                </div>
                <p className="text-lg text-slate-600">
                    You're spending <span className="font-bold text-indigo-900">${displayedMonthly.toFixed(2)}/month</span> on{' '}
                    <span className="font-bold text-indigo-900">{activeCount}</span> subscriptions
                </p>
            </div>

            {/* URGENT TRIAL ALERTS */}
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
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl">{daysLeft === 0 ? '🚨' : '⏰'}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-black text-red-900">
                                                {trial.name} Trial Ending {daysLeft === 0 ? 'TODAY!' : `in ${daysLeft} day${daysLeft > 1 ? 's' : ''}!`}
                                            </h3>
                                            {daysLeft === 0 && (
                                                <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold animate-pulse">
                                                    URGENT
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-red-800 mb-3">
                                            Cancel now to avoid ${trial.cost} charge on {formatDate(trial.trial_end_date)}
                                        </p>
                                        <div className="flex gap-3">
                                            <button className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold hover:shadow-xl transition-all">
                                                Cancel Trial Now
                                            </button>
                                            <button className="px-4 py-2 bg-white text-red-900 border-2 border-red-300 rounded-xl font-bold hover:bg-red-50 transition-all">
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

            {/* MAIN GRID - Chart + Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* Enhanced Spending Chart */}
                <div className="lg:col-span-2 animate-fade-in-up" style={{animationDelay: '200ms'}}>
                    <div className="relative rounded-3xl p-10 overflow-hidden bg-gradient-to-br from-indigo-950 to-blue-900 shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400 opacity-10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400 opacity-10 rounded-full blur-3xl"></div>
                        
                        <h2 className="text-2xl font-black mb-8 text-white relative z-10">💰 Your Spending</h2>
                        
                        {Object.keys(categoryData).length > 0 ? (
                            <div className="flex flex-col lg:flex-row items-center gap-8 relative z-10">
                                <div className="relative">
                                    <canvas ref={chartRef} width="300" height="300" style={{filter: 'drop-shadow(0 10px 30px rgba(153, 252, 250, 0.3))'}}></canvas>
                                </div>

                                <div className="flex-1 w-full space-y-3">
                                    {Object.entries(categoryData).sort((a, b) => b[1] - a[1]).map(([category, amount], index) => {
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

                {/* Stats Column - Hidden on xl (shown in right panel) */}
                <div className="space-y-4 lg:hidden">
                    {/* Mobile stats */}
                    <div className="rounded-2xl p-6 bg-gradient-to-br from-indigo-100 to-blue-100 border border-indigo-200">
                        <p className="text-xs font-bold uppercase text-indigo-700 mb-2">Monthly Total</p>
                        <p className="text-4xl font-black bg-gradient-to-r from-indigo-800 to-purple-700 bg-clip-text text-transparent">
                            ${totalMonthly.toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>

            {/* QUICK ACTIONS - Scan Emails First */}
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

            {/* RECENT SUBSCRIPTIONS */}
            {subscriptions.length > 0 && (
                <div>
                    <h2 className="text-2xl font-black mb-6 text-indigo-950">📊 Recent Subscriptions</h2>
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

window.UltimateDashboard = EnhancedUltimateDashboard;

export default EnhancedUltimateDashboard;