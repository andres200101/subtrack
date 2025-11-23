// ==============================================
// ANALYTICS VIEW COMPONENT - analytics.js
// ==============================================

window.AnalyticsView = function AnalyticsView({ subscriptions, totalMonthly, totalYearly }) {
    // Category breakdown
    const categoryData = subscriptions.reduce((acc, sub) => {
        const category = sub.category || 'Other';
        const monthly = window.helpers?.calculateMonthlyEquivalent?.(
            parseFloat(sub.cost), 
            sub.billing_cycle
        ) || parseFloat(sub.cost);
        
        acc[category] = (acc[category] || 0) + monthly;
        return acc;
    }, {});

    const categoryArray = Object.entries(categoryData)
        .map(([category, amount]) => ({
            category,
            amount,
            percentage: totalMonthly > 0 ? (amount / totalMonthly * 100).toFixed(1) : 0
        }))
        .sort((a, b) => b.amount - a.amount);

    // Billing cycle breakdown
    const billingData = subscriptions.reduce((acc, sub) => {
        const cycle = sub.billing_cycle || 'monthly';
        acc[cycle] = (acc[cycle] || 0) + 1;
        return acc;
    }, {});

    // Most expensive subscriptions
    const topExpensive = [...subscriptions]
        .sort((a, b) => {
            const aMonthly = window.helpers?.calculateMonthlyEquivalent?.(
                parseFloat(a.cost), 
                a.billing_cycle
            ) || parseFloat(a.cost);
            const bMonthly = window.helpers?.calculateMonthlyEquivalent?.(
                parseFloat(b.cost), 
                b.billing_cycle
            ) || parseFloat(b.cost);
            return bMonthly - aMonthly;
        })
        .slice(0, 5);

    // Colors for categories
    const colors = [
        'bg-blue-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-orange-500',
        'bg-green-500',
        'bg-yellow-500',
        'bg-red-500',
        'bg-indigo-500'
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-tangaroa">Analytics</h1>
                <p className="text-lynch mt-1">Insights into your subscription spending</p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card-frosted p-6 text-center">
                    <div className="text-3xl mb-2">💰</div>
                    <p className="text-sm text-lynch mb-1">Monthly Total</p>
                    <p className="text-2xl font-black gradient-text">${totalMonthly.toFixed(2)}</p>
                </div>
                <div className="card-frosted p-6 text-center">
                    <div className="text-3xl mb-2">📅</div>
                    <p className="text-sm text-lynch mb-1">Yearly Total</p>
                    <p className="text-2xl font-black gradient-text">${totalYearly.toFixed(2)}</p>
                </div>
                <div className="card-frosted p-6 text-center">
                    <div className="text-3xl mb-2">📊</div>
                    <p className="text-sm text-lynch mb-1">Total Services</p>
                    <p className="text-2xl font-black gradient-text">{subscriptions.length}</p>
                </div>
                <div className="card-frosted p-6 text-center">
                    <div className="text-3xl mb-2">💵</div>
                    <p className="text-sm text-lynch mb-1">Average Cost</p>
                    <p className="text-2xl font-black gradient-text">
                        ${subscriptions.length > 0 ? (totalMonthly / subscriptions.length).toFixed(2) : '0.00'}
                    </p>
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="card-frosted p-6">
                <h2 className="text-2xl font-bold text-tangaroa mb-6">Spending by Category</h2>
                
                {categoryArray.length === 0 ? (
                    <p className="text-center text-lynch py-8">No data to display</p>
                ) : (
                    <div className="space-y-4">
                        {categoryArray.map((item, index) => (
                            <div key={item.category}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-tangaroa">{item.category}</span>
                                    <div className="text-right">
                                        <span className="font-bold text-tangaroa">
                                            ${item.amount.toFixed(2)}/mo
                                        </span>
                                        <span className="text-sm text-lynch ml-2">
                                            ({item.percentage}%)
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div 
                                        className={`h-full ${colors[index % colors.length]} transition-all duration-500`}
                                        style={{ width: `${item.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top 5 Most Expensive */}
                <div className="card-frosted p-6">
                    <h2 className="text-xl font-bold text-tangaroa mb-4">Most Expensive</h2>
                    {topExpensive.length === 0 ? (
                        <p className="text-center text-lynch py-8">No subscriptions yet</p>
                    ) : (
                        <div className="space-y-3">
                            {topExpensive.map((sub, index) => {
                                const monthly = window.helpers?.calculateMonthlyEquivalent?.(
                                    parseFloat(sub.cost), 
                                    sub.billing_cycle
                                ) || parseFloat(sub.cost);

                                return (
                                    <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl font-black text-gray-300">
                                                #{index + 1}
                                            </span>
                                            <div>
                                                <p className="font-bold text-tangaroa">{sub.name}</p>
                                                <p className="text-xs text-lynch">{sub.category}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-tangaroa">${monthly.toFixed(2)}</p>
                                            <p className="text-xs text-lynch">/month</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Billing Cycles */}
                <div className="card-frosted p-6">
                    <h2 className="text-xl font-bold text-tangaroa mb-4">Billing Cycles</h2>
                    {Object.keys(billingData).length === 0 ? (
                        <p className="text-center text-lynch py-8">No data to display</p>
                    ) : (
                        <div className="space-y-3">
                            {Object.entries(billingData).map(([cycle, count]) => (
                                <div key={cycle} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div>
                                        <p className="font-bold text-tangaroa capitalize">{cycle}</p>
                                        <p className="text-sm text-lynch">
                                            {count} {count === 1 ? 'subscription' : 'subscriptions'}
                                        </p>
                                    </div>
                                    <div className="text-3xl">
                                        {cycle === 'monthly' && '📅'}
                                        {cycle === 'yearly' && '🗓️'}
                                        {cycle === 'weekly' && '📆'}
                                        {cycle === 'quarterly' && '📊'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Insights */}
            <div className="card-frosted p-6 bg-gradient-to-r from-blue-50 to-purple-50">
                <h2 className="text-xl font-bold text-tangaroa mb-4">💡 Insights & Tips</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl">
                        <p className="text-sm font-bold text-tangaroa mb-2">Annual Savings Opportunity</p>
                        <p className="text-xs text-lynch">
                            Switching monthly subscriptions to annual billing typically saves 15-20%. 
                            That could mean <span className="font-bold">${(totalYearly * 0.175).toFixed(2)}</span> in savings!
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl">
                        <p className="text-sm font-bold text-tangaroa mb-2">Budget Recommendation</p>
                        <p className="text-xs text-lynch">
                            Financial experts suggest keeping subscription costs under 5-10% of your income. 
                            Review subscriptions quarterly to eliminate unused services.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};