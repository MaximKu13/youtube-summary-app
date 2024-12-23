"use client"; // Add this line at the top
import React, { useState, useEffect } from 'react';

// Define the type for a subscription
interface Subscription {
  id: number;
  channelId: string;
  channelName: string;
}

const UnifiedSubscriptionManager = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/subscriptions');
      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }
      const data = await response.json();
      setSubscriptions(data);
    } catch (err) {
      setError('Failed to load subscriptions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Your Subscriptions</h2>
      <ul>
        {subscriptions.map((subscription) => (
          <li key={subscription.id}>
            {subscription.channelName} - {subscription.channelId}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UnifiedSubscriptionManager;