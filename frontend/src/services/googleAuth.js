import { gapi } from 'gapi-script';

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export const initGoogleAuth = () => {
  return new Promise((resolve, reject) => {
    gapi.load('auth2', () => {
      try {
        gapi.auth2.init({
          client_id: CLIENT_ID,
          scope: 'email profile',
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
};

export const signInWithGoogle = async () => {
  try {
    const auth2 = gapi.auth2.getAuthInstance();
    const googleUser = await auth2.signIn();
    
    const profile = googleUser.getBasicProfile();
    const authResponse = googleUser.getAuthResponse();
    
    const userData = {
      email: profile.getEmail(),
      name: profile.getName(),
      googleId: profile.getId(),
      imageUrl: profile.getImageUrl(),
      token: authResponse.id_token,
    };
    
    return userData;
  } catch (error) {
    throw new Error('Google sign in failed: ' + error.message);
  }
};

export const signOutFromGoogle = async () => {
  try {
    const auth2 = gapi.auth2.getAuthInstance();
    await auth2.signOut();
  } catch (error) {
    console.error('Google sign out error:', error);
  }
};
