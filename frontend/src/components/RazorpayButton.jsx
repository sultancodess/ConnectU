import React from 'react';
import axios from 'axios';

const RazorpayButton = ({ amount, campaignId, onSuccess, onError, donationData }) => {
    const handlePayment = async () => {
        try {
            // In a real implementation, you would create an order on your server
            // and get the order_id from Razorpay
            const orderData = {
                amount: amount * 100, // Razorpay expects amount in paise
                currency: 'INR',
                receipt: `donation_${Date.now()}`,
                payment_capture: 1
            };
            
            // Simulating order creation response
            const orderId = `order_${Date.now()}`;
            
            const options = {
                key: 'rzp_test_YOUR_KEY_ID', // Replace with your Razorpay key
                amount: amount * 100,
                currency: 'INR',
                name: 'ConnectU',
                description: 'Donation for College Campaign',
                order_id: orderId,
                handler: async function(response) {
                    try {
                        // Process donation on successful payment
                        const donationResponse = await axios.post(
                            `http://localhost:8000/api/donation/campaigns/${campaignId}/donate`,
                            {
                                ...donationData,
                                amount: amount,
                                paymentId: response.razorpay_payment_id,
                                paymentMethod: 'razorpay'
                            },
                            { withCredentials: true }
                        );
                        
                        onSuccess(donationResponse.data);
                    } catch (error) {
                        console.error('Error processing donation:', error);
                        onError('Payment successful but donation processing failed');
                    }
                },
                prefill: {
                    name: donationData.name || '',
                    email: donationData.email || '',
                },
                theme: {
                    color: '#3B82F6'
                },
                modal: {
                    ondismiss: function() {
                        console.log('Payment cancelled');
                    }
                }
            };
            
            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error('Error initiating payment:', error);
            onError('Failed to initiate payment');
        }
    };

    return (
        <button
            onClick={handlePayment}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
            Pay ₹{amount} with Razorpay
        </button>
    );
};

export default RazorpayButton;