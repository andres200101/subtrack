// ==============================================
// SUBSCRIPTIONS LIST COMPONENT - subscriptions.js
// ==============================================

const { useState } = React;

window.SubscriptionsList = function SubscriptionsList({ subscriptions, onAdd, onEdit, onDelete, loading }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingSub, setEditingSub] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        cost: '',
        billing_cycle: 'monthly',
        category: 'Entertainment',
        type: 'paid',
        next_billing_date: '',
        notes: ''
    });

    const categories = ['Entertainment', 'Productivity', 'Health', 'Education', 'Shopping', 'Finance', 'Other'];
    const billingCycles = ['monthly', 'yearly', 'weekly', 'quarterly'];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.cost) {
            alert('Please fill in name and cost');
            return;
        }

        const subData = {
            name: formData.name,
            cost: parseFloat(formData.cost),
            billing_cycle: formData.billing_cycle,
            category: formData.category,
            type: formData.type,
            next_billing_date: formData.next_billing_date || null,
            notes: formData.notes || ''
        };

        if (editingSub) {
            await onEdit(editingSub.id, subData);
            setEditingSub(null);
        } else {
            await onAdd(subData);
        }

        resetForm();
        setShowAddModal(false);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            cost: '',
            billing_cycle: 'monthly',
            category: 'Entertainment',
            type: 'paid',
            next_billing_date: '',
            notes: ''
        });
    };

    const handleEdit = (sub) => {
        setEditingSub(sub);
        setFormData({
            name: sub.name,
            cost: sub.cost.toString(),
            billing_cycle: sub.billing_cycle,
            category: sub.category,
            type: sub.type,
            next_billing_date: sub.next_billing_date || '',
            notes: sub.notes || ''
        });
        setShowAddModal(true);
    };

    const handleCancelEdit = () => {
        setEditingSub(null);
        resetForm();
        setShowAddModal(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-tangaroa">My Subscriptions</h1>
                    <p className="text-lynch mt-1">{subscriptions.length} active subscriptions</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-primary"
                >
                    + Add Subscription
                </button>
            </div>

            {/* Subscriptions Grid */}
            {loading ? (
                <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-picton-blue mx-auto"></div>
                    <p className="text-lynch mt-4">Loading subscriptions...</p>
                </div>
            ) : subscriptions.length === 0 ? (
                <div className="card-frosted p-12 text-center">
                    <div className="text-6xl mb-4">💳</div>
                    <h3 className="text-xl font-bold text-tangaroa mb-2">No subscriptions yet</h3>
                    <p className="text-lynch mb-6">Start tracking your subscriptions to take control of your spending</p>
                    <button onClick={() => setShowAddModal(true)} className="btn btn-accent">
                        Add Your First Subscription
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subscriptions.map(sub => {
                        const monthlyEquivalent = window.helpers?.calculateMonthlyEquivalent?.(
                            parseFloat(sub.cost), 
                            sub.billing_cycle
                        ) || parseFloat(sub.cost);

                        return (
                            <div key={sub.id} className="card-frosted p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-tangaroa mb-1">{sub.name}</h3>
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-lynch">
                                            {sub.category}
                                        </span>
                                    </div>
                                    {sub.type === 'trial' && (
                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                            Trial
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-lynch">Cost</span>
                                        <span className="font-bold text-tangaroa">${parseFloat(sub.cost).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-lynch">Billing</span>
                                        <span className="text-sm text-tangaroa capitalize">{sub.billing_cycle}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-lynch">Monthly</span>
                                        <span className="text-sm font-bold gradient-text">
                                            ${monthlyEquivalent.toFixed(2)}/mo
                                        </span>
                                    </div>
                                    {sub.next_billing_date && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-lynch">Next billing</span>
                                            <span className="text-sm text-tangaroa">
                                                {new Date(sub.next_billing_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {sub.notes && (
                                    <p className="text-sm text-lynch mb-4 border-t border-gray-200 pt-3">
                                        {sub.notes}
                                    </p>
                                )}

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(sub)}
                                        className="flex-1 btn btn-ghost text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => onDelete(sub.id)}
                                        className="flex-1 btn btn-ghost text-sm text-red-600 hover:bg-red-50"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-black text-tangaroa mb-6">
                            {editingSub ? 'Edit Subscription' : 'Add New Subscription'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-tangaroa mb-2">
                                    Service Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Netflix, Spotify, etc."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-picton-blue focus:ring-2 focus:ring-picton-blue/20 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-tangaroa mb-2">
                                    Cost *
                                </label>
                                <input
                                    type="number"
                                    name="cost"
                                    value={formData.cost}
                                    onChange={handleInputChange}
                                    placeholder="9.99"
                                    step="0.01"
                                    min="0"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-picton-blue focus:ring-2 focus:ring-picton-blue/20 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-tangaroa mb-2">
                                    Billing Cycle
                                </label>
                                <select
                                    name="billing_cycle"
                                    value={formData.billing_cycle}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-picton-blue focus:ring-2 focus:ring-picton-blue/20 outline-none"
                                >
                                    {billingCycles.map(cycle => (
                                        <option key={cycle} value={cycle}>
                                            {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-tangaroa mb-2">
                                    Category
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-picton-blue focus:ring-2 focus:ring-picton-blue/20 outline-none"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-tangaroa mb-2">
                                    Type
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-picton-blue focus:ring-2 focus:ring-picton-blue/20 outline-none"
                                >
                                    <option value="paid">Paid</option>
                                    <option value="trial">Trial</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-tangaroa mb-2">
                                    Next Billing Date
                                </label>
                                <input
                                    type="date"
                                    name="next_billing_date"
                                    value={formData.next_billing_date}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-picton-blue focus:ring-2 focus:ring-picton-blue/20 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-tangaroa mb-2">
                                    Notes
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    placeholder="Add any notes..."
                                    rows="3"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-picton-blue focus:ring-2 focus:ring-picton-blue/20 outline-none resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="flex-1 btn btn-ghost"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 btn btn-primary"
                                >
                                    {editingSub ? 'Update' : 'Add'} Subscription
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};