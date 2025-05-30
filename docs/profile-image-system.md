# Clinnet-EMR Profile Image System Guide

This guide documents the profile image upload and fetch system, including backend Lambda, S3, CORS, error handling, and frontend integration.

---

## Overview

- Upload, fetch, and remove patient profile images
- S3-backed storage, secure and CORS-compliant
- Robust error handling and user feedback

## Backend (Lambda, S3, CORS)

- IAM: All profile image Lambdas have `s3:HeadObject` permission
- CORS: Centralized CORS utilities, proper headers on all responses
- Error Handling: Standardized error format, HTTP codes, exception details

## Frontend Integration

- Enhanced error handling in `userService.js`
- Validates response content-type before parsing
- Extracts error details from Lambda responses
- Provides meaningful error messages to users

## Testing

- Use `frontend/test_profile_images.js` in browser console
- Update `TEST_CONFIG.apiBaseUrl` with your API Gateway URL
- Run `runAllTests()`

## Manual Testing Checklist

- [ ] Upload profile image works without CORS errors
- [ ] Fetch profile image returns proper data or 404
- [ ] Remove profile image works correctly
- [ ] Error responses include CORS headers
- [ ] Frontend displays proper error messages

## Troubleshooting

- See `docs/troubleshooting.md` for CORS, S3, and frontend error solutions

---

For deployment and more details, see `docs/deployment.md` and `docs/project-structure.md`.
