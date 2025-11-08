import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/config";
import dayjs from "dayjs";

const MONTHLY_FEE = 5000;

export default function StatsManager() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentMonth = dayjs().format("YYYY-MM");

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

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <p className="text-center text-gray-600">Chargement...</p>
      </div>
    );
  }

  // Calculs
  const totalDue = students.length * MONTHLY_FEE;
  let totalReceived = 0;
  
  students.forEach(student => {
    const payments = student.payments || {};
    if (payments[currentMonth]) {
      totalReceived += MONTHLY_FEE;
    }
  });

  const totalArrears = totalDue - totalReceived;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">💰 Gestion des Paiements</h1>

        {/* Résumé */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-blue-800 font-medium">Total à percevoir</p>
            <p className="text-2xl font-bold text-blue-600">{totalDue} FC</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-green-800 font-medium">Déjà perçu</p>
            <p className="text-2xl font-bold text-green-600">{totalReceived} FC</p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <p className="text-orange-800 font-medium">Reste à percevoir</p>
            <p className="text-2xl font-bold text-orange-600">{totalArrears} FC</p>
          </div>
        </div>

        {/* Liste étudiants */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Étudiants - {dayjs(currentMonth).format('MMMM YYYY')}
          </h2>
          
          {students.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucun étudiant</p>
          ) : (
            <div className="space-y-3">
              {students.map((student) => {
                const payments = student.payments || {};
                const hasPaid = payments[currentMonth] || false;

                return (
                  <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-semibold">{student.prenom} {student.nom}</p>
                      <p className="text-sm text-gray-600">{student.serie} • {student.email}</p>
                    </div>
                    
                    <button
                      onClick={() => togglePayment(student.id)}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        hasPaid 
                          ? 'bg-green-500 hover:bg-green-600 text-white' 
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      {hasPaid ? '✅ Payé' : '❌ En attente'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          💡 Cliquez pour marquer un étudiant comme "Payé" après réception du paiement.
        </p>
      </div>
    </div>
  );
}