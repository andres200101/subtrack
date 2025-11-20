// ==============================================
// AI NEGOTIATION ASSISTANT - negotiation-assistant.js
// Save as: js/negotiation-assistant.js
// ==============================================
// Uses Claude AI to generate personalized negotiation emails

window.NegotiationAssistantComponent = function({ subscription, user, onClose }) {
    const [loading, setLoading] = React.useState(false);
    const [selectedStrategy, setSelectedStrategy] = React.useState('price_increase');
    const [generatedEmail, setGeneratedEmail] = React.useState(null);
    const [customContext, setCustomContext] = React.useState('');
    const [copySuccess, setCopySuccess] = React.useState(false);

    const strategies = {
        price_increase: {
            title: '📈 Price Increase Response',
            description: 'Your price went up - negotiate to keep old rate',
            icon: '💰',
            color: 'orange'
        },
        retention: {
            title: '🎯 Retention Offer Request',
            description: 'Threaten to cancel to get discount',
            icon: '🎁',
            color: 'blue'
        },
        competitor: {
            title: '🏆 Competitor Leverage',
            description: 'Use competitor pricing to negotiate',
            icon: '⚔️',
            color: 'purple'
        },
        loyalty: {
            title: '⭐ Loyalty Discount',
            description: 'Long-time customer requesting discount',
            icon: '👑',
            color: 'green'
        },
        bundle: {
            title: '📦 Bundle Discount',
            description: 'Multiple services - ask for bundle pricing',
            icon: '🎁',
            color: 'pink'
        },
        financial: {
            title: '💸 Financial Hardship',
            description: 'Budget constraints - need reduced rate',
            icon: '🙏',
            color: 'red'
        }
    };

    const generateNegotiationEmail = async () => {
        setLoading(true);
        try {
            // Call Claude API to generate personalized email
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 1000,
                    messages: [{
                        role: 'user',
                        content: `Generate a professional, persuasive negotiation email for me to send to ${subscription.name} customer support.

CONTEXT:
- Service: ${subscription.name}
- Current cost: $${subscription.cost}/${subscription.billing_cycle}
- Category: ${subscription.category}
- Strategy: ${strategies[selectedStrategy].title}
- Additional context: ${customContext || 'None provided'}

REQUIREMENTS:
1. Professional and polite tone
2. Specific dollar amount mention
3. Reference to loyalty/being a good customer
4. Mention competitor if relevant
5. Clear ask for discount/retention offer
6. Include subtle threat to cancel if appropriate
7. Keep it concise (150-200 words)
8. DO NOT use placeholders - generate realistic details
9. Be persuasive but not desperate
10. Include a clear call-to-action

Generate ONLY the email body, no subject line. Use a friendly but firm tone.`
                    }]
                })
            });

            const data = await response.json();
            const emailText = data.content[0].text;

            // Generate subject line separately
            const subjectResponse = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 50,
                    messages: [{
                        role: 'user',
                        content: `Generate a short, professional email subject line for this negotiation with ${subscription.name}. Strategy: ${strategies[selectedStrategy].title}. Return ONLY the subject line, no quotes or extra text.`
                    }]
                })
            });

            const subjectData = await subjectResponse.json();
            const subject = subjectData.content[0].text.replace(/['"]/g, '');

            setGeneratedEmail({
                subject: subject,
                body: emailText,
                strategy: selectedStrategy,
                generatedAt: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error generating email:', error);
            alert('Failed to generate email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const sendEmail = () => {
        // Construct mailto link
        const supportEmails = {
            'Netflix': 'support@netflix.com',
            'Spotify': 'support@spotify.com',
            'Hulu': 'support@hulu.com',
            'Disney+': 'help@disneyplus.com',
            'Amazon Prime': 'prime@amazon.com'
        };

        const email = supportEmails[subscription.name] || `support@${subscription.name.toLowerCase().replace(/\s+/g, '')}.com`;
        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(generatedEmail.subject)}&body=${encodeURIComponent(generatedEmail.body)}`;
        
        window.location.href = mailtoLink;
    };

    // Icons
    const Zap = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
    const Mail = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
    const Copy = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
    const X = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
    const Sparkles = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>;
    const TrendingUp = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
    const Check = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[70]" onClick={onClose}>
            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                            <Sparkles size={28} className="text-purple-600" />
                            AI Negotiation Assistant
                        </h2>
                        <p className="text-gray-600">Generate personalized emails to negotiate with {subscription.name}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {!generatedEmail && (
                    <div>
                        {/* Subscription Info */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6 border-2 border-purple-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{subscription.name}</h3>
                                    <p className="text-gray-600">Currently paying: <span className="font-bold text-purple-600">${subscription.cost}/{subscription.billing_cycle}</span></p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600 mb-1">Potential Savings</p>
                                    <p className="text-2xl font-bold text-green-600">$50-150/year</p>
                                </div>
                            </div>
                        </div>

                        {/* Strategy Selection */}
                        <div className="mb-6">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <TrendingUp size={20} />
                                Choose Your Negotiation Strategy
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Object.entries(strategies).map(([key, strategy]) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedStrategy(key)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                                            selectedStrategy === key
                                                ? `border-${strategy.color}-500 bg-${strategy.color}-50`
                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-3xl">{strategy.icon}</span>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900 mb-1">{strategy.title}</h4>
                                                <p className="text-sm text-gray-600">{strategy.description}</p>
                                            </div>
                                            {selectedStrategy === key && (
                                                <div className="flex-shrink-0">
                                                    <Check className="text-green-600" size={24} />
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Additional Context */}
                        <div className="mb-6">
                            <label className="block font-bold text-gray-900 mb-2">
                                Additional Context (Optional)
                            </label>
                            <textarea
                                value={customContext}
                                onChange={(e) => setCustomContext(e.target.value)}
                                placeholder="E.g., 'I've been a customer for 3 years' or 'I saw competitor offering same for $5 less'"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                                rows="3"
                            />
                        </div>

                        {/* Success Examples */}
                        <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
                            <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                                💪 Success Stories
                            </h4>
                            <div className="space-y-2 text-sm text-green-700">
                                <p>• "Got 40% off Netflix by mentioning I was switching to Disney+" - Sarah M.</p>
                                <p>• "Spotify gave me 3 months free just for asking!" - Mike T.</p>
                                <p>• "Adobe reduced my plan from $54 to $29/month" - Jessica R.</p>
                            </div>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={generateNegotiationEmail}
                            disabled={loading}
                            className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-xl transition-all font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin w-6 h-6 border-3 border-white border-t-transparent rounded-full"></div>
                                    <span>Generating with AI...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={24} />
                                    <span>Generate Negotiation Email</span>
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Generated Email Display */}
                {generatedEmail && (
                    <div>
                        {/* Success Header */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-5 mb-6">
                            <div className="flex items-center gap-3 text-white">
                                <Check size={32} />
                                <div>
                                    <h3 className="text-xl font-bold">Email Generated!</h3>
                                    <p className="text-white/90">AI-powered negotiation email ready to send</p>
                                </div>
                            </div>
                        </div>

                        {/* Email Preview */}
                        <div className="bg-gray-50 rounded-xl p-6 mb-6 border-2 border-gray-200">
                            <div className="mb-4 pb-4 border-b-2 border-gray-300">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-semibold text-gray-600">SUBJECT:</span>
                                    <button
                                        onClick={() => copyToClipboard(generatedEmail.subject)}
                                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        <Copy size={14} />
                                        Copy
                                    </button>
                                </div>
                                <p className="font-bold text-gray-900">{generatedEmail.subject}</p>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-semibold text-gray-600">EMAIL BODY:</span>
                                    <button
                                        onClick={() => copyToClipboard(generatedEmail.body)}
                                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        <Copy size={14} />
                                        {copySuccess ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                                    {generatedEmail.body}
                                </div>
                            </div>
                        </div>

                        {/* Strategy Badge */}
                        <div className="mb-6 flex items-center gap-2">
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                                Strategy: {strategies[generatedEmail.strategy].icon} {strategies[generatedEmail.strategy].title}
                            </span>
                        </div>

                        {/* Tips */}
                        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <h4 className="font-bold text-blue-900 mb-2">💡 Negotiation Tips:</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>✓ Be polite but firm - customer support wants to help</li>
                                <li>✓ Mention you're a long-time customer (even if just 6 months)</li>
                                <li>✓ Have a competitor price ready if asked</li>
                                <li>✓ If first agent says no, try calling/chatting again</li>
                                <li>✓ Best times: End of month/quarter when agents have retention quotas</li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={sendEmail}
                                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-xl transition-all font-bold flex items-center justify-center gap-2"
                            >
                                <Mail size={20} />
                                Open in Email
                            </button>
                            <button
                                onClick={() => {
                                    copyToClipboard(`${generatedEmail.subject}\n\n${generatedEmail.body}`);
                                    alert('Full email copied to clipboard!');
                                }}
                                className="px-6 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold flex items-center gap-2"
                            >
                                <Copy size={20} />
                                Copy All
                            </button>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={() => setGeneratedEmail(null)}
                                className="flex-1 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors font-semibold"
                            >
                                ← Generate Different Strategy
                            </button>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-semibold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Make it available globally
window.NegotiationAssistant = window.NegotiationAssistantComponent;