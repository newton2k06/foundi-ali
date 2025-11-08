import { useEffect, useState } from "react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import {  getDoc } from "firebase/firestore";

export default function PlanningManager() {
  const [planning, setPlanning] = useState({});
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [day, setDay] = useState("monday");
  const [hour, setHour] = useState("18h30");
  const [subject, setSubject] = useState("math");
  const [pdf, setPdf] = useState("");
  const [message, setMessage] = useState("");

  const daysLabels = {
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
    sunday: "Dimanche",
  };

  const hoursOptions = {
    normal: "18h30 → 20h00",
    saturday: "15h00 → 17h00",
  };

  // Récupérer le planning actuel
  const fetchPlanning = async () => {
    const docRef = doc(db, "system", "planning");
    const docSnap = await getDocs(collection(db, "courses")); // pour les pdf disponibles
    const coursesList = docSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setCourses(coursesList);

    const planningDoc = await getDoc(doc(db, "system", "planning"));
    if (planningDoc.exists()) setPlanning(planningDoc.data());

    setLoading(false);
  };

  useEffect(() => {
    fetchPlanning();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const docRef = doc(db, "system", "planning");

    // Créer une copie du planning existant
    const newPlanning = { ...planning };

    if (!newPlanning[day]) newPlanning[day] = {};

    // On définit le créneau horaire
    const slot = day === "saturday" && hour === "15h00" ? "15h00" : "18h30";

    // On met à jour le créneau
    newPlanning[day][slot] = {
      subject,
      pdf,
      message,
      group: slot === "15h00" ? 2 : 1, // exemple : 15h00 → groupe 2
    };

    // Sauvegarde dans Firestore
    await setDoc(docRef, newPlanning);

    setPlanning(newPlanning);
    alert("Planning mis à jour !");
  };

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="p-6 bg-white rounded-xl shadow-md max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gestion du Planning</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Jour */}
        <div>
          <label className="block font-semibold mb-1">Jour</label>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {Object.keys(daysLabels).map((d) => (
              <option key={d} value={d}>{daysLabels[d]}</option>
            ))}
          </select>
        </div>

        {/* Créneau */}
        <div>
          <label className="block font-semibold mb-1">Créneau</label>
          <select
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {day === "saturday" ? (
              <>
                <option value="15h00">{hoursOptions.saturday}</option>
                <option value="18h30">{hoursOptions.normal}</option>
              </>
            ) : (
              <option value="18h30">{hoursOptions.normal}</option>
            )}
          </select>
        </div>

        {/* Matière */}
        <div>
          <label className="block font-semibold mb-1">Matière</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="math">Mathématiques</option>
            <option value="physics">Physique</option>
            <option value="chemistry">Chimie</option>
            <option value="none">Pas de cours</option>
          </select>
        </div>

        {/* PDF */}
        <div>
          <label className="block font-semibold mb-1">Cours PDF (optionnel)</label>
          <select
            value={pdf}
            onChange={(e) => setPdf(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Aucun fichier</option>
            {courses.map((c) => (
              <option key={c.id} value={c.fichierUrl}>{c.titre}</option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div>
          <label className="block font-semibold mb-1">Message pour les élèves</label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Chapitre 3"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Enregistrer
        </button>
      </form>

      {/* Aperçu du planning */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Aperçu du Planning</h2>
        <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(planning, null, 2)}</pre>
      </div>
    </div>
  );
}
