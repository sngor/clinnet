// Look for the getProfileImage function or similar and update the URL:

// Change this:
const response = await fetch('https://libzdu3ibi.execute-api.us-east-2.amazonaws.com/prod/users/profile-image', {...});

// To this:
const response = await fetch('http://localhost:3001/api/users/profile-image', {...});

// Change this:
// const profileImageUrl = 'https://libzdu3ibi.execute-api.us-east-2.amazonaws.com/prod/users/profile-image';

// To this:
const profileImageUrl = '/api/users/profile-image';

// Or in your fetch call, replace:
// fetch('https://libzdu3ibi.execute-api.us-east-2.amazonaws.com/prod/users/profile-image', {...})

// With:
// fetch('/api/users/profile-image', {...})
