import React from 'react';
import { useAuth } from '../hooks/useAuth';

const DashboardPage = () => {
    const { user } = useAuth();

    return (
        <div>
            <h2>Dashboard</h2>
            <p>Welcome back, {user?.username}! This is your main dashboard.</p>
            {/* Add widgets, summaries, quick links etc. here */}
        </div>
    );
};

export default DashboardPage;