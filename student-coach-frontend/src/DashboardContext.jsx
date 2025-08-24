import React, { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { auth } from "./firebase";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      let userCred;
      if (isSignUp) {
        // Sign up new user
        userCred = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // Login existing user
        userCred = await signInWithEmailAndPassword(auth, email, password);
      }

      const token = await userCred.user.getIdToken();
      onLogin(token); // pass token to parent (optional)
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>{isSignUp ? "Sign Up" : "Login"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br />
        <button type="submit">{isSignUp ? "Sign Up" : "Login"}</button>
      </form>

      <p style={{ color: "red" }}>{error}</p>

      <p style={{ marginTop: "1rem" }}>
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
