import { useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); 

  // Récupération de l'utilisateur connecté
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/LoginForm");
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/LoginForm");
  };

  if (!user) {
    return <p className="text-center mt-10 text-gray-600">Chargement...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Header */}
      <header className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Bonjour, {user.displayName || "Utilisateur"}
          </h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg"
        >
          Se déconnecter
        </button>
      </header>

      {/* Main content */}
      <main className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Carte : Rôle */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Votre rôle</h2>
          <p className="text-gray-600 text-sm">
            Rôle actuel : <span className="font-medium">Non défini</span>
          </p>
          <p className="text-gray-400 text-xs mt-1">
            (Admin / Élève / Délégué / Super User — configuration à venir)
          </p>
        </div>

        {/* Carte : Groupes */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Vos groupes</h2>
          <p className="text-gray-600 text-sm">
            Aucun groupe assigné pour le moment.
          </p>
        </div>

        {/* Carte : Actions rapides */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Actions rapides</h2>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>📌 Voir mes cours</li>
            <li>📝 Voir mes notes</li>
            <li>📅 Voir le planning</li>
            <li>👥 Gérer la présence (selon rôle)</li>
          </ul>
        </div>

      </main>
    </div>
  );
}

export default Dashboard;
