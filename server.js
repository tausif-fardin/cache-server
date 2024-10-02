// server.js
const express = require("express");
const axios = require("axios");
const NodeCache = require("node-cache");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

class CachingProxyServer {
    constructor(port, origin) {
        this.port = port;
        this.origin = origin;
        this.cache = new NodeCache({ stdTTL: process.env.CACHE_TTL || 3600 }); // Use environment variable for TTL
        this.app = express();
        this.app.use(morgan("combined"));
        this.app.use(this.limiter());
        this.app.get("/health", this.healthCheck.bind(this)); // Health check endpoint
    }

    // Health check endpoint
    healthCheck(req, res) {
        res.status(200).send("Server is healthy");
    }

    async handleRequest(req, res, next) {
        const url = `${this.origin.replace(
            /\/+$/,
            ""
        )}/${req.originalUrl.replace(/^\/+/, "")}`;
        console.log(`Forwarding request to: ${url}`); // Log the forwarded URL

        try {
            const cachedResponse = this.cache.get(url);
            if (cachedResponse) {
                res.setHeader("X-Cache", "HIT");
                return res.status(200).send(cachedResponse);
            }

            const response = await axios.get(url);
            const responseData = response.data;
            this.cache.set(url, responseData);
            res.setHeader("X-Cache", "MISS");
            res.status(response.status).send(responseData);
        } catch (error) {
            this.handleError(error, res);
            next(error);
        }
    }

    limiter() {
        return rateLimit({
            windowMs: 1 * 60 * 1000, // 1 minute
            max: 10, // Limit each IP to 10 requests per window
        });
    }

    handleError(error, res) {
        console.error("Error occurred:", error.message);
        if (error.response) {
            // Server responded with a status other than 200
            res.status(error.response.status).send(error.response.data);
        } else if (error.request) {
            // Request was made but no response received
            res.status(504).send("No response from the origin server.");
        } else {
            // Something happened in setting up the request
            res.status(500).send("Oops! Something bad happened!");
        }
    }

    start() {
        this.app.get("*", this.handleRequest.bind(this));
        this.app.listen(this.port, () => {
            console.log(`Caching Proxy Server running on port ${this.port}`);
        });
    }

    clearCache() {
        this.cache.flushAll();
        console.log("Cache cleared successfully.");
    }
}

module.exports = CachingProxyServer;
