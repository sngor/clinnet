/**
 * Base handler for JavaScript Lambda functions to reduce code duplication
 */

const { buildResponse, buildErrorResponse, buildCorsPreflightResponse } = require('./js-helpers');

class BaseJSHandler {
    constructor(options = {}) {
        this.tableName = options.tableName;
        this.requiredFields = options.requiredFields || [];
        this.allowedMethods = options.allowedMethods || ['GET', 'POST', 'PUT', 'DELETE'];
    }

    async handler(event, context) {
        const awsRequestId = context.awsRequestId;
        console.log(`Received event (requestId: ${awsRequestId}):`, JSON.stringify(event, null, 2));

        const eventHeaders = event.headers || {};
        const requestOrigin = eventHeaders.Origin || eventHeaders.origin;

        // Handle CORS preflight
        if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
            console.log(`Handling OPTIONS request (requestId: ${awsRequestId})`);
            return buildCorsPreflightResponse(requestOrigin);
        }

        // Validate configuration
        if (this.tableName && !process.env[this.tableName]) {
            console.error(`${this.tableName} environment variable not set (requestId: ${awsRequestId}).`);
            return buildErrorResponse(500, 'ConfigurationError', 'Internal server error: DB Configuration missing.', requestOrigin);
        }

        try {
            // Parse request body
            let body = {};
            const contentTypeHeader = event.headers && (event.headers['content-type'] || event.headers['Content-Type']);
            const isMultipart = contentTypeHeader && contentTypeHeader.startsWith('multipart/form-data');

            if (!isMultipart && event.body) {
                try {
                    body = JSON.parse(event.body);
                } catch (parseError) {
                    console.error("Invalid JSON in request body:", event.body, context.awsRequestId);
                    return buildErrorResponse(400, 'JSONParseError', 'Invalid JSON format in request body.', requestOrigin);
                }
            }

            // Validate required fields
            const validationError = this.validateRequiredFields(body);
            if (validationError) {
                return buildErrorResponse(400, 'ValidationError', validationError, requestOrigin);
            }

            // Custom validation
            const customValidationError = await this.customValidation(body, event, context);
            if (customValidationError) {
                return buildErrorResponse(400, 'ValidationError', customValidationError, requestOrigin);
            }

            // Route the request
            const result = await this.processRequest(event, context, body, requestOrigin);
            return result;

        } catch (error) {
            console.error(`Unhandled error in handler (requestId: ${awsRequestId}):`, error);
            return buildErrorResponse(error.statusCode || 500, error.name || 'UnhandledError', error.message, requestOrigin);
        }
    }

    validateRequiredFields(body) {
        const missingFields = this.requiredFields.filter(field => !(field in body));
        if (missingFields.length > 0) {
            return `Missing required fields: ${missingFields.join(', ')}`;
        }
        return null;
    }

    async customValidation(body, event, context) {
        // Override in subclasses for custom validation
        return null;
    }

    async processRequest(event, context, body, requestOrigin) {
        // Must be implemented by subclasses
        throw new Error('processRequest method must be implemented by subclass');
    }

    getTableName() {
        return process.env[this.tableName];
    }
}

module.exports = { BaseJSHandler };