import fetch from "node-fetch";
import cors from "cors";

const BEARER_TOKEN = process.env.BEARER_TOKEN;
const userId = '1944362340561887232'; // Hard-coded user ID for MooMooPortfolio
const CACHE_DURATION = 20 * 60 * 1000; // 20 minutes in milliseconds

let cachedTweets = null;
let lastFetchTime = 0;

// Helper to run CORS in Vercel serverless
function runCors(req, res) {
    return new Promise((resolve, reject) => {
        cors({
            origin: "https://testmoomoo.framer.website"
        })(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

export default async function handler(req, res) {
    await runCors(req, res);

    const count = req.query.count || 1;
    const now = Date.now();

    // Serve from cache if within 20 minutes
    if (cachedTweets && (now - lastFetchTime < CACHE_DURATION)) {
        return res.status(200).json(cachedTweets);
    }

    try {
        const tweetsRes = await fetch(`https://api.twitter.com/2/users/${userId}/tweets?max_results=${count}&tweet.fields=created_at,text`, {
            headers: { Authorization: `Bearer ${BEARER_TOKEN}` }
        });
        const tweetsData = await tweetsRes.json();
        cachedTweets = tweetsData;
        lastFetchTime = now;
        res.status(200).json(tweetsData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tweets', details: error.message });
    }
} 