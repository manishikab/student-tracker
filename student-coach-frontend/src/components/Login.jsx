import React, { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useAuthContext } from "../App"; // get token setter from context

export default function Login() {
  const setToken = useAuthContext(); // this updates AuthContext automatically
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let userCred;

      if (isSignUp) {
        userCred = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCred = await signInWithEmailAndPassword(auth, email, password);
      }

      // Get Firebase ID token and store in AuthContext
      const idToken = await userCred.user.getIdToken();
      setToken(idToken);
    } catch (err) {
      setError(err.code?.includes("auth/") ? "Invalid email or password" : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "1rem" }}>
      <h2>{isSignUp ? "Sign Up" : "Login"}</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
          disabled={loading}
        />
        <button type="submit" style={{ width: "100%", padding: "0.5rem" }} disabled={loading}>
          {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Login"}
        </button>
      </form>

      {error && <p style={{ color: "red", marginTop: "0.5rem" }}>{error}</p>}

      <p style={{ marginTop: "1rem", textAlign: "center" }}>
        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          style={{ color: "blue", background: "none", border: "none", cursor: "pointer" }}
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? "Login" : "Sign Up"}
        </button>
      </p>
    </div>
  );
}
