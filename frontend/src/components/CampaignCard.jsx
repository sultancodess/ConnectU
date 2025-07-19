import React from 'react';
import moment from 'moment';

const CampaignCard = ({ campaign, onDonate, onViewDetails }) => {
    const progressPercentage = (campaign.raisedAmount / campaign.targetAmount) * 100;
    const daysLeft = moment(campaign.endDate).diff(moment(), 'days');

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {campaign.images && campaign.images.length > 0 && (
                <img
                    src={campaign.images[0]}
                    alt={campaign.title}
                    className="w-full h-48 object-cover"
                />
            )}
            
            <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        campaign.category === 'scholarship' ? 'bg-blue-100 text-blue-800' :
                        campaign.category === 'infrastructure' ? 'bg-green-100 text-green-800' :
                        campaign.category === 'research' ? 'bg-purple-100 text-purple-800' :
                        campaign.category === 'events' ? 'bg-yellow-100 text-yellow-800' :
                        campaign.category === 'emergency' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                        {campaign.category.charAt(0).toUpperCase() + campaign.category.slice(1)}
                    </span>
                    <span className={`text-xs font-medium ${
                        campaign.status === 'active' ? 'text-green-600' :
                        campaign.status === 'completed' ? 'text-blue-600' :
                        'text-gray-600'
                    }`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {campaign.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {campaign.description}
                </p>

                <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">College:</span> {campaign.college}
                    </p>
                    <p className="text-sm text-gray-600">
                        <span className="font-medium">Created by:</span> {campaign.createdBy?.firstName} {campaign.createdBy?.lastName}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>₹{campaign.raisedAmount.toLocaleString()}</span>
                        <span>₹{campaign.targetAmount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{progressPercentage.toFixed(1)}% funded</span>
                        <span>{campaign.donorCount} donors</span>
                    </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                    <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Campaign ended'}</span>
                    <span>Ends: {moment(campaign.endDate).format('MMM DD, YYYY')}</span>
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={() => onViewDetails(campaign)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        View Details
                    </button>
                    {campaign.status === 'active' && (
                        <button
                            onClick={() => onDonate(campaign)}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Donate Now
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CampaignCard;