// ==============================================
// COMMAND PALETTE - command-palette.js
// Save as: js/command-palette.js
// Add to index.html: <script type="text/babel" src="js/command-palette.js"></script>
// ==============================================

window.CommandPaletteComponent = function({ 
    subscriptions = [], 
    onCommand,
    onClose 
}) {
    const [query, setQuery] = React.useState('');
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const inputRef = React.useRef(null);

    // Focus input on mount
    React.useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Build command list
    const commands = React.useMemo(() => {
        const cmds = [
            // Quick Actions
            {
                id: 'add',
                label: 'Add New Subscription',
                icon: '➕',
                keywords: ['add', 'new', 'create', 'subscription'],
                category: 'Quick Actions'
            },
            {
                id: 'scan',
                label: 'Scan Receipt',
                icon: '📸',
                keywords: ['scan', 'receipt', 'ocr', 'upload', 'photo'],
                category: 'Quick Actions'
            },
            {
                id: 'bank',
                label: 'Connect Bank Account',
                icon: '🏦',
                keywords: ['bank', 'connect', 'plaid', 'link', 'account'],
                category: 'Quick Actions'
            },
            {
                id: 'email',
                label: 'Scan Emails',
                icon: '📧',
                keywords: ['email', 'gmail', 'scan', 'import'],
                category: 'Quick Actions'
            },
            
            // Views
            {
                id: 'budget',
                label: 'Set Budget',
                icon: '💰',
                keywords: ['budget', 'spending', 'limit', 'money'],
                category: 'Manage'
            },
            {
                id: 'analytics',
                label: 'View Analytics',
                icon: '📊',
                keywords: ['analytics', 'charts', 'stats', 'graphs', 'data'],
                category: 'Manage'
            },
            {
                id: 'wrapped',
                label: 'Generate Wrapped',
                icon: '🎊',
                keywords: ['wrapped', 'year', 'summary', 'review', '2024'],
                category: 'Manage'
            },
            {
                id: 'autopilot',
                label: 'Autopilot Settings',
                icon: '⚡',
                keywords: ['autopilot', 'ai', 'auto', 'settings'],
                category: 'Manage'
            },
            {
                id: 'notifications',
                label: 'View Notifications',
                icon: '🔔',
                keywords: ['notifications', 'alerts', 'warnings'],
                category: 'Manage'
            },
            
            // Subscription-specific commands (up to 10 most recent)
            ...subscriptions.slice(0, 10).map(sub => ({
                id: `view-${sub.id}`,
                label: `View ${sub.name}`,
                icon: '👁️',
                keywords: ['view', 'see', 'details', sub.name.toLowerCase()],
                category: 'Your Subscriptions',
                meta: `$${sub.cost}/${sub.billing_cycle}`
            })),
            
            ...subscriptions.slice(0, 10).map(sub => ({
                id: `cancel-${sub.id}`,
                label: `Cancel ${sub.name}`,
                icon: '❌',
                keywords: ['cancel', 'stop', 'delete', 'remove', sub.name.toLowerCase()],
                category: 'Your Subscriptions',
                meta: `Save $${sub.cost}/${sub.billing_cycle}`
            })),
            
            ...subscriptions.slice(0, 10).map(sub => ({
                id: `negotiate-${sub.id}`,
                label: `Negotiate ${sub.name}`,
                icon: '✨',
                keywords: ['negotiate', 'discount', 'price', 'ai', sub.name.toLowerCase()],
                category: 'Your Subscriptions',
                meta: `Currently $${sub.cost}`
            }))
        ];

        return cmds;
    }, [subscriptions]);

    // Filter commands based on query
    const filteredCommands = React.useMemo(() => {
        if (!query) return commands;
        
        const lowerQuery = query.toLowerCase();
        return commands.filter(cmd => 
            cmd.label.toLowerCase().includes(lowerQuery) ||
            cmd.keywords.some(k => k.includes(lowerQuery)) ||
            (cmd.meta && cmd.meta.toLowerCase().includes(lowerQuery))
        );
    }, [query, commands]);

    // Group commands by category
    const groupedCommands = React.useMemo(() => {
        const groups = {};
        filteredCommands.forEach(cmd => {
            if (!groups[cmd.category]) {
                groups[cmd.category] = [];
            }
            groups[cmd.category].push(cmd);
        });
        return groups;
    }, [filteredCommands]);

    // Keyboard navigation
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(i => Math.max(i - 1, 0));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const cmd = filteredCommands[selectedIndex];
                if (cmd) {
                    onCommand(cmd.id);
                    onClose();
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex, filteredCommands, onClose, onCommand]);

    // Reset selected index when query changes
    React.useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    const X = ({ size = 20 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    );

    let globalIndex = 0;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 z-[100]"
            onClick={onClose}
            style={{ animation: 'fadeIn 0.15s ease-out' }}
        >
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px) scale(0.96);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>

            <div 
                className="w-full max-w-2xl mt-[10vh] card-frosted rounded-2xl shadow-2xl overflow-hidden border border-primary-bright/20"
                onClick={(e) => e.stopPropagation()}
                style={{ animation: 'slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
                {/* Search Input */}
                <div className="flex items-center gap-3 p-4 border-b-2 border-gray-200">
                    <div className="text-2xl">🔍</div>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Type a command or search..."
                        className="flex-1 text-lg bg-transparent border-none outline-none placeholder-gray-400 text-primary-text"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                    />
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Commands List */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {Object.keys(groupedCommands).length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="text-4xl mb-2">🤔</div>
                            <p className="text-gray-600 font-medium">No commands found</p>
                            <p className="text-sm text-gray-400 mt-1">Try "add", "cancel", or a subscription name</p>
                        </div>
                    ) : (
                        Object.entries(groupedCommands).map(([category, cmds]) => (
                            <div key={category} className="p-2">
                                <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    {category}
                                </div>
                                {cmds.map((cmd) => {
                                    const currentIndex = globalIndex++;
                                    const isSelected = currentIndex === selectedIndex;
                                    
                                    return (
                                        <button
                                            key={cmd.id}
                                            onClick={() => {
                                                onCommand(cmd.id);
                                                onClose();
                                            }}
                                            onMouseEnter={() => setSelectedIndex(currentIndex)}
                                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                                                isSelected 
                                                    ? 'bg-primary-deep text-white' 
                                                    : 'hover:bg-gray-100'
                                            }`}
                                        >
                                            <span className="text-2xl flex-shrink-0">{cmd.icon}</span>
                                            <div className="flex-1 text-left min-w-0">
                                                <div className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                                    {cmd.label}
                                                </div>
                                                {cmd.meta && (
                                                    <div className={`text-sm truncate ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
                                                        {cmd.meta}
                                                    </div>
                                                )}
                                            </div>
                                            {isSelected && (
                                                <kbd className="px-2 py-1 bg-white/20 text-white text-xs rounded font-mono flex-shrink-0">
                                                    ↵
                                                </kbd>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Hints */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">↑↓</kbd>
                            <span>Navigate</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">↵</kbd>
                            <span>Select</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">esc</kbd>
                            <span>Close</span>
                        </div>
                    </div>
                    <div className="text-xs text-gray-400">
                        {filteredCommands.length} command{filteredCommands.length !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Make it available globally
window.CommandPalette = window.CommandPaletteComponent;