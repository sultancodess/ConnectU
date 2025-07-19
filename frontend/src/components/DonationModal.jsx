import React, { useState, useContext } from 'react';
import RazorpayButton from './RazorpayButton';
import { userDataContext } from '../context/userContext';

const DonationModal = ({ campaign, isOpen, onClose, onSuccess }) => {
    const { userData } = useContext(userDataContext);
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [error, setError] = useState('');

    const predefinedAmounts = [100, 500, 1000, 2500, 5000];

    const handleDonationSuccess = (data) => {
        onSuccess(data);
        onClose();
    };

    const handleDonationError = (errorMessage) => {
        setError(errorMessage);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Donate to Campaign</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="mb-4">
                        <h3 className="font-medium text-gray-900 mb-1">{campaign.title}</h3>
                        <p className="text-sm text-gray-600">{campaign.college}</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Donation Amount (₹)
                        </label>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            {predefinedAmounts.map(amt => (
                                <button
                                    key={amt}
                                    type="button"
                                    onClick={() => setAmount(amt.toString())}
                                    className={`px-3 py-2 text-sm border rounded-md ${
                                        amount === amt.toString()
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    ₹{amt}
                                </button>
                            ))}
                        </div>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter custom amount"
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Message (Optional)
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Leave a message of support..."
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Method
                        </label>
                        <div className="flex space-x-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    checked={paymentMethod === 'razorpay'}
                                    onChange={() => setPaymentMethod('razorpay')}
                                    className="mr-2"
                                />
                                <span>Razorpay</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    checked={paymentMethod === 'stripe'}
                                    onChange={() => setPaymentMethod('stripe')}
                                    className="mr-2"
                                />
                                <span>Stripe</span>
                            </label>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Donate anonymously</span>
                        </label>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        
                        {paymentMethod === 'razorpay' ? (
                            <RazorpayButton
                                amount={parseInt(amount) || 0}
                                campaignId={campaign._id}
                                onSuccess={handleDonationSuccess}
                                onError={handleDonationError}
                                donationData={{
                                    message,
                                    isAnonymous,
                                    name: `${userData.firstName} ${userData.lastName}`,
                                    email: userData.email
                                }}
                            />
                        ) : (
                            <button
                                type="button"
                                disabled={!amount}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => setError('Stripe integration coming soon!')}
                            >
                                Pay ₹{amount || 0} with Stripe
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonationModal;