import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useNavigate } from "react-router-dom";
import { verifyAuth } from "../../utils/authGuard";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

import UserManager from "../admin/UserManager";
import CourseManager from "../admin/CourseManager";
import PlanningManager from "../admin/PlanningManager";
import StatsManager from "../admin/StatsManager";
import Profile from "../common/Profile"; 
import ChatGlobal from "../common/ChatGlobal";
import MessageriePrivee from "../common/MessageriePrivee";
import FirestoreUsageMonitor from "../admin/FirestoreUsageMonitor";

export default function DashboardSuperUser() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("students");
  const [userLoaded, setUserLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  useEffect(() => {
    const checkAuthorization = async () => {
      const result = await verifyAuth("superuser");
      
      if (!result.authorized) {
        navigate(result.redirectTo);
        return;
      }
      
      setUserLoaded(true);
    };

    checkAuthorization();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setTimeout(() => {
        if (!auth.currentUser) {
          navigate("/", { replace: true });
        } else {
          window.location.href = "/";
        }
      }, 500);
    } catch (error) {
      console.error("Erreur déconnexion:", error);
      window.location.href = "/";
    }
  };

  if (!userLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

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
      case "profile":
        return <Profile />;
      case "chat-global":
        return <ChatGlobal />;
      case "messages-prives":
        return <MessageriePrivee />;
      case "monitoring":
        return <FirestoreUsageMonitor />;
      default:
        return <UserManager />;
    }
  };

  // Menu items avec icônes et couleurs
  const menuItems = [
    { id: "students", label: "Étudiants", icon: "👨‍🎓", color: "blue" },
    { id: "courses", label: "Cours", icon: "📚", color: "purple" },
    { id: "planning", label: "Planning", icon: "📅", color: "green" },
    { id: "stats", label: "Statistiques", icon: "📊", color: "yellow" },
    { id: "chat-global", label: "Chat Global", icon: "💬", color: "indigo" },
    { id: "messages-prives", label: "Messages Privés", icon: "📨", color: "teal" },
    { id: "monitoring", label: "Monitoring", icon: "📈", color: "orange" },
    { id: "profile", label: "Mon Profil", icon: "👤", color: "gray" },
  ];

  const getColorClasses = (color, isActive) => {
    const colors = {
      blue: isActive ? "bg-blue-600 text-white" : "text-blue-700 hover:bg-blue-50",
      purple: isActive ? "bg-purple-600 text-white" : "text-purple-700 hover:bg-purple-50",
      green: isActive ? "bg-green-600 text-white" : "text-green-700 hover:bg-green-50",
      yellow: isActive ? "bg-yellow-600 text-white" : "text-yellow-700 hover:bg-yellow-50",
      indigo: isActive ? "bg-indigo-600 text-white" : "text-indigo-700 hover:bg-indigo-50",
      teal: isActive ? "bg-teal-600 text-white" : "text-teal-700 hover:bg-teal-50",
      orange: isActive ? "bg-orange-600 text-white" : "text-orange-700 hover:bg-orange-50",
      gray: isActive ? "bg-gray-600 text-white" : "text-gray-700 hover:bg-gray-50",
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30
        w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Header Sidebar */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
                <p className="text-sm text-gray-500">Super Administrateur</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left p-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-3 ${getColorClasses(item.color, activePage === item.id)}`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Footer Sidebar */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white p-3 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>🚪</span>
              <span>Se déconnecter</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header Mobile */}
        <header className="bg-white shadow-sm border-b border-gray-200 md:hidden">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-2xl">☰</span>
            </button>
            <h1 className="text-lg font-semibold text-gray-800">
              {menuItems.find(item => item.id === activePage)?.label || "Tableau de bord"}
            </h1>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-6 lg:p-8">
          {/* En-tête de page */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">
                {menuItems.find(item => item.id === activePage)?.icon}
              </span>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {menuItems.find(item => item.id === activePage)?.label}
                </h1>
                <p className="text-gray-600 mt-1">
                  Gestion et administration de la plateforme
                </p>
              </div>
            </div>
          </div>

          {/* Contenu de la page */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}