import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import Nav from '../components/Nav';

const MyDonations = () => {
    const [donations, setDonations] = useState([]);
    const [totalDonated, setTotalDonated] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyDonations();
    }, []);

    const fetchMyDonations = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/donation/my-donations', {
                withCredentials: true
            });
            setDonations(response.data.donations);
            setTotalDonated(response.data.totalDonated);
        } catch (error) {
            console.error('Error fetching donations:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'text-green-600 bg-green-100';
            case 'pending':
                return 'text-yellow-600 bg-yellow-100';
            case 'failed':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Nav />
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Donations</h1>
                    <p className="text-gray-600">Track your contribution to various campaigns</p>
                </div>

                {/* Stats Card */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">₹{totalDonated.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">Total Donated</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">{donations.length}</div>
                            <div className="text-sm text-gray-600">Total Donations</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600">
                                {donations.filter(d => d.paymentStatus === 'completed').length}
                            </div>
                            <div className="text-sm text-gray-600">Successful Donations</div>
                        </div>
                    </div>
                </div>

                {/* Donations List */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="flex justify-between">
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : donations.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">💝</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No donations yet</h3>
                        <p className="text-gray-600 mb-4">Start making a difference by donating to campaigns</p>
                        <a
                            href="/donations"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Browse Campaigns
                        </a>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {donations.map(donation => (
                            <div key={donation._id} className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                            {donation.campaign.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {donation.campaign.college}
                                        </p>
                                        {donation.message && (
                                            <p className="text-sm text-gray-700 italic">
                                                "{donation.message}"
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-blue-600 mb-1">
                                            ₹{donation.amount.toLocaleString()}
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(donation.paymentStatus)}`}>
                                            {donation.paymentStatus.charAt(0).toUpperCase() + donation.paymentStatus.slice(1)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-sm text-gray-600 border-t pt-4">
                                    <div className="flex items-center space-x-4">
                                        <span>Payment ID: {donation.paymentId}</span>
                                        <span>Method: {donation.paymentMethod.charAt(0).toUpperCase() + donation.paymentMethod.slice(1)}</span>
                                        {donation.isAnonymous && (
                                            <span className="text-purple-600">Anonymous</span>
                                        )}
                                    </div>
                                    <span>{moment(donation.createdAt).format('MMM DD, YYYY HH:mm')}</span>
                                </div>

                                {/* Campaign Progress */}
                                <div className="mt-4 pt-4 border-t">
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>Campaign Progress</span>
                                        <span>
                                            ₹{donation.campaign.raisedAmount.toLocaleString()} / ₹{donation.campaign.targetAmount.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ 
                                                width: `${Math.min((donation.campaign.raisedAmount / donation.campaign.targetAmount) * 100, 100)}%` 
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyDonations;