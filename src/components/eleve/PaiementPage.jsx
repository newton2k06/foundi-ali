import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/config";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const MONTHLY_FEE = 5000; // francs comoriens

export default function PaiementPage() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(dayjs().format("YYYY-MM"));

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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  const payments = userProfile?.payments || {};
  const hasPaidCurrent = payments[currentMonth] || false;
  
  // Calcul des mois impayés
  const unpaidMonths = Object.entries(payments)
    .filter(([month, paid]) => !paid)
    .map(([month]) => month)
    .sort((a, b) => a.localeCompare(b));

  // Total dû (mois impayés)
  const totalDue = unpaidMonths.length * MONTHLY_FEE;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">💳 Mes Paiements</h1>
          <p className="text-gray-600">Gestion de vos frais de scolarité</p>
        </div>

        {/* Carte statut actuel */}
        <div className={`p-6 rounded-2xl shadow-lg mb-6 ${
          hasPaidCurrent ? 'bg-green-100 border border-green-300' : 'bg-yellow-100 border border-yellow-300'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">
                {hasPaidCurrent ? '✅ Paiement effectué' : '⏳ En attente de paiement'}
              </h2>
              <p className="text-gray-700">
                Mois de <strong>{dayjs(currentMonth).format('MMMM YYYY')}</strong>
              </p>
              <p className={`text-lg font-bold mt-2 ${
                hasPaidCurrent ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {MONTHLY_FEE} FC
              </p>
            </div>
            <div className="text-4xl">
              {hasPaidCurrent ? '🎉' : '📋'}
            </div>
          </div>
        </div>

        {/* Historique des paiements */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📊 Historique des paiements</h2>
          
          {Object.keys(payments).length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucun historique de paiement.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(payments)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([month, paid]) => (
                  <div key={month} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                    <span className="font-medium">{dayjs(month).format('MMMM YYYY')}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
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

        {/* Résumé financier */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">💰 Résumé financier</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-blue-800 font-semibold">Total dû</p>
              <p className="text-2xl font-bold text-blue-600">{totalDue} FC</p>
              <p className="text-sm text-blue-600 mt-1">
                {unpaidMonths.length} mois impayé(s)
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-green-800 font-semibold">Prochain paiement</p>
              <p className="text-2xl font-bold text-green-600">{MONTHLY_FEE} FC</p>
              <p className="text-sm text-green-600 mt-1">
                {dayjs().add(1, 'month').format('MMMM YYYY')}
              </p>
            </div>
          </div>

          {/* Liste des mois impayés */}
          {unpaidMonths.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-800 mb-2">📋 Mois impayés :</h3>
              <div className="flex flex-wrap gap-2">
                {unpaidMonths.map(month => (
                  <span key={month} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                    {dayjs(month).format('MMM YYYY')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Information */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            💡 <strong>Information :</strong> Les paiements sont validés manuellement par l'administration. 
            Contactez le responsable en cas de problème.
          </p>
        </div>

      </div>
    </div>
  );
}