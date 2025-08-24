import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      let userCred;
      if (isNewUser) {
        userCred = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCred = await signInWithEmailAndPassword(auth, email, password);
      }

      const token = await userCred.user.getIdToken();
      onLogin(token); // pass token up to DashboardContext
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>{isNewUser ? "Sign Up" : "Login"}</h2>
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
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">{isNewUser ? "Sign Up" : "Login"}</button>
      </form>
      <button onClick={() => setIsNewUser(!isNewUser)}>
        {isNewUser ? "Already have an account? Login" : "New user? Sign Up"}
      </button>
    </div>
  );
}
