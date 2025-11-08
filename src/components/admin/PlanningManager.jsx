import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function PlanningManager() {
  const [planning, setPlanning] = useState({});
  const [day, setDay] = useState("lundi");
  const [hour, setHour] = useState("18h30");
  const [subject, setSubject] = useState("math");
  const [message, setMessage] = useState("");

  const jours = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

  useEffect(() => {
    const getPlanning = async () => {
      const planningDoc = await getDoc(doc(db, "system", "planning"));
      if (planningDoc.exists()) setPlanning(planningDoc.data());
    };
    getPlanning();
  }, []);

  const ajouterCours = async () => {
    const nouveauPlanning = { ...planning };
    
    if (!nouveauPlanning[day]) nouveauPlanning[day] = {};
    
    nouveauPlanning[day][hour] = {
      subject,
      message
    };

    await setDoc(doc(db, "system", "planning"), nouveauPlanning);
    setPlanning(nouveauPlanning);
    setMessage("");
    alert("Cours ajouté !");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">📅 Gestion du Planning</h1>

        {/* Formulaire simple */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h2 className="font-semibold mb-4">Ajouter un cours</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Jour</label>
              <select 
                value={day} 
                onChange={e => setDay(e.target.value)} 
                className="w-full border border-gray-300 p-3 rounded-lg"
              >
                {jours.map(jour => (
                  <option key={jour} value={jour}>
                    {jour.charAt(0).toUpperCase() + jour.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Horaire</label>
              <select 
                value={hour} 
                onChange={e => setHour(e.target.value)} 
                className="w-full border border-gray-300 p-3 rounded-lg"
              >
                <option value="18h30">18h30 - 20h00</option>
                {day === "samedi" && <option value="15h00">15h00 - 17h00</option>}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Matière</label>
              <select 
                value={subject} 
                onChange={e => setSubject(e.target.value)} 
                className="w-full border border-gray-300 p-3 rounded-lg"
              >
                <option value="math">Mathématiques</option>
                <option value="physics">Physique</option>
                <option value="chemistry">Chimie</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message (optionnel)</label>
              <input 
                type="text" 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                className="w-full border border-gray-300 p-3 rounded-lg" 
                placeholder="Ex: Chapitre 3 - Les fonctions"
              />
            </div>
          </div>

          <button 
            onClick={ajouterCours}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            ✅ Ajouter le cours
          </button>
        </div>

        {/* Aperçu du planning */}
        <div>
          <h2 className="font-semibold mb-4">Planning actuel</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jours.map(jour => {
              const coursDuJour = planning[jour];
              
              return (
                <div key={jour} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 text-blue-600">
                    {jour.charAt(0).toUpperCase() + jour.slice(1)}
                  </h3>
                  
                  {!coursDuJour ? (
                    <p className="text-gray-500">Aucun cours</p>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(coursDuJour).map(([horaire, details]) => (
                        <div key={horaire} className="bg-blue-50 p-3 rounded text-sm">
                          <p><strong>{horaire}</strong></p>
                          <p>
                            {details.subject === "math" && "📐 Maths"}
                            {details.subject === "physics" && "⚛️ Physique"}
                            {details.subject === "chemistry" && "🧪 Chimie"}
                          </p>
                          {details.message && <p className="text-gray-600">📝 {details.message}</p>}
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
    </div>
  );
}