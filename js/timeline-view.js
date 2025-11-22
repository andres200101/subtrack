// Timeline View Component for Aurabilio
// Chronological timeline showing subscription lifecycle and upcoming events

window.TimelineView = ({ subscriptions, trials, onEdit, onCancel, onDelete, calculateMonthlyEquivalent, formatDate, getDaysRemaining }) => {
    const { useState, useMemo } = React;
    const [selectedTimeframe, setSelectedTimeframe] = useState('month'); // 'week', 'month', 'year', 'all'
    const [hoveredEvent, setHoveredEvent] = useState(null);

    // Generate timeline events
    const generateTimelineEvents = useMemo(() => {
        const events = [];
        const now = new Date();

        // Add all subscriptions with their next billing dates or trial end dates
        [...subscriptions, ...trials].forEach(sub => {
            const isTrial = sub.type === 'trial';
            const eventDate = isTrial ? new Date(sub.trial_end_date) : (sub.next_billing_date ? new Date(sub.next_billing_date) : null);
            
            if (!eventDate) return;

            const daysUntil = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
            const monthsUntil = Math.ceil(daysUntil / 30);

            events.push({
                id: sub.id,
                subscription: sub,
                date: eventDate,
                daysUntil,
                monthsUntil,
                type: isTrial ? 'trial_end' : 'billing',
                title: isTrial ? `${sub.name} Trial Ends` : `${sub.name} Payment Due`,
                amount: parseFloat(sub.cost),
                category: sub.category,
                isPast: eventDate < now,
                isUrgent: daysUntil <= 3,
                isWarning: daysUntil > 3 && daysUntil <= 7,
                isTrial
            });
        });

        // Sort by date
        return events.sort((a, b) => a.date - b.date);
    }, [subscriptions, trials]);

    // Filter events based on timeframe
    const filteredEvents = useMemo(() => {
        const now = new Date();
        return generateTimelineEvents.filter(event => {
            if (selectedTimeframe === 'all') return true;
            
            const daysAhead = {
                'week': 7,
                'month': 30,
                'year': 365
            }[selectedTimeframe];

            const futureDate = new Date(now);
            futureDate.setDate(futureDate.getDate() + daysAhead);

            return event.date <= futureDate && event.date >= now;
        });
    }, [generateTimelineEvents, selectedTimeframe]);

    // Group events by month
    const groupedEvents = useMemo(() => {
        const grouped = {};
        filteredEvents.forEach(event => {
            const monthKey = event.date.toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!grouped[monthKey]) {
                grouped[monthKey] = [];
            }
            grouped[monthKey].push(event);
        });
        return grouped;
    }, [filteredEvents]);

    // Calculate total spending per month
    const monthlyTotals = useMemo(() => {
        const totals = {};
        Object.keys(groupedEvents).forEach(month => {
            totals[month] = groupedEvents[month].reduce((sum, event) => sum + event.amount, 0);
        });
        return totals;
    }, [groupedEvents]);

    // Get event color
    const getEventColor = (event) => {
        if (event.isTrial) {
            if (event.isUrgent) return { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-700', dot: 'bg-red-500', glow: 'shadow-red-500/50' };
            if (event.isWarning) return { bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-700', dot: 'bg-orange-500', glow: 'shadow-orange-500/50' };
            return { bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-700', dot: 'bg-yellow-500', glow: 'shadow-yellow-500/50' };
        }
        
        if (event.isUrgent) return { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-700', dot: 'bg-purple-500', glow: 'shadow-purple-500/50' };
        return { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700', dot: 'bg-blue-500', glow: 'shadow-blue-500/50' };
    };

    // Get category icon
    const getCategoryIcon = (category) => {
        const icons = {
            'Streaming': '🎬',
            'Software': '💻',
            'Gaming': '🎮',
            'Fitness': '💪',
            'News': '📰',
            'Music': '🎵',
            'Cloud Storage': '☁️',
            'Other': '📦'
        };
        return icons[category] || '📦';
    };

    return (
        <div>
            {/* Timeframe Selector */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-2xl font-bold text-primary-text mb-1">📅 Timeline View</h3>
                    <p className="text-gray-600">Your subscription schedule at a glance</p>
                </div>
                <div className="flex gap-2">
                    {[
                        { value: 'week', label: 'Next 7 Days', icon: '📅' },
                        { value: 'month', label: 'Next 30 Days', icon: '🗓️' },
                        { value: 'year', label: 'This Year', icon: '📆' },
                        { value: 'all', label: 'All Time', icon: '♾️' }
                    ].map(({ value, label, icon }) => (
                        <button
                            key={value}
                            onClick={() => setSelectedTimeframe(value)}
                            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                                selectedTimeframe === value
                                    ? 'gradient-primary text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <span className="mr-2">{icon}</span>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="card-frosted rounded-2xl p-5 border-2 border-blue-200">
                    <p className="text-sm text-blue-700 font-semibold mb-1">Upcoming Events</p>
                    <p className="text-3xl font-black text-blue-600">{filteredEvents.length}</p>
                    <p className="text-xs text-blue-600 mt-1">in selected period</p>
                </div>
                <div className="card-frosted rounded-2xl p-5 border-2 border-purple-200">
                    <p className="text-sm text-purple-700 font-semibold mb-1">Payments Due</p>
                    <p className="text-3xl font-black text-purple-600">
                        {filteredEvents.filter(e => e.type === 'billing').length}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">billing events</p>
                </div>
                <div className="card-frosted rounded-2xl p-5 border-2 border-yellow-200">
                    <p className="text-sm text-yellow-700 font-semibold mb-1">Trials Ending</p>
                    <p className="text-3xl font-black text-yellow-600">
                        {filteredEvents.filter(e => e.isTrial).length}
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">free trials</p>
                </div>
                <div className="card-frosted rounded-2xl p-5 border-2 border-green-200">
                    <p className="text-sm text-green-700 font-semibold mb-1">Total Due</p>
                    <p className="text-3xl font-black text-green-600">
                        ${filteredEvents.filter(e => e.type === 'billing').reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">upcoming charges</p>
                </div>
            </div>

            {/* Timeline */}
            {filteredEvents.length === 0 ? (
                <div className="card-frosted rounded-2xl p-16 text-center border-2 border-gray-200">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-xl font-bold text-gray-700 mb-2">No upcoming events</p>
                    <p className="text-gray-500">No subscriptions or trials are due in this period</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.keys(groupedEvents).map((monthKey, monthIndex) => {
                        const monthEvents = groupedEvents[monthKey];
                        const monthTotal = monthlyTotals[monthKey];

                        return (
                            <div key={monthKey} className="relative">
                                {/* Month Header */}
                                <div className="sticky top-0 z-10 mb-6 card-frosted bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200 shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-2xl font-black text-primary-text mb-1">{monthKey}</h3>
                                            <p className="text-sm text-gray-600">
                                                {monthEvents.length} event{monthEvents.length !== 1 ? 's' : ''} scheduled
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600 mb-1">Total Charges</p>
                                            <p className="text-3xl font-black text-indigo-600">${monthTotal.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline Line */}
                                <div className="relative pl-12">
                                    <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-300 via-purple-300 to-pink-300"></div>

                                    {/* Events */}
                                    <div className="space-y-6">
                                        {monthEvents.map((event, eventIndex) => {
                                            const colors = getEventColor(event);
                                            const isHovered = hoveredEvent === event.id;
                                            const monthlyCost = calculateMonthlyEquivalent(event.amount, event.subscription.billing_cycle);

                                            return (
                                                <div
                                                    key={event.id}
                                                    className="relative"
                                                    onMouseEnter={() => setHoveredEvent(event.id)}
                                                    onMouseLeave={() => setHoveredEvent(null)}
                                                    style={{
                                                        animationDelay: `${(monthIndex * 100) + (eventIndex * 50)}ms`,
                                                        animation: 'slideInLeft 0.5s ease-out forwards',
                                                        opacity: 0
                                                    }}
                                                >
                                                    {/* Timeline Dot */}
                                                    <div className={`absolute -left-6 w-5 h-5 rounded-full border-4 border-white ${colors.dot} ${
                                                        event.isUrgent ? 'animate-pulse' : ''
                                                    } ${isHovered ? `shadow-lg ${colors.glow}` : ''}`}></div>

                                                    {/* Event Card */}
                                                    <div className={`card-frosted ${colors.bg} rounded-2xl border-2 ${colors.border} p-6 transition-all duration-300 ${
                                                        isHovered ? 'shadow-2xl scale-105 -translate-y-1' : 'shadow-md'
                                                    }`}>
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex items-start gap-4 flex-1">
                                                                {/* Icon */}
                                                                <div className="text-4xl">
                                                                    {getCategoryIcon(event.category)}
                                                                </div>

                                                                {/* Content */}
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <h4 className={`text-xl font-bold ${colors.text}`}>
                                                                            {event.title}
                                                                        </h4>
                                                                        {event.isTrial && (
                                                                            <span className="px-2 py-1 bg-white rounded-full text-xs font-bold text-yellow-700">
                                                                                🎁 TRIAL
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    <div className="flex items-center gap-4 text-sm text-gray-700 mb-3">
                                                                        <span className="flex items-center gap-1">
                                                                            📅 {event.date.toLocaleDateString('en-US', { 
                                                                                weekday: 'short',
                                                                                month: 'short', 
                                                                                day: 'numeric',
                                                                                year: 'numeric'
                                                                            })}
                                                                        </span>
                                                                        <span className="flex items-center gap-1">
                                                                            ⏰ {event.daysUntil === 0 ? 'Today' : 
                                                                                event.daysUntil === 1 ? 'Tomorrow' : 
                                                                                `in ${event.daysUntil} days`}
                                                                        </span>
                                                                        <span className="px-2 py-1 bg-white/70 rounded-full text-xs font-semibold">
                                                                            {event.category}
                                                                        </span>
                                                                    </div>

                                                                    {event.subscription.description && (
                                                                        <p className="text-sm text-gray-600 mb-3">
                                                                            {event.subscription.description}
                                                                        </p>
                                                                    )}

                                                                    {/* Pricing */}
                                                                    <div className="flex items-center gap-6">
                                                                        <div>
                                                                            <p className="text-xs text-gray-600 mb-1">Amount Due</p>
                                                                            <p className={`text-2xl font-black ${colors.text}`}>
                                                                                ${event.amount}
                                                                            </p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs text-gray-600 mb-1">Billing Cycle</p>
                                                                            <p className="text-sm font-bold text-gray-700">
                                                                                {event.subscription.billing_cycle}
                                                                            </p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs text-gray-600 mb-1">Monthly Cost</p>
                                                                            <p className="text-sm font-bold text-gray-700">
                                                                                ${monthlyCost.toFixed(2)}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex items-center gap-2 pt-4 border-t border-gray-300">
                                                            <button
                                                                onClick={() => onEdit(event.subscription)}
                                                                className="px-4 py-2 bg-white text-primary-deep rounded-xl hover:bg-gray-100 transition-colors font-semibold text-sm flex items-center gap-2"
                                                            >
                                                                ✏️ Edit
                                                            </button>
                                                            <button
                                                                onClick={() => onCancel(event.subscription)}
                                                                className="px-4 py-2 bg-white text-yellow-600 rounded-xl hover:bg-yellow-50 transition-colors font-semibold text-sm flex items-center gap-2"
                                                            >
                                                                ✖️ Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => onDelete(event.subscription.id)}
                                                                className="px-4 py-2 bg-white text-red-600 rounded-xl hover:bg-red-50 transition-colors font-semibold text-sm flex items-center gap-2"
                                                            >
                                                                🗑️ Delete
                                                            </button>
                                                            {event.isTrial && (
                                                                <button
                                                                    onClick={() => {
                                                                        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Cancel%20${encodeURIComponent(event.subscription.name)}%20Trial&dates=${event.subscription.trial_end_date.replace(/-/g, '')}/${event.subscription.trial_end_date.replace(/-/g, '')}&details=Remember%20to%20cancel%20before%20being%20charged`;
                                                                        window.open(calendarUrl, '_blank');
                                                                    }}
                                                                    className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold text-sm flex items-center gap-2 ml-auto"
                                                                >
                                                                    📅 Add Reminder
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`
                @keyframes slideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-30px);
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