import { useState } from "react";
import { Navigate } from "react-router-dom";

interface LoginProps {
  setUser: React.Dispatch<React.SetStateAction<any>>;
  setRole: React.Dispatch<React.SetStateAction<string>>;
  setName: React.Dispatch<React.SetStateAction<string>>;
}

const Login = ({ setUser, setRole, setName }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(
        "https://taskme-backend-wt4m.onrender.com/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const content = await response.json();

      console.log("Status :", response.status);
      console.log("Réponse :", content);

      if (!response.ok) {
        setError(content.message || "Email ou mot de passe incorrect");
        return;
      }

      if (!content.user) {
        setError("Utilisateur introuvable.");
        return;
      }

      setUser(content.user._id);
      setRole(content.user.role);
      setName(content.user.firstName);

      console.log("Utilisateur connecté :", content.user);

      setRedirect(true);
    } catch (err) {
      console.error(err);
      setError("Impossible de se connecter au serveur.");
    }
  };

  console.log("redirect =", redirect);

  if (redirect) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div
        className="card shadow-lg p-4"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <div className="text-center mb-4">
          <h2>Connexion</h2>
          <p className="text-muted">Bienvenue</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <input
            className="form-control mb-3"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="form-control mb-3"
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="btn btn-primary w-100" type="submit">
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;