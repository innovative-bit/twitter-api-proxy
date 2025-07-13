import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

const BEARER_TOKEN = 'AAAAAAAAAAAAAAAAAAAAAGAs3AEAAAAAy6xWVutqqxvxhKCr36qxlEFKGtE%3Dcui9wUWCZnNVOrkT8DL6fjPWtiEuC5oF7Ug3eZ7JdxsEP7SJLg';
const userId = '1944362340561887232'; // Hard-coded user ID for MooMooPortfolio
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

let cachedTweets = null;
let lastFetchTime = 0;

app.get('/api/latest-tweets', async (req, res) => {
    const count = req.query.count || 5;
    const now = Date.now();

    // Serve from cache if within 10 minutes
    if (cachedTweets && (now - lastFetchTime < CACHE_DURATION)) {
        return res.json(cachedTweets);
    }

    // Fetch new tweets from X
    try {
        const tweetsRes = await fetch(`https://api.twitter.com/2/users/${userId}/tweets?max_results=${count}&tweet.fields=created_at,text`, {
            headers: { Authorization: `Bearer ${BEARER_TOKEN}` }
        });
        const tweetsData = await tweetsRes.json();
        cachedTweets = tweetsData;
        lastFetchTime = now;
        res.json(tweetsData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tweets', details: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));