import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function UserManager() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "users"));
    let usersList = querySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      // 1️⃣ Exclure les super users
      .filter((user) => user.role !== "superuser")
      // 2️⃣ Trier par ordre alphabétique
      .sort((a, b) => a.nom.localeCompare(b.nom));
    setStudents(usersList);
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const validateStudent = async (id) => {
    await updateDoc(doc(db, "users", id), { status: "active" });
    fetchStudents();
  };

  const deleteStudent = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet étudiant ?")) {
      await deleteDoc(doc(db, "users", id));
      fetchStudents();
    }
  };

  const updateGroup = async (id, group) => {
    await updateDoc(doc(db, "users", id), { group });
    fetchStudents();
  };

  const togglePayment = async (id) => {
    const student = students.find((s) => s.id === id);
    const hasPaid = student?.hasPaidThisMonth || false;
    await updateDoc(doc(db, "users", id), { hasPaidThisMonth: !hasPaid });
    fetchStudents();
  };

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Gestion des étudiants</h2>

      {students.length === 0 ? (
        <p>Aucun étudiant trouvé.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-center min-w-[700px]">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Nom</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Série</th>
                <th className="border px-4 py-2">Statut</th>
                <th className="border px-4 py-2">Groupe</th>
                <th className="border px-4 py-2">Paiement</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="border px-4 py-2">
                    {student.prenom} {student.nom}
                  </td>
                  <td className="border px-4 py-2">{student.email}</td>
                  <td className="border px-4 py-2">{student.serie}</td>
                  <td className="border px-4 py-2">{student.status}</td>
                  <td className="border px-4 py-2">
                    <select
                      value={student.group || ""}
                      onChange={(e) => updateGroup(student.id, Number(e.target.value))}
                      className="border px-2 py-1 rounded"
                    >
                      <option value="">Non assigné</option>
                      <option value={1}>Groupe 1</option>
                      <option value={2}>Groupe 2</option>
                    </select>
                  </td>
                  <td className="border px-4 py-2">
                    <input
                      type="checkbox"
                      checked={student.hasPaidThisMonth || false}
                      onChange={() => togglePayment(student.id)}
                    />
                  </td>
                  <td className="border px-4 py-2 space-x-2">
                    {student.status === "pending" && (
                      <button
                        onClick={() => validateStudent(student.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded"
                      >
                        Valider
                      </button>
                    )}
                    <button
                      onClick={() => deleteStudent(student.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
