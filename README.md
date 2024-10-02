# Caching Proxy Server

A simple caching proxy server built with Node.js, Express, and Axios. This server forwards requests to a specified origin server while caching responses for improved performance and reduced load on the origin server.

## Features

-   **Caching**: Stores responses from the origin server to serve future requests quickly.
-   **Rate Limiting**: Limits the number of requests from a single IP address to prevent abuse.
-   **Health Check**: Provides a health check endpoint to monitor server status.
-   **Configurable Cache TTL**: Supports setting the cache time-to-live via environment variables.
-   **Error Handling**: Robust error handling with detailed responses for different error scenarios.

## Installation

### Prerequisites

-   Node.js (v14 or later)
-   npm (Node package manager)

### Clone the Repository

```bash
git clone https://github.com/tausif-fardin/caching-proxy-server.git
cd caching-proxy-server
```

### Install Dependencies

```bash
npm install
```

### Configuration

Create a `.env` file in the root directory and specify the desired cache TTL (in seconds). For example:

```
CACHE_TTL=3600
```

## Usage

### Start the Server

Use the following command to start the caching proxy server, specifying the port and origin server URL:

```bash
npx yargs start --port <PORT> --origin <ORIGIN_URL>
```

For example:

```bash
npx yargs start --port 3000 --origin https://api.example.com
```

### Clear the Cache

To clear the cache, run:

```bash
npx yargs clear
```

### Health Check

You can check the server's health by visiting:

```
http://localhost:<PORT>/health
```

## API Endpoints

### Health Check

-   **GET** `/health`
    -   Returns a simple message indicating that the server is running.

### Proxy Requests

All requests to the caching proxy server will be forwarded to the specified origin server while caching the responses.

## Error Handling

The server provides appropriate HTTP status codes and messages for different types of errors, including:

-   500 Internal Server Error
-   504 Gateway Timeout (if no response from the origin server)

---

Feel free to adjust the content, especially the repository URL, author details, and any additional features or information that might be relevant to your project! Let me know if you need any more modifications.
