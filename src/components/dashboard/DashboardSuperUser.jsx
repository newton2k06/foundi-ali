import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useNavigate } from "react-router-dom";

import UserManager from "../admin/UserManager";
import CourseManager from "../admin/CourseManager";
import PlanningManager from "../admin/PlanningManager";
import StatsManager from "../admin/StatsManager";
import Profile from "../common/Profile"; 

export default function DashboardSuperUser() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("students");
  const [userLoaded, setUserLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/LoginForm");
      } else {
        setUserLoaded(true);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/LoginForm");
  };

  if (!userLoaded) return <p className="text-center mt-10">Chargement utilisateur...</p>;

  // Contenu conditionnel
  const renderContent = () => {
    switch (activePage) {
      case "students":
        return <UserManager />;
      case "courses":
        return <CourseManager />;
      case "planning":
        return <PlanningManager />;
      case "stats":
        return <StatsManager />;
      case "profile": // ← Nouveau cas
        return <Profile />;
      default:
        return <UserManager />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-lg p-4 hidden md:block">
        <h1 className="text-2xl font-bold mb-8 text-blue-700">Admin Panel</h1>

        <nav className="space-y-2">
          <button
            onClick={() => setActivePage("students")}
            className={`w-full text-left p-3 rounded-lg font-semibold ${
              activePage === "students" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            👨‍🎓 Gestion des étudiants
          </button>

          <button
            onClick={() => setActivePage("courses")}
            className={`w-full text-left p-3 rounded-lg font-semibold ${
              activePage === "courses" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            📚 Gestion des cours
          </button>

          <button
            onClick={() => setActivePage("planning")}
            className={`w-full text-left p-3 rounded-lg font-semibold ${
              activePage === "planning" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            📅 Planning
          </button>

          <button
            onClick={() => setActivePage("stats")}
            className={`w-full text-left p-3 rounded-lg font-semibold ${
              activePage === "stats" ? "bg-yellow-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            📊 Statistiques
          </button>

          {/* NOUVEAU BOUTON PROFIL */}
          <button
            onClick={() => setActivePage("profile")}
            className={`w-full text-left p-3 rounded-lg font-semibold ${
              activePage === "profile" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            👤 Mon Profil
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-10 w-full bg-red-500 text-white p-3 rounded-lg font-bold hover:bg-red-600"
        >
          🚪 Se déconnecter
        </button>
      </aside>

      {/* MOBILE NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex justify-around text-xl">
        <button onClick={() => setActivePage("students")}>👨‍🎓</button>
        <button onClick={() => setActivePage("courses")}>📚</button>
        <button onClick={() => setActivePage("planning")}>📅</button>
        <button onClick={() => setActivePage("stats")}>📊</button>
        <button onClick={() => setActivePage("profile")}>👤</button> {/* ← Nouveau bouton */}
      </div>

      {/* CONTENT */}
      <main className="flex-1 p-4 md:p-8">
        {renderContent()}
      </main>
    </div>
  );
}