import { gapi } from 'gapi-script';

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export const initGoogleAuth = () => {
  // Skip initialisation when no Client ID is configured
  if (!CLIENT_ID) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    try {
      gapi.load('auth2', () => {
        try {
          gapi.auth2
            .init({ client_id: CLIENT_ID, scope: 'email profile' })
            .then(resolve)
            .catch(reject);
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      // gapi itself failed to load (e.g. network offline) — don't crash the page
      console.warn('Google API failed to load:', error);
      resolve();
    }
  });
};

export const signInWithGoogle = async () => {
  try {
    const auth2 = gapi.auth2.getAuthInstance();
    if (!auth2) throw new Error('Google Auth not initialised');

    const googleUser = await auth2.signIn();
    const profile = googleUser.getBasicProfile();
    const authResponse = googleUser.getAuthResponse();

    return {
      email: profile.getEmail(),
      name: profile.getName(),
      googleId: profile.getId(),
      imageUrl: profile.getImageUrl(),
      token: authResponse.id_token,
    };
  } catch (error) {
    throw new Error('Google sign in failed: ' + error.message);
  }
};

export const signOutFromGoogle = async () => {
  try {
    const auth2 = gapi.auth2.getAuthInstance();
    if (auth2) await auth2.signOut();
  } catch (error) {
    console.error('Google sign out error:', error);
  }
};
