# Adding Custom Attributes to Cognito User Pool

This guide explains how to add custom attributes to your AWS Cognito User Pool to support features like profile images.

## Adding the profileImage Custom Attribute

1. **Sign in to the AWS Console**:

   - Go to the [AWS Console](https://console.aws.amazon.com/)
   - Sign in with your credentials

2. **Navigate to Amazon Cognito**:

   - In the AWS Console, search for "Cognito" or find it under the Services menu
   - Click on "Manage User Pools"

3. **Select Your User Pool**:

   - Click on the name of your user pool used for the Clinnet-EMR application

4. **Add Custom Attributes**:

   - In the left navigation panel, under "General Settings", click on "Attributes"
   - Scroll down to the "Custom Attributes" section
   - Click "Add custom attribute"

5. **Configure the profileImage Attribute**:

   - **Name**: profileImage (AWS will automatically prefix it with "custom:")
   - **Type**: String
   - **Min Length**: 0
   - **Max Length**: 2048 (to accommodate long URLs)
   - **Mutable**: Yes (check this box to allow users to update it)
   - Click "Save changes"

6. **Update IAM Permissions (if needed)**:
   - If you have specific IAM roles controlling Cognito access, make sure they allow:
     - `cognito-idp:AdminUpdateUserAttributes`
     - `cognito-idp:UpdateUserAttributes`

## Accessing the Custom Attribute

Once set up, you can access the custom attribute in your code:

```javascript
// Update the attribute
await updateUserAttributes(username, {
  "custom:profileImage": imageUrl,
});

// Read the attribute
const attributes = await getCognitoUserAttributes();
const profileImageUrl = attributes["custom:profileImage"];
```

## Troubleshooting

- **InvalidParameterException: Attribute does not exist in the schema** - This error occurs if you're trying to set a custom attribute that hasn't been defined in your User Pool
- **NotAuthorizedException** - Check that your IAM roles have the correct permissions
- **Changes not appearing immediately** - There might be a slight delay before custom attribute changes propagate through Cognito

## Important Notes

- Custom attributes don't appear in tokens by default. If you need the profile image URL in tokens, you need to mark the attribute as "Read" in the App Client settings.
- Custom attributes count toward your 50 attribute limit per User Pool
- The maximum length for a custom attribute value is 2048 characters
