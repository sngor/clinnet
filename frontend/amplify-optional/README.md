# Amplify Optional Integration

**Default Deployment: S3 + CloudFront**

This folder contains all files and configuration needed to use AWS Amplify for the Clinnet-EMR frontend. By default, the frontend uses S3 + CloudFront for deployment and API access. Amplify is fully optional and not active unless you explicitly enable it.

## How to Enable Amplify (Optional)

1. Move the contents of this folder back to the main project as needed (see `USAGE.md` for details).
2. Set the environment variable `VITE_USE_AMPLIFY=true` when building and running the frontend.
3. Follow the steps in `USAGE.md` to configure and deploy with Amplify.

- No Amplify code or configuration is active unless you move these files and set the environment variable.
- The default deployment and API access method is S3 + CloudFront.

## Notes

- All Amplify-related files and configuration are isolated here for clarity and maintainability.
- If you do not wish to use Amplify, you can ignore this folder entirely.
