import { initializeApp } from "firebase-admin/app";
import { JWT } from "google-auth-library";
import serviceAccount from "../serviceAccountKey.json" with { type: "json" };

// Use JWT constructor directly instead of deprecated auth.fromJSON
const jwtClient = new JWT({
  email: serviceAccount.client_email,
  key: serviceAccount.private_key,
  scopes: [
    "https://www.googleapis.com/auth/cloud-platform",
    "https://www.googleapis.com/auth/firebase.database",
    "https://www.googleapis.com/auth/firebase.messaging",
    "https://www.googleapis.com/auth/identitytoolkit",
    "https://www.googleapis.com/auth/userinfo.email",
  ],
});

export const app = initializeApp({
  credential: {
    getAccessToken: async () => {
      const res = await jwtClient.getAccessToken();
      const expiry = jwtClient.credentials?.expiry_date;
      return {
        access_token: res.token || jwtClient.credentials?.access_token,
        expires_in: expiry ? Math.floor((expiry - Date.now()) / 1000) : 3600,
      };
    },
  },
  projectId: serviceAccount.project_id,
});
