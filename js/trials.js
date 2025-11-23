// ==============================================
// TRIALS VIEW COMPONENT - trials.js
// ==============================================

window.TrialsView = function TrialsView({ trials, onConvert, onDelete }) {
    const handleConvertToPaid = async (trial) => {
        if (confirm(`Convert "${trial.name}" to a paid subscription?`)) {
            await onConvert(trial.id, { ...trial, type: 'paid' });
        }
    };

    const getDaysRemaining = (billingDate) => {
        if (!billingDate) return null;
        const now = new Date();
        const billing = new Date(billingDate);
        const diffTime = billing - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-tangaroa">Trial Subscriptions</h1>
                <p className="text-lynch mt-1">
                    {trials.length} active {trials.length === 1 ? 'trial' : 'trials'}
                </p>
            </div>

            {/* Trials List */}
            {trials.length === 0 ? (
                <div className="card-frosted p-12 text-center">
                    <div className="text-6xl mb-4">🎁</div>
                    <h3 className="text-xl font-bold text-tangaroa mb-2">No active trials</h3>
                    <p className="text-lynch">
                        Free trials you add will appear here with expiration tracking
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trials.map(trial => {
                        const daysRemaining = getDaysRemaining(trial.next_billing_date);
                        const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7;
                        const isExpired = daysRemaining !== null && daysRemaining < 0;

                        return (
                            <div 
                                key={trial.id} 
                                className={`card-frosted p-6 ${isExpiringSoon ? 'border-2 border-yellow-400' : ''} ${isExpired ? 'border-2 border-red-400' : ''}`}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-tangaroa mb-1">
                                            {trial.name}
                                        </h3>
                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                            Trial
                                        </span>
                                    </div>
                                </div>

                                {/* Trial Info */}
                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-lynch">Category</span>
                                        <span className="text-sm text-tangaroa">{trial.category}</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-lynch">Cost after trial</span>
                                        <span className="font-bold text-tangaroa">
                                            ${parseFloat(trial.cost).toFixed(2)}/{trial.billing_cycle}
                                        </span>
                                    </div>

                                    {trial.next_billing_date && (
                                        <>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-lynch">Ends on</span>
                                                <span className="text-sm text-tangaroa">
                                                    {new Date(trial.next_billing_date).toLocaleDateString()}
                                                </span>
                                            </div>

                                            {daysRemaining !== null && (
                                                <div className="pt-2 border-t border-gray-200">
                                                    <div className={`text-center py-2 rounded-xl ${
                                                        isExpired 
                                                            ? 'bg-red-50 text-red-700' 
                                                            : isExpiringSoon 
                                                            ? 'bg-yellow-50 text-yellow-700'
                                                            : 'bg-green-50 text-green-700'
                                                    }`}>
                                                        <span className="font-bold text-lg">
                                                            {isExpired 
                                                                ? 'Expired' 
                                                                : `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} left`
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {trial.notes && (
                                        <div className="pt-2 border-t border-gray-200">
                                            <p className="text-sm text-lynch">{trial.notes}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="space-y-2">
                                    <button
                                        onClick={() => handleConvertToPaid(trial)}
                                        className="w-full btn btn-accent text-sm"
                                    >
                                        Convert to Paid
                                    </button>
                                    <button
                                        onClick={() => onDelete(trial.id)}
                                        className="w-full btn btn-ghost text-sm text-red-600 hover:bg-red-50"
                                    >
                                        Cancel Trial
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Tips Section */}
            {trials.length > 0 && (
                <div className="card-frosted p-6 bg-blue-50">
                    <h3 className="font-bold text-tangaroa mb-3">💡 Trial Tips</h3>
                    <ul className="space-y-2 text-sm text-lynch">
                        <li>• Set calendar reminders 2-3 days before trials expire</li>
                        <li>• Cancel unwanted trials at least 24 hours before they end</li>
                        <li>• Some services let you cancel immediately while keeping access</li>
                        <li>• Track which payment method you used for easy cancellation</li>
                    </ul>
                </div>
            )}
        </div>
    );
};