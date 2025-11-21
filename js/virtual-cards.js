// Virtual Cards Component - Add this to your existing app

window.VirtualCardsComponent = function({ subscription, onUpdate, onClose }) {
    const [cardNumber, setCardNumber] = React.useState('');
    const [cardStatus, setCardStatus] = React.useState('active');
    const [showCardNumber, setShowCardNumber] = React.useState(false);
    const [isGenerating, setIsGenerating] = React.useState(false);

    React.useEffect(() => {
        // Load existing card if any
        if (subscription && subscription.virtual_card) {
            const card = typeof subscription.virtual_card === 'string' 
                ? JSON.parse(subscription.virtual_card) 
                : subscription.virtual_card;
            setCardNumber(card.number);
            setCardStatus(card.status);
        }
    }, [subscription]);

    const generateVirtualCard = () => {
        setIsGenerating(true);
        
        // Simulate card generation (in real app, this would call Privacy.com API or similar)
        setTimeout(() => {
            // Generate realistic-looking card number
            const cardNum = `4532-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
            setCardNumber(cardNum);
            setCardStatus('active');
            setIsGenerating(false);

            // Save to subscription
            const cardData = {
                number: cardNum,
                status: 'active',
                created: new Date().toISOString(),
                subscription_name: subscription.name
            };

            onUpdate({ virtual_card: JSON.stringify(cardData) });
        }, 2000);
    };

    const pauseCard = () => {
        setCardStatus('paused');
        const cardData = JSON.parse(subscription.virtual_card);
        cardData.status = 'paused';
        cardData.paused_date = new Date().toISOString();
        onUpdate({ virtual_card: JSON.stringify(cardData) });
    };

    const cancelCard = () => {
        if (confirm('Cancel this virtual card? The subscription will stop working.')) {
            setCardStatus('cancelled');
            const cardData = JSON.parse(subscription.virtual_card);
            cardData.status = 'cancelled';
            cardData.cancelled_date = new Date().toISOString();
            onUpdate({ virtual_card: JSON.stringify(cardData) });
        }
    };

    const reactivateCard = () => {
        setCardStatus('active');
        const cardData = JSON.parse(subscription.virtual_card);
        cardData.status = 'active';
        cardData.reactivated_date = new Date().toISOString();
        onUpdate({ virtual_card: JSON.stringify(cardData) });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[70]" onClick={onClose}>
            <div className="card-frosted rounded-2xl p-8 max-w-2xl w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-primary-text mb-1 flex items-center gap-2">
                            💳 Virtual Card Manager
                        </h2>
                        <p className="text-gray-600">Manage virtual card for {subscription?.name}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {!cardNumber && !isGenerating && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">💳</div>
                        <h3 className="text-xl font-bold text-primary-text mb-2">
                            No Virtual Card Yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Generate a virtual card for this subscription to:
                        </p>
                        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                            <div className="p-4 bg-green-50 rounded-xl text-left">
                                <p className="text-sm font-semibold text-green-700 mb-1">✓ Auto-Cancel</p>
                                <p className="text-xs text-green-600">Pause card when trial ends</p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-xl text-left">
                                <p className="text-sm font-semibold text-blue-700 mb-1">✓ Security</p>
                                <p className="text-xs text-primary-deep">Unique card per service</p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-xl text-left">
                                <p className="text-sm font-semibold text-purple-700 mb-1">✓ Control</p>
                                <p className="text-xs text-purple-600">Pause/resume anytime</p>
                            </div>
                            <div className="p-4 bg-orange-50 rounded-xl text-left">
                                <p className="text-sm font-semibold text-orange-700 mb-1">✓ Track</p>
                                <p className="text-xs text-orange-600">See all charges</p>
                            </div>
                        </div>
                        <button
                            onClick={generateVirtualCard}
                            className="px-8 py-4 gradient-primary text-white rounded-2xl hover:shadow-xl transition-all font-bold text-lg"
                        >
                            Generate Virtual Card
                        </button>
                        <p className="text-xs text-gray-500 mt-4">
                            🔒 Powered by secure card generation
                        </p>
                    </div>
                )}

                {isGenerating && (
                    <div className="text-center py-12">
                        <div className="ocr-loading mx-auto mb-4"></div>
                        <p className="text-lg font-semibold mb-2">Generating virtual card...</p>
                        <p className="text-sm text-gray-500">Creating secure card number</p>
                    </div>
                )}

                {cardNumber && !isGenerating && (
                    <div>
                        {/* Virtual Card Display */}
                        <div className={`virtual-card card-status-${cardStatus} mb-6`}>
                            <div className="flex justify-between items-start mb-6">
                                <div className="card-chip"></div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                                    cardStatus === 'active' ? 'bg-green-500' :
                                    cardStatus === 'paused' ? 'bg-yellow-500' :
                                    'bg-gray-500'
                                }`}>
                                    {cardStatus.toUpperCase()}
                                </div>
                            </div>

                            <div className="mb-6">
                                <p className="text-white/60 text-xs mb-2">CARD NUMBER</p>
                                <div className="flex items-center gap-3">
                                    <p className={`card-number text-white ${!showCardNumber ? 'card-number-blurred' : ''}`}>
                                        {cardNumber}
                                    </p>
                                    <button
                                        onClick={() => setShowCardNumber(!showCardNumber)}
                                        className="text-white/60 hover:text-white"
                                    >
                                        {showCardNumber ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-white/60 text-xs mb-1">LINKED TO</p>
                                    <p className="text-white font-bold">{subscription.name}</p>
                                </div>
                                <div>
                                    <p className="text-white/60 text-xs mb-1">LIMIT</p>
                                    <p className="text-white font-bold">${subscription.cost}</p>
                                </div>
                            </div>
                        </div>

                        {/* Card Controls */}
                        <div className="space-y-4 mb-6">
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h4 className="font-semibold text-primary-text mb-2">Card Controls</h4>
                                <div className="flex flex-wrap gap-2">
                                    {cardStatus === 'active' && (
                                        <>
                                            <button
                                                onClick={pauseCard}
                                                className="px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-all font-semibold text-sm"
                                            >
                                                ⏸️ Pause Card
                                            </button>
                                            <button
                                                onClick={cancelCard}
                                                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-semibold text-sm"
                                            >
                                                ❌ Cancel Card
                                            </button>
                                        </>
                                    )}
                                    {cardStatus === 'paused' && (
                                        <button
                                            onClick={reactivateCard}
                                            className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all font-semibold text-sm"
                                        >
                                            ▶️ Reactivate Card
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(cardNumber.replace(/-/g, ''));
                                            alert('Card number copied!');
                                        }}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-primary-deep transition-all font-semibold text-sm"
                                    >
                                        📋 Copy Number
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                <div className="flex items-start gap-3">
                                    <Info className="text-primary-deep flex-shrink-0 mt-0.5" size={20} />
                                    <div className="text-sm text-blue-800">
                                        <p className="font-semibold mb-1">How it works:</p>
                                        <ul className="space-y-1 text-blue-700">
                                            <li>• Use this card number for {subscription.name}</li>
                                            <li>• Charges are limited to ${subscription.cost}</li>
                                            <li>• Pause the card to prevent future charges</li>
                                            <li>• Cancel to permanently disable</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Make it available globally
window.VirtualCards = window.VirtualCardsComponent;