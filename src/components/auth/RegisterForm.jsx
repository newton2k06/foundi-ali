import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification, deleteUser } from "firebase/auth";
import { collection, query, where, getDocs, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase/config";

function RegisterForm() {
  const navigate = useNavigate();

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [serie, setSerie] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validation prénom + nom (STOP les trucs comme "àef 'f'f")
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;

  // === CALCUL FORCE DU MOT DE PASSE ===
  function getPasswordStrength(pwd) {
    let score = 0;

    if (pwd.length >= 6) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    return score; // 0 → 4
  }

  const strength = getPasswordStrength(password);

  const strengthText = ["Très faible", "Faible", "Moyen", "Bon", "Excellent"];
  const strengthColors = ["#ff4d4d", "#ff884d", "#ffcc00", "#4caf50", "#008000"];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    // erreurs nom/prenom
    if (!nameRegex.test(prenom.trim()) || !nameRegex.test(nom.trim())) {
      setError("⚠️ Le prénom et le nom doivent contenir uniquement des lettres.");
      setLoading(false);
      return;
    }

    // force mdp minimum
    if (strength < 2) {
      setError("⚠️ Mot de passe trop faible. Ajoutez des chiffres ou majuscules.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("❌ Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    let createdUser = null;

    try {
      // Vérifier prénom + nom
      const q = query(
        collection(db, "users"),
        where("prenom", "==", prenom.trim()),
        where("nom", "==", nom.trim())
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        setError("⚠️ Un élève avec ce prénom et nom existe déjà.");
        setLoading(false);
        return;
      }

      // créer user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      createdUser = userCredential.user;

      // Firestore
      await setDoc(doc(db, "users", createdUser.uid), {
        prenom,
        nom,
        email,
        serie,
        role: "eleve",
        status: "pending",
        createdAt: serverTimestamp(),
        emailVerified: false
      });

      await sendEmailVerification(createdUser);

      alert(
        "🎉 Inscription envoyée !\n\n📧 Vérifiez votre e-mail et cliquez sur le lien.\n\nVotre compte sera validé par l'administration."
      );

      // reset
      setPrenom("");
      setNom("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setSerie("");

    } catch (err) {
      console.error("Register error:", err);

      if (createdUser) {
        try {
          await deleteUser(createdUser);
        } catch (e) {}
      }

      if (err.code === "auth/email-already-in-use") {
        setError("❌ Cet e-mail est déjà utilisé.");
      } else {
        setError("❌ Une erreur est survenue. Réessayez.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-2xl shadow-xl border border-gray-200">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
        Inscription Élève
      </h1>

      {error && (
        <div className="mb-4 p-3 text-red-700 bg-red-100 border border-red-300 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* PRENOM */}
        <div>
          <label className="text-sm font-semibold text-gray-700">Prénom</label>
          <input
            type="text"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
            required
          />
        </div>

        {/* NOM */}
        <div>
          <label className="text-sm font-semibold text-gray-700">Nom</label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
            required
          />
        </div>

        {/* EMAIL */}
        <div>
          <label className="text-sm font-semibold text-gray-700">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
            required
          />
        </div>

        {/* SERIE */}
        <div>
          <label className="text-sm font-semibold text-gray-700">Série</label>
          <select
            value={serie}
            onChange={(e) => setSerie(e.target.value)}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
            required
          >
            <option value="">Choisissez votre série</option>
            <option value="A1">Série A1</option>
            <option value="C">Série C</option>
            <option value="D">Série D</option>
          </select>
        </div>

        {/* MOT DE PASSE */}
        <div>
          <label className="text-sm font-semibold text-gray-700">Mot de passe</label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

          {/* BARRE FORCE */}
          {password.length > 0 && (
            <div className="mt-2">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${(strength / 4) * 100}%`,
                  background: strengthColors[strength],
                  transition: "0.3s",
                }}
              ></div>
              <p className="text-xs mt-1" style={{ color: strengthColors[strength] }}>
                🔒 Force : {strengthText[strength]}
              </p>
            </div>
          )}
        </div>

        {/* CONFIRMATION MDP */}
        <div>
          <label className="text-sm font-semibold text-gray-700">Confirmation</label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

          {confirmPassword.length > 0 && confirmPassword !== password && (
            <p className="text-red-600 text-xs mt-1">
              ❌ Les mots de passe ne correspondent pas.
            </p>
          )}
        </div>

        {/* BOUTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-lg transition disabled:opacity-50"
        >
          {loading ? "⏳ Patientez..." : "S'inscrire"}
        </button>

        <p className="text-center text-gray-600 text-sm mt-4">
          Déjà un compte ?{" "}
          <button onClick={() => navigate("/LoginForm")} className="text-blue-600 hover:underline">
            Se connecter
          </button>
        </p>
      </form>
    </div>
  );
}

export default RegisterForm;
