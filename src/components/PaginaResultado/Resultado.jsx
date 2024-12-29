import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../Firebase/Firebase';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Radar } from 'react-chartjs-2';
import 'chart.js/auto';

const MAX_PAGE_BUTTONS = 15; // Número máximo de botões de páginas visíveis

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const Resultados = () => {
  const { id } = useParams(); // Pega o ID do simulado
  const [simuladoData, setSimuladoData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [mediaTags, setMediaTags] = useState({});
  const location = useLocation();
  const [tempoFormatado, setTempoFormatado] = useState('00:00:00');

  const formatarTempo = (segundos) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segundosRestantes = segundos % 60;
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundosRestantes).padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, 'Simulados', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSimuladoData(data);

        if (data.tempoSimulado) {
          setTempoFormatado(formatarTempo(data.tempoSimulado));
        }
      } else {
        console.log('Nenhum documento encontrado!');
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (simuladoData) {
      const fetchQuestions = async () => {
        const questionsArray = await Promise.all(
          simuladoData.questoesSelecionadasIds.map(async (questionId) => {
            const questionRef = doc(db, 'Questoes', questionId);
            const questionSnap = await getDoc(questionRef);
            return { id: questionId, ...questionSnap.data() };
          })
        );
        setQuestions(questionsArray);
      };
      fetchQuestions();
    }
  }, [simuladoData]);

  // Função para calcular e salvar os resultados
  const calcularResultados = async () => {
    let acertosCount = 0;
    let errosCount = 0;
    let tagMap = {};

    simuladoData.questoesSelecionadasIds.forEach((id) => {
      const userAnswerIndex = simuladoData.respostas[id];
      const question = questions.find(q => q.id === id);
      const correctAnswerIndex = question.alternativaCorreta;

      if (userAnswerIndex === undefined) return;

      const acertou = userAnswerIndex === correctAnswerIndex;
      if (acertou) acertosCount++;
      else errosCount++;

      question.tags.forEach((tag) => {
        if (!tagMap[tag]) {
          tagMap[tag] = { acertos: 0, total: 0 };
        }
        tagMap[tag].total += 1;
        if (acertou) tagMap[tag].acertos += 1;
      });
    });

    const mediaTags = {};
    Object.keys(tagMap).forEach(tag => {
      mediaTags[tag] = (tagMap[tag].acertos / tagMap[tag].total) * 100;
    });

    // Salva os resultados no estado
    setAcertos(acertosCount);
    setErros(errosCount);
    setMediaTags(mediaTags);

    // Atualiza o documento no Firestore apenas se a página anterior for simulado
    if (location.state?.fromSimulado) {
      const simuladoRef = doc(db, 'Simulados', id);
      updateDoc(simuladoRef, {
        acertos: acertosCount,
        erros: errosCount,
        mediaTags: mediaTags,
      });
      console.log("Informações extras cadastradas no firestore.")
    }
  };

  const getPageNumbers = () => {
    const totalQuestions = questions.length;
    let startPage = Math.max(0, currentQuestionIndex - Math.floor(MAX_PAGE_BUTTONS / 2));
    let endPage = Math.min(totalQuestions - 1, startPage + MAX_PAGE_BUTTONS - 1);

    if (endPage - startPage < MAX_PAGE_BUTTONS - 1) {
      startPage = Math.max(0, endPage - MAX_PAGE_BUTTONS + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  useEffect(() => {
    if (simuladoData && questions.length > 0) {
      calcularResultados();
    }
  }, [simuladoData, questions]);

  const handleQuestionChange = (index) => {
    setCurrentQuestionIndex(index);
  };

  const getCurrentAnswer = (questionId) => {
    return simuladoData?.respostas ? simuladoData.respostas[questionId] : null;
  };

  const getCorrectAnswer = (question) => {
    return question.alternativaCorreta; // Índice da alternativa correta
  };

  // Dados doughtnut chart
  let data = [
    {
      label: "Corretas",
      value: acertos,
      color: "rgba(25, 135, 84, 1)",
      cutout: "50%",
    },
    {
      label: "Erradas",
      value: erros,
      color: "rgba(220, 53, 69, 1)",
      cutout: "50%",
    },
    {
      label: "Nulas",
      value: simuladoData?.questoesNulas,
      color: "rgba(92, 99, 106, 1)",
      cutout: "50%",
    },
  ]

  const options = {
    plugins: {
      datalabels: {
        formatter: function (value) {
          let val = Math.round(value);
          return new Intl.NumberFormat("tr-TR").format(val); //for number format
        },
        color: "white",

        font: {
          weight: 'bold',
          size: 14,
        },
      },
      responsive: true,
    },
    cutout: data.map((item) => item.cutout),
  };

  const finalData = {
    labels: data.map((item) => item.label),
    datasets: [
      {
        data: data.map((item) => Math.round(item.value)),
        backgroundColor: data.map((item) => item.color),
        borderColor: data.map((item) => item.color),
        borderWidth: 1,
        dataVisibility: new Array(data.length).fill(true),
      },
    ],
  };

  // Configuração do radar chart
  const radarData = {
    labels: Object.keys(mediaTags),
    datasets: [
      {
        label: 'Média de acertos (%) por disciplina',
        data: Object.values(mediaTags),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const radarOptions = {
    scales: {
      r: {
        angleLines: { display: false },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: { stepSize: 20, callback: (value) => `${value}%` },
      },
    },
    plugins: { legend: { display: true } },
    responsive: true,
  };

  return (
    <div className='pt-4'>
      <div className='text-center mb-4'>
        <h2>Resultados do simulado</h2>
        <p>Data: {simuladoData?.date?.toDate().toLocaleString() || 'N/A'}</p>
      </div>

      <div className='row'>
        <div className='col'>

          <div className='card'>
            <div className='card-header'>Desempenho do usuário</div>
            <div className='d-flex flex-col flex-column justify-content-center align-items-center m-4'>
              <h5>Número de questões: {questions.length}</h5>
              <h5>Questões respondidas: {simuladoData?.questoesRespondidas || 0}</h5>
              <div className=''>
                <h6>Corretas: {acertos}</h6>
                <h6>Erradas: {erros}</h6>
              </div>

              <h5>Questões nulas: {simuladoData?.questoesNulas}</h5>

              <div className='m-4'>
                {<Doughnut data={finalData} options={options} />}
              </div>
              <div className='mt-4'>
                <h6>Porcentagem total: {((acertos / simuladoData?.questoesRespondidas || 0) * 100).toFixed(2)}%</h6>
              </div>
            </div>
          </div>
        </div>

        <div className='col-6'>

          <div className='d-flex justify-content-center mt-3 gap-1'>
            {/* Ellipses à esquerda */}
            {questions.length > MAX_PAGE_BUTTONS && getPageNumbers()[0] > 0 && (
              <button className="btn rounded-pill" disabled>
                ...
              </button>
            )}

            {/* Botões de Paginação */}
            {getPageNumbers().map((index) => {
              const userAnswerIndex = getCurrentAnswer(questions[index].id);
              const correctAnswerIndex = getCorrectAnswer(questions[index]);
              const isCorrect = userAnswerIndex === correctAnswerIndex;

              return (
                <button
                  key={index}
                  onClick={() => handleQuestionChange(index)}
                  className={`btn ${currentQuestionIndex === index
                    ? isCorrect ? 'btn-success border-dark' : 'btn-danger border-dark'
                    : simuladoData?.respostas[questions[index].id] !== undefined
                      ? isCorrect ? 'btn-success' : 'btn-danger'
                      : 'btn-secondary'
                    } rounded-pill`}
                >
                  {index + 1}
                </button>
              );
            })}

            {/* Ellipses à direita */}
            {questions.length > MAX_PAGE_BUTTONS && getPageNumbers().slice(-1)[0] < questions.length - 1 && (
              <button className="btn rounded-pill" disabled>
                ...
              </button>
            )}
          </div>

          {questions.length > 0 ? (
            <>
              <div className='row mt-5'>
                <div>
                  <div dangerouslySetInnerHTML={{ __html: questions[currentQuestionIndex].textoBase }} />
                </div>
              </div>

              <div className='row d-flex m-4'>
                {questions[currentQuestionIndex].alternativas.map((alt, i) => {
                  const userAnswerIndex = getCurrentAnswer(questions[currentQuestionIndex].id);
                  const correctAnswerIndex = getCorrectAnswer(questions[currentQuestionIndex]);
                  const isUserAnswer = userAnswerIndex === i;
                  const isCorrect = correctAnswerIndex === i;

                  return (
                    <div className="form-check" key={i}>
                      <input
                        className={`form-check-input ${isUserAnswer && !isCorrect ? 'is-invalid' : ''} ${isCorrect ? 'is-valid' : ''}`}
                        type="radio"
                        name={`flexRadioDefault-${currentQuestionIndex}`}
                        id={`flexRadioDefault-${currentQuestionIndex}-${i}`}
                        checked={isUserAnswer}
                        readOnly
                      />
                      <label
                        className={`form-check-label ${isUserAnswer && !isCorrect ? 'text-danger' : ''} ${isCorrect ? 'text-success' : ''}`}
                        htmlFor={`flexRadioDefault-${currentQuestionIndex}-${i}`}
                        dangerouslySetInnerHTML={{ __html: alt }} // Renderiza o conteúdo como HTML
                      />
                    </div>
                  );
                })}
              </div>

              <div>
                <p>{questions[currentQuestionIndex].tipoProva} | {questions[currentQuestionIndex].anoProva} | Questão Nº {questions[currentQuestionIndex].numeroQuestao} | {questions[currentQuestionIndex].tags.join(', ')}</p>
              </div>

              <div className='row d-flex justify-content-between mt-4'>
                <div className='col-2'>
                  <button
                    type="button"
                    className={`btn btn-secondary btn-sm ms-2 ${currentQuestionIndex === 0 ? 'disabled' : ''}`}
                    disabled={currentQuestionIndex === 0}
                    onClick={() => handleQuestionChange(currentQuestionIndex - 1)}
                  >
                    Questão anterior
                  </button>
                </div>

                <div className='col-6 d-flex justify-content-center'>
                  <button
                    className="btn btn-outline-success"
                    disabled={true}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-clock" viewBox="0 0 20 20">
                      <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z" />
                      <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0" />
                    </svg>

                    {tempoFormatado}

                  </button>
                </div>

                <div className='col-2'>
                  <button
                    type="button"
                    className={`btn btn-success btn-sm ms-2 ${currentQuestionIndex === questions.length - 1 ? 'disabled' : ''}`}
                    disabled={currentQuestionIndex === questions.length - 1}
                    onClick={() => handleQuestionChange(currentQuestionIndex + 1)}
                  >
                    Próxima questão
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p>Nenhuma questão encontrada.</p>
          )}
        </div>

        <div className='col'>
          <div className='card'>
            <div className='card-header'>Desempenho por disciplina</div>
            <div className='d-flex flex-col flex-column justify-content-center align-items-center'>
              <Radar data={radarData} options={radarOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resultados;
