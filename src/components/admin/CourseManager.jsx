import { useState, useEffect } from "react";
import { collection, addDoc, query, where, getDocs, orderBy } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "../../firebase/config";

function CourseManager() {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [fichier, setFichier] = useState(null);
  const [serie, setSerie] = useState("");
  const [type, setType] = useState("cours");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [courses, setCourses] = useState([]);
  const [filterSerie, setFilterSerie] = useState("all");

  // Fonction pour ajouter un cours
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      let fichierUrl = null;

      if (fichier) {
        const storageRef = ref(storage, `courses/${Date.now()}_${fichier.name}`);
        const uploadTask = uploadBytesResumable(storageRef, fichier);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            null,
            (err) => reject(err),
            async () => {
              fichierUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      }

      await addDoc(collection(db, "courses"), {
        titre,
        description,
        fichierUrl,
        serie,
        type,
        createdBy: auth.currentUser.uid,
        createdAt: new Date()
      });

      setTitre("");
      setDescription("");
      setFichier(null);
      setSerie("");
      setType("cours");
      setSuccess("Cours ajouté avec succès !");
      fetchCourses();
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'ajout du cours.");
    }
  };

  // Fonction pour récupérer les cours
  const fetchCourses = async () => {
    try {
      let q = query(collection(db, "courses"), orderBy("createdAt", "desc"));
      if (filterSerie !== "all") {
        q = query(collection(db, "courses"), where("serie", "==", filterSerie), orderBy("createdAt", "desc"));
      }

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCourses(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [filterSerie]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gestion des Cours</h1>

      {/* Formulaire d'ajout */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md space-y-4">
        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}

        <div>
          <label className="block text-sm font-semibold mb-1">Titre</label>
          <input
            type="text"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Fichier (optionnel)</label>
          <input
            type="file"
            onChange={(e) => setFichier(e.target.files[0])}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Série</label>
          <select
            value={serie}
            onChange={(e) => setSerie(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Choisissez la série</option>
            <option value="A1">Série A1</option>
            <option value="C">Série C</option>
            <option value="D">Série D</option>
            <option value="all">Toutes</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="cours">Cours</option>
            <option value="td">TD</option>
            <option value="exercice">Exercice</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Ajouter le cours
        </button>
      </form>

      {/* Filtrage */}
      <div className="mt-6 flex items-center space-x-4">
        <label className="font-semibold">Filtrer par série :</label>
        <select
          value={filterSerie}
          onChange={(e) => setFilterSerie(e.target.value)}
          className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Toutes</option>
          <option value="A1">Série A1</option>
          <option value="C">Série C</option>
          <option value="D">Série D</option>
        </select>
      </div>

      {/* Liste des cours */}
      <div className="mt-6 space-y-4">
        {courses.map((course) => (
          <div key={course.id} className="bg-white p-4 rounded-xl shadow-sm">
            <h3 className="font-semibold text-lg">{course.titre}</h3>
            <p className="text-gray-600 text-sm mb-1">{course.description}</p>
            <p className="text-gray-500 text-xs">
              Série : {course.serie} | Type : {course.type}
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
    </div>
  );
}

export default CourseManager;
