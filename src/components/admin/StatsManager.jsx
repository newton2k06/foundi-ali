import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/config";
import dayjs from "dayjs";

const MONTHLY_FEE = 5000;

export default function StatsManager() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const currentMonth = dayjs().format("YYYY-MM");

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((u) => u.role !== "superuser")
        .sort((a, b) => a.nom.localeCompare(b.nom));
      setStudents(usersList);
    } catch (error) {
      console.error("Erreur chargement étudiants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const togglePayment = async (studentId) => {
    setUpdating(studentId);
    
    try {
      const student = students.find((s) => s.id === studentId);
      
      // S'assurer que payments existe et est un objet
      const currentPayments = student.payments || {};
      
      // Créer une copie pour éviter les mutations directes
      const updatedPayments = { ...currentPayments };
      
      // Inverser le statut pour le mois courant
      updatedPayments[currentMonth] = !updatedPayments[currentMonth];
      
      console.log("Mise à jour paiement:", {
        student: student.prenom,
        mois: currentMonth,
        nouveauStatut: updatedPayments[currentMonth]
      });
      
      // Mettre à jour dans Firestore
      await updateDoc(doc(db, "users", studentId), { 
        payments: updatedPayments 
      });
      
      // Recharger les données
      await fetchStudents();
      
    } catch (error) {
      console.error("Erreur mise à jour paiement:", error);
      alert("Erreur lors de la mise à jour du paiement");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <p className="text-center text-gray-600">Chargement des étudiants...</p>
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
            <p className="text-2xl font-bold text-blue-600">{totalDue.toLocaleString()} FC</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-green-800 font-medium">Déjà perçu</p>
            <p className="text-2xl font-bold text-green-600">{totalReceived.toLocaleString()} FC</p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <p className="text-orange-800 font-medium">Reste à percevoir</p>
            <p className="text-2xl font-bold text-orange-600">{totalArrears.toLocaleString()} FC</p>
          </div>
        </div>

        {/* Liste étudiants */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Étudiants - {dayjs(currentMonth).format('MMMM YYYY')}
            </h2>
            <span className="text-sm text-gray-500">
              {students.length} étudiant(s)
            </span>
          </div>
          
          {students.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucun étudiant inscrit</p>
          ) : (
            <div className="space-y-3">
              {students.map((student) => {
                const payments = student.payments || {};
                const hasPaid = payments[currentMonth] || false;

                return (
                  <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{student.prenom} {student.nom}</p>
                      <p className="text-sm text-gray-600">
                        {student.serie} • {student.email}
                      </p>
                      {student.payments && (
                        <p className="text-xs text-gray-500 mt-1">
                          Dernier paiement: {dayjs(Object.keys(student.payments).sort().pop()).format('DD/MM/YYYY')}
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => togglePayment(student.id)}
                      disabled={updating === student.id}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors min-w-24 ${
                        hasPaid 
                          ? 'bg-green-500 hover:bg-green-600 text-white' 
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      } ${updating === student.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {updating === student.id ? (
                        <span>...</span>
                      ) : hasPaid ? (
                        '✅ Payé'
                      ) : (
                        '❌ En attente'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          💡 <strong>Instructions :</strong> Cliquez sur le bouton pour marquer un étudiant comme "Payé" après réception du paiement. 
          Le système enregistre automatiquement pour le mois en cours ({dayjs(currentMonth).format('MMMM YYYY')}).
        </p>
      </div>

      {/* Debug info (à retirer en production) */}
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
        <p className="text-gray-700 text-sm">
          🔍 <strong>Debug :</strong> Mois en cours: {currentMonth} | 
          Étudiants chargés: {students.length} | 
          Mise à jour en cours: {updating || 'Aucune'}
        </p>
      </div>
    </div>
  );
}