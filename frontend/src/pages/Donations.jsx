import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Nav from '../components/Nav';
import CampaignCard from '../components/CampaignCard';
import DonationModal from '../components/DonationModal';

const Donations = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [showDonationModal, setShowDonationModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const categories = [
        { value: 'all', label: 'All Categories' },
        { value: 'scholarship', label: 'Scholarships' },
        { value: 'infrastructure', label: 'Infrastructure' },
        { value: 'research', label: 'Research' },
        { value: 'events', label: 'Events' },
        { value: 'emergency', label: 'Emergency' },
        { value: 'other', label: 'Other' }
    ];

    useEffect(() => {
        fetchCampaigns();
    }, [selectedCategory]);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8000/api/donation/campaigns', {
                params: { category: selectedCategory },
                withCredentials: true
            });
            setCampaigns(response.data.campaigns);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDonate = (campaign) => {
        setSelectedCampaign(campaign);
        setShowDonationModal(true);
    };

    const handleViewDetails = (campaign) => {
        setSelectedCampaign(campaign);
        setShowDetailsModal(true);
    };

    const handleDonationSuccess = () => {
        fetchCampaigns(); // Refresh campaigns to show updated amounts
        alert('Thank you for your donation!');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Nav />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">College Donations</h1>
                    <p className="text-gray-600">Support education and make a difference in students' lives</p>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                        {categories.map(category => (
                            <button
                                key={category.value}
                                onClick={() => setSelectedCategory(category.value)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    selectedCategory === category.value
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                }`}
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Campaigns Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="h-2 bg-gray-200 rounded mb-4"></div>
                                <div className="flex space-x-2">
                                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">🎓</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
                        <p className="text-gray-600">
                            {selectedCategory === 'all' 
                                ? 'No donation campaigns are currently active.'
                                : `No campaigns found in the ${categories.find(c => c.value === selectedCategory)?.label.toLowerCase()} category.`
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {campaigns.map(campaign => (
                            <CampaignCard
                                key={campaign._id}
                                campaign={campaign}
                                onDonate={handleDonate}
                                onViewDetails={handleViewDetails}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Donation Modal */}
            {selectedCampaign && (
                <DonationModal
                    campaign={selectedCampaign}
                    isOpen={showDonationModal}
                    onClose={() => setShowDonationModal(false)}
                    onSuccess={handleDonationSuccess}
                />
            )}

            {/* Campaign Details Modal */}
            {selectedCampaign && showDetailsModal && (
                <CampaignDetailsModal
                    campaign={selectedCampaign}
                    isOpen={showDetailsModal}
                    onClose={() => setShowDetailsModal(false)}
                    onDonate={() => {
                        setShowDetailsModal(false);
                        setShowDonationModal(true);
                    }}
                />
            )}
        </div>
    );
};

// Campaign Details Modal Component
const CampaignDetailsModal = ({ campaign, isOpen, onClose, onDonate }) => {
    const [recentDonations, setRecentDonations] = useState([]);

    useEffect(() => {
        if (isOpen && campaign) {
            fetchCampaignDetails();
        }
    }, [isOpen, campaign]);

    const fetchCampaignDetails = async () => {
        try {
            const response = await axios.get(
                `http://localhost:8000/api/donation/campaigns/${campaign._id}`,
                { withCredentials: true }
            );
            setRecentDonations(response.data.recentDonations);
        } catch (error) {
            console.error('Error fetching campaign details:', error);
        }
    };

    if (!isOpen) return null;

    const progressPercentage = (campaign.raisedAmount / campaign.targetAmount) * 100;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Campaign Details</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>

                    {campaign.images && campaign.images.length > 0 && (
                        <img
                            src={campaign.images[0]}
                            alt={campaign.title}
                            className="w-full h-64 object-cover rounded-lg mb-4"
                        />
                    )}

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{campaign.title}</h3>
                    <p className="text-gray-600 mb-4">{campaign.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <p className="text-sm text-gray-600">College</p>
                            <p className="font-medium">{campaign.college}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Category</p>
                            <p className="font-medium capitalize">{campaign.category}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Target Amount</p>
                            <p className="font-medium">₹{campaign.targetAmount.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Raised Amount</p>
                            <p className="font-medium">₹{campaign.raisedAmount.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>{progressPercentage.toFixed(1)}% funded</span>
                            <span>{campaign.donorCount} donors</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Beneficiary Details */}
                    {campaign.beneficiaryDetails && (
                        <div className="mb-6">
                            <h4 className="font-medium text-gray-900 mb-2">Beneficiary Information</h4>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm"><strong>Name:</strong> {campaign.beneficiaryDetails.name}</p>
                                <p className="text-sm"><strong>Contact:</strong> {campaign.beneficiaryDetails.contact}</p>
                                <p className="text-sm"><strong>Description:</strong> {campaign.beneficiaryDetails.description}</p>
                            </div>
                        </div>
                    )}

                    {/* Recent Donations */}
                    {recentDonations.length > 0 && (
                        <div className="mb-6">
                            <h4 className="font-medium text-gray-900 mb-2">Recent Donations</h4>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                {recentDonations.map((donation, index) => (
                                    <div key={index} className="flex justify-between items-center text-sm">
                                        <span>
                                            {donation.donor.firstName} {donation.donor.lastName}
                                        </span>
                                        <span className="font-medium">₹{donation.amount}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                            Close
                        </button>
                        {campaign.status === 'active' && (
                            <button
                                onClick={onDonate}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Donate Now
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Donations;