import { useState, useEffect } from "react";
import { collection, getDocs, getCountFromServer } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function FirestoreUsageMonitor() {
  const [usage, setUsage] = useState({
    messagesGlobal: 0,
    messagesPrives: 0,
    users: 0,
    courses: 0,
    totalDocuments: 0,
    storageUsed: 0,
    readsToday: 0,
    writesToday: 0
  });
  const [loading, setLoading] = useState(true);

  // Calcul des limites gratuites (par jour)
  const FREE_LIMITS = {
    documents: 1000,        // 1 Go stockage
    reads: 50000,           // 50k lectures/jour
    writes: 20000,          // 20k écritures/jour
    deletes: 20000          // 20k suppressions/jour
  };

  useEffect(() => {
    const checkUsage = async () => {
      try {
        // Compter les documents par collection
        const collections = ['messages_global', 'messages_prives', 'users', 'courses'];
        const counts = {};
        
        for (const coll of collections) {
          const snapshot = await getCountFromServer(collection(db, coll));
          counts[coll] = snapshot.data().count;
        }

        // Estimation de la taille stockage (approximative)
        // En moyenne: 1KB par document pour les messages
        const estimatedStorage = (
          counts.messages_global * 1 + 
          counts.messages_prives * 1 + 
          counts.users * 2 + // plus gros
          counts.courses * 3  // encore plus gros
        );

        const totalDocs = Object.values(counts).reduce((a, b) => a + b, 0);

        setUsage({
          messagesGlobal: counts.messages_global,
          messagesPrives: counts.messages_prives,
          users: counts.users,
          courses: counts.courses,
          totalDocuments: totalDocs,
          storageUsed: estimatedStorage,
          readsToday: 0, // À implémenter avec Firebase Monitoring
          writesToday: 0 // À implémenter avec Firebase Monitoring
        });

      } catch (error) {
        console.error("Erreur monitoring:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUsage();
    // Vérifier toutes les 5 minutes
    const interval = setInterval(checkUsage, 300000);
    return () => clearInterval(interval);
  }, []);

  // Calcul des pourcentages d'utilisation
  const storagePercentage = (usage.storageUsed / FREE_LIMITS.documents) * 100;
  const documentsPercentage = (usage.totalDocuments / 50000) * 100; // Estimation 50k docs max

  const getStatusColor = (percentage) => {
    if (percentage < 60) return "bg-green-500";
    if (percentage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusText = (percentage) => {
    if (percentage < 60) return "✅ Sécurisé";
    if (percentage < 80) return "⚠️ Attention";
    return "🚨 Critique";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-gray-600">Chargement des statistiques...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold">📊 Monitoring Firestore</h2>
          <p className="text-sm text-gray-600">Utilisation des ressources gratuites</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">Statut: {getStatusText(Math.max(storagePercentage, documentsPercentage))}</p>
          <p className="text-xs text-gray-500">Mise à jour automatique</p>
        </div>
      </div>

      {/* Barres de progression */}
      <div className="space-y-4 mb-6">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Stockage utilisé: {usage.storageUsed.toFixed(1)} MB / {FREE_LIMITS.documents} MB</span>
            <span>{storagePercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getStatusColor(storagePercentage)}`}
              style={{ width: `${Math.min(storagePercentage, 100)}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Documents: {usage.totalDocuments} / 50,000 (est.)</span>
            <span>{documentsPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getStatusColor(documentsPercentage)}`}
              style={{ width: `${Math.min(documentsPercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">{usage.messagesGlobal}</p>
          <p className="text-xs text-blue-800">Messages Global</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{usage.messagesPrives}</p>
          <p className="text-xs text-green-800">Messages Privés</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-2xl font-bold text-purple-600">{usage.users}</p>
          <p className="text-xs text-purple-800">Utilisateurs</p>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg">
          <p className="text-2xl font-bold text-orange-600">{usage.courses}</p>
          <p className="text-xs text-orange-800">Cours</p>
        </div>
      </div>

      {/* Recommandations */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h3 className="font-semibold mb-2">💡 Recommandations</h3>
        <ul className="text-sm space-y-1">
          {storagePercentage > 70 && (
            <li>• 🔥 Supprimez les vieux messages inutiles</li>
          )}
          {usage.messagesGlobal > 1000 && (
            <li>• 💬 Archivez les anciens messages du chat global</li>
          )}
          {usage.messagesPrives > 2000 && (
            <li>• 📨 Nettoyez les messages privés anciens</li>
          )}
          {storagePercentage < 50 && (
            <li>• ✅ Bonne utilisation, continuez ainsi !</li>
          )}
          <li>• ⏰ Monitoring automatique toutes les 5 minutes</li>
        </ul>
      </div>

      {/* Actions rapides */}
      <div className="mt-4 flex gap-2">
        <button 
          onClick={() => window.location.reload()}
          className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Actualiser
        </button>
        <button 
          onClick={() => {
            if (usage.messagesGlobal > 500) {
              if (confirm("Voulez-vous archiver les vieux messages ? (À implémenter)")) {
                // Implémenter l'archivage ici
              }
            }
          }}
          className="text-xs bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
        >
          Nettoyer
        </button>
      </div>
    </div>
  );
}