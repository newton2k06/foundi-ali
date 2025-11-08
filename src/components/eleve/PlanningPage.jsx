import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/config";

export default function PlanningPage() {
  const [planning, setPlanning] = useState({});
  const [loading, setLoading] = useState(true);

  const jours = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

  useEffect(() => {
    const getPlanning = async () => {
      const planningDoc = await getDoc(doc(db, "system", "planning"));
      if (planningDoc.exists()) setPlanning(planningDoc.data());
      setLoading(false);
    };
    getPlanning();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <p className="text-center text-gray-600">Chargement du planning...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">📅 Mon Planning</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jours.map(jour => {
            const coursDuJour = planning[jour];
            
            return (
              <div key={jour} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 text-blue-600">
                  {jour.charAt(0).toUpperCase() + jour.slice(1)}
                </h3>
                
                {!coursDuJour ? (
                  <p className="text-gray-500">Aucun cours aujourd'hui</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(coursDuJour).map(([horaire, details]) => (
                      <div key={horaire} className="bg-blue-50 p-3 rounded-lg">
                        <p className="font-medium mb-1">{horaire}</p>
                        <p className="font-semibold">
                          {details.subject === "math" && "📐 Mathématiques"}
                          {details.subject === "physics" && "⚛️ Physique"} 
                          {details.subject === "chemistry" && "🧪 Chimie"}
                        </p>
                        {details.message && (
                          <p className="text-sm text-gray-600 mt-1">{details.message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}