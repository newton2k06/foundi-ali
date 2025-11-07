import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-6 py-5">
          <h1 className="text-3xl font-bold text-center text-gray-800">
            Cours de Mr Ali M'kouboi
          </h1>
          <p className="text-center text-gray-600 mt-1 tracking-wide">
            Plus de 20 ans d’expérience dans l’enseignement
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row items-center gap-14">
          
          {/* Texte */}
          <div className="lg:w-1/2 animate-fadeInUp">
            <div className="bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 leading-tight">
                Une Plateforme Moderne au Service de l’Éducation
              </h2>

              <p className="text-gray-600 mb-4 leading-relaxed">
                Depuis plus de deux décennies, Mr Ali M'kouboi dédie son savoir-faire 
                et son expérience à la réussite de ses élèves. Sa passion pour 
                l’éduction a marqué plusieurs générations.
              </p>

              <p className="text-gray-600 mb-6 leading-relaxed">
                Aujourd’hui, son fils modernise cet héritage en développant une 
                plateforme intuitive permettant de gérer plus facilement : les présences, 
                les notes, les cours, le planning et la communication.
              </p>

              <p className="text-gray-800 font-semibold text-lg">
                Un enseignement traditionnel renforcé par des outils modernes.
              </p>
            </div>
          </div>

          {/* Photo + connexion */}
          <div className="lg:w-1/2 animate-fadeInUp delay-150">
            <div className="bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
              
              {/* Photo */}
              <div className="bg-gray-200/60 rounded-xl h-64 mb-8 flex items-center justify-center shadow-inner">
                <span className="text-gray-500">
                  Photo de Mr Ali M'kouboi (à remplacer)
                </span>
              </div>

              {/* Boutons */}
              <div className="space-y-4">
                <button
                  onClick={() => navigate("/LoginForm")}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg 
                  font-semibold text-lg shadow-md transition-all duration-200"
                >
                  Se connecter
                </button>

                <button
                  onClick={() => navigate("/registerForm")}
                  className="w-full bg-white hover:bg-gray-50 text-indigo-600 border border-indigo-600 
                  py-3 px-6 rounded-lg font-semibold text-lg shadow-sm transition-all duration-200"
                >
                  Créer un compte
                </button>
              </div>

              <p className="text-center text-gray-400 text-sm mt-6">
                Réservé aux élèves de Mr Ali M'kouboi
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-6 border-t mt-20">
        <div className="container mx-auto px-6 text-center text-gray-500">
          © 2024 — Plateforme éducative de Foundi Ali
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
