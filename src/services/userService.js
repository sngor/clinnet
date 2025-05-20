// Look for the getProfileImage function or similar and update the URL:

// Change this:
const response = await fetch('https://libzdu3ibi.execute-api.us-east-2.amazonaws.com/prod/users/profile-image', {...});

// To this:
const response = await fetch('http://localhost:3001/api/users/profile-image', {...});
