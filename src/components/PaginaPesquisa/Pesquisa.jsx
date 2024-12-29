import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db, client } from '../../Firebase/Firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { Pagination } from 'react-bootstrap';  // Importando o Pagination do Bootstrap
import { useUser } from '../../context/UserContext';
import Typesense from 'typesense';
import Swal from 'sweetalert2';
import './Pesquisa.css';

const Pesquisa = () => {
  const location = useLocation();
  const allResults = location.state?.results || []; // Todos os resultados passados
  const navigate = useNavigate();
  const { user } = useUser();

  // Estados
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [questoesSelecionadas, setQuestoesSelecionadas] = useState([]);
  const [mostrarRespostas, setMostrarRespostas] = useState(allResults.map(() => false));
  const [selecionarChecado, setSelecionarChecado] = useState(false);
  const [ITEMS_PER_PAGE, setItemsPerPage] = useState(5); // Valor inicial do dropdown
  const [timer, setTimer] = useState({ hours: 0, minutes: 0 }); // Estado para horas e minutos
  const MAX_PAGE_BUTTONS = 9; // Quantidade máxima de botões visíveis na paginação
  const MAX_SELECTED_QUESTIONS = 70; // Máximo de questões selecionadas

  const totalPaginas = Math.ceil(allResults.length / ITEMS_PER_PAGE);

  // Atualiza o número de itens por página dinamicamente
  useEffect(() => {
    setPaginaAtual(1); // Reinicia para a primeira página quando `itemsPerPage` muda
  }, [ITEMS_PER_PAGE]);

  // Calcula as questões exibidas na página atual
  const startIndex = (paginaAtual - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentResults = allResults.slice(startIndex, endIndex);

  // Seleciona ou desseleciona todas as questões na página atual
  const handleSelecionarTodas = () => {
    const pageIds = currentResults.map((q) => q.id);
    setQuestoesSelecionadas((prev) => {
      const newSelection = [...new Set([...prev, ...pageIds])];
      if (newSelection.length > MAX_SELECTED_QUESTIONS) {
        Swal.fire(
          'Limite atingido',
          `Você pode selecionar no máximo ${MAX_SELECTED_QUESTIONS} questões.`,
          'warning'
        );
        return prev; // Retorna o estado anterior se o limite for excedido
      }
      return newSelection;
    });
  };


  const handleDesselecionarTodas = () => {
    const pageIds = currentResults.map((q) => q.id);
    setQuestoesSelecionadas((prev) => prev.filter((id) => !pageIds.includes(id)));
  };

  // Lógica para mostrar os números de páginas
  const getPageNumbers = () => {
    let startPage = Math.max(1, paginaAtual - Math.floor(MAX_PAGE_BUTTONS / 2));
    let endPage = Math.min(totalPaginas, startPage + MAX_PAGE_BUTTONS - 1);

    if (endPage - startPage < MAX_PAGE_BUTTONS - 1) {
      startPage = Math.max(1, endPage - MAX_PAGE_BUTTONS + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      await deleteDoc(doc(db, 'Questoes', questionId));

      // Exclui a questão do Typesense
      await client.collections('Questoes').documents(questionId).delete();

      Swal.fire('Excluído!', 'A questão foi excluída com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao excluir questão:', error);
      Swal.fire('Erro!', 'Não foi possível excluir a questão. Tente novamente.', 'error');
    }
  };

  // Muda para uma nova página
  const handleMudarPagina = (newPage) => {
    setPaginaAtual(newPage);
    setSelecionarChecado(false);
  };

  // Alterna a exibição do gabarito
  const handleGabaritoClick = (index) => {
    setMostrarRespostas((prev) => {
      const newShowAnswers = [...prev];
      newShowAnswers[index + startIndex] = !newShowAnswers[index + startIndex];
      return newShowAnswers;
    });
  };

  // Converte índice em letra
  const getAlternativeLetter = (index) => ['A', 'B', 'C', 'D', 'E'][index] || '';

  const handleTimerChange = (e) => {
    const { name, value } = e.target;
    if (name === 'hours' || name === 'minutes') {
      const validValue = Math.max(0, Math.min(99, Number(value))); // Garantir que seja numérico
      setTimer({ ...timer, [name]: validValue });
    }
  };

  const handleStartSimulado = () => {
    const { hours, minutes } = timer;
    console.log({ questoesSelecionadas, horas: hours, minutos: minutes }); // Verificar o envio
    navigate('/simulado', { state: { questoesSelecionadasIds: questoesSelecionadas, horas: hours, minutos: minutes } });
  };

  function sanitizeAlternative(altIndex, alt) {
    // Remove quaisquer tags <p> que possam estar sendo adicionadas pelo HTML sanitizado
    const sanitizedAlt = alt.replace(/<p>/g, '').replace(/<\/p>/g, '');

    // Retorna a alternativa sem a tag <p>, com a letra da alternativa seguida do texto
    return `${getAlternativeLetter(altIndex)})&nbsp;${sanitizedAlt}`;
  }

  const handleCheckboxChange = (isChecked, questionId) => {
    setQuestoesSelecionadas((prev) => {
      if (isChecked) {
        if (prev.length >= MAX_SELECTED_QUESTIONS) {
          Swal.fire(
            'Limite atingido',
            `Você pode selecionar no máximo ${MAX_SELECTED_QUESTIONS} questões.`,
            'warning'
          );
          return prev;
        }
        return [...prev, questionId];
      } else {
        return prev.filter((id) => id !== questionId);
      }
    });
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value)); // Atualiza a quantidade de itens por página
  };

  return (
    <div className="pt-4">
      <div className="row">
        <div className="col"></div>
        <div className="col-6">
          <h4>Achado(s) {allResults.length} resultado(s):</h4>
          <hr className="hr hr-blurry" />

          {currentResults.length > 0 ? (
            <div>
              {currentResults.map((result, index) => (
                <div className="pb-4" key={result.id}>
                  <div className="d-flex">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`flexCheckDefault-${index}`}
                        disabled={!user}
                        checked={questoesSelecionadas.includes(result.id)}
                        onChange={(e) =>
                          handleCheckboxChange(e.target.checked, result.id)
                        }
                      />
                    </div>
                    <div>
                      <div dangerouslySetInnerHTML={{ __html: result.textoBase }} />
                    </div>
                  </div>

                  <div style={{ paddingLeft: '4%', paddingTop: '1%' }}>
                    <ul className="list-unstyled">
                      {result.alternativas.map((alt, altIndex) => (
                        <li key={altIndex}>
                          <span
                            dangerouslySetInnerHTML={{
                              __html: sanitizeAlternative(altIndex, alt),
                            }}
                          ></span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="row d-flex align-items-center">
                    <div style={{ paddingLeft: '3%', }}>
                      <p>
                        <small>
                          <em>
                            {result.tags.join(', ')} | {result.tipoProva} | {result.anoProva} | Questão Nº{' '}
                            {result.numeroQuestao}
                          </em>
                        </small>
                      </p>
                    </div>



                  </div>

                  <div className="row-4 d-flex justify-content-end">
                    {user?.papel === "professor" && (
                      <div className='col-7'>
                        <div className='btn-group' role="group" aria-label="botoes crud">
                          {/* Botão Editar */}
                          <button
                            type="button"
                            className="btn btn-outline-success btn-sm"
                            onClick={() => navigate('/registrarQuestoes', { state: { id: result.id } })}
                          >
                            Editar
                          </button>

                          {/* Botão Excluir */}
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => {
                              Swal.fire({
                                title: 'Excluir questão?',
                                text: 'Você tem certeza de que deseja excluir esta questão? Esta ação não pode ser desfeita.',
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonText: 'Sim, excluir',
                                cancelButtonText: 'Cancelar',
                                dangerMode: true,
                              }).then((dialogResult) => {
                                if (dialogResult.isConfirmed) {
                                  handleDeleteQuestion(result.id); // Passa o ID correto da questão
                                }
                              });
                            }}
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    )}
                    {mostrarRespostas[index + startIndex] && (
                      <div className='col-sm'>
                        <strong>Resposta correta:</strong>{'  '}
                        {getAlternativeLetter(result.alternativaCorreta)}
                      </div>
                    )}

                    <div className="col-sm d-flex justify-content-end">
                      <button
                        type="button"
                        className="btn btn-success btn-sm"
                        onClick={() => handleGabaritoClick(index)}
                      >
                        {mostrarRespostas[index + startIndex] ? 'Esconder gabarito' : 'Mostrar gabarito'}
                      </button>
                    </div>
                  </div>



                  <hr className="hr hr-blurry" />
                </div>
              ))}
            </div>
          ) : (
            <p>Nenhum resultado encontrado.</p>
          )}

          {/* Botões de paginação utilizando o Pagination do Bootstrap */}
          <div className="d-flex justify-content-center pb-5">
            <Pagination>
              <Pagination.Prev
                onClick={() => handleMudarPagina(paginaAtual - 1)}
                disabled={paginaAtual === 1}
              />
              {getPageNumbers().map((pageNumber) => (
                <Pagination.Item
                  key={pageNumber}
                  active={pageNumber === paginaAtual}
                  onClick={() => handleMudarPagina(pageNumber)}
                >
                  {pageNumber}
                </Pagination.Item>
              ))}
              {totalPaginas > MAX_PAGE_BUTTONS && paginaAtual < totalPaginas - Math.floor(MAX_PAGE_BUTTONS / 2) && (
                <Pagination.Ellipsis />
              )}
              <Pagination.Next
                onClick={() => handleMudarPagina(paginaAtual + 1)}
                disabled={paginaAtual === totalPaginas}
              />
            </Pagination>
          </div>
        </div>

        <div className="col cartao-opcoes">
          {!user ? (
            <div className="alerta-login">
              <p>Faça login ou registre-se para montar seus próprios simulados.</p>
            </div>
          ) : (
            <div className="card opcoes">
              <div className="card-header">Opções</div>
              <div className="mt-2">

                <div className="d-flex flex-column align-items-center m-2">
                  <p>Defina o tempo do simulado</p>
                  <div className="d-flex gap-3">

                    <div>
                      <label htmlFor="hours" className="form-label">Horas</label>
                      <input
                        type="number"
                        id="hours"
                        name="hours"
                        value={timer.hours || 0}
                        onChange={handleTimerChange}
                        className="form-control"
                        min="0"
                        max="99"
                      />
                    </div>

                    <div>
                      <label htmlFor="minutes" className="form-label">Minutos</label>
                      <input
                        type="number"
                        id="minutes"
                        name="minutes"
                        value={timer.minutes || 0}
                        onChange={handleTimerChange}
                        className="form-control"
                        min="0"
                        max="59"

                      />
                    </div>

                  </div>

                  <p><small><small>*Caso não queira um simulado com tempo deixe horas e minutos em 0.</small></small></p>
                </div>

                <hr className="hr hr-blurry" />

                <div className="m-2">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="selectAll"
                      disabled={!user}
                      checked={selecionarChecado} // Controla o estado com o estado local
                      onChange={(e) => {
                        setSelecionarChecado(e.target.checked); // Atualiza o estado do checkbox
                        if (e.target.checked) {
                          handleSelecionarTodas();
                        } else {
                          handleDesselecionarTodas();
                        }
                      }}
                    />
                    <label className="form-check-label" htmlFor="selectAll">
                      Selecionar/Deselecionar todas as questões.
                    </label>
                  </div>
                </div>

                <hr className="hr hr-blurry" />

                {/* Dropdown para selecionar o número de questões por página */}
                <div className="d-flex mb-3 ps-4 pe-4 align-items-end">

                  <div htmlFor="itemsPerPageSelect" className="form-label ms-2 pe-2">
                    Quantidade de questões por página:
                  </div>

                  <select
                    id="itemsPerPageSelect"
                    className="form-select"
                    value={ITEMS_PER_PAGE}
                    onChange={handleItemsPerPageChange}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                    <option value={25}>25</option>
                  </select>

                </div>

                <hr className="hr hr-blurry" />

                <div className="quadro">
                  <p>Quantidade de questões selecionadas: {questoesSelecionadas.length}</p>
                  <button
                    type="button"
                    className="btn btn-success"
                    disabled={!user || questoesSelecionadas.length === 0}
                    onClick={handleStartSimulado}
                  >
                    <label>Iniciar simulado</label>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pesquisa;
