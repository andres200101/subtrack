// ==============================================
// UTILITY HELPERS - helpers.js
// Pure functions for calculations and formatting
// ==============================================

window.AurabilioHelpers = {
    // Calculate monthly equivalent cost
    calculateMonthlyEquivalent(cost, cycle) {
        const multipliers = {
            'Weekly': 4.33,
            'Monthly': 1,
            'Quarterly': 1/3,
            'Yearly': 1/12
        };
        return cost * (multipliers[cycle] || 1);
    },

    // Format date to readable string
    formatDate(dateString) {
        if (!dateString) return 'Not set';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    },

    // Get days remaining until a date
    getDaysRemaining(endDate) {
        if (!endDate) return 0;
        const end = new Date(endDate);
        const now = new Date();
        const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        return Math.max(0, diff);
    },

    // Get urgency level based on days remaining
    getUrgencyLevel(daysRemaining) {
        if (daysRemaining <= 1) return 'critical';
        if (daysRemaining <= 3) return 'high';
        if (daysRemaining <= 7) return 'medium';
        return 'low';
    },

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    },

    // Get category color
    getCategoryColor(category) {
        const colors = {
            'Streaming': { bg: 'from-purple-50 to-purple-100', border: 'border-purple-300', text: 'text-purple-600', icon: '🎬' },
            'Software': { bg: 'from-blue-50 to-blue-100', border: 'border-blue-300', text: 'text-blue-600', icon: '💻' },
            'Gaming': { bg: 'from-green-50 to-green-100', border: 'border-green-300', text: 'text-green-600', icon: '🎮' },
            'Fitness': { bg: 'from-orange-50 to-orange-100', border: 'border-orange-300', text: 'text-orange-600', icon: '💪' },
            'News': { bg: 'from-red-50 to-red-100', border: 'border-red-300', text: 'text-red-600', icon: '📰' },
            'Music': { bg: 'from-pink-50 to-pink-100', border: 'border-pink-300', text: 'text-pink-600', icon: '🎵' },
            'Cloud Storage': { bg: 'from-cyan-50 to-cyan-100', border: 'border-cyan-300', text: 'text-cyan-600', icon: '☁️' },
            'Other': { bg: 'from-gray-50 to-gray-100', border: 'border-gray-300', text: 'text-gray-600', icon: '📦' }
        };
        return colors[category] || colors['Other'];
    },

    // Get urgency colors
    getUrgencyColors(urgency) {
        const colors = {
            critical: {
                bg: 'from-red-500 to-red-600',
                border: 'border-red-600',
                cardBg: 'bg-red-50',
                cardBorder: 'border-red-300',
                text: 'text-red-900',
                badge: 'bg-red-600',
                glow: 'shadow-[0_0_30px_rgba(239,68,68,0.6)]'
            },
            high: {
                bg: 'from-orange-500 to-orange-600',
                border: 'border-orange-600',
                cardBg: 'bg-orange-50',
                cardBorder: 'border-orange-300',
                text: 'text-orange-900',
                badge: 'bg-orange-600',
                glow: 'shadow-[0_0_25px_rgba(249,115,22,0.5)]'
            },
            medium: {
                bg: 'from-yellow-500 to-yellow-600',
                border: 'border-yellow-600',
                cardBg: 'bg-yellow-50',
                cardBorder: 'border-yellow-300',
                text: 'text-yellow-900',
                badge: 'bg-yellow-600',
                glow: 'shadow-[0_0_20px_rgba(234,179,8,0.4)]'
            },
            low: {
                bg: 'from-green-500 to-green-600',
                border: 'border-green-600',
                cardBg: 'bg-green-50',
                cardBorder: 'border-green-300',
                text: 'text-green-900',
                badge: 'bg-green-600',
                glow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]'
            }
        };
        return colors[urgency] || colors['low'];
    },

    // Validate email
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    // Truncate text
    truncate(text, length = 50) {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    },

    // Group by category
    groupByCategory(subscriptions) {
        return subscriptions.reduce((acc, sub) => {
            const category = sub.category || 'Other';
            if (!acc[category]) acc[category] = [];
            acc[category].push(sub);
            return acc;
        }, {});
    },

    // Calculate total by category
    calculateCategoryTotals(subscriptions) {
        const totals = {};
        subscriptions.forEach(sub => {
            const category = sub.category || 'Other';
            const monthly = this.calculateMonthlyEquivalent(
                parseFloat(sub.cost),
                sub.billing_cycle
            );
            totals[category] = (totals[category] || 0) + monthly;
        });
        return totals;
    },

    // Sort subscriptions
    sortSubscriptions(subscriptions, sortBy = 'name') {
        const sorted = [...subscriptions];
        
        switch(sortBy) {
            case 'name':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'cost':
                return sorted.sort((a, b) => {
                    const aCost = this.calculateMonthlyEquivalent(parseFloat(a.cost), a.billing_cycle);
                    const bCost = this.calculateMonthlyEquivalent(parseFloat(b.cost), b.billing_cycle);
                    return bCost - aCost;
                });
            case 'date':
                return sorted.sort((a, b) => {
                    const aDate = new Date(a.next_billing_date || a.trial_end_date || 0);
                    const bDate = new Date(b.next_billing_date || b.trial_end_date || 0);
                    return aDate - bDate;
                });
            case 'category':
                return sorted.sort((a, b) => a.category.localeCompare(b.category));
            default:
                return sorted;
        }
    },

    // Debounce function
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Get today's date in YYYY-MM-DD format
    getTodayDate() {
        return new Date().toISOString().split('T')[0];
    },

    // Get date N days from now
    getDateDaysFromNow(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    },

    // Check if date is in the past
    isDatePast(dateString) {
        if (!dateString) return false;
        return new Date(dateString) < new Date();
    },

    // Get percentage
    getPercentage(value, total) {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    }
};

// Make it available globally
window.helpers = window.AurabilioHelpers;