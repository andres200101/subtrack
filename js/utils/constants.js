// ==============================================
// CONSTANTS - constants.js
// All app-wide constants in one place
// ==============================================

window.AurabilioConstants = {
    // Categories
    CATEGORIES: [
        'Streaming',
        'Software',
        'Gaming',
        'Fitness',
        'News',
        'Music',
        'Cloud Storage',
        'Other'
    ],

    // Billing Cycles
    BILLING_CYCLES: [
        'Weekly',
        'Monthly',
        'Quarterly',
        'Yearly'
    ],

    // Subscription Status
    STATUS: {
        ACTIVE: 'active',
        CANCELLED: 'cancelled',
        PAUSED: 'paused'
    },

    // Subscription Types
    TYPES: {
        SUBSCRIPTION: 'subscription',
        TRIAL: 'trial'
    },

    // LemonSqueezy Checkout URL
    LEMONSQUEEZY_CHECKOUT_URL: 'https://aurabilio.lemonsqueezy.com/buy/7b297b95-d09c-48c1-85a5-c53e94eaa386',

    // Gmail API Config
    GMAIL_CLIENT_ID: '603154538670-hk77lp74ka686i095solp4uc0ra0ef9k.apps.googleusercontent.com',
    GMAIL_SCOPES: 'https://www.googleapis.com/auth/gmail.readonly',

    // Bank Integration API (change in production)
    BANK_API_URL: 'http://localhost:8000/api',

    // Free Tier Limits
    FREE_TIER_LIMIT: 5,

    // Default Form Values
    DEFAULT_FORM_DATA: {
        name: '',
        cost: '',
        billing_cycle: 'Monthly',
        category: 'Streaming',
        next_billing_date: '',
        description: '',
        status: 'active',
        type: 'subscription',
        trial_end_date: ''
    },

    // View Modes
    VIEW_MODES: {
        DASHBOARD: 'dashboard',
        SUBSCRIPTIONS: 'subscriptions',
        TIMELINE: 'timeline',
        TRIALS: 'trials',
        BUDGET: 'budget',
        ANALYTICS: 'analytics',
        SHARING: 'sharing',
        AUTOPILOT: 'autopilot'
    },

    // Sort Options
    SORT_OPTIONS: [
        { value: 'name', label: 'Name' },
        { value: 'cost', label: 'Cost' },
        { value: 'date', label: 'Next Billing' },
        { value: 'category', label: 'Category' }
    ],

    // Known Subscription Services for Email Scanner
    KNOWN_SERVICES: {
        'netflix': { name: 'Netflix', category: 'Streaming' },
        'spotify': { name: 'Spotify', category: 'Music' },
        'hulu': { name: 'Hulu', category: 'Streaming' },
        'disney': { name: 'Disney+', category: 'Streaming' },
        'amazon': { name: 'Amazon Prime', category: 'Streaming' },
        'apple': { name: 'Apple', category: 'Software' },
        'adobe': { name: 'Adobe', category: 'Software' },
        'microsoft': { name: 'Microsoft', category: 'Software' },
        'google': { name: 'Google', category: 'Software' },
        'youtube': { name: 'YouTube Premium', category: 'Streaming' },
        'dropbox': { name: 'Dropbox', category: 'Cloud Storage' },
        'zoom': { name: 'Zoom', category: 'Software' }
    },

    // Animation Durations (ms)
    ANIMATION: {
        FAST: 150,
        BASE: 200,
        SLOW: 300
    },

    // LocalStorage Keys
    STORAGE_KEYS: {
        SUPABASE_URL: 'supabase_url',
        SUPABASE_KEY: 'supabase_key',
        SESSION: 'supabase_session',
        BUDGET: (userId) => `budget_${userId}`,
        AUTOPILOT: (userId) => `autopilot_${userId}`,
        PRO_STATUS: (userId) => `pro_${userId}`,
        DISMISSED_NOTIFICATIONS: (userId) => `dismissed_notifications_${userId}`
    },

    // Urgency Thresholds (days)
    URGENCY: {
        CRITICAL: 1,
        HIGH: 3,
        MEDIUM: 7
    },

    // Budget Status Thresholds (percentage)
    BUDGET_THRESHOLDS: {
        DANGER: 100,
        WARNING: 90,
        CAUTION: 75
    },

    // Chart Colors
    CHART_COLORS: [
        '#9333ea', // Purple (Streaming)
        '#3b82f6', // Blue (Software)
        '#10b981', // Green (Gaming)
        '#f59e0b', // Orange (Fitness)
        '#ef4444', // Red (News)
        '#ec4899', // Pink (Music)
        '#06b6d4', // Cyan (Cloud Storage)
        '#6b7280'  // Gray (Other)
    ],

    // Error Messages
    ERRORS: {
        NETWORK: 'Network error. Please check your connection.',
        AUTH: 'Authentication failed. Please try again.',
        SUPABASE: 'Database error. Please try again.',
        VALIDATION: 'Please fill in all required fields.',
        LIMIT_REACHED: 'Free tier limit reached. Upgrade to Pro for unlimited subscriptions.',
        UNKNOWN: 'Something went wrong. Please try again.'
    },

    // Success Messages
    SUCCESS: {
        ADDED: 'Subscription added successfully!',
        UPDATED: 'Subscription updated successfully!',
        DELETED: 'Subscription deleted successfully!',
        CANCELLED: 'Subscription cancelled successfully!',
        BUDGET_SET: 'Budget set successfully!',
        IMPORTED: 'Subscriptions imported successfully!',
        SETTINGS_SAVED: 'Settings saved successfully!'
    }
};

// Make it available globally
window.constants = window.AurabilioConstants;