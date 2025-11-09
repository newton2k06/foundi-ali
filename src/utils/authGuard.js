// src/utils/authGuard.js
import { auth, db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";

/**
 * Vérifie si l'utilisateur est autorisé à accéder à la page
 * @param {string} requiredRole - 'superuser', 'eleve', ou null pour tout utilisateur connecté
 * @returns {Object} { authorized: boolean, userData: Object, redirectTo: string }
 */
export const verifyAuth = async (requiredRole = null) => {
  try {
    const user = auth.currentUser;
    
    // Vérifier si l'utilisateur est connecté
    if (!user) {
      return { 
        authorized: false, 
        userData: null, 
        redirectTo: "/LoginForm" 
      };
    }

    // Récupérer les données utilisateur depuis Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      return { 
        authorized: false, 
        userData: null, 
        redirectTo: "/LoginForm" 
      };
    }

    const userData = userDoc.data();

    // Vérifier le statut du compte
    if (userData.status !== "active") {
      return { 
        authorized: false, 
        userData: null, 
        redirectTo: "/LoginForm" 
      };
    }

    // Vérifier le rôle si spécifié
    if (requiredRole && userData.role !== requiredRole) {
      // Rediriger vers la page appropriée selon le rôle
      const redirectTo = userData.role === "superuser" ? "/admin" : "/dashboard";
      return { 
        authorized: false, 
        userData, 
        redirectTo 
      };
    }

    // Autorisation accordée
    return { 
      authorized: true, 
      userData, 
      redirectTo: null 
    };

  } catch (error) {
    console.error("Erreur de vérification d'authentification:", error);
    return { 
      authorized: false, 
      userData: null, 
      redirectTo: "/LoginForm" 
    };
  }
};

/**
 * Hook personnalisé pour la protection des pages
 */
export const useAuthGuard = (requiredRole = null) => {
  const [authState, setAuthState] = useState({
    loading: true,
    authorized: false,
    userData: null
  });

  useEffect(() => {
    const checkAuth = async () => {
      const result = await verifyAuth(requiredRole);
      setAuthState({
        loading: false,
        authorized: result.authorized,
        userData: result.userData
      });
      return result;
    };

    checkAuth();
  }, [requiredRole]);

  return authState;
};