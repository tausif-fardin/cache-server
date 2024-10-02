const express = require("express");
const axios = require("axios");
const NodeCache = require("node-cache");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

class CachingProxyServer {
    constructor(port, origin) {
        this.port = port;
        this.origin = origin;
        this.cache = new NodeCache({ stdTTL: 3600 });
        this.app = express();
        this.app.use(morgan("combined"));
        this.app.use(this.limiter());
    }

    async handleRequest(req, res, next) {
        const url = `${this.origin.replace(
            /\/+$/,
            ""
        )}/${req.originalUrl.replace(/^\/+/, "")}`;

        console.log(`Forwarding request to: ${url}`); // Log the forwarded URL
        const cachedResponse = this.cache.get(url);

        if (cachedResponse) {
            res.setHeader("X-Cache", "HIT");
            return res.status(200).send(cachedResponse.data);
        }

        try {
            const response = await axios.get(url);
            const responseData = response.data; // Simplified data
            this.cache.set(url, responseData);
            res.setHeader("X-Cache", "MISS");
            res.status(response.status).send(responseData);
        } catch (error) {
            next(error);
        }
    }

    // Rate limiting middleware configuration
    limiter() {
        return rateLimit({
            windowMs: 1 * 60 * 1000, // 1 minute
            max: 10, // Limit each IP to 10 requests per window
        });
    }

    // Error handling middleware
    errorHandler(err, req, res, next) {
        console.error(err.stack);
        res.status(500).send("Oops! Something bad happened!");
    }

    start() {
        this.app.get("*", this.handleRequest.bind(this));
        // Register the error handling middleware
        this.app.use(this.errorHandler.bind(this));
        this.app.listen(this.port, () => {
            console.log(`Caching Proxy Server running on port ${this.port}`);
        });
    }

    clearCache() {
        this.cache.flushAll();
    }
}

module.exports = CachingProxyServer;
