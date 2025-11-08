import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../../firebase/config";
import { doc, getDoc } from "firebase/firestore";

function LoginForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      // 1️⃣ Connexion Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2️⃣ Vérification du statut Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();

        if (userData.status === "active" ) {
          // ✅ Compte validé
          if(userData.role==="superuser"){
            navigate("/admin")
          }else{
            navigate("/dashboard");

          }
          
        } else {
          // ❌ Compte en attente
          setError("Votre compte est en attente de validation par l'administrateur.");
          await signOut(auth); // Déconnexion immédiate
        }
      } else {
        setError("Profil utilisateur introuvable. Contactez l'administrateur.");
        await signOut(auth);
      }

    } catch (err) {
      console.error(err);

      if (err.code === "auth/invalid-email" || err.code === "auth/user-not-found") {
        setError("E-mail ou mot de passe incorrect.");
      } else if (err.code === "auth/wrong-password") {
        setError("Mot de passe incorrect.");
      } else {
        setError("Erreur lors de la connexion. Réessayez.");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-2xl shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Connexion
      </h1>

      {/* Message d'erreur */}
      {error && (
        <div className="mb-4 p-3 text-red-700 bg-red-100 border border-red-300 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Mot de passe */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Bouton */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-lg transition"
        >
          Se connecter
        </button>

        {/* Liens supplémentaires */}
        <p className="text-center text-gray-600 text-sm mt-4">
          Mot de passe oublié ?{" "}
          <button 
          onClick={() => navigate("/forgot-password")}
          className="text-blue-600 hover:underline">Réinitialiser</button>
          
        </p>
        <p className="text-center text-gray-600 text-sm mt-2">
          Pas de compte ?{" "}
          <button
            onClick={() => navigate("/RegisterForm")}
            className="text-blue-600 hover:underline"
          >
            Inscris-toi
          </button>
        </p>
      </form>
    </div>
  );
}

export default LoginForm;
