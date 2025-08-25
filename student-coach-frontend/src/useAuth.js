import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export function useAuth() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Always fetch a fresh ID token
        const idToken = await user.getIdToken(true);
        setToken(idToken);
      } else {
        setToken(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return token;
}
