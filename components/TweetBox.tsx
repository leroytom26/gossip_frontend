'use client'

import { useState, useEffect, useCallback } from 'react';

interface Tweet {
  id: string
  text: string
  created_at: string
  likes: number
  retweets: number
  url: string
}

interface TweetBoxProps {
  userId: string
  onTweetPosted?: () => void
}

export default function TweetBox({ userId, onTweetPosted }: TweetBoxProps) {
  const [tweet, setTweet] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [recentTweets, setRecentTweets] = useState<Tweet[]>([])

  const fetchRecentTweets = useCallback(async () => {
    try {
        const response = await fetch(`https://gossip-backend-fn8d.onrender.com/api/tweets/${userId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.error) {
            console.error('Error from API:', data.error);
            return;
        }
        
        setRecentTweets(data.tweets);
    } catch (error) {
        console.error('Error fetching tweets:', error);
    }
}, [userId]);

  useEffect(() => {
    fetchRecentTweets();
  }, [fetchRecentTweets]);

const handleTweet = async () => {
  if (!tweet.trim()) return;

  setIsLoading(true);
  try {
      const response = await fetch(`https://gossip-backend-fn8d.onrender.com/api/tweet/${userId}`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ content: tweet }),
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to post tweet');
      }

      setTweet('');
      fetchRecentTweets();
      onTweetPosted?.();
  } catch (error) {
      console.error('Error posting tweet:', error);
      // Type assertion to handle the error correctly
      const errorMessage = (error as Error).message || 'Failed to post tweet. Please try again.';
      alert(errorMessage);
  } finally {
      setIsLoading(false);
  }
};

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-4">
        <textarea
          value={tweet}
          onChange={(e) => setTweet(e.target.value)}
          className="w-full p-2 border rounded-lg dark:bg-gray-800"
          placeholder="What's happening?"
          maxLength={280}
        />
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {tweet.length}/280 characters
          </span>
          <button
            onClick={handleTweet}
            disabled={isLoading || !tweet.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-full disabled:opacity-50"
          >
            {isLoading ? 'Posting...' : 'Tweet'}
          </button>
        </div>
      </div>

      {recentTweets.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Tweets</h3>
          <div className="space-y-4">
            {recentTweets.map((tweet) => (
              <div key={tweet.id} className="p-4 border rounded-lg">
                <p>{tweet.text}</p>
                <div className="mt-2 flex gap-4 text-sm text-gray-500">
                  <span>{new Date(tweet.created_at).toLocaleDateString()}</span>
                  <span>❤️ {tweet.likes}</span>
                  <span>🔁 {tweet.retweets}</span>
                  <a
                    href={tweet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    View Tweet
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 