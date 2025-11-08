import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/config";

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Récupérer le profil utilisateur CORRECTEMENT
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }
      }
    };
    fetchUserProfile();
  }, []);

  // Récupérer les cours UNE SEULE FOIS
  useEffect(() => {
    if (!userProfile) return;

    const fetchCourses = async () => {
      setLoading(true);
      try {
        console.log("🔍 Série de l'élève:", userProfile.serie);
        
        let q = query(
          collection(db, "courses"),
          where("serie", "in", [userProfile.serie, "all"]),
          orderBy("createdAt", "desc")
        );

        // Ajouter filtre type si nécessaire
        if (filterType !== "all") {
          q = query(q, where("type", "==", filterType));
        }

        const querySnapshot = await getDocs(q);
        console.log("📚 Cours trouvés:", querySnapshot.docs.length);
        
        const data = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        
        console.log("📄 Données cours:", data);
        setCourses(data);
      } catch (err) {
        console.error("❌ Erreur Firestore:", err);
        // Si erreur d'index, on fait une requête simple
        if (err.code === 'failed-precondition') {
          const querySnapshot = await getDocs(collection(db, "courses"));
          const allCourses = querySnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
          }));
          // Filtrage manuel par série
          const filteredCourses = allCourses.filter(course => 
            course.serie === userProfile.serie || course.serie === "all"
          );
          setCourses(filteredCourses);
        }
      }
      setLoading(false);
    };

    fetchCourses();
  }, [userProfile, filterType]); // Dépendances correctes

  if (!userProfile) {
    return <p className="text-center py-10 text-gray-600">Chargement du profil...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Filtrage par type */}
      <div className="mb-6 flex items-center space-x-4">
        <label className="font-semibold text-gray-700">Filtrer par type :</label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Tous les types</option>
          <option value="cours">Cours</option>
          <option value="td">TD</option>
          <option value="exercice">Exercice</option>
        </select>
      </div>

      {/* Liste des cours */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Chargement des cours...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">📚 Aucun cours disponible pour le moment.</p>
          <p className="text-gray-400 text-sm mt-2">Série {userProfile.serie}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg text-gray-800">{course.titre}</h3>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {course.type}
                </span>
              </div>
              
              <p className="text-gray-600 mb-3">{course.description}</p>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">
                  Série : {course.serie}
                </span>
                
                {course.fichierUrl && (
                  <a
                    href={course.fichierUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                  >
                    <span className="mr-2">📎</span>
                    Télécharger
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CourseList;