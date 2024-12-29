// ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import Swal from 'sweetalert2';

const ProtectedRoute = ({ children, papelNecessario }) => {
  const { user } = useUser();

  if (!user) {
    // Redireciona para a página de login se o usuário não estiver autenticado
    return <Navigate to="/login" replace />;
  }

  if (user.papel !== papelNecessario) {
    // Exibe uma mensagem de erro ou redireciona se o papel não for o necessário
    return Swal.fire({
        icon: 'warning',
        title: 'PARE.',
        text: 'Você não tem permissão para acessar essa página.',
    }), <Navigate to="/" replace />;
    
  }

  return children;
};

export default ProtectedRoute;

export const RotaProtegidaLogado = ({ children }) => {
  const { user } = useUser();

  if (user) {
    // Se o usuário estiver logado, redireciona para a página inicial
    return <Navigate to="/" replace />;
  }

  // Se o usuário não estiver logado, permite o acesso ao conteúdo da rota
  return children;
};

export const RotaProtegidaNaoLogado = ({ children }) => {
  const { user } = useUser();

  if (!user) {
    // Se o usuário não estiver logado, redireciona para a página inicial
    return <Navigate to="/login" replace />;
  }

  // Se o usuário não estiver logado, permite o acesso ao conteúdo da rota
  return children;
};
