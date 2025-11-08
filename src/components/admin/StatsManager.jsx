import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/config";
import dayjs from "dayjs";

const MONTHLY_FEE = 5000; // francs comoriens

export default function StatsManager() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentMonth = dayjs().format("YYYY-MM"); // ex: "2025-11"

  const fetchStudents = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "users"));
    const usersList = querySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((u) => u.role !== "superuser")
      .sort((a, b) => a.nom.localeCompare(b.nom));
    setStudents(usersList);
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const togglePayment = async (studentId) => {
    const student = students.find((s) => s.id === studentId);
    const payments = student.payments || {};
    payments[currentMonth] = !payments[currentMonth];
    await updateDoc(doc(db, "users", studentId), { payments });
    fetchStudents();
  };

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  // Calcul des montants
  const totalDue = students.length * MONTHLY_FEE;
  let totalReceived = 0;
  let totalArrears = 0;

  students.forEach((s) => {
    const payments = s.payments || {};
    totalReceived += Object.values(payments).filter(Boolean).length * MONTHLY_FEE;
  });

  totalArrears = totalDue - totalReceived;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Gestion des Paiements</h2>

      <div className="mb-4">
        <p>Total à percevoir ce mois : {totalDue} FC</p>
        <p>Total perçu : {totalReceived} FC</p>
        <p>Total restant (arriérés) : {totalArrears} FC</p>
      </div>

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
                <th className="border px-4 py-2">Paiement {currentMonth}</th>
                <th className="border px-4 py-2">Arriérés</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const payments = student.payments || {};
                const hasPaidCurrent = payments[currentMonth] || false;

                const arrears = Object.keys(payments)
                  .filter((m) => !payments[m])
                  .sort((a, b) => a.localeCompare(b));

                return (
                  <tr key={student.id}>
                    <td className="border px-4 py-2">{student.prenom} {student.nom}</td>
                    <td className="border px-4 py-2">{student.email}</td>
                    <td className="border px-4 py-2">{student.serie}</td>
                    <td className="border px-4 py-2">
                      <input
                        type="checkbox"
                        checked={hasPaidCurrent}
                        onChange={() => togglePayment(student.id)}
                      />
                    </td>
                    <td className="border px-4 py-2">
                      {arrears.length > 0 ? arrears.join(", ") : "Aucun"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
