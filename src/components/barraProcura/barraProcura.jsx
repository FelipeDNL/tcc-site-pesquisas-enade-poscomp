// components/SearchBar.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Typesense from 'typesense';
import 'bootstrap/dist/css/bootstrap.min.css';
import './barraProcura.css';

// Configuração do Typesense
const client = new Typesense.Client({
  nodes: [
    {
      host: import.meta.env.VITE_TYPESENSE_API_HOST,  // Seu host do Typesense (ou da nuvem)
      port: import.meta.env.VITE_TYPESENSE_API_PORT,  // Porta do Typesense
      protocol: import.meta.env.VITE_TYPESENSE_API_PROTOCOL,
    }
  ],
  apiKey: import.meta.env.VITE_TYPESENSE_API_KEY_SEARCH_ONLY,          // Chave da API do Typesense - Chave Search Only
  connectionTimeoutSeconds: 2,
});

const barraProcura = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = async (e) => {
    if (e.key === 'Enter' && searchTerm) {
      try {
        // Verifica se o termo de busca é um número
        const isNumber = !isNaN(searchTerm);

        // Configuração da consulta
        const queryOptions = {
          q: isNumber ? '*' : searchTerm, // Usa '*' para buscas apenas com filtro
          query_by: 'alternativas,textoBase,tipoProva,tags',
          filter_by: isNumber
            ? `anoProva:=${searchTerm} || numeroQuestao:=${searchTerm}` // Busca por ano ou número da questão
            : undefined,
          per_page: 250, // Máximo permitido por Typesense
        };

        const searchResults = await client.collections('Questoes').documents().search(queryOptions);

        // Navega para a página de pesquisa, passando os resultados no estado
        navigate('/pesquisa', { state: { results: searchResults.hits.map((hit) => hit.document) } });
      } catch (error) {
        console.error('Erro na busca:', error);
      }
    }
  };

  return (
    <div>
      <input
        className="searchbar"
        type="text"
        placeholder="Procure a questão desejada aqui..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleSearch}
      />
    </div>
  );
};

export default barraProcura;
