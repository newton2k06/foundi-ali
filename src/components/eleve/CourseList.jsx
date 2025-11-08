import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, auth } from "../../firebase/config";

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
    useEffect(() => {
  if (!userProfile) return;

  const fetchCourses = async () => {
    setLoading(true);
    try {
      console.log("🔍 Série de l'élève:", userProfile.serie); // ← AJOUTE
      
      let q = query(
        collection(db, "courses"),
        where("serie", "in", [userProfile.serie, "all"]),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      console.log("📚 Cours trouvés:", querySnapshot.docs.length); // ← AJOUTE
      
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("📄 Données cours:", data); // ← AJOUTE
      
      setCourses(data);
    } catch (err) {
      console.error("❌ Erreur:", err);
    }
    setLoading(false);
  };

  fetchCourses();
}, [userProfile, filterType]);
  // Récupérer les infos de l'élève
  useEffect(() => {
    const fetchUserProfile = async () => {
      const userDoc = await getDocs(collection(db, "users"));
      const userData = userDoc.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .find(u => u.email === auth.currentUser.email);
      setUserProfile(userData);
    };
    fetchUserProfile();
  }, []);

  // Récupérer les cours correspondant à la série de l'élève
  useEffect(() => {
    if (!userProfile) return;

    const fetchCourses = async () => {
      setLoading(true);
      try {
        let q = query(
          collection(db, "courses"),
          where("serie", "in", [userProfile.serie, "all"]),
          orderBy("createdAt", "desc")
        );

        if (filterType !== "all") {
          q = query(
            collection(db, "courses"),
            where("serie", "in", [userProfile.serie, "all"]),
            where("type", "==", filterType),
            orderBy("createdAt", "desc")
          );
        }

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCourses(data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchCourses();
  }, [userProfile, filterType]);

  if (!userProfile) {
    return <p className="text-center mt-10 text-gray-600">Chargement du profil...</p>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Cours - Série {userProfile.serie}</h1>

      {/* Filtrage par type */}
      <div className="mb-4 flex items-center space-x-4">
        <label className="font-semibold">Filtrer par type :</label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous</option>
          <option value="cours">Cours</option>
          <option value="td">TD</option>
          <option value="exercice">Exercice</option>
        </select>
      </div>

      {/* Liste des cours */}
      {loading ? (
        <p className="text-gray-600">Chargement des cours...</p>
      ) : courses.length === 0 ? (
        <p className="text-gray-600">Aucun cours disponible pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-white p-4 rounded-xl shadow-sm">
              <h3 className="font-semibold text-lg">{course.titre}</h3>
              <p className="text-gray-600 text-sm mb-1">{course.description}</p>
              <p className="text-gray-500 text-xs">
                Type : {course.type} | Série : {course.serie}
              </p>
              {course.fichierUrl && (
                <a
                  href={course.fichierUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  📎 Télécharger le fichier
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CourseList;
