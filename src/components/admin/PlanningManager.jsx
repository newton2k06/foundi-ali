import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function PlanningManager() {
  const [planning, setPlanning] = useState({});
  const [loading, setLoading] = useState(true);

  const [day, setDay] = useState("monday");
  const [hour, setHour] = useState("18h30");
  const [subject, setSubject] = useState("math");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  const daysLabels = {
    monday: "Lundi",
    tuesday: "Mardi", 
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
    sunday: "Dimanche",
  };

  const subjectsLabels = {
    math: "Mathématiques",
    physics: "Physique",
    chemistry: "Chimie",
    none: "Pas de cours"
  };

  useEffect(() => {
    const fetchPlanning = async () => {
      const docSnap = await getDoc(doc(db, "system", "planning"));
      if (docSnap.exists()) setPlanning(docSnap.data());
      setLoading(false);
    };
    fetchPlanning();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");

    const slot = day === "saturday" && hour === "15h00" ? "15h00" : "18h30";

    const newPlanning = { ...planning };
    if (!newPlanning[day]) newPlanning[day] = {};
    newPlanning[day][slot] = {
      subject,
      message,
      group: slot === "15h00" ? 2 : 1,
    };

    try {
      await setDoc(doc(db, "system", "planning"), newPlanning);
      setPlanning(newPlanning);
      setSuccess("✅ Planning mis à jour avec succès !");
      setMessage(""); // Reset du message
    } catch (error) {
      setSuccess("❌ Erreur lors de la sauvegarde");
    }
  };

  if (loading) return <p className="text-center mt-10">Chargement du planning...</p>;

  return (
    <div className="p-6 bg-white rounded-xl shadow-md max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📅 Gestion du Planning</h1>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-8 p-6 bg-gray-50 rounded-lg">
        {success && (
          <div className={`p-3 rounded-lg ${success.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Jour</label>
            <select 
              value={day} 
              onChange={e => setDay(e.target.value)} 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(daysLabels).map(([key, label]) => 
                <option key={key} value={key}>{label}</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Créneau</label>
            <select 
              value={hour} 
              onChange={e => setHour(e.target.value)} 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {day === "saturday" ? (
                <>
                  <option value="15h00">15h00 → 17h00 (Groupe 2)</option>
                  <option value="18h30">18h30 → 20h00 (Groupe 1)</option>
                </>
              ) : <option value="18h30">18h30 → 20h00 (Groupe 1)</option>}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Matière</label>
            <select 
              value={subject} 
              onChange={e => setSubject(e.target.value)} 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(subjectsLabels).map(([key, label]) => 
                <option key={key} value={key}>{label}</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Message optionnel
              <span className="text-gray-500 text-sm font-normal ml-2">(Chapitre, thème...)</span>
            </label>
            <input 
              type="text" 
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500" 
              placeholder="Ex: Chapitre 3 - Les dérivées"
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-200"
        >
          💾 Enregistrer le créneau
        </button>
      </form>

      {/* Aperçu visuel du planning */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">📋 Planning Hebdomadaire</h2>
        
        {Object.keys(planning).length === 0 ? (
          <p className="text-gray-500 text-center p-8 bg-gray-50 rounded-lg">
            Aucun créneau planifié pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(daysLabels).map(([dayKey, dayLabel]) => (
              planning[dayKey] && (
                <div key={dayKey} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-lg mb-3 text-blue-600">{dayLabel}</h3>
                  <div className="space-y-2">
                    {Object.entries(planning[dayKey]).map(([hourKey, slot]) => (
                      <div key={hourKey} className="bg-gray-50 p-3 rounded border">
                        <div className="flex justify-between items-start">
                          <span className="font-medium">{hourKey}</span>
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Groupe {slot.group}
                          </span>
                        </div>
                        <p className="font-semibold mt-1">{subjectsLabels[slot.subject]}</p>
                        {slot.message && (
                          <p className="text-sm text-gray-600 mt-1">📝 {slot.message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}