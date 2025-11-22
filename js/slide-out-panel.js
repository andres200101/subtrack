// ==============================================
// SLIDE-OUT PANEL - slide-out-panel.js
// ==============================================

window.SlideOutPanelComponent = function({ 
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    size = 'medium'
}) {
    const [isAnimating, setIsAnimating] = React.useState(false);
    
    React.useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    React.useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen && !isAnimating) return null;

    const sizeClasses = {
        small: 'max-w-md',
        medium: 'max-w-2xl',
        large: 'max-w-4xl'
    };

    const X = ({ size = 24 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    );

    return (
        <>
            <style>{`
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                
                .slide-panel-enter {
                    animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                
                .slide-panel-exit {
                    animation: slideOutRight 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .overlay-enter {
                    animation: fadeIn 0.2s ease-out;
                }
                
                .overlay-exit {
                    animation: fadeOut 0.2s ease-out;
                }
            `}</style>

            <div 
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] ${
                    isOpen ? 'overlay-enter' : 'overlay-exit'
                }`}
                onClick={onClose}
                onAnimationEnd={() => {
                    if (!isOpen) setIsAnimating(false);
                }}
            />

            <div 
                className={`fixed top-0 right-0 bottom-0 w-full ${sizeClasses[size]} bg-white shadow-2xl z-[91] flex flex-col ${
                    isOpen ? 'slide-panel-enter' : 'slide-panel-exit'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between p-6 border-b-2 border-gray-200 bg-gradient-to-r from-primary-deep to-primary-astronaut">
                    <div className="flex-1 pr-4">
                        <h2 className="text-2xl font-bold text-white mb-1">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="text-white/80 text-sm">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all flex-shrink-0"
                        aria-label="Close panel"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                        Press <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">esc</kbd> to close
                    </p>
                </div>
            </div>
        </>
    );
};

window.SlideOutPanel = window.SlideOutPanelComponent;