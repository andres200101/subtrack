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
        // ADD THIS NUMBER FORMATTING UTILITY HERE
    const formatCurrency = (value, compact = false) => {
        const num = parseFloat(value);
        
        if (compact) {
            if (num >= 1000000) {
                return `$${(num / 1000000).toFixed(1)}M`;
            }
            if (num >= 10000) {
                return `$${(num / 1000).toFixed(1)}K`;
            }
        }
        
        return `$${num.toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        })}`;
    };
    
    const formatCompactNumber = (value) => {
        const num = parseFloat(value);
        
        if (num >= 1000000000) {
            return `${(num / 1000000000).toFixed(1)}B`;
        }
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        }
        if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        }
        return num.toFixed(0);
    };
        const [displayedMonthly, setDisplayedMonthly] = useState(0);
        const chartRef = useRef(null);
        const trendChartRef = useRef(null);
        const [chartsLoaded, setChartsLoaded] = useState(false);
        // Track chart loading
        useEffect(() => {
             const timer = setTimeout(() => setChartsLoaded(true), 100);
             return () => clearTimeout(timer);
         }, []);
        // Animated count-up
        useEffect(() => {
            const duration = 800;
            const steps = 30;
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

        // Lines 64-73 - Replace categoryColors with:
const categoryColors = {
    'Streaming': { color: '#8B5CF6', icon: '🎬', light: '#A78BFA' }, // Purple
    'Software': { color: '#3B82F6', icon: '💻', light: '#60A5FA' }, // Blue
    'Gaming': { color: '#10B981', icon: '🎮', light: '#34D399' }, // Emerald
    'Fitness': { color: '#F59E0B', icon: '💪', light: '#FBBF24' }, // Amber
    'News': { color: '#EF4444', icon: '📰', light: '#F87171' }, // Red
    'Music': { color: '#EC4899', icon: '🎵', light: '#F472B6' }, // Pink
    'Cloud Storage': { color: '#06B6D4', icon: '☁️', light: '#22D3EE' }, // Cyan
    'Other': { color: '#6B7280', icon: '📦', light: '#9CA3AF' } // Gray
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

// Calculate spending pace
const getDaysInMonth = () => new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
const currentDay = new Date().getDate();
const expectedSpend = monthlyBudget ? (monthlyBudget / getDaysInMonth()) * currentDay : 0;
const spendingPace = expectedSpend > 0 ? ((totalMonthly / expectedSpend) * 100).toFixed(0) : 100;

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

        // In ultimate-dashboard.js, find the donut chart drawing (around line 180)
// Replace the entire useEffect for chartRef:

useEffect(() => {
    if (chartRef.current && Object.keys(categoryData).length > 0) {
        const canvas = chartRef.current;
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const outerRadius = 135;
        const innerRadius = 100; // Thicker donut

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const total = Object.values(categoryData).reduce((sum, val) => sum + val, 0);

        // ENHANCED: Brand-aligned colors with better contrast
        const enhancedColors = {
            'Streaming': { color: '#9333ea', light: '#c084fc' },
            'Software': { color: '#3b82f6', light: '#60a5fa' },
            'Gaming': { color: '#10b981', light: '#34d399' },
            'Fitness': { color: '#f59e0b', light: '#fbbf24' },
            'News': { color: '#ef4444', light: '#f87171' },
            'Music': { color: '#ec4899', light: '#f472b6' },
            'Cloud Storage': { color: '#06b6d4', light: '#22d3ee' },
            'Other': { color: '#6b7280', light: '#9ca3af' }
        };

        let startAngle = -Math.PI / 2;

        // Draw segments with subtle shadow
        Object.entries(categoryData).forEach(([category, amount]) => {
            const sliceAngle = (amount / total) * 2 * Math.PI;
            const colors = enhancedColors[category] || { color: '#6b7280', light: '#9ca3af' };
            
            // Subtle shadow (FIXED - reduced from 15 to 6)
            ctx.shadowBlur = 3;
            ctx.shadowColor = colors.color + '20';
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 2;
            
            // Draw outer arc
            ctx.beginPath();
            ctx.arc(centerX, centerY, outerRadius, startAngle, startAngle + sliceAngle);
            ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
            ctx.closePath();
            
            // Gradient fill for depth
            const gradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius);
            gradient.addColorStop(0, colors.light);
            gradient.addColorStop(1, colors.color);
            ctx.fillStyle = gradient;
            ctx.fill();
            
            // Clean edges
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            startAngle += sliceAngle;
        });

        // ENHANCED: Premium center circle with subtle gradient
        const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, innerRadius - 5);
        centerGradient.addColorStop(0, '#ffffff');
        centerGradient.addColorStop(1, '#f8fafc');
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, innerRadius - 5, 0, 2 * Math.PI);
        ctx.fillStyle = centerGradient;
        ctx.fill();
        
        // Elegant border
        ctx.strokeStyle = 'rgba(76, 52, 245, 0.15)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // ENHANCED: Hierarchical center text
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

// Amount - larger and centered properly with dynamic sizing
const displayValue = displayedMonthly >= 100000 
    ? formatCompactNumber(displayedMonthly) 
    : displayedMonthly.toFixed(0);

const fontSize = displayedMonthly >= 1000000 ? 48 : displayedMonthly >= 100000 ? 52 : 56;

ctx.fillStyle = '#1e293b';
ctx.font = `900 ${fontSize}px Inter, sans-serif`;
ctx.fillText(`$${displayValue}`, centerX, centerY - 10);

// Label
ctx.font = '600 14px Inter, sans-serif';
ctx.fillStyle = '#64748b';
ctx.fillText('per month', centerX, centerY + 28);

// Percentage indicator
ctx.font = '700 12px Inter, sans-serif';
ctx.fillStyle = '#10b981';
ctx.fillText('▲ 4.2%', centerX, centerY + 46);
    }
}, [categoryData, displayedMonthly]);

        //trend chart drawing section 
useEffect(() => {
    if (trendChartRef.current && trendData.length > 0) {
        const canvas = trendChartRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const padding = 70; 
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        ctx.clearRect(0, 0, width, height);

        const dataMax = Math.max(...trendData.map(d => d.value));
const dataMin = Math.min(...trendData.map(d => d.value));

// Add 10% padding above and below for better visual spacing
const range = dataMax - dataMin;
const maxValue = dataMax + (range * 0.1);
const minValue = Math.max(0, dataMin - (range * 0.1)); // Don't go below 0
const valueRange = maxValue - minValue;

        // ENHANCED: Draw grid with better visibility
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.8)'; // Increased opacity
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]); // Dashed lines
        
        for (let i = 0; i <= 4; i++) {
            const y = padding + (chartHeight / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        ctx.setLineDash([]); // Reset

        // ENHANCED: Draw gradient area fill with brand colors
        const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
        gradient.addColorStop(0, 'rgba(76, 52, 245, 0.15)'); // Primary color
        gradient.addColorStop(0.5, 'rgba(76, 52, 245, 0.08)');
        gradient.addColorStop(1, 'rgba(76, 52, 245, 0)');
        
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

        // Draw budget reference line (if set)
        if (monthlyBudget) {
            const budgetY = padding + chartHeight - ((monthlyBudget - minValue) / valueRange) * chartHeight;
            
            ctx.setLineDash([8, 4]);
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(padding, budgetY);
            ctx.lineTo(width - padding, budgetY);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Budget label with compact formatting
ctx.fillStyle = '#ef4444';
ctx.font = '600 12px Inter, sans-serif';
ctx.textAlign = 'left';
const budgetDisplay = monthlyBudget >= 10000 
    ? `Budget: $${(monthlyBudget / 1000).toFixed(1)}K`
    : `Budget: $${monthlyBudget.toFixed(0)}`;
ctx.fillText(budgetDisplay, padding + 10, budgetY - 8);
        }

        // ENHANCED: Draw line with gradient stroke
        const lineGradient = ctx.createLinearGradient(padding, 0, width - padding, 0);
        lineGradient.addColorStop(0, '#6366f1');    // Indigo
        lineGradient.addColorStop(0.6, '#8b5cf6');  // Purple
        lineGradient.addColorStop(0.85, '#06b6d4'); // Cyan start
        lineGradient.addColorStop(1, '#0891b2');    // Cyan end
        
        ctx.beginPath();
        ctx.strokeStyle = lineGradient;
        ctx.lineWidth = 4; // Thicker line
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(76, 52, 245, 0.3)';
        ctx.shadowBlur = 8;

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
        ctx.shadowBlur = 0;

        // ENHANCED: Draw premium points with ring effect
        trendData.forEach((point, index) => {
            const x = padding + (chartWidth / (trendData.length - 1)) * index;
            const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
            
            // Outer ring
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, 2 * Math.PI);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.strokeStyle = index === trendData.length - 1 ? '#4C34F5' : '#6B54FF';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Inner dot
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = index === trendData.length - 1 ? '#4C34F5' : '#6B54FF';
            ctx.fill();
        });

        // ENHANCED: Draw Y-axis labels with better formatting
ctx.fillStyle = '#64748b';
ctx.font = '600 12px Inter, sans-serif';
ctx.textAlign = 'right';
ctx.textBaseline = 'middle';

for (let i = 0; i <= 4; i++) {
    const value = maxValue - (valueRange / 4) * i;
    const y = padding + (chartHeight / 4) * i;
    
    // Smart rounding based on magnitude
    let displayValue;
    if (value >= 1000000) {
        displayValue = `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 100000) {
        displayValue = `$${(value / 1000).toFixed(0)}K`;
    } else if (value >= 10000) {
        displayValue = `$${(value / 1000).toFixed(1)}K`;
    } else {
        const roundTo = value >= 1000 ? 100 : 10;
        const rounded = Math.round(value / roundTo) * roundTo;
        displayValue = `$${rounded.toLocaleString()}`;
    }
    
    ctx.fillText(displayValue, padding - 15, y);
}

        // ENHANCED: Draw X-axis labels with current month highlighted
        ctx.font = '600 13px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        trendData.forEach((point, index) => {
    const x = padding + (chartWidth / (trendData.length - 1)) * index;
    const isCurrentMonth = index === trendData.length - 1;
    
    // Show every other month OR current month
    if (index % 2 === 0 || isCurrentMonth) {
        if (isCurrentMonth) {
            ctx.fillStyle = '#4C34F5';
            const textWidth = ctx.measureText(point.month).width;
            ctx.beginPath();
            ctx.roundRect(x - textWidth/2 - 10, height - 35, textWidth + 20, 24, 12);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
        } else {
            ctx.fillStyle = '#94a3b8'; // Lighter gray for non-current
        }
        
        ctx.fillText(point.month, x, height - 23);
    }
});
    }
}, [trendData]);
// Add hover interaction for trend chart
useEffect(() => {
    if (!trendChartRef.current || trendData.length === 0) return;
    
    const canvas = trendChartRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const handleMouseMove = (e) => {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const padding = 70;
        const chartWidth = canvas.width - padding * 2;
        const pointWidth = chartWidth / (trendData.length - 1);
        
        // Find closest data point
        const index = Math.round((mouseX - padding) / pointWidth);
        if (index >= 0 && index < trendData.length) {
            canvas.style.cursor = 'pointer';
            // You can add a tooltip div here
        } else {
            canvas.style.cursor = 'default';
        }
    };
    
    canvas.addEventListener('mousemove', handleMouseMove);
    return () => canvas.removeEventListener('mousemove', handleMouseMove);
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
    
    /* ENHANCED: Better card spacing */
    .hover-lift {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .hover-lift:hover {
    transform: translateY(-4px); // Reduced from -6px (less jarring)
    box-shadow: 0 16px 32px rgba(76, 52, 245, 0.12),
                0 4px 12px rgba(76, 52, 245, 0.08);
}
    
    /* ENHANCED: Chart containers need more breathing room */
    canvas {
        image-rendering: -webkit-optimize-contrast;
        image-rendering: crisp-edges;
    }
    
    /* Better text rendering */
    * {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
    }
    
    @keyframes shine {
                to { transform: translateX(100%); }
            }
    
    /* Compact headers with better typography */
    .welcome-header {
        padding: 16px 0 !important;
        margin-bottom: 28px;
    }
    .welcome-header h1 {
    font-size: 36px !important; // Increased from 32px
    margin-bottom: 8px !important;
    line-height: 1.2;
    letter-spacing: -0.03em; // Tighter for better readability
    font-weight: 900; // Bolder
}
.welcome-header p {
    font-size: 17px !important; // Slightly larger
    line-height: 1.5;
    color: #475569; // Darker for better contrast
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
        <div className="relative bg-white rounded-3xl p-8 shadow-lg border border-slate-200">
            {!chartsLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-3xl z-10">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-sm font-semibold text-indigo-600">Loading chart...</p>
                    </div>
                </div>
            )}
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
                         <div className="relative rounded-3xl p-10 overflow-hidden bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e3a8a] shadow-2xl">
                             <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500 opacity-10 rounded-full blur-3xl"></div>
                             <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500 opacity-10 rounded-full blur-3xl"></div>
                            
                            <h2 className="text-2xl font-black mb-8 text-white relative z-10">💰 Category Breakdown</h2>

{Object.keys(categoryData).length > 0 ? (
    <div className="flex flex-col lg:flex-row items-center gap-8 relative z-10">
        <div className="relative">
            {!chartsLoaded && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
            )}
            <canvas ref={chartRef} width="300" height="300" style={{filter: 'drop-shadow(0 5px 15px rgba(153, 252, 250, 0.2))'}}></canvas>
                                    </div>
<div className="flex-1 w-full space-y-3">
    {Object.entries(categoryData).sort((a, b) => b[1] - a[1]).map(([category, amount], index) => {
        const catColor = categoryColors[category];
        const percentage = ((amount / totalMonthly) * 100).toFixed(0);
        
        return (
            <div 
                key={category}
                className="group relative bg-white/20 backdrop-blur-lg p-5 rounded-2xl hover-lift border border-white/40 transition-all duration-300 shadow-lg"
                style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                }}
            >
                {/* Progress bar background */}
                <div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                        background: `linear-gradient(90deg, ${catColor?.color}15 0%, transparent ${percentage}%)`
                    }}
                />
                
                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Icon with glow effect */}
                        <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110"
                            style={{
                                background: `linear-gradient(135deg, ${catColor?.color}20 0%, ${catColor?.color}10 100%)`,
                                boxShadow: `0 4px 12px ${catColor?.color}20`
                            }}
                        >
                            {catColor?.icon}
                        </div>
                        
                        <div>
                            <span className="font-bold text-white text-lg block mb-1">{category}</span>
                            <div className="flex items-center gap-2">
                                <div className="h-2.5 w-28 bg-white/25 rounded-full overflow-hidden shadow-inner">
    <div 
        className="h-full rounded-full transition-all duration-1000"
        style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${catColor?.color}, ${catColor?.light})`,
            boxShadow: `0 0 12px ${catColor?.color}80, inset 0 1px 2px rgba(255,255,255,0.3)`
        }}
    />
</div>
                                <span className="text-xs text-cyan-300 font-semibold">{percentage}%</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
    <p className="font-black text-2xl text-white group-hover:text-cyan-300 transition-colors">
        {formatCurrency(amount, amount >= 10000)}
    </p>
    <p className="text-xs text-cyan-200/90 font-semibold mt-1">
        {formatCurrency(amount / 30, (amount / 30) >= 1000)}/day
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
                                                <p className="font-black text-indigo-900 text-sm">
    {formatCurrency(monthlyCost, monthlyCost >= 1000)}
</p>
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
                            // In the Quick Actions section, enhance the buttons:
<button
    key={card.id}
    onClick={card.onClick}
    className={`group relative overflow-hidden bg-white rounded-3xl p-8 text-left border-2 transition-all duration-300 ${
        card.priority 
            ? 'border-red-300 shadow-lg shadow-red-100 hover:shadow-xl hover:shadow-red-200' 
            : 'border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100'
    }`}
    style={{
        animationDelay: `${index * 100}ms`,
        animation: 'fadeInUp 0.6s ease-out forwards'
    }}
>
    {/* Animated gradient background */}
    <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-all duration-500 group-hover:scale-110`}></div>
    
    {/* Shine effect on hover */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
         style={{
             background: 'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
             transform: 'translateX(-100%)',
             animation: 'shine 1.5s ease-in-out infinite'
         }}
    />
    
    <div className="relative z-10">
        <div className={`w-16 h-16 mb-5 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-4xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
            {card.icon}
        </div>
        <h3 className="font-black text-xl text-indigo-950 mb-2 group-hover:text-indigo-700 transition-colors">{card.title}</h3>
        <p className="text-sm text-slate-600 mb-3">{card.description}</p>
        {card.priority && (
            <div className="flex items-center gap-2 text-xs font-bold text-red-600">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                Recommended
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