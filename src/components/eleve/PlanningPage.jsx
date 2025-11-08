import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/config";

export default function PlanningPage() {
  const [planning, setPlanning] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const dayLabels = { 
    monday: "Lundi", 
    tuesday: "Mardi", 
    wednesday: "Mercredi", 
    thursday: "Jeudi", 
    friday: "Vendredi", 
    saturday: "Samedi", 
    sunday: "Dimanche" 
  };

  const subjectLabels = {
    math: "📐 Mathématiques",
    physics: "⚛️ Physique", 
    chemistry: "🧪 Chimie",
    none: "🏠 Pas de cours"
  };

  const getEmojiForDay = (day) => {
    const emojis = { 
      monday: "🔵", 
      tuesday: "🟢", 
      wednesday: "🟡", 
      thursday: "🟠", 
      friday: "🔴", 
      saturday: "🟣", 
      sunday: "⚫" 
    };
    return emojis[day] || "📅";
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) setUserProfile(userDoc.data());

      const planningDoc = await getDoc(doc(db, "system", "planning"));
      if (planningDoc.exists()) setPlanning(planningDoc.data());

      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Chargement du planning...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📅 Mon Planning</h1>
          <p className="text-gray-600">
            {userProfile?.serie ? `Série ${userProfile.serie}` : "Planning hebdomadaire"}
          </p>
        </div>

        {/* Planning */}
        <div className="space-y-4">
          {days.map(day => {
            const dayData = planning[day] || {};
            const coursesToShow = [];

            // Récupérer tous les cours du jour
            Object.entries(dayData).forEach(([hour, course]) => {
              coursesToShow.push({ 
                hour: hour === "15h00" ? "15h00 → 17h00" : "18h30 → 20h00", 
                ...course 
              });
            });

            // Si pas de cours, afficher "Pas de cours"
            if (coursesToShow.length === 0) {
              coursesToShow.push({ 
                subject: "none", 
                message: "Aucun cours programmé aujourd'hui", 
                hour: "Toute la journée" 
              });
            }

            return (
              <div key={day} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transform transition-transform hover:scale-[1.02]">
                
                {/* En-tête du jour */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center">
                      <span className="mr-3 text-2xl">{getEmojiForDay(day)}</span>
                      {dayLabels[day]}
                    </h2>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                      {coursesToShow.length} cours
                    </span>
                  </div>
                </div>
                
                {/* Liste des cours */}
                <div className="p-4">
                  {coursesToShow.map((course, idx) => (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-xl mb-3 last:mb-0 transition-all duration-200 ${
                        course.subject === "none" 
                          ? "bg-gray-100 border border-gray-200" 
                          : "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:shadow-md"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        
                        {/* Informations du cours */}
                        <div className="flex-1">
                          <p className={`text-lg font-semibold ${
                            course.subject === "none" ? "text-gray-600" : "text-blue-800"
                          }`}>
                            {subjectLabels[course.subject] || course.subject}
                          </p>
                          
                          {course.message && course.subject !== "none" && (
                            <p className="text-gray-700 mt-2 flex items-center">
                              <span className="mr-2">📝</span>
                              {course.message}
                            </p>
                          )}

                          {course.subject === "none" && (
                            <p className="text-gray-500 text-sm mt-1">
                              Profitez de cette journée pour réviser ! 📚
                            </p>
                          )}
                        </div>

                        {/* Horaires */}
                        <div className="flex items-center">
                          <span className={`px-3 py-2 rounded-lg text-sm font-medium ${
                            course.subject === "none" 
                              ? "bg-gray-200 text-gray-700" 
                              : "bg-blue-500 text-white"
                          }`}>
                            🕐 {course.hour}
                          </span>
                        </div>

                      </div>

                      {/* Badge groupe */}
                      {course.group && course.subject !== "none" && (
                        <div className="mt-3">
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            👥 Groupe {course.group}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Information pour l'élève */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-blue-200 p-6">
          <div className="flex items-start">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <span className="text-blue-600 text-xl">💡</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Information importante</h3>
              <p className="text-gray-600 text-sm">
                Ce planning est mis à jour en temps réel par votre professeur. 
                Les modifications apparaissent automatiquement. Pensez à actualiser la page 
                pour voir les dernières mises à jour.
              </p>
              <p className="text-gray-500 text-xs mt-2">
                📱 Compatible mobile • 🔄 Mise à jour automatique
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}