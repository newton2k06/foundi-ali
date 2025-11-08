import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";

function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Rediriger automatiquement si l'utilisateur est déjà connecté
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header élégant */}
      <header className="bg-white/90 backdrop-blur-lg shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-10 h-10 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">FA</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Foundi Ali</h1>
                <p className="text-sm text-gray-600">Enseignement d'excellence</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <span className="text-gray-700 font-medium">📚 Mathématiques</span>
              <span className="text-gray-700 font-medium">⚛️ Physique</span>
              <span className="text-gray-700 font-medium">🧪 Chimie</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Contenu principal */}
          <div className="lg:w-1/2">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 border border-white/60">
              
              {/* Badge d'expérience */}
              <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                🏆 20+ ans d'expérience
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6 leading-tight">
                Votre réussite, 
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}notre passion
                </span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Rejoignez la plateforme éducative de <strong>Mr Ali M'kouboi</strong> et 
                bénéficiez d'un suivi personnalisé pour exceller en mathématiques, 
                physique et chimie.
              </p>

              {/* Points forts */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <span className="text-green-600">📅</span>
                  </div>
                  <span className="text-gray-700">Planning interactif et mis à jour</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <span className="text-blue-600">📚</span>
                  </div>
                  <span className="text-gray-700">Cours et ressources accessibles 24h/24</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <span className="text-purple-600">💳</span>
                  </div>
                  <span className="text-gray-700">Gestion simplifiée des paiements</span>
                </div>
              </div>

              {/* Statistiques */}
              <div className="flex space-x-8 text-center border-t border-gray-100 pt-6">
                <div>
                  <div className="text-2xl font-bold text-blue-600">500+</div>
                  <div className="text-sm text-gray-500">Élèves accompagnés</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">95%</div>
                  <div className="text-sm text-gray-500">Taux de réussite</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">20+</div>
                  <div className="text-sm text-gray-500">Ans d'expérience</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section connexion */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100 transform hover:scale-[1.02] transition-all duration-300">
              
              {/* Avatar et présentation */}
              <div className="text-center mb-8">
                <div className="bg-gradient-to-br from-blue-400 to-purple-500 w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <span className="text-white text-3xl">👨‍🏫</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Mr Ali M'kouboi</h3>
                <p className="text-gray-600 mt-2">Professeur de Mathématiques, Physique & Chimie</p>
                <div className="flex justify-center space-x-4 mt-4">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Expert BAC</span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">Pédagogue</span>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="space-y-4">
                <button
                  onClick={() => navigate("/LoginForm")}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                  text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all duration-200 
                  transform hover:scale-105 flex items-center justify-center space-x-3"
                >
                  <span>🔐</span>
                  <span>Se connecter à mon espace</span>
                </button>

                <button
                  onClick={() => navigate("/registerForm")}
                  className="w-full bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-200 
                  py-4 px-6 rounded-xl font-bold text-lg shadow-md transition-all duration-200 
                  transform hover:scale-105 flex items-center justify-center space-x-3"
                >
                  <span>👤</span>
                  <span>Créer mon compte élève</span>
                </button>
              </div>

              {/* Témoignage */}
              <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <p className="text-sm text-gray-700 italic text-center">
                  "Grâce à la plateforme, je peux suivre mon planning et réviser mes cours 
                  n'importe quand. Très pratique !" 
                  <br />
                  <span className="font-semibold text-gray-800 mt-1 block">- Élève de Terminale</span>
                </p>
              </div>

              <p className="text-center text-gray-400 text-sm mt-6">
                Accès réservé aux élèves inscrits
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-lg border-t border-gray-200 mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FA</span>
              </div>
              <span className="text-gray-700 font-semibold">Foundi Ali Education</span>
            </div>
            <div className="text-gray-500 text-sm">
              © 2024 - Plateforme éducative moderne • Développé avec passion 💙
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;