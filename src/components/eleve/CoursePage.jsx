import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, auth } from "../../firebase/config";

function CoursePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serie, setSerie] = useState("");

  // Récupérer la série de l'utilisateur
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    getDocs(query(collection(db, "users"), where("uid", "==", user.uid))).then(
      (snapshot) => {
        if (!snapshot.empty) {
          setSerie(snapshot.docs[0].data().serie);
        }
      }
    );
  }, []);

  // Récupérer les cours de la série de l'élève
  useEffect(() => {
    if (!serie) return;

    const fetchCourses = async () => {
      setLoading(true);
      let q = query(
        collection(db, "courses"),
        where("serie", "in", [serie, "all"]),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCourses(data);
      setLoading(false);
    };

    fetchCourses();
  }, [serie]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">📚 Mes Cours</h1>

      {/* Si en chargement */}
      {loading && <p>Chargement des cours...</p>}

      {/* Si aucun cours */}
      {!loading && courses.length === 0 && (
        <p className="text-gray-600">Aucun cours disponible pour votre série.</p>
      )}

      {/* Liste des cours */}
      <div className="space-y-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white p-4 rounded-xl shadow-sm border"
          >
            <h3 className="font-semibold text-lg">{course.titre}</h3>
            <p className="text-gray-600 text-sm mb-2">{course.description}</p>

            <p className="text-xs text-gray-500 mb-2">
              Série : {course.serie} | Type : {course.type}
            </p>

            {course.fichierUrl && (
              <a
                href={course.fichierUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-semibold underline text-sm"
              >
                📎 Télécharger
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CoursePage;
