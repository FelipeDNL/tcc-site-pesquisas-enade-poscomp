import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { UserProvider } from '../context/UserContext';

import LayoutBase from '../layouts/LayoutBase';
import Inicial from '../pages/PaginaInicial';
import PaginaLogin from '../pages/PaginaLogin';
import PaginaRegistrarConta from '../pages/PaginaRegistrarConta';
import PaginaPesquisa from '../pages/PaginaPesquisa';
import PaginaRegistrarQuestoes from '../pages/PaginaRegistrarQuestoes';
import PaginaSimulado from '../pages/PaginaSimulado';
import PaginaResultado from '../pages/PaginaResultado';
import PaginaConta from '../pages/PaginaConta';
import PaginaSobre from '../pages/PaginaSobre';

import ProtectedRoute from './ProtectedRoute/ProtectedRoute';
import { RotaProtegidaLogado } from './ProtectedRoute/ProtectedRoute';
import { RotaProtegidaNaoLogado } from './ProtectedRoute/ProtectedRoute';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <LayoutBase>
          <Routes>

            <Route path="/" element={<Inicial />} />

            <Route
              path="/login"
              element={
                <RotaProtegidaLogado>
                  <PaginaLogin />
                </RotaProtegidaLogado>
              }
            />
            <Route
              path="/registrarConta"
              element={
                <RotaProtegidaLogado>
                  <PaginaRegistrarConta />
                </RotaProtegidaLogado>
              }
            />

            <Route
              path='/conta'
              element={
                <RotaProtegidaNaoLogado>
                  <PaginaConta />
                </RotaProtegidaNaoLogado>
              }
            />

            <Route path="/pesquisa" element={<PaginaPesquisa />} />

            <Route
              path="/registrarQuestoes"
              element={
                <ProtectedRoute papelNecessario="professor">
                  <PaginaRegistrarQuestoes />
                </ProtectedRoute>
              }
            />

            <Route path="/simulado" element={<PaginaSimulado />} />
            <Route path="/resultado/:id" element={<PaginaResultado />} />
            <Route path="/sobre" element={<PaginaSobre />} />

          </Routes>
        </LayoutBase>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
