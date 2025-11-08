import { useState, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function PlanningManager() {
  const [selectedDay, setSelectedDay] = useState("monday");
  const [planning, setPlanning] = useState({});
  const [loading, setLoading] = useState(true);

  const days = {
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
    sunday: "Dimanche",
  };

  const subjects = [
    { id: "math", label: "Mathématiques" },
    { id: "physics", label: "Physique" },
    { id: "chemistry", label: "Chimie" },
    { id: "none", label: "Pas de cours" },
  ];

  // Charger le planning
  const fetchPlanning = async () => {
    const docRef = doc(db, "system", "planning");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setPlanning(docSnap.data());
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPlanning();
  }, []);

  // Sauvegarder une modification
  const updatePlanning = async (day, subject) => {
    const newPlanning = { ...planning, [day]: subject };
    await setDoc(doc(db, "system", "planning"), newPlanning);
    setPlanning(newPlanning);
  };

  if (loading) return <p className="text-gray-600">Chargement...</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Gestion du Planning</h2>

      {/* Sélection du jour */}
      <label className="font-semibold">Choisir un jour :</label>
      <select
        value={selectedDay}
        onChange={(e) => setSelectedDay(e.target.value)}
        className="ml-3 border px-3 py-2 rounded-lg"
      >
        {Object.keys(days).map((d) => (
          <option key={d} value={d}>{days[d]}</option>
        ))}
      </select>

      {/* Choix du cours */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {subjects.map((subj) => (
          <button
            key={subj.id}
            onClick={() => updatePlanning(selectedDay, subj.id)}
            className={`p-4 rounded-xl font-semibold border ${
              planning[selectedDay] === subj.id
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {subj.label}
          </button>
        ))}
      </div>

      {/* Résumé du jour */}
      <div className="mt-6 p-4 bg-gray-100 rounded-xl">
        <p className="text-gray-600">
          Cours du <strong>{days[selectedDay]}</strong> :
        </p>
        <p className="text-xl font-bold mt-2">
          {planning[selectedDay]
            ? subjects.find((s) => s.id === planning[selectedDay])?.label
            : "Aucun cours défini"}
        </p>
      </div>
    </div>
  );
}
