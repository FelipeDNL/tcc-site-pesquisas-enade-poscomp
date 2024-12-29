import React, { useState, useEffect, useContext } from 'react';
import { auth, db } from '../Firebase/Firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';


// Criação do contexto
const UserContext = React.createContext();

// Hook para usar o contexto
export const useUser = () => {
  return useContext(UserContext);
};

// Função para obter dados do usuário no Firestore
const getUserData = async (userId) => {
  const userDoc = await getDoc(doc(db, 'Usuarios', userId));
  if (userDoc.exists()) {
    const data = userDoc.data();
    return {
      papel: data.papel,
      photoURL: data.photoURL,
    };
  }
  return { papel: null, photoURL: '/default-user.jpg' };
};

// Provider para envolver a aplicação
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        if (currentUser.emailVerified) {
          // Verifica o Firestore apenas se o e-mail foi verificado
          const { papel, photoURL } = await getUserData(currentUser.uid);
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            name: currentUser.displayName || 'Usuário',
            photoURL,
            papel,
          });
        } else {
          // Desloga automaticamente se o e-mail não foi verificado
          await signOut(auth);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const value = { user, login, logout };

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
};
