import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/config";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const MONTHLY_FEE = 5000;

export default function PaiementPage() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/LoginForm");
        return;
      }
      
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <p className="text-center text-gray-600">Chargement...</p>
      </div>
    );
  }

  const payments = userProfile?.payments || {};
  const currentMonth = dayjs().format("YYYY-MM");
  const hasPaidCurrent = payments[currentMonth] || false;
  
  const unpaidMonths = Object.entries(payments)
    .filter(([month, paid]) => !paid)
    .map(([month]) => month)
    .sort();

  const totalDue = unpaidMonths.length * MONTHLY_FEE;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">💳 Mes Paiements</h1>

        {/* Statut actuel */}
        <div className={`p-6 rounded-lg mb-6 ${
          hasPaidCurrent ? 'bg-green-100 border border-green-300' : 'bg-yellow-100 border border-yellow-300'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-2">
                {hasPaidCurrent ? '✅ Paiement effectué' : '⏳ En attente de paiement'}
              </h2>
              <p className="text-gray-700">
                {dayjs(currentMonth).format('MMMM YYYY')} - {MONTHLY_FEE} FC
              </p>
            </div>
            <div className="text-3xl">
              {hasPaidCurrent ? '🎉' : '💰'}
            </div>
          </div>
        </div>

        {/* Résumé */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-blue-800 font-medium">Total à payer</p>
            <p className="text-2xl font-bold text-blue-600">{totalDue} FC</p>
            <p className="text-sm text-blue-600">{unpaidMonths.length} mois impayé(s)</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-green-800 font-medium">Prochain paiement</p>
            <p className="text-2xl font-bold text-green-600">{MONTHLY_FEE} FC</p>
            <p className="text-sm text-green-600">{dayjs().add(1, 'month').format('MMMM YYYY')}</p>
          </div>
        </div>

        {/* Historique */}
        <div>
          <h2 className="text-lg font-semibold mb-4">📊 Historique</h2>
          
          {Object.keys(payments).length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucun historique</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(payments)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([month, paid]) => (
                  <div key={month} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                    <span>{dayjs(month).format('MMMM YYYY')}</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {paid ? '✅ Payé' : '❌ Impayé'}
                    </span>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">
          💡 Payez en physique au responsable, puis votre paiement sera validé ici.
        </p>
      </div>
    </div>
  );
}