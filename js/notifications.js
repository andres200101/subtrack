// ==============================================
// SMART NOTIFICATIONS SYSTEM - notifications.js
// Save as: js/notifications.js
// ==============================================
// Intelligent alerts for price changes, trials ending, budget limits, etc.

window.NotificationsSystemComponent = function({ user, subscriptions, monthlyBudget, onClose }) {
    const [notifications, setNotifications] = React.useState([]);
    const [filter, setFilter] = React.useState('all');
    const [notificationSettings, setNotificationSettings] = React.useState({
        priceIncrease: true,
        trialEnding: true,
        budgetWarning: true,
        unusedSubscription: true,
        betterDeals: true,
        renewalReminder: true
    });

    React.useEffect(() => {
        generateNotifications();
        loadSettings();
    }, [subscriptions, monthlyBudget]);

    const loadSettings = () => {
        const saved = localStorage.getItem(`notification_settings_${user.id}`);
        if (saved) {
            setNotificationSettings(JSON.parse(saved));
        }
    };

    const saveSettings = () => {
        localStorage.setItem(`notification_settings_${user.id}`, JSON.stringify(notificationSettings));
        alert('✅ Notification settings saved!');
    };

    const generateNotifications = () => {
        const alerts = [];
        const now = new Date();

        subscriptions.forEach(sub => {
            // Trial Ending Soon
            if (sub.type === 'trial' && sub.trial_end_date) {
                const endDate = new Date(sub.trial_end_date);
                const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
                
                if (daysLeft <= 3 && daysLeft >= 0) {
                    alerts.push({
                        id: `trial_${sub.id}`,
                        type: 'trial_ending',
                        severity: daysLeft === 0 ? 'critical' : daysLeft === 1 ? 'high' : 'medium',
                        subscription: sub,
                        title: `🚨 Trial Ending ${daysLeft === 0 ? 'TODAY' : `in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`}!`,
                        message: `${sub.name} trial ends ${daysLeft === 0 ? 'today' : 'soon'}. Cancel now to avoid $${sub.cost} charge.`,
                        action: 'Cancel Trial',
                        actionType: 'cancel',
                        priority: daysLeft === 0 ? 1 : daysLeft === 1 ? 2 : 3,
                        timestamp: now
                    });
                }
            }

            // Renewal Coming Up
            if (sub.next_billing_date && sub.type !== 'trial') {
                const billingDate = new Date(sub.next_billing_date);
                const daysUntil = Math.ceil((billingDate - now) / (1000 * 60 * 60 * 24));
                
                if (daysUntil <= 7 && daysUntil >= 0) {
                    alerts.push({
                        id: `renewal_${sub.id}`,
                        type: 'renewal_reminder',
                        severity: 'low',
                        subscription: sub,
                        title: `📅 ${sub.name} renews in ${daysUntil} days`,
                        message: `Your ${sub.billing_cycle} subscription will charge $${sub.cost} on ${new Date(sub.next_billing_date).toLocaleDateString()}.`,
                        action: 'View Details',
                        actionType: 'view',
                        priority: 8,
                        timestamp: now
                    });
                }
            }

            // Price Increase Detected
            if (sub.price_history) {
                const history = typeof sub.price_history === 'string' 
                    ? JSON.parse(sub.price_history) 
                    : sub.price_history;
                
                if (history && history.length > 0) {
                    const latestChange = history[history.length - 1];
                    const changeDate = new Date(latestChange.date);
                    const daysSinceChange = Math.floor((now - changeDate) / (1000 * 60 * 60 * 24));
                    
                    if (latestChange.change_amount > 0 && daysSinceChange <= 30) {
                        alerts.push({
                            id: `price_increase_${sub.id}`,
                            type: 'price_increase',
                            severity: latestChange.change_amount > 5 ? 'high' : 'medium',
                            subscription: sub,
                            title: `📈 ${sub.name} price increased!`,
                            message: `Price went up by $${latestChange.change_amount.toFixed(2)} (${latestChange.change_percentage}%) ${daysSinceChange} days ago.`,
                            action: 'Negotiate Price',
                            actionType: 'negotiate',
                            priority: 4,
                            timestamp: changeDate
                        });
                    }
                }
            }

            // High Cost Alert
            const monthlyCost = calculateMonthlyEquivalent(parseFloat(sub.cost), sub.billing_cycle);
            if (monthlyCost > 50) {
                alerts.push({
                    id: `high_cost_${sub.id}`,
                    type: 'high_cost',
                    severity: 'medium',
                    subscription: sub,
                    title: `💰 ${sub.name} is expensive`,
                    message: `At $${monthlyCost.toFixed(2)}/month, this is one of your priciest subscriptions.`,
                    action: 'Find Alternatives',
                    actionType: 'alternatives',
                    priority: 6,
                    timestamp: now
                });
            }
        });

        // Budget Warnings
        if (monthlyBudget) {
            const totalMonthly = subscriptions.reduce((sum, sub) => 
                sum + calculateMonthlyEquivalent(parseFloat(sub.cost), sub.billing_cycle), 0
            );
            const percentUsed = (totalMonthly / monthlyBudget) * 100;

            if (percentUsed >= 100) {
                alerts.push({
                    id: 'budget_over',
                    type: 'budget_warning',
                    severity: 'critical',
                    subscription: null,
                    title: '⚠️ OVER BUDGET!',
                    message: `You're spending $${(totalMonthly - monthlyBudget).toFixed(2)} more than your $${monthlyBudget.toFixed(2)} budget.`,
                    action: 'View Budget',
                    actionType: 'budget',
                    priority: 1,
                    timestamp: now
                });
            } else if (percentUsed >= 90) {
                alerts.push({
                    id: 'budget_warning',
                    type: 'budget_warning',
                    severity: 'high',
                    subscription: null,
                    title: '⚡ Near Budget Limit',
                    message: `You're using ${percentUsed.toFixed(0)}% of your $${monthlyBudget.toFixed(2)} monthly budget.`,
                    action: 'View Budget',
                    actionType: 'budget',
                    priority: 3,
                    timestamp: now
                });
            }
        }

        // Duplicate Category Alert
        const categoryCounts = {};
        subscriptions.forEach(sub => {
            categoryCounts[sub.category] = (categoryCounts[sub.category] || 0) + 1;
        });

        Object.entries(categoryCounts).forEach(([category, count]) => {
            if (count >= 3) {
                alerts.push({
                    id: `duplicate_${category}`,
                    type: 'duplicate_category',
                    severity: 'low',
                    subscription: null,
                    title: `🔄 Multiple ${category} Subscriptions`,
                    message: `You have ${count} ${category} subscriptions. Consider consolidating.`,
                    action: 'Review Category',
                    actionType: 'category',
                    priority: 7,
                    timestamp: now
                });
            }
        });

        // Sort by priority and timestamp
        alerts.sort((a, b) => {
            if (a.priority !== b.priority) return a.priority - b.priority;
            return b.timestamp - a.timestamp;
        });

        setNotifications(alerts);
    };

    const calculateMonthlyEquivalent = (cost, cycle) => {
        const multipliers = { 'Weekly': 4.33, 'Monthly': 1, 'Quarterly': 1/3, 'Yearly': 1/12 };
        return cost * multipliers[cycle];
    };

    const getFilteredNotifications = () => {
        if (filter === 'all') return notifications;
        return notifications.filter(n => n.type === filter);
    };

    const dismissNotification = (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
        
        // Save dismissed notifications
        const dismissed = JSON.parse(localStorage.getItem(`dismissed_notifications_${user.id}`) || '[]');
        dismissed.push({ id, dismissedAt: new Date().toISOString() });
        localStorage.setItem(`dismissed_notifications_${user.id}`, JSON.stringify(dismissed));
    };

    const handleAction = (notification) => {
        // This would trigger different actions based on actionType
        console.log('Action triggered:', notification.actionType, notification);
        // You can add specific handlers here
    };

    // Icons
    const Bell = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
    const X = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    const Settings = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m5.7-13.7-4.2 4.2m0 5l4.2 4.2M23 12h-6m-6 0H1m13.7 5.7-4.2-4.2m0-5-4.2-4.2"/></svg>;
    const Check = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>;

    const severityColors = {
        critical: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-900', badge: 'bg-red-600' },
        high: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-900', badge: 'bg-orange-600' },
        medium: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-900', badge: 'bg-yellow-600' },
        low: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-900', badge: 'bg-primary-deep' }
    };

    const [showSettings, setShowSettings] = React.useState(false);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[70]" onClick={onClose}>
            <div className="card-frosted rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                            <Bell size={28} className="text-primary-deep" />
                            Smart Notifications
                            {notifications.length > 0 && (
                                <span className="px-3 py-1 bg-red-600 text-white text-sm rounded-full font-bold">
                                    {notifications.length}
                                </span>
                            )}
                        </h2>
                        <p className="text-gray-600">AI-powered alerts to save you money</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            title="Notification Settings"
                        >
                            <Settings size={24} />
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Settings Panel */}
                {showSettings && (
                    <div className="mb-6 p-6 bg-gray-50 rounded-2xl border-2 border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-4">Notification Preferences</h3>
                        <div className="space-y-3">
                            {Object.entries(notificationSettings).map(([key, value]) => (
                                <label key={key} className="flex items-center justify-between p-3 card-frosted rounded-xl cursor-pointer hover:bg-gray-50">
                                    <span className="text-gray-900 font-medium capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={value}
                                        onChange={(e) => setNotificationSettings({...notificationSettings, [key]: e.target.checked})}
                                        className="w-5 h-5 text-primary-deep"
                                    />
                                </label>
                            ))}
                        </div>
                        <button
                            onClick={saveSettings}
                            className="w-full mt-4 px-4 py-2 bg-primary-deep text-white rounded-xl hover:bg-blue-700 font-semibold"
                        >
                            Save Settings
                        </button>
                    </div>
                )}

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {['all', 'trial_ending', 'price_increase', 'budget_warning', 'renewal_reminder'].map(filterType => {
                        const count = filterType === 'all' ? notifications.length : notifications.filter(n => n.type === filterType).length;
                        if (count === 0 && filterType !== 'all') return null;
                        
                        return (
                            <button
                                key={filterType}
                                onClick={() => setFilter(filterType)}
                                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                                    filter === filterType
                                        ? 'bg-primary-deep text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {filterType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                {count > 0 && <span className="ml-2 px-2 py-0.5 card-frosted/20 rounded-full text-xs">{count}</span>}
                            </button>
                        );
                    })}
                </div>

                {/* Notifications List */}
                {getFilteredNotifications().length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🎉</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">All Clear!</h3>
                        <p className="text-gray-600">No notifications at the moment. We'll alert you when something needs attention.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {getFilteredNotifications().map(notification => {
                            const colors = severityColors[notification.severity];
                            
                            return (
                                <div key={notification.id} className={`p-5 rounded-2xl border-2 ${colors.bg} ${colors.border} transition-all hover-lift`}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className={`font-bold ${colors.text}`}>{notification.title}</h3>
                                                <span className={`px-2 py-0.5 ${colors.badge} text-white text-xs rounded-full font-bold uppercase`}>
                                                    {notification.severity}
                                                </span>
                                            </div>
                                            <p className={`text-sm ${colors.text} mb-3`}>{notification.message}</p>
                                            {notification.subscription && (
                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    <span className="px-2 py-1 card-frosted rounded text-gray-900 font-semibold">
                                                        {notification.subscription.name}
                                                    </span>
                                                    <span>${notification.subscription.cost}/{notification.subscription.billing_cycle}</span>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => dismissNotification(notification.id)}
                                            className="ml-4 text-gray-400 hover:text-gray-600 p-1"
                                            title="Dismiss"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAction(notification)}
                                            className="px-4 py-2 card-frosted border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold text-sm transition-colors"
                                        >
                                            {notification.action}
                                        </button>
                                        {notification.severity === 'critical' && (
                                            <button className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold text-sm">
                                                Act Now!
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Summary Stats */}
                {notifications.length > 0 && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Alerts</p>
                                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600 mb-1">Critical</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {notifications.filter(n => n.severity === 'critical').length}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600 mb-1">High Priority</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {notifications.filter(n => n.severity === 'high').length}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Make it available globally
window.NotificationsSystem = window.NotificationsSystemComponent;