// backend/src/utils/js-helpers.js
const STAGE = process.env.STAGE || 'dev';
// Mimic ALLOWED_ORIGINS from Python CORS utility. This might need adjustment based on actual frontend deployment.
const ALLOWED_ORIGINS = [
    'https://d23hk32py5djal.cloudfront.net', // Production CloudFront (example)
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
];

function getCorsOrigin(requestOrigin) {
    if (STAGE === 'dev') {
        if (requestOrigin && (requestOrigin.startsWith('http://localhost:') || requestOrigin.startsWith('http://127.0.0.1:'))) {
            return requestOrigin;
        }
        // For dev, if origin is in ALLOWED_ORIGINS (e.g. a deployed dev/staging frontend), allow it.
        if (ALLOWED_ORIGINS.includes(requestOrigin)) {
            return requestOrigin;
        }
        // Fallback for dev if no specific match, could be more restrictive or permissive based on policy
        return ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS[0] : '*'; // Default to first allowed or wildcard
    }

    // Production: only allow specific origins
    if (ALLOWED_ORIGINS.includes(requestOrigin)) {
        return requestOrigin;
    }
    // Default to the main production origin if the requestOrigin is not in the list
    return ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS[0] : null; // Or handle error if no match
}

function getCorsHeaders(requestOrigin) {
    const corsOrigin = getCorsOrigin(requestOrigin);
    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With,Origin,Accept',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Max-Age': '7200' // Cache preflight for 2 hours
    };
    if (corsOrigin) {
        headers['Access-Control-Allow-Origin'] = corsOrigin;
    }
    // Only allow credentials for specific origins, not wildcard and if an origin is determined
    if (corsOrigin && corsOrigin !== '*') {
        headers['Access-Control-Allow-Credentials'] = 'true'; // Changed to string 'true' as per typical header values
    }
    return headers;
}

function buildResponse(statusCode, body, requestOrigin, additionalHeaders = {}) {
    const corsHeaders = getCorsHeaders(requestOrigin);
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
            ...additionalHeaders,
        },
        body: JSON.stringify(body),
    };
}

function buildErrorResponse(statusCode, errorType, message, requestOrigin) {
    const errorBody = {
        error: errorType,
        message: message,
    };
    return buildResponse(statusCode, errorBody, requestOrigin);
}

// Function to handle CORS preflight (OPTIONS) requests
function buildCorsPreflightResponse(requestOrigin) {
    const corsHeaders = getCorsHeaders(requestOrigin);
    return {
        statusCode: 200, // No Content for OPTIONS is also common (204)
        headers: corsHeaders,
        body: JSON.stringify({}) // Empty body for OPTIONS
    };
}

module.exports = {
    getCorsHeaders,
    buildResponse,
    buildErrorResponse,
    buildCorsPreflightResponse
};
