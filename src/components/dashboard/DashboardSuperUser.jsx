import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/config";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import CourseManager from "../admin/CourseManager";

function DashboardSuperUser() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Déconnexion
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/LoginForm");
  };

  // Récupérer les étudiants
  const fetchStudents = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "users"));
    const usersList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setStudents(usersList);
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Valider un étudiant
  const validateStudent = async (id) => {
    await updateDoc(doc(db, "users", id), { status: "active" });
    fetchStudents();
  };

  // Supprimer un étudiant
  const deleteStudent = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet étudiant ?")) {
      await deleteDoc(doc(db, "users", id));
      fetchStudents();
    }
  };

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">

      {/* Header */}
      <header className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Super User</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg"
        >
          Se déconnecter
        </button>
      </header>

      {/* Gestion des étudiants */}
      <section className="mt-6 bg-white p-6 rounded-xl shadow-sm overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Gestion des étudiants</h2>
        {students.length === 0 ? (
          <p>Aucun étudiant pour le moment.</p>
        ) : (
          <table className="w-full border-collapse text-center min-w-[600px]">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Nom</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Série</th>
                <th className="border px-4 py-2">Statut</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="text-center">
                  <td className="border px-4 py-2">{student.prenom} {student.nom}</td>
                  <td className="border px-4 py-2">{student.email}</td>
                  <td className="border px-4 py-2">{student.serie}</td>
                  <td className="border px-4 py-2">{student.status}</td>
                  <td className="border px-4 py-2 space-x-2">
                    {student.status === "pending" && (
                      <button
                        onClick={() => validateStudent(student.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Valider
                      </button>
                    )}
                    <button
                      onClick={() => deleteStudent(student.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Gestion des cours */}
      <section className="mt-6 bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Gestion des cours</h2>
        <CourseManager />
      </section>

      {/* Fonctions supplémentaires */}
      <section className="mt-6 bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Fonctions supplémentaires</h2>
        <p className="text-gray-600">
          Gestion des groupes, planning et statistiques à venir.
        </p>
      </section>

      {/* Navigation mobile fixe */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-2 grid grid-cols-3 gap-1">
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="p-2 text-center text-blue-600 text-lg">👨‍🎓 Étudiants</button>
        <button onClick={() => window.scrollTo({ top: 600, behavior: "smooth" })} className="p-2 text-center text-purple-600 text-lg">📚 Cours</button>
        <button onClick={() => window.scrollTo({ top: 1200, behavior: "smooth" })} className="p-2 text-center text-gray-600 text-lg">⚙️ Autres</button>
      </div>

    </div>
  );
}

export default DashboardSuperUser;
