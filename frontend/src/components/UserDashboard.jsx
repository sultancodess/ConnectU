import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { userDataContext } from '../context/userContext';
import { useSocket } from '../context/SocketContext';

const UserDashboard = () => {
    const { userData } = useContext(userDataContext);
    const { onlineUsers } = useSocket();
    const [stats, setStats] = useState({
        connections: 0,
        posts: 0,
        donations: 0,
        totalDonated: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserStats();
        fetchRecentActivity();
    }, []);

    const fetchUserStats = async () => {
        try {
            // Fetch user connections count
            const connectionsResponse = await axios.get('http://localhost:8000/api/user/connections', {
                withCredentials: true
            });
            
            // Fetch user posts count
            const postsResponse = await axios.get('http://localhost:8000/api/post/user-posts', {
                withCredentials: true
            });
            
            // Fetch donation stats
            const donationsResponse = await axios.get('http://localhost:8000/api/donation/my-donations', {
                withCredentials: true
            });

            setStats({
                connections: connectionsResponse.data.connections?.length || 0,
                posts: postsResponse.data.posts?.length || 0,
                donations: donationsResponse.data.donations?.length || 0,
                totalDonated: donationsResponse.data.totalDonated || 0
            });
        } catch (error) {
            console.error('Error fetching user stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentActivity = async () => {
        try {
            // This would be a combined endpoint in a real app
            const response = await axios.get('http://localhost:8000/api/user/recent-activity', {
                withCredentials: true
            });
            setRecentActivity(response.data.activities || []);
        } catch (error) {
            console.error('Error fetching recent activity:', error);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="text-center">
                            <div className="h-8 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">
                    Welcome back, {userData.firstName}! 👋
                </h2>
                <p className="text-blue-100">
                    {userData.headline || 'Complete your profile to get better connections'}
                </p>
                <div className="mt-4 flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span className="text-sm">{onlineUsers.length} users online</span>
                    </div>
                    <div className="text-sm">
                        Role: {userData.role?.charAt(0).toUpperCase() + userData.role?.slice(1)}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600">{stats.connections}</div>
                    <div className="text-sm text-gray-600">Connections</div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <div className="text-3xl font-bold text-green-600">{stats.posts}</div>
                    <div className="text-sm text-gray-600">Posts</div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <div className="text-3xl font-bold text-purple-600">{stats.donations}</div>
                    <div className="text-sm text-gray-600">Donations</div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <div className="text-3xl font-bold text-orange-600">₹{stats.totalDonated.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Donated</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <a
                        href="/network"
                        className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <div className="text-2xl mb-2">👥</div>
                        <span className="text-sm font-medium">Find Connections</span>
                    </a>
                    <a
                        href="/chat"
                        className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <div className="text-2xl mb-2">💬</div>
                        <span className="text-sm font-medium">Start Chat</span>
                    </a>
                    <a
                        href="/donations"
                        className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <div className="text-2xl mb-2">💝</div>
                        <span className="text-sm font-medium">Donate</span>
                    </a>
                    <a
                        href="/profile"
                        className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <div className="text-2xl mb-2">👤</div>
                        <span className="text-sm font-medium">Edit Profile</span>
                    </a>
                </div>
            </div>

            {/* Profile Completion */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Profile Completion</h3>
                <ProfileCompletionBar userData={userData} />
            </div>
        </div>
    );
};

// Profile Completion Component
const ProfileCompletionBar = ({ userData }) => {
    const calculateCompletion = () => {
        let completed = 0;
        const total = 8;

        if (userData.firstName && userData.lastName) completed++;
        if (userData.email) completed++;
        if (userData.headline) completed++;
        if (userData.profileImage) completed++;
        if (userData.location) completed++;
        if (userData.skills && userData.skills.length > 0) completed++;
        if (userData.education && userData.education.length > 0) completed++;
        if (userData.experience && userData.experience.length > 0) completed++;

        return Math.round((completed / total) * 100);
    };

    const completion = calculateCompletion();
    const suggestions = [];

    if (!userData.headline) suggestions.push("Add a professional headline");
    if (!userData.profileImage) suggestions.push("Upload a profile picture");
    if (!userData.skills || userData.skills.length === 0) suggestions.push("Add your skills");
    if (!userData.education || userData.education.length === 0) suggestions.push("Add your education");
    if (!userData.experience || userData.experience.length === 0) suggestions.push("Add work experience");

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Profile Completion</span>
                <span className="text-sm text-gray-600">{completion}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completion}%` }}
                ></div>
            </div>
            {suggestions.length > 0 && (
                <div>
                    <p className="text-sm text-gray-600 mb-2">Complete your profile:</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                        {suggestions.slice(0, 3).map((suggestion, index) => (
                            <li key={index} className="flex items-center">
                                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;