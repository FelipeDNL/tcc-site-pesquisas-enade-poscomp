import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, Timestamp, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../../Firebase/Firebase';
import Swal from 'sweetalert2';

const MAX_PAGE_BUTTONS = 15; // Máximo de botões visíveis na paginação

const Simulado = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { questoesSelecionadasIds, horas = 0, minutos = 0 } = location.state || {}; // Recebendo os IDs das questões selecionadas
  const [questoes, setQuestoes] = useState([]); // Estado para armazenar as questões recuperadas
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Estado para armazenar a questão atualmente selecionada
  const [respostas, setRespostas] = useState({}); // Estado para armazenar as respostas do usuário por questão
  const [isAutomatic, setIsAutomatic] = useState(false); // Controle de finalização automática

  const [tempoRestante, setTempoRestante] = useState(
    (horas || 0) * 3600 + (minutos || 0) * 60
  );// Timer: Inicializar como 0 se horas for inexistente ou 0
  const [timerAtivo, setTimerAtivo] = useState(false);

  const [horaInicio, setHoraInicio] = useState(null); // Variável para armazenar o horário de início
  const [horaFim, setHoraFim] = useState(null); // Variável para armazenar o horário de término
  const [tempoDecorrido, setTempoDecorrido] = useState(0); // Variável para armazenar o tempo decorrido em segundos

  // Função para iniciar o Timer
  const iniciarTimer = () => {
    if (tempoRestante > 0 && !timerAtivo) {
      setHoraInicio(new Date());
      setTimerAtivo(true);
    }
  };

  // Iniciar o timer quando a página carregar
  useEffect(() => {
    iniciarTimer();
  }, []);

  // Lógica do Timer
  useEffect(() => {
    if (timerAtivo && tempoRestante > 0) {
      const interval = setInterval(() => {
        setTempoRestante((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente ou pausar o timer
    } else if (timerAtivo && tempoRestante === 0) {
      setTimerAtivo(false); // Pausa o timer
      handleFinalizeSimulado(true); // Finaliza automaticamente o simulado
    }
  }, [timerAtivo, tempoRestante]);

  // Formatar o tempo para exibição (HH:MM:SS)
  const formatarTempo = (segundos) => {
    const h = String(Math.floor(segundos / 3600)).padStart(2, '0');
    const m = String(Math.floor((segundos % 3600) / 60)).padStart(2, '0');
    const s = String(segundos % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  useEffect(() => {
    if (questoesSelecionadasIds && questoesSelecionadasIds.length > 0) {
      const fetchQuestions = async () => {
        const questionPromises = questoesSelecionadasIds.map(async (id) => {
          const questionDoc = await getDoc(doc(db, 'Questoes', id));
          return questionDoc.exists() ? { id, ...questionDoc.data() } : null;
        });
        const questionResults = await Promise.all(questionPromises);
        setQuestoes(questionResults.filter(q => q !== null)); // Remover questões nulas
      };

      fetchQuestions();
    }
  }, [questoesSelecionadasIds]);

  const handleQuestionChange = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleAnswerChange = (questionId, selectedIndex) => {
    setRespostas((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: selectedIndex, // Armazena o índice da alternativa
    }));
  };

  const getCurrentAnswer = (questionId) => {
    return respostas[questionId] !== undefined ? respostas[questionId] : null;
  };

  const isQuestionAnswered = (questionId) => respostas[questionId] !== undefined;

  const getPageNumbers = () => {
    const totalQuestoes = questoes.length;
    let startPage = Math.max(0, currentQuestionIndex - Math.floor(MAX_PAGE_BUTTONS / 2));
    let endPage = Math.min(totalQuestoes - 1, startPage + MAX_PAGE_BUTTONS - 1);

    if (endPage - startPage < MAX_PAGE_BUTTONS - 1) {
      startPage = Math.max(0, endPage - MAX_PAGE_BUTTONS + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handleFinalizeSimulado = async () => {
    if (horaFim) return; // Previne múltiplas execuções

    // Se for finalização automática, chama diretamente o processo
    if (isAutomatic) {
      processFinalize();
    } else {
      // Exibe o confirm para o usuário
      const confirmFinalizar = window.confirm(
        'Você realmente deseja finalizar o simulado? Esta ação não pode ser desfeita.'
      );

      // Se o usuário clicar em "OK", finaliza o simulado
      if (confirmFinalizar) {
        processFinalize();
      }
    }
  };

  const processFinalize = async () => {
    // Registra o horário de término
    const fimSimulado = new Date();
    setHoraFim(fimSimulado);

    // Calcula o tempo decorrido
    const tempoEmSegundos = Math.floor((fimSimulado - horaInicio) / 1000);
    setTempoDecorrido(tempoEmSegundos);

    const questoesRespondidas = Object.keys(respostas).length;
    const questoesNulas = questoes.length - questoesRespondidas;

    // Supondo que você tem um usuário autenticado e o Firebase configurado
    const user = auth.currentUser;

    if (user) {
      const simuladoData = {
        questoesSelecionadasIds,
        questoesNulas,
        questoesRespondidas,
        respostas,
        date: Timestamp.now(),
        tempoSimulado: tempoEmSegundos,
        simuladoFeitoPor: user.uid,
      };

      try {
        const docRef = await addDoc(collection(db, 'Simulados'), simuladoData);

        const userDocRef = doc(db, 'Usuarios', user.uid);
        await updateDoc(userDocRef, {
          simuladosId: arrayUnion(docRef.id),
        });

        navigate(`/resultado/${docRef.id}`, { state: { fromSimulado: true } });
      } catch (error) {
        console.error('Erro ao registrar o simulado: ', error);
      }
    } else {
      console.error('Nenhum usuário logado!');
    }
  };

  return (
    <div className="p-4">
      <div className="row">
        <div className="col"></div>

        <div className="col-6">
          {/* Botões de Paginação */}
          <div className="d-flex justify-content-center mt-3 gap-1">
            {/* Ellipses à esquerda */}
            {questoes.length > MAX_PAGE_BUTTONS && getPageNumbers()[0] > 0 && (
              <button className="btn rounded-pill" disabled>
                ...
              </button>
            )}

            {/* Botões da Paginação */}
            {getPageNumbers().map((index) => (
              <button
                key={index}
                onClick={() => handleQuestionChange(index)}
                className={`btn ${currentQuestionIndex === index
                  ? 'btn-success border-dark'
                  : isQuestionAnswered(questoes[index].id)
                    ? 'btn-success'
                    : 'btn-secondary'
                  } rounded-pill`}
              >
                {index + 1}
              </button>
            ))}

            {/* Ellipses à direita */}
            {questoes.length > MAX_PAGE_BUTTONS && getPageNumbers().slice(-1)[0] < questoes.length - 1 && (
              <button className="btn rounded-pill" disabled>
                ...
              </button>
            )}
          </div>
          {questoes.length > 0 ? (
            <>
              {/* Exibição da Questão Atual */}
              <div className="row mt-5">
                <div>
                  <div dangerouslySetInnerHTML={{ __html: questoes[currentQuestionIndex].textoBase }} />
                </div>
              </div>

              {/* Alternativas da Questão */}
              <div className="row d-flex m-4">
                {questoes[currentQuestionIndex].alternativas.map((alt, i) => (
                  <div className="form-check" key={i}>
                    <input
                      className="form-check-input"
                      type="radio"
                      name={`flexRadioDefault-${currentQuestionIndex}`}
                      id={`flexRadioDefault-${currentQuestionIndex}-${i}`}
                      checked={getCurrentAnswer(questoes[currentQuestionIndex].id) === i}
                      onChange={() => handleAnswerChange(questoes[currentQuestionIndex].id, i)}
                    />
                    <p
                      dangerouslySetInnerHTML={{
                        __html: alt, // Coloca o conteúdo HTML diretamente nas alternativas
                      }}
                    ></p>
                  </div>
                ))}
              </div>

              <div>
                <p>
                  {questoes[currentQuestionIndex].tipoProva} | {questoes[currentQuestionIndex].anoProva} | Questão Nº{' '}
                  {questoes[currentQuestionIndex].numeroQuestao} | {questoes[currentQuestionIndex].tags.join(', ')}
                </p>
              </div>

              {/* Navegação entre Questões */}
              <div className="row mt-5">
                <div className='col-3 d-flex justify-content-center align-items-center'>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm ms-2"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => handleQuestionChange(currentQuestionIndex - 1)}
                  >
                    Questão anterior
                  </button>
                </div>

                <div className='col-6 d-flex justify-content-center align-items-center'>
                  <button
                    className="btn btn-outline-success"
                    disabled={true} // Desativa o botão
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-clock" viewBox="0 0 20 20">
                      <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z" />
                      <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0" />
                    </svg>

                    {formatarTempo(tempoRestante)}

                  </button>
                </div>

                <div className='col-3 d-flex justify-content-center align-items-center'>
                  <button
                    type="button"
                    className="btn btn-success btn-sm ms-2"
                    disabled={currentQuestionIndex === questoes.length - 1}
                    onClick={() => handleQuestionChange(currentQuestionIndex + 1)}
                  >
                    Próxima questão
                  </button>
                </div>
              </div>

              {/* Finalizar Simulado */}
              <div className='d-flex justify-content-center mt-3 me-2'>
                <button onClick={() => handleFinalizeSimulado(false)} className="btn btn-outline-success btn-sm ms-2">
                  Finalizar simulado
                </button>
              </div>
            </>
          ) : (
            <p>Nenhuma questão selecionada.</p>
          )}
        </div>

        <div className="col"></div>
      </div>
    </div>
  );
};

export default Simulado;