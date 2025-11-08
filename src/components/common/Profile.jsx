// src/components/Profile.jsx
import { useState, useEffect } from 'react';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, updateEmail } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';

export default function Profile() {
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  
  // États pour les formulaires
  const [passwordForm, setPasswordForm] = useState({ 
    currentPassword: '', 
    newPassword: '', 
    confirmPassword: '' 
  });
  
  const [profileForm, setProfileForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    serie: ''
  });

  // Charger les données du profil
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserProfile(data);
            setProfileForm({
              nom: data.nom || '',
              prenom: data.prenom || '',
              email: data.email || user.email || '',
              serie: data.serie || ''
            });
          }
        } catch (error) {
          console.error('Erreur chargement profil:', error);
          setMessage('Erreur lors du chargement du profil');
        }
      }
    };
    loadUserProfile();
  }, [user]);

  // Réauthentification nécessaire pour les opérations sensibles
  const reauthenticate = async (password) => {
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
  };

  // Modifier le mot de passe
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    // Validations
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('❌ Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage('❌ Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    try {
      // Réauthentification avec le mot de passe actuel
      await reauthenticate(passwordForm.currentPassword);
      
      // Mise à jour du mot de passe
      await updatePassword(user, passwordForm.newPassword);
      
      setMessage('✅ Mot de passe mis à jour avec succès !');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Erreur mise à jour mot de passe:', error);
      
      // Gestion des erreurs spécifiques
      if (error.code === 'auth/wrong-password') {
        setMessage('❌ Mot de passe actuel incorrect');
      } else if (error.code === 'auth/weak-password') {
        setMessage('❌ Le mot de passe est trop faible');
      } else if (error.code === 'auth/requires-recent-login') {
        setMessage('❌ Veuillez vous reconnecter avant de changer votre mot de passe');
      } else {
        setMessage(`❌ Erreur: ${error.message}`);
      }
    }
    setLoading(false);
  };

  // Modifier les informations du profil
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const userRef = doc(db, 'users', user.uid);
      
      // Mettre à jour Firestore
      await updateDoc(userRef, {
        nom: profileForm.nom,
        prenom: profileForm.prenom,
        email: profileForm.email,
        serie: profileForm.serie,
        updatedAt: new Date()
      });

      // Mettre à jour l'email dans Firebase Auth si l'email a changé
      if (profileForm.email !== user.email) {
        await updateEmail(user, profileForm.email);
      }
      
      setMessage('✅ Profil mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      
      if (error.code === 'auth/requires-recent-login') {
        setMessage('❌ Veuillez vous reconnecter avant de modifier votre email');
      } else {
        setMessage(`❌ Erreur: ${error.message}`);
      }
    }
    setLoading(false);
  };

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Mon Profil</h1>
      
      {/* Message de statut */}
      {message && (
        <div className={`p-4 mb-6 rounded-lg ${
          message.includes('❌') ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Informations du profil */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Informations personnelles</h2>
          
          {/* Affichage des informations non modifiables */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-3">Informations système</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Statut:</span>
                <span className={`font-medium ${
                  userProfile.status === 'active' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {userProfile.status === 'active' ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rôle:</span>
                <span className="font-medium text-blue-600 capitalize">{userProfile.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date de création:</span>
                <span className="font-medium text-gray-700">
                  {userProfile.createdAt?.toDate?.().toLocaleDateString('fr-FR') || '8 novembre 2025'}
                </span>
              </div>
            </div>
          </div>

          {/* Formulaire modification profil */}
          <form onSubmit={handleUpdateProfile}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profileForm.nom}
                  onChange={(e) => setProfileForm({...profileForm, nom: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profileForm.prenom}
                  onChange={(e) => setProfileForm({...profileForm, prenom: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Série</label>
                <select
                  value={profileForm.serie}
                  onChange={(e) => setProfileForm({...profileForm, serie: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionnez une série</option>
                  <option value="A">Série A</option>
                  <option value="B">Série B</option>
                  <option value="C">Série C</option>
                  <option value="D">Série D</option>
                  <option value="E">Série E</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6 bg-blue-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Mise à jour...
                </>
              ) : (
                '📝 Modifier le profil'
              )}
            </button>
          </form>
        </div>

        {/* Modification du mot de passe */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Modifier le mot de passe</h2>
          
          <form onSubmit={handleUpdatePassword}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe actuel <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="Entrez votre mot de passe actuel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau mot de passe <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  minLength={6}
                  placeholder="Au moins 6 caractères"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le nouveau mot de passe <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="Retapez le nouveau mot de passe"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6 bg-green-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Mise à jour...
                </>
              ) : (
                '🔒 Modifier le mot de passe'
              )}
            </button>
          </form>

          {/* Conseils de sécurité */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-800 mb-2">💡 Conseils de sécurité</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Utilisez au moins 6 caractères</li>
              <li>• Combinez lettres, chiffres et caractères spéciaux</li>
              <li>• Évitez les mots de passe facilement devinables</li>
              <li>• Ne réutilisez pas d'anciens mots de passe</li>
            </ul>
          </div>

          {/* Note importante */}
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-700">
              <strong>Note :</strong> La modification du mot de passe nécessite une reconnexion récente. 
              Si vous rencontrez une erreur, déconnectez-vous et reconnectez-vous puis réessayez.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}