// ==============================================
// ENHANCED TRIAL CARDS - enhanced-trial-cards.js
// Save as: js/enhanced-trial-cards.js
// Add to index.html: <script type="text/babel" src="js/enhanced-trial-cards.js"></script>
// ==============================================

window.EnhancedTrialCardComponent = function({ 
    trial,
    onCancel,
    onConvert,
    onEdit,
    onAddReminder
}) {
    const getDaysRemaining = (trialEndDate) => {
        if (!trialEndDate) return 0;
        const end = new Date(trialEndDate);
        const now = new Date();
        const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        return Math.max(0, diff);
    };

    const getUrgencyLevel = (daysRemaining) => {
        if (daysRemaining === 0) return 'critical';
        if (daysRemaining === 1) return 'critical';
        if (daysRemaining <= 3) return 'high';
        if (daysRemaining <= 7) return 'medium';
        return 'low';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

    const daysLeft = getDaysRemaining(trial.trial_end_date);
    const urgency = getUrgencyLevel(daysLeft);

    const urgencyConfig = {
        critical: {
            bg: 'from-red-500 to-red-600',
            border: 'border-red-600',
            cardBg: 'bg-red-50',
            cardBorder: 'border-red-300',
            text: 'text-red-900',
            badge: 'bg-red-600',
            glow: 'shadow-[0_0_30px_rgba(239,68,68,0.6)]',
            pulse: 'animate-pulse'
        },
        high: {
            bg: 'from-orange-500 to-orange-600',
            border: 'border-orange-600',
            cardBg: 'bg-orange-50',
            cardBorder: 'border-orange-300',
            text: 'text-orange-900',
            badge: 'bg-orange-600',
            glow: 'shadow-[0_0_25px_rgba(249,115,22,0.5)]',
            pulse: ''
        },
        medium: {
            bg: 'from-yellow-500 to-yellow-600',
            border: 'border-yellow-600',
            cardBg: 'bg-yellow-50',
            cardBorder: 'border-yellow-300',
            text: 'text-yellow-900',
            badge: 'bg-yellow-600',
            glow: 'shadow-[0_0_20px_rgba(234,179,8,0.4)]',
            pulse: ''
        },
        low: {
            bg: 'from-green-500 to-green-600',
            border: 'border-green-600',
            cardBg: 'bg-green-50',
            cardBorder: 'border-green-300',
            text: 'text-green-900',
            badge: 'bg-green-600',
            glow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]',
            pulse: ''
        }
    };

    const config = urgencyConfig[urgency];

    const Clock = ({ size = 20 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
        </svg>
    );

    const Calendar = ({ size = 20 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
    );

    const X = ({ size = 20 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    );

    const DollarSign = ({ size = 20 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
    );

    const Edit2 = ({ size = 20 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
        </svg>
    );

    return (
        <div className={`${config.cardBg} border-2 ${config.cardBorder} rounded-2xl p-6 hover:shadow-xl transition-all ${config.glow}`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-bold text-gray-900">{trial.name}</h3>
                        <span className={`px-3 py-1 bg-gradient-to-r ${config.bg} text-white text-xs rounded-full font-bold shadow-md ${config.pulse}`}>
                            FREE TRIAL
                        </span>
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                            {trial.category}
                        </span>
                    </div>
                    <p className="text-gray-700 font-medium mb-1">
                        Will cost <span className="text-lg font-bold text-orange-600">${trial.cost}</span>/{trial.billing_cycle} after trial
                    </p>
                    {trial.description && (
                        <p className="text-sm text-gray-600">{trial.description}</p>
                    )}
                </div>
            </div>

            {/* Giant Countdown - Most Visual Element */}
            <div className="relative mb-6">
                <div className="text-center py-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 shadow-inner">
                    <div className={`text-7xl font-black mb-2 ${config.text}`}>
                        {daysLeft}
                    </div>
                    <div className={`text-2xl font-bold ${config.text} uppercase tracking-wide`}>
                        {daysLeft === 1 ? 'Day' : 'Days'} Left
                    </div>
                    {daysLeft === 0 && (
                        <div className="mt-3">
                            <span className="px-4 py-2 bg-red-600 text-white rounded-full text-sm font-bold animate-pulse">
                                🚨 ENDS TODAY!
                            </span>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Clock size={16} />
                            Trial ends {formatDate(trial.trial_end_date)}
                        </span>
                        <span className={`text-sm font-bold ${config.text}`}>
                            {daysLeft === 0 ? 'Last day!' : `${daysLeft} days`}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                        <div 
                            className={`h-full bg-gradient-to-r ${config.bg} transition-all duration-500 shadow-lg`}
                            style={{ 
                                width: `${Math.max(5, Math.min(100, (daysLeft / 30) * 100))}%`,
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                            }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => onCancel(trial)}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-bold shadow-md hover:shadow-xl"
                >
                    <X size={18} />
                    Cancel Now
                </button>
                <button
                    onClick={() => onConvert(trial)}
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-deep to-primary-astronaut text-white rounded-xl hover:shadow-xl transition-all font-bold"
                >
                    <DollarSign size={18} />
                    Keep & Pay
                </button>
                <button
                    onClick={() => onEdit(trial)}
                    className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                >
                    <Edit2 size={18} />
                    Edit
                </button>
                <button
                    onClick={() => {
                        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Cancel ${trial.name} Trial`)}&dates=${trial.trial_end_date.replace(/-/g, '')}/${trial.trial_end_date.replace(/-/g, '')}&details=${encodeURIComponent('Remember to cancel before being charged')}`;
                        window.open(calendarUrl, '_blank');
                    }}
                    className="flex items-center gap-2 px-4 py-3 bg-blue-100 border-2 border-blue-300 text-blue-700 rounded-xl hover:bg-blue-200 transition-all font-semibold"
                >
                    <Calendar size={18} />
                    Remind Me
                </button>
            </div>

            {/* Savings Callout */}
            <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-xl">
                <p className="text-sm text-green-800 font-semibold text-center">
                    💰 Cancel now = Save ${(parseFloat(trial.cost) * 12).toFixed(2)}/year
                </p>
            </div>
        </div>
    );
};

// Container for multiple trial cards
window.EnhancedTrialSectionComponent = function({ 
    trials,
    onCancel,
    onConvert,
    onEdit 
}) {
    const getDaysRemaining = (trialEndDate) => {
        if (!trialEndDate) return 0;
        const end = new Date(trialEndDate);
        const now = new Date();
        const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        return Math.max(0, diff);
    };

    const criticalTrials = trials.filter(t => getDaysRemaining(t.trial_end_date) <= 3);

    const Bell = ({ size = 20 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
    );

    const AlertCircle = ({ size = 20 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
    );

    const Gift = ({ size = 28 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 12 20 22 4 22 4 12"/>
            <rect x="2" y="7" width="20" height="5"/>
            <line x1="12" y1="22" x2="12" y2="7"/>
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
        </svg>
    );

    if (trials.length === 0) return null;

    return (
        <div className="mb-6">
            {/* Urgent Alert Banner */}
            {criticalTrials.length > 0 && (
                <div className="mb-4 p-5 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-2xl shadow-lg animate-pulse">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-red-100 rounded-full shadow-md">
                            <AlertCircle className="text-red-600" size={28} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-red-900 mb-2 flex items-center gap-2">
                                <Bell size={20} />
                                Urgent: Trials Ending Soon!
                            </h3>
                            <p className="text-red-800 mb-3 font-medium">
                                You have {criticalTrials.length} trial{criticalTrials.length > 1 ? 's' : ''} ending within 3 days. 
                                Cancel now to avoid charges!
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {criticalTrials.map(trial => {
                                    const days = getDaysRemaining(trial.trial_end_date);
                                    return (
                                        <span key={trial.id} className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-semibold shadow-md">
                                            {trial.name} - {days === 0 ? 'TODAY!' : `${days} day${days > 1 ? 's' : ''}`}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Trial Section */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-300 overflow-hidden shadow-lg">
                <div className="p-6 bg-white/50 backdrop-blur-sm border-b-2 border-yellow-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg">
                                <Gift className="text-white" size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    Free Trials Manager
                                    <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-xs rounded-full font-bold">
                                        {trials.length} Active
                                    </span>
                                </h2>
                                <p className="text-gray-600">Never forget to cancel a free trial again</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    {trials
                        .sort((a, b) => getDaysRemaining(a.trial_end_date) - getDaysRemaining(b.trial_end_date))
                        .map(trial => (
                            <window.EnhancedTrialCard
                                key={trial.id}
                                trial={trial}
                                onCancel={onCancel}
                                onConvert={onConvert}
                                onEdit={onEdit}
                            />
                        ))}
                </div>
            </div>
        </div>
    );
};

// Make components available globally
window.EnhancedTrialCard = window.EnhancedTrialCardComponent;
window.EnhancedTrialSection = window.EnhancedTrialSectionComponent;