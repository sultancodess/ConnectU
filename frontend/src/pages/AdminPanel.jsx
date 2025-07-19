import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Nav from '../components/Nav';
import moment from 'moment';

const AdminPanel = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalRaised: 0,
        totalDonors: 0
    });

    useEffect(() => {
        fetchCampaigns();
        fetchStats();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/donation/campaigns', {
                params: { status: 'all' },
                withCredentials: true
            });
            setCampaigns(response.data.campaigns);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            // This would be a separate API endpoint in a real app
            const response = await axios.get('http://localhost:8000/api/donation/campaigns', {
                withCredentials: true
            });
            const allCampaigns = response.data.campaigns;
            
            setStats({
                totalCampaigns: allCampaigns.length,
                activeCampaigns: allCampaigns.filter(c => c.status === 'active').length,
                totalRaised: allCampaigns.reduce((sum, c) => sum + c.raisedAmount, 0),
                totalDonors: allCampaigns.reduce((sum, c) => sum + c.donorCount, 0)
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const updateCampaignStatus = async (campaignId, newStatus) => {
        try {
            await axios.put(
                `http://localhost:8000/api/donation/campaigns/${campaignId}`,
                { status: newStatus },
                { withCredentials: true }
            );
            fetchCampaigns();
            fetchStats();
        } catch (error) {
            console.error('Error updating campaign:', error);
            alert('Failed to update campaign status');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Nav />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
                    <p className="text-gray-600">Manage donation campaigns and monitor platform activity</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="text-2xl font-bold text-blue-600">{stats.totalCampaigns}</div>
                        <div className="text-sm text-gray-600">Total Campaigns</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="text-2xl font-bold text-green-600">{stats.activeCampaigns}</div>
                        <div className="text-sm text-gray-600">Active Campaigns</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="text-2xl font-bold text-purple-600">₹{stats.totalRaised.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Total Raised</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="text-2xl font-bold text-orange-600">{stats.totalDonors}</div>
                        <div className="text-sm text-gray-600">Total Donors</div>
                    </div>
                </div>

                {/* Create Campaign Button */}
                <div className="mb-6">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                        Create New Campaign
                    </button>
                </div>

                {/* Campaigns Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">All Campaigns</h2>
                    </div>
                    
                    {loading ? (
                        <div className="p-6">
                            <div className="animate-pulse space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Campaign
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Progress
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {campaigns.map((campaign) => (
                                        <tr key={campaign._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {campaign.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {campaign.college}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    ₹{campaign.raisedAmount.toLocaleString()} / ₹{campaign.targetAmount.toLocaleString()}
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{ 
                                                            width: `${Math.min((campaign.raisedAmount / campaign.targetAmount) * 100, 100)}%` 
                                                        }}
                                                    ></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                    campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {campaign.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {moment(campaign.createdAt).format('MMM DD, YYYY')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <select
                                                    value={campaign.status}
                                                    onChange={(e) => updateCampaignStatus(campaign._id, e.target.value)}
                                                    className="text-sm border border-gray-300 rounded px-2 py-1"
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="paused">Paused</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Campaign Modal */}
            {showCreateModal && (
                <CreateCampaignModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        fetchCampaigns();
                        fetchStats();
                        setShowCreateModal(false);
                    }}
                />
            )}
        </div>
    );
};

// Create Campaign Modal Component
const CreateCampaignModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        targetAmount: '',
        college: '',
        category: 'scholarship',
        endDate: '',
        beneficiaryDetails: {
            name: '',
            contact: '',
            description: ''
        }
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post(
                'http://localhost:8000/api/donation/campaigns',
                {
                    ...formData,
                    targetAmount: parseInt(formData.targetAmount)
                },
                { withCredentials: true }
            );
            onSuccess();
        } catch (error) {
            console.error('Error creating campaign:', error);
            alert('Failed to create campaign');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Create New Campaign</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                required
                                rows="3"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount (₹)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.targetAmount}
                                    onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="scholarship">Scholarship</option>
                                    <option value="infrastructure">Infrastructure</option>
                                    <option value="research">Research</option>
                                    <option value="events">Events</option>
                                    <option value="emergency">Emergency</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.college}
                                    onChange={(e) => setFormData({...formData, college: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h3 className="text-lg font-medium mb-3">Beneficiary Details</h3>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Beneficiary Name"
                                    value={formData.beneficiaryDetails.name}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        beneficiaryDetails: {...formData.beneficiaryDetails, name: e.target.value}
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    placeholder="Contact Information"
                                    value={formData.beneficiaryDetails.contact}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        beneficiaryDetails: {...formData.beneficiaryDetails, contact: e.target.value}
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <textarea
                                    placeholder="Additional Description"
                                    rows="2"
                                    value={formData.beneficiaryDetails.description}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        beneficiaryDetails: {...formData.beneficiaryDetails, description: e.target.value}
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create Campaign'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;