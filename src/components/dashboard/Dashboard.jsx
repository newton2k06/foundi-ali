import { useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import CourseList from "../eleve/CourseList";
import Profile from "../common/Profile";
import PlanningPage from "../eleve/PlanningPage"; 
import { verifyAuth } from "../../utils/authGuard";
import ChatGlobal from "../common/ChatGlobal";
import MessageriePrivee from "../common/MessageriePrivee";

const NAVIGATION_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "🏠", color: "blue" },
  { id: "cours", label: "Mes Cours", icon: "📚", color: "purple" },
  { id: "profile", label: "Mon Profil", icon: "👤", color: "green" },
  { id: "planning", label: "Planning", icon: "📅", color: "orange" },
  { id: "chat-global", label: "Chat Global", icon: "💬", color: "indigo" },
  { id: "messages", label: "Messages", icon: "📨", color: "teal" }
];

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuthorization = async () => {
      const result = await verifyAuth();
      
      if (!result.authorized) {
        navigate(result.redirectTo);
        return;
      }
      
      if (result.userData.role === "superuser") {
        navigate("/admin");
        return;
      }
      
      setUser(auth.currentUser);
      setUserProfile(result.userData);
      setLoading(false);
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

  const handleNavigation = (item) => {
    setActivePage(item.id);
    setSidebarOpen(false);
  };

  const getColorClasses = (color, isActive) => {
    const colors = {
      blue: isActive ? "bg-blue-600 text-white" : "text-blue-700 hover:bg-blue-50",
      purple: isActive ? "bg-purple-600 text-white" : "text-purple-700 hover:bg-purple-50",
      green: isActive ? "bg-green-600 text-white" : "text-green-700 hover:bg-green-50",
      orange: isActive ? "bg-orange-600 text-white" : "text-orange-700 hover:bg-orange-50",
      indigo: isActive ? "bg-indigo-600 text-white" : "text-indigo-700 hover:bg-indigo-50",
      teal: isActive ? "bg-teal-600 text-white" : "text-teal-700 hover:bg-teal-50",
    };
    return colors[color] || colors.blue;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement de votre espace...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Réessayer
          </button>
        </div>
      );
    }

    switch (activePage) {
      case "profile":
        return <Profile />;
      
      case "cours":
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-2xl">📚</span>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Mes Cours</h1>
                  <p className="text-gray-600">Gérez et consultez tous vos cours</p>
                </div>
              </div>
              <CourseList />
            </div>
          </div>
        );

      case "planning":
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-2xl">📅</span>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Mon Planning</h1>
                  <p className="text-gray-600">Consultez votre emploi du temps</p>
                </div>
              </div>
              <PlanningPage />
            </div>
          </div>
        );

      case "chat-global":
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-2xl">💬</span>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Chat Global</h1>
                  <p className="text-gray-600">Discutez avec toute la classe</p>
                </div>
              </div>
              <ChatGlobal />
            </div>
          </div>
        );

      case "messages":
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-2xl">📨</span>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Messages Privés</h1>
                  <p className="text-gray-600">Communications avec votre professeur</p>
                </div>
              </div>
              <MessageriePrivee />
            </div>
          </div>
        );
      
      case "dashboard":
      default:
        return (
          <div className="space-y-6">
            {/* Section de bienvenue */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-2xl shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👋</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">Bonjour, {userProfile?.prenom} !</h1>
                  <p className="text-blue-100 text-lg">Bienvenue dans votre espace personnel</p>
                </div>
              </div>
            </div>

            {/* Cartes de fonctionnalités */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                title="Mes Cours"
                description="Consultez vos cours et progression"
                icon="📚"
                color="purple"
                onClick={() => setActivePage("cours")}
              />
              
              <FeatureCard
                title="Mon Profil"
                description="Gérez vos informations personnelles"
                icon="👤"
                color="green"
                onClick={() => setActivePage("profile")}
              />

              <FeatureCard
                title="Planning"
                description="Votre emploi du temps"
                icon="📅"
                color="orange"
                onClick={() => setActivePage("planning")}
              />

              <FeatureCard
                title="Chat Global"
                description="Discutez avec la classe"
                icon="💬"
                color="indigo"
                onClick={() => setActivePage("chat-global")}
              />

              <FeatureCard
                title="Messages"
                description="Contactez votre professeur"
                icon="📨"
                color="teal"
                onClick={() => setActivePage("messages")}
              />

              <FeatureCard
                title="Paiement"
                description="Gestion des frais de scolarité"
                icon="💳"
                color="blue"
                onClick={() => navigate("/paiement")}
              />
            </div>
          </div>
        );
    }
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
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {userProfile?.prenom?.charAt(0) || 'E'}
                </span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Espace Élève</h1>
                <p className="text-sm text-gray-500">{userProfile?.prenom} {userProfile?.nom}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {NAVIGATION_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`w-full text-left p-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-3 ${getColorClasses(item.color, activePage === item.id)}`}
              >
                <span className="text-xl">{item.icon}</span>
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
              {NAVIGATION_ITEMS.find(item => item.id === activePage)?.label || "Tableau de bord"}
            </h1>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {userProfile?.prenom?.charAt(0) || 'E'}
              </span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-6 lg:p-8">
          {/* En-tête de page (Desktop) */}
          <div className="mb-6 md:mb-8 hidden md:block">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">
                {NAVIGATION_ITEMS.find(item => item.id === activePage)?.icon}
              </span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {NAVIGATION_ITEMS.find(item => item.id === activePage)?.label}
                </h1>
                <p className="text-gray-600 mt-1">
                  {activePage === "dashboard" 
                    ? "Vue d'ensemble de votre espace élève" 
                    : "Gestion de votre espace personnel"
                  }
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

// Composant de carte de fonctionnalité
function FeatureCard({ title, description, icon, color, onClick, comingSoon }) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
    indigo: "from-indigo-500 to-indigo-600",
    teal: "from-teal-500 to-teal-600",
    yellow: "from-yellow-500 to-yellow-600"
  };

  return (
    <div 
      onClick={!comingSoon ? onClick : undefined}
      className={`bg-gradient-to-br ${colorClasses[color]} text-white p-6 rounded-xl shadow-sm cursor-pointer transform transition duration-200 hover:scale-105 ${
        comingSoon ? "opacity-60 cursor-not-allowed" : "hover:shadow-lg"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-3xl mb-3">{icon}</div>
          <h3 className="font-bold text-lg mb-2">{title}</h3>
          <p className="text-white text-opacity-90 text-sm leading-relaxed">{description}</p>
        </div>
        {comingSoon && (
          <span className="bg-black bg-opacity-20 text-xs px-2 py-1 rounded-full whitespace-nowrap">
            Bientôt
          </span>
        )}
      </div>
    </div>
  );
}

export default Dashboard;