import { useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import CourseList from "../eleve/CourseList";
import Profile from "../common/Profile"; 

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activePage, setActivePage] = useState("dashboard"); 
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/LoginForm");
      } else {
        setUser(currentUser);
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/LoginForm");
  };

  if (!user || !userProfile) {
    return <p className="text-center mt-10 text-gray-600 text-lg">Chargement...</p>;
  }

  // Contenu conditionnel selon la page active
  const renderContent = () => {
    switch (activePage) {
      case "profile":
        return <Profile />;
      case "cours":
        return (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Mes Cours</h2>
            <CourseList />
          </div>
        );
      default:
        return (
          <>
            {/* Mes Cours */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Mes Cours</h2>
              <CourseList />
            </div>

            {/* Placeholders */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Mes Notes</h2>
              <p className="text-gray-600">Fonctionnalité à venir...</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Mon Planning</h2>
              <p className="text-gray-600">Fonctionnalité à venir...</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Mes Présences</h2>
              <p className="text-gray-600">Fonctionnalité à venir...</p>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">

      {/* Header */}
      <header className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            {activePage === "profile" ? "Mon Profil" : `Bonjour, ${userProfile.prenom} ${userProfile.nom}`}
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

      {/* Actions rapides Desktop */}
      <div className="bg-white p-6 rounded-xl shadow-sm mt-6 hidden md:block">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Navigation</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3"> {/* ← Changé de 4 à 5 colonnes */}
          <button 
            onClick={() => setActivePage("dashboard")}
            className={`p-3 rounded-lg text-center ${
              activePage === "dashboard" ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
            }`}
          >
            🏠 Dashboard
          </button>
          <button 
            onClick={() => setActivePage("cours")}
            className={`p-3 rounded-lg text-center ${
              activePage === "cours" ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
            }`}
          >
            📚 Mes Cours
          </button>
          <button 
            onClick={() => setActivePage("profile")}
            className={`p-3 rounded-lg text-center ${
              activePage === "Profile" ? "bg-green-600 text-white" : "bg-green-500 text-white"
            }`}
          >
            👤 Mon Profil
          </button>
          <button 
            onClick={() => setActivePage("planning")}
            className="bg-purple-500 text-white p-3 rounded-lg text-center"
          >
            📅 Planning
          </button>
          <button 
            onClick={() => navigate("/Paiement")}
            className="bg-orange-500 text-white p-3 rounded-lg text-center"
          >
            ✅ Paiement
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <main className="mt-6 grid grid-cols-1 gap-6">
        {renderContent()}
      </main>

      {/* Navigation mobile fixe */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-2 grid grid-cols-5 gap-1"> {/* ← Changé de 4 à 5 colonnes */}
        <button 
          onClick={() => setActivePage("dashboard")}
          className={`p-2 text-center text-lg ${
            activePage === "dashboard" ? "text-blue-600" : "text-gray-600"
          }`}
        >🏠</button>
        <button 
          onClick={() => setActivePage("cours")}
          className={`p-2 text-center text-lg ${
            activePage === "cours" ? "text-blue-600" : "text-gray-600"
          }`}
        >📚</button>
        <button 
          onClick={() => setActivePage("profile")}
          className={`p-2 text-center text-lg ${
            activePage === "profile" ? "text-green-600" : "text-gray-600"
          }`}
        >👤</button>
        <button 
          onClick={() => setActivePage("planning")}
          className={`p-2 text-center text-lg ${
            activePage === "planning" ? "text-purple-600" : "text-gray-600"
          }`}
        >📅</button>
        <button 
          onClick={() => navigate("/Paiement")}
          className="p-2 text-center text-orange-600 text-lg"
        >✅</button>
      </div>

    </div>
  );
}

export default Dashboard;