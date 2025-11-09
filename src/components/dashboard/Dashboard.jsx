import { useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import CourseList from "../eleve/CourseList";
import Profile from "../common/Profile";
import PlanningPage from "../eleve/PlanningPage"; 
import { verifyAuth } from "../../utils/authGuard";

const NAVIGATION_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "🏠", color: "blue" },
  { id: "cours", label: "Mes Cours", icon: "📚", color: "blue" },
  { id: "profile", label: "Mon Profil", icon: "👤", color: "green" },
  { id: "planning", label: "Planning", icon: "📅", color: "purple" },
  { id: "paiement", label: "Paiement", icon: "✅", color: "orange", external: true }
];

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const checkAuthorization = async () => {
      const result = await verifyAuth(); // ← Pour tout utilisateur connecté
      
      if (!result.authorized) {
        navigate(result.redirectTo);
        return;
      }
      
      // Si c'est un superuser qui tente d'accéder au dashboard élève
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (!currentUser) {
          navigate("/LoginForm");
          return;
        }

        setUser(currentUser);
        
        // Charger le profil utilisateur
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        } else {
          setError("Profil utilisateur non trouvé");
        }
      } catch (err) {
        console.error("Erreur chargement utilisateur:", err);
        setError("Erreur lors du chargement du profil");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
  try {
    await signOut(auth);
    
    // Attendre un peu que la déconnexion soit effective
    setTimeout(() => {
      // Double vérification
      if (!auth.currentUser) {
        navigate("/", { replace: true });
      } else {
        // Fallback si la déconnexion échoue
        window.location.href = "/";
      }
    }, 500);
    
  } catch (error) {
    console.error("Erreur déconnexion:", error);
    // Fallback en cas d'erreur
    window.location.href = "/";
  }
};

  const handleNavigation = (item) => {
    if (item.external) {
      navigate(`/${item.id}`);
    } else {
      setActivePage(item.id);
    }
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
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h1 className="text-2xl font-semibold text-gray-800 mb-2">Mes Cours</h1>
              <p className="text-gray-600 mb-6">Gérez et consultez tous vos cours</p>
              <CourseList />
            </div>
          </div>
        );
      case "planning":
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h1 className="text-2xl font-semibold text-gray-800 mb-2">Mon Planning</h1>
              <p className="text-gray-600 mb-6">Consultez votre planning</p>
              <PlanningPage />
            </div>
          </div>
        );
    
      
      case "dashboard":
      default:
        return (
          <div className="space-y-6">
            {/* Section de bienvenue */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl shadow-sm">
              <h1 className="text-2xl font-bold mb-2">Bienvenue, {userProfile.prenom} !</h1>
              <p className="opacity-90">Que souhaitez-vous faire aujourd'hui ?</p>
            </div>

            {/* Cartes de fonctionnalités */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                title="Mes Cours"
                description="Consultez vos cours et progression"
                icon="📚"
                color="blue"
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
                color="purple"
                onClick={() => setActivePage("planning")}  // ← "planning" au lieu de "PlanningPage"
              />
             
              
              <FeatureCard
                title="Mes Notes"
                description="Suivez vos résultats"
                icon="📝"
                color="yellow"
                onClick={() => setActivePage("notes")}
                comingSoon
              />
              
              <FeatureCard
                title="Présences"
                description="Votre assiduité"
                icon="✅"
                color="green"
                onClick={() => setActivePage("presences")}
                comingSoon
              />
              
              <FeatureCard
                title="Paiement"
                description="Gestion des frais"
                icon="💳"
                color="orange"
                onClick={() => navigate("/Paiement")}
              />
            </div>

            
            
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {activePage === "profile" ? "Mon Profil" : `Bonjour, ${userProfile?.prenom}`}
              </h1>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition duration-200 flex items-center"
            >
              <span className="mr-2">🚪</span>
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Desktop */}
      <nav className="bg-white shadow-sm border-b hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 py-3">
            {NAVIGATION_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition duration-200 ${
                  activePage === item.id
                    ? `bg-${item.color}-100 text-${item.color}-700 border border-${item.color}-200`
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </main>

      {/* Navigation Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
        <div className="flex justify-around p-2">
          {NAVIGATION_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={`flex flex-col items-center p-2 rounded-lg min-w-16 ${
                activePage === item.id
                  ? `text-${item.color}-600 bg-${item.color}-50`
                  : "text-gray-500"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs mt-1">{item.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

// Composant de carte de fonctionnalité
function FeatureCard({ title, description, icon, color, onClick, comingSoon }) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    yellow: "from-yellow-500 to-yellow-600",
    orange: "from-orange-500 to-orange-600"
  };

  return (
    <div 
      onClick={!comingSoon ? onClick : undefined}
      className={`bg-gradient-to-br ${colorClasses[color]} text-white p-6 rounded-xl shadow-sm cursor-pointer transform transition duration-200 hover:scale-105 ${
        comingSoon ? "opacity-60 cursor-not-allowed" : "hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-2xl mb-2">{icon}</div>
          <h3 className="font-semibold text-lg mb-1">{title}</h3>
          <p className="text-white text-opacity-90 text-sm">{description}</p>
        </div>
        {comingSoon && (
          <span className="bg-black bg-opacity-20 text-xs px-2 py-1 rounded-full">
            Bientôt
          </span>
        )}
      </div>
    </div>
  );
}

// Composant de carte de statistique
function StatCard({ label, value }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

export default Dashboard;