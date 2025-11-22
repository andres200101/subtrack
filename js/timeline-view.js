// Timeline View Component for Aurabilio
// Epic chronological timeline with visual storytelling

window.TimelineView = ({ subscriptions, trials, onEdit, onCancel, onDelete, calculateMonthlyEquivalent, formatDate, getDaysRemaining }) => {
    const { useState, useMemo } = React;
    const [selectedTimeframe, setSelectedTimeframe] = useState('month');
    const [hoveredEvent, setHoveredEvent] = useState(null);

    // Generate timeline events with relative positioning
    const generateTimelineEvents = useMemo(() => {
        const events = [];
        const now = new Date();

        [...subscriptions, ...trials].forEach(sub => {
            const isTrial = sub.type === 'trial';
            const eventDate = isTrial ? new Date(sub.trial_end_date) : (sub.next_billing_date ? new Date(sub.next_billing_date) : null);
            
            if (!eventDate) return;

            const daysUntil = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));

            events.push({
                id: sub.id,
                subscription: sub,
                date: eventDate,
                daysUntil,
                type: isTrial ? 'trial_end' : 'billing',
                title: isTrial ? `Trial Ends` : `Payment Due`,
                amount: parseFloat(sub.cost),
                category: sub.category,
                isUrgent: daysUntil <= 3,
                isWarning: daysUntil > 3 && daysUntil <= 7,
                isTrial,
                name: sub.name
            });
        });

        return events.sort((a, b) => a.date - b.date);
    }, [subscriptions, trials]);

    // Filter by timeframe
    const filteredEvents = useMemo(() => {
        const now = new Date();
        return generateTimelineEvents.filter(event => {
            if (selectedTimeframe === 'all') return true;
            
            const daysAhead = {
                'week': 7,
                'month': 30,
                'quarter': 90,
                'year': 365
            }[selectedTimeframe];

            const futureDate = new Date(now);
            futureDate.setDate(futureDate.getDate() + daysAhead);

            return event.date <= futureDate && event.date >= now;
        });
    }, [generateTimelineEvents, selectedTimeframe]);

    // Get category colors
    const getCategoryColor = (category) => {
        const colors = {
            'Streaming': { gradient: 'from-purple-400 via-pink-500 to-red-500', icon: '🎬', light: 'purple' },
            'Software': { gradient: 'from-blue-400 via-cyan-500 to-teal-500', icon: '💻', light: 'blue' },
            'Gaming': { gradient: 'from-green-400 via-emerald-500 to-teal-500', icon: '🎮', light: 'green' },
            'Fitness': { gradient: 'from-orange-400 via-amber-500 to-yellow-500', icon: '💪', light: 'orange' },
            'News': { gradient: 'from-red-400 via-rose-500 to-pink-500', icon: '📰', light: 'red' },
            'Music': { gradient: 'from-pink-400 via-fuchsia-500 to-purple-500', icon: '🎵', light: 'pink' },
            'Cloud Storage': { gradient: 'from-cyan-400 via-sky-500 to-blue-500', icon: '☁️', light: 'cyan' },
            'Other': { gradient: 'from-gray-400 via-slate-500 to-zinc-500', icon: '📦', light: 'gray' }
        };
        return colors[category] || colors['Other'];
    };

    // Calculate position on timeline (0-100%)
    const getEventPosition = (event) => {
        if (filteredEvents.length === 0) return 0;
        const firstDate = filteredEvents[0].date;
        const lastDate = filteredEvents[filteredEvents.length - 1].date;
        const totalDays = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24));
        const eventDays = Math.ceil((event.date - firstDate) / (1000 * 60 * 60 * 24));
        return totalDays === 0 ? 50 : (eventDays / totalDays) * 100;
    };

    return (
        <div className="relative">
            {/* EPIC HEADER */}
            <div className="mb-12 text-center relative overflow-hidden rounded-3xl p-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                    }}></div>
                </div>
                <div className="relative z-10">
                    <div className="text-6xl mb-4 animate-bounce">⏰</div>
                    <h2 className="text-5xl font-black text-white mb-4 tracking-tight">
                        Your Subscription Journey
                    </h2>
                    <p className="text-xl text-white/90 mb-6">
                        Every payment, every trial, mapped in time
                    </p>
                    
                    {/* Timeframe Pills */}
                    <div className="flex justify-center gap-3 flex-wrap">
                        {[
                            { value: 'week', label: 'Next Week', icon: '📅' },
                            { value: 'month', label: 'This Month', icon: '🗓️' },
                            { value: 'quarter', label: '3 Months', icon: '📆' },
                            { value: 'year', label: 'This Year', icon: '🗂️' },
                            { value: 'all', label: 'Everything', icon: '♾️' }
                        ].map(({ value, label, icon }) => (
                            <button
                                key={value}
                                onClick={() => setSelectedTimeframe(value)}
                                className={`px-6 py-3 rounded-full font-bold transition-all transform ${
                                    selectedTimeframe === value
                                        ? 'bg-white text-purple-600 shadow-2xl scale-110'
                                        : 'bg-white/20 text-white hover:bg-white/30 hover:scale-105'
                                }`}
                            >
                                <span className="mr-2">{icon}</span>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* STATS DASHBOARD */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-2xl transform hover:scale-105 transition-transform">
                    <div className="absolute top-0 right-0 text-9xl opacity-10">📊</div>
                    <p className="text-sm font-semibold mb-2 opacity-90">Events Ahead</p>
                    <p className="text-5xl font-black mb-2">{filteredEvents.length}</p>
                    <p className="text-xs opacity-75">in this period</p>
                </div>
                
                <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-2xl transform hover:scale-105 transition-transform">
                    <div className="absolute top-0 right-0 text-9xl opacity-10">💰</div>
                    <p className="text-sm font-semibold mb-2 opacity-90">Payments</p>
                    <p className="text-5xl font-black mb-2">{filteredEvents.filter(e => !e.isTrial).length}</p>
                    <p className="text-xs opacity-75">bills to pay</p>
                </div>
                
                <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-2xl transform hover:scale-105 transition-transform">
                    <div className="absolute top-0 right-0 text-9xl opacity-10">🎁</div>
                    <p className="text-sm font-semibold mb-2 opacity-90">Trials Ending</p>
                    <p className="text-5xl font-black mb-2">{filteredEvents.filter(e => e.isTrial).length}</p>
                    <p className="text-xs opacity-75">free rides over</p>
                </div>
                
                <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-2xl transform hover:scale-105 transition-transform">
                    <div className="absolute top-0 right-0 text-9xl opacity-10">💸</div>
                    <p className="text-sm font-semibold mb-2 opacity-90">Total Due</p>
                    <p className="text-5xl font-black mb-2">
                        ${filteredEvents.filter(e => !e.isTrial).reduce((sum, e) => sum + e.amount, 0).toFixed(0)}
                    </p>
                    <p className="text-xs opacity-75">upcoming charges</p>
                </div>
            </div>

            {/* THE EPIC TIMELINE */}
            {filteredEvents.length === 0 ? (
                <div className="text-center py-32 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200">
                    <div className="text-9xl mb-6 animate-pulse">📭</div>
                    <p className="text-3xl font-bold text-gray-700 mb-3">Nothing on the horizon!</p>
                    <p className="text-xl text-gray-500">Change your timeframe to see more events</p>
                </div>
            ) : (
                <div className="relative">
                    {/* TODAY MARKER */}
                    <div className="mb-8 flex items-center justify-center">
                        <div className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-2xl">
                            <p className="text-white font-black text-2xl flex items-center gap-3">
                                <span className="text-3xl animate-pulse">📍</span>
                                TODAY - {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    {/* HORIZONTAL TIMELINE TRACK */}
                    <div className="relative mb-16">
                        {/* Timeline Base */}
                        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full relative overflow-hidden shadow-inner">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                        </div>

                        {/* Event Markers on Timeline */}
                        {filteredEvents.map((event, index) => {
                            const position = getEventPosition(event);
                            const categoryColor = getCategoryColor(event.category);
                            
                            return (
                                <div
                                    key={event.id}
                                    className="absolute top-0 transform -translate-x-1/2 -translate-y-2"
                                    style={{ left: `${position}%` }}
                                >
                                    <div className={`w-8 h-8 bg-gradient-to-br ${categoryColor.gradient} rounded-full shadow-lg border-4 border-white ${
                                        event.isUrgent ? 'animate-pulse scale-150' : hoveredEvent === event.id ? 'scale-150' : 'scale-100'
                                    } transition-transform cursor-pointer`}
                                         onMouseEnter={() => setHoveredEvent(event.id)}
                                         onMouseLeave={() => setHoveredEvent(null)}
                                    ></div>
                                </div>
                            );
                        })}
                    </div>

                    {/* EVENT CARDS - ALTERNATING LAYOUT */}
                    <div className="space-y-24">
                        {filteredEvents.map((event, index) => {
                            const categoryColor = getCategoryColor(event.category);
                            const isLeft = index % 2 === 0;
                            const monthlyCost = calculateMonthlyEquivalent(event.amount, event.subscription.billing_cycle);

                            return (
                                <div
                                    key={event.id}
                                    className={`relative flex items-center ${isLeft ? 'flex-row' : 'flex-row-reverse'} gap-12`}
                                    onMouseEnter={() => setHoveredEvent(event.id)}
                                    onMouseLeave={() => setHoveredEvent(null)}
                                    style={{
                                        animationDelay: `${index * 100}ms`,
                                        animation: `${isLeft ? 'slideInLeft' : 'slideInRight'} 0.8s ease-out forwards`,
                                        opacity: 0
                                    }}
                                >
                                    {/* CONNECTING LINE */}
                                    <div className={`absolute top-1/2 ${isLeft ? 'left-1/2' : 'right-1/2'} w-1/2 h-1 bg-gradient-to-r ${
                                        isLeft ? 'from-transparent to-gray-300' : 'from-gray-300 to-transparent'
                                    }`}></div>

                                    {/* DATE CIRCLE */}
                                    <div className="relative z-10 flex-shrink-0">
                                        <div className={`w-48 h-48 rounded-full bg-gradient-to-br ${categoryColor.gradient} shadow-2xl flex flex-col items-center justify-center text-white transform ${
                                            hoveredEvent === event.id ? 'scale-110 rotate-6' : 'scale-100'
                                        } transition-all duration-300`}>
                                            <div className="text-6xl mb-2">{categoryColor.icon}</div>
                                            <p className="text-4xl font-black">
                                                {event.daysUntil === 0 ? 'TODAY' : 
                                                 event.daysUntil === 1 ? '1 DAY' :
                                                 `${event.daysUntil} DAYS`}
                                            </p>
                                            <p className="text-sm opacity-90 font-semibold">
                                                {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* EVENT CARD */}
                                    <div className={`flex-1 relative transform ${
                                        hoveredEvent === event.id ? 'scale-105 -translate-y-2' : 'scale-100'
                                    } transition-all duration-300`}>
                                        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${categoryColor.gradient} p-1 shadow-2xl`}>
                                            <div className="bg-white rounded-3xl p-8">
                                                {/* Badge */}
                                                <div className="flex items-center gap-3 mb-4">
                                                    {event.isTrial && (
                                                        <span className={`px-4 py-2 rounded-full text-sm font-black text-white ${
                                                            event.isUrgent ? 'bg-red-600 animate-pulse' :
                                                            event.isWarning ? 'bg-orange-500' :
                                                            'bg-yellow-500'
                                                        } shadow-lg`}>
                                                            🎁 FREE TRIAL ENDING
                                                        </span>
                                                    )}
                                                    {!event.isTrial && event.isUrgent && (
                                                        <span className="px-4 py-2 bg-red-600 text-white rounded-full text-sm font-black shadow-lg animate-pulse">
                                                            ⚠️ URGENT
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Title */}
                                                <h3 className="text-4xl font-black mb-2 text-gray-900">
                                                    {event.name}
                                                </h3>
                                                <p className="text-xl text-gray-600 mb-6">
                                                    {event.title}
                                                </p>

                                                {/* Details Grid */}
                                                <div className="grid grid-cols-3 gap-4 mb-6">
                                                    <div className="bg-gray-50 rounded-2xl p-4 text-center">
                                                        <p className="text-xs text-gray-500 mb-1">Amount</p>
                                                        <p className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                                            ${event.amount}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-2xl p-4 text-center">
                                                        <p className="text-xs text-gray-500 mb-1">Monthly</p>
                                                        <p className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                                            ${monthlyCost.toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-2xl p-4 text-center">
                                                        <p className="text-xs text-gray-500 mb-1">Yearly</p>
                                                        <p className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                                            ${(monthlyCost * 12).toFixed(0)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => onEdit(event.subscription)}
                                                        className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-bold hover:shadow-2xl transform hover:-translate-y-1 transition-all"
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button
                                                        onClick={() => onCancel(event.subscription)}
                                                        className="flex-1 px-6 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-2xl font-bold hover:shadow-2xl transform hover:-translate-y-1 transition-all"
                                                    >
                                                        ✖️ Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => onDelete(event.subscription.id)}
                                                        className="px-6 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-2xl font-bold hover:shadow-2xl transform hover:-translate-y-1 transition-all"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-100px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100px);
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