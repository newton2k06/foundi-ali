import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/config";

function RegisterForm() {
  const navigate = useNavigate();

  // États
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [serie, setSerie] = useState(""); // ✅ nouveau
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);

      // ✅ Plus tard : enregistrement des infos dans Firestore

      navigate("/dashboard");

    } catch (err) {
      console.error(err);

      if (err.code === "auth/email-already-in-use") {
        setError("Cet e-mail est déjà utilisé.");
      } else if (err.code === "auth/invalid-email") {
        setError("Adresse e-mail invalide.");
      } else if (err.code === "auth/weak-password") {
        setError("Le mot de passe doit contenir au moins 6 caractères.");
      } else {
        setError("Une erreur est survenue. Réessayez.");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-2xl shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Inscription Élève
      </h1>

      {error && (
        <div className="mb-4 p-3 text-red-700 bg-red-100 border border-red-300 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Prénom */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Prénom</label>
          <input
            type="text"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Nom */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Nom</label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Série */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Série</label>
          <select
            value={serie}
            onChange={(e) => setSerie(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Choisissez votre série</option>
            <option value="A1">Série A1</option>
            <option value="C">Série C</option>
            <option value="D">Série D</option>
          </select>
        </div>

        {/* Mot de passe */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Confirmation */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Confirmation mot de passe</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Bouton */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold text-lg transition"
        >
          S'inscrire
        </button>

        {/* Lien */}
        <p className="text-center text-gray-600 text-sm mt-4">
          Déjà un compte ?{" "}
          <button
            onClick={() => navigate("/LoginForm")}
            className="text-blue-600 hover:underline"
          >
            Se connecter
          </button>
        </p>
      </form>
    </div>
  );
}

export default RegisterForm;
