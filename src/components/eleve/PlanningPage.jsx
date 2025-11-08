import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/config";

export default function PlanningPage() {
  const [planning, setPlanning] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
  const dayLabels = {
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
    sunday: "Dimanche",
  };

  // Récupérer planning et user profile
  useEffect(() => {
    const fetchData = async () => {
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userDoc.exists()) setUserProfile(userDoc.data());

      const planningDoc = await getDoc(doc(db, "system", "planning"));
      if (planningDoc.exists()) setPlanning(planningDoc.data());

      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Mon Planning</h1>

      <div className="space-y-4">
        {days.map((day) => {
          const dayData = planning[day] || {};
          let coursesToShow = [];

          // Filtrer selon le groupe de l'élève
          if (userProfile?.group) {
            // Samedi spécial : deux créneaux
            if(day === "saturday") {
              if(dayData["15h00"] && userProfile.serie === "A1" && dayData["15h00"].group === userProfile.group){
                coursesToShow.push({ hour: "15h00 → 17h00", ...dayData["15h00"] });
              }
              if(dayData["18h30"] && dayData["18h30"].group === userProfile.group){
                coursesToShow.push({ hour: "18h30 → 20h00", ...dayData["18h30"] });
              }
            } else if(dayData.group === userProfile.group){
              coursesToShow.push({ hour: "18h30 → 20h00", ...dayData });
            }
          }

          if(coursesToShow.length === 0){
            coursesToShow.push({ subject: "none", message: "Pas de cours", hour: "-" });
          }

          return (
            <div key={day} className="bg-white p-4 rounded-xl shadow flex flex-col md:flex-row justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{dayLabels[day]}</h2>
                {coursesToShow.map((c, idx) => (
                  <div key={idx} className="mt-2">
                    {c.subject !== "none" ? (
                      <>
                        <p className="font-semibold">{c.subject}</p>
                        {c.message && <p className="text-gray-600 text-sm">{c.message}</p>}
                        {c.pdf && (
                          <a href={c.pdf} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                            📎 Télécharger le fichier
                          </a>
                        )}
                        <p className="text-gray-500 text-sm">{c.hour}</p>
                      </>
                    ) : (
                      <p className="text-red-500 font-semibold">❌ Pas de cours</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
