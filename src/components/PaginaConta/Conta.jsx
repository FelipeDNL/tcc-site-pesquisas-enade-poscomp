import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Radar, Pie } from 'react-chartjs-2';
import { getAuth, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider, sendEmailVerification } from 'firebase/auth';
import { collection, query, getDocs, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../Firebase/Firebase';
import Swal from 'sweetalert2';
import './Conta.css';
import 'chart.js/auto';

function Conta() {
  const [selectedPhoto, setSelectedPhoto] = useState('');
  const [showPhotoSelector, setShowPhotoSelector] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [totalRespondidas, setTotalRespondidas] = useState(0);
  const [totalCorretas, setTotalCorretas] = useState(0);
  const [totalErradas, setTotalErradas] = useState(0);
  const [mediaTags, setMediaTags] = useState({});
  const [simuladosData, setSimuladosData] = useState([]);
  const navigate = useNavigate();

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchSimuladosData = async () => {
      if (user) {
        const userDocRef = doc(db, 'Usuarios', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const { simuladosId } = userDocSnap.data();

          const simuladosInfo = [];
          const tagsSum = {};
          const tagsCount = {};
          let totalRespondidasCount = 0;
          let totalCorretasCount = 0;
          let totalErradasCount = 0;

          for (const simuladoId of simuladosId) {
            const simuladoDocRef = doc(db, 'Simulados', simuladoId);
            const simuladoDocSnap = await getDoc(simuladoDocRef);

            if (simuladoDocSnap.exists()) {
              const simuladoData = simuladoDocSnap.data();
              const {
                date,
                questoesRespondidas,
                acertos,
                erros,
                mediaTags: simuladoTags
              } = simuladoData;

              // Atualiza contagens totais
              totalRespondidasCount += questoesRespondidas;
              totalCorretasCount += acertos;
              totalErradasCount += erros;

              // Atualiza soma e contagem para cada tag
              Object.entries(simuladoTags || {}).forEach(([tag, media]) => {
                tagsSum[tag] = (tagsSum[tag] || 0) + media * questoesRespondidas;
                tagsCount[tag] = (tagsCount[tag] || 0) + questoesRespondidas;
              });

              const acertosPercent = ((acertos / questoesRespondidas) * 100).toFixed(2);
              simuladosInfo.push({
                date: new Date(date.seconds * 1000),
                acertosPercent,
                simuladoId
              });
            }
          }

          // Calcula as médias finais por tag
          const calculatedMediaTags = {};
          Object.entries(tagsSum).forEach(([tag, total]) => {
            calculatedMediaTags[tag] = (total / tagsCount[tag]).toFixed(2);
          });

          // Atualiza os estados
          setSimuladosData(simuladosInfo);
          setTotalRespondidas(totalRespondidasCount);
          setTotalCorretas(totalCorretasCount);
          setTotalErradas(totalErradasCount);
          setMediaTags(calculatedMediaTags);
        }
      }
    };

    fetchSimuladosData();
  }, [user]);


  const handlePhotoChange = async (newPhoto) => {
    setSelectedPhoto(newPhoto);
    const userDocRef = doc(db, 'Usuarios', user.uid);
    await updateDoc(userDocRef, { photoURL: newPhoto });
  };

  // Config line chart
  const chartData = {
    labels: simuladosData.map((simulado) => simulado.date.toLocaleDateString()),
    datasets: [
      {
        label: 'Média desse simulado',
        data: simuladosData.map((simulado) => simulado.acertosPercent),
        fill: false,
        borderColor: 'green',
        backgroundColor: 'green',
        tension: 0.1,
        borderWidth: 1
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        position: 'top',
      },
    },
    scales: {
      x: { title: { display: true, text: 'Data do simulado' } },
      y: {
        title: { display: true, text: 'Porcentagem de acertos (%)' },
        min: 0,
        max: 100,
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const elementIndex = elements[0].index;
        const simuladoId = simuladosData[elementIndex].simuladoId;

        // Redirecionar para a página do simulado correspondente
        navigate(`/resultado/${simuladoId}`);
      }
    },
  };

  // Configuração do radar chart
  const radarData = {
    labels: Object.keys(mediaTags),
    datasets: [
      {
        label: 'Média de Acertos (%) por Disciplina',
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
        ticks: {
          stepSize: 20,
          callback: (value) => `${value}%`,
        },
      },
    },
    plugins: { legend: { display: false } },
    responsive: true,
  };

  // Configuração Pie Cahrt
  const pieData = {
    labels: ['Acertos', 'Erros'],
    datasets: [
      {
        data: [totalCorretas, totalErradas],
        backgroundColor: ['#4CAF50', '#F44336'],
        hoverBackgroundColor: ['#66BB6A', '#EF5350'],
      },
    ],
  };

  const pieOptions = {
    responsive: true, // Gráfico responsivo
    maintainAspectRatio: false, // Permite que o gráfico preencha o contêiner
    plugins:
    {
      legend:
        { display: false }
    }
  };

  return (
    <div className='main m-3 d-flex'>

      <div className='parte1pai'>

        <div className='d-flex'>
          <div className='parte1 card mb-2'>
            <div className='card-header'>Usuário</div>
            <div className='text-center d-flex justify-content-evenly p-3'>
              <div className="position-relative d-inline-block">
                {/* Imagem do usuário */}
                <img
                  src={user.photoURL || 'default-user.jpg'}
                  alt="User"
                  className="rounded-circle mb-3"
                  width="100"
                  height="100"
                  style={{ objectFit: 'cover', border: '2px solid #ccc' }}
                />

                {/* Botão sobreposto para mudar a foto */}
                <button
                  className="btn btn-secondary btn-sm position-absolute"
                  style={{ bottom: '0', right: '0px', borderRadius: '50%' }}
                  onClick={() => setShowPhotoSelector(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" />
                  </svg>
                </button>
              </div>

              <div className='mt-3'>
                <p><strong>E-mail:</strong> {user.email}</p>
                <p><strong>Nome:</strong> {user.displayName}</p>
              </div>

            </div>

            {/* Modal para seleção de foto e edição de informações */}
            {showPhotoSelector && (
              <div className="photo-selector-overlay">
                <div className="photo-selector-modal">
                  <h5>Editar perfil</h5>
                  <div className="d-flex justify-content-around mt-3">
                    {/* Seleção de nova foto */}
                    {['./f1.jpeg', './f2.jpeg', './f3.jpeg'].map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`Foto ${idx + 1}`}
                        className="rounded-circle"
                        width="80"
                        height="80"
                        style={{ cursor: 'pointer', border: '2px solid #ccc' }}
                        onClick={() => handlePhotoChange(photo)}
                      />
                    ))}
                  </div>

                  {/* Formulário para edição de informações */}
                  <form
                    className="mt-4"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        const user = auth.currentUser;

                        // Reautentica o usuário antes de operações sensíveis
                        const credential = EmailAuthProvider.credential(user.email, currentPassword);
                        await reauthenticateWithCredential(user, credential);

                        // Atualiza o email e envia a verificação
                        if (newEmail) {
                          await updateEmail(user, newEmail);
                          await sendEmailVerification(user);
                          Swal.fire({
                            title: 'Email atualizado!',
                            text: 'Um email de verificação foi enviado. Por favor, verifique seu novo email.',
                            icon: 'success',
                            confirmButtonText: 'OK',
                          }).then(() => {
                            window.location.reload(); // Recarrega a página após clicar em OK
                          });
                        }

                        if (newPassword) {
                          await updatePassword(user, newPassword);
                          Swal.fire({
                            title: 'Senha atualizada!',
                            text: 'Sua nova senha foi salva com sucesso.',
                            icon: 'success',
                            confirmButtonText: 'OK',
                          }).then(() => {
                            window.location.reload(); // Recarrega a página após clicar em OK
                          });
                        }

                        Swal.fire({
                          title: 'Sucesso!',
                          text: 'Informações atualizadas com sucesso!',
                          icon: 'success',
                          confirmButtonText: 'OK',
                        }).then(() => {
                          window.location.reload(); // Recarrega a página após clicar em OK
                        });
                      } catch (error) {
                        console.error(error);
                        if (error.code === 'auth/wrong-password') {
                          Swal.fire({
                            title: 'Erro!',
                            text: 'A senha atual está incorreta.',
                            icon: 'error',
                          });
                        } else if (error.code === 'auth/operation-not-allowed') {
                          Swal.fire({
                            title: 'Erro!',
                            text: 'Alteração de email não está permitida. Verifique as configurações do Firebase.',
                            icon: 'error',
                          });
                        } else {
                          Swal.fire({
                            title: 'Erro!',
                            text: 'Erro ao atualizar informações.',
                            icon: 'error',
                          });
                        }
                      }
                    }}
                  >
                    <div className="form-group">
                      <label htmlFor="currentPassword">Senha atual</label>
                      <input
                        type="password"
                        id="currentPassword"
                        className="form-control"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group mt-2">
                      <label htmlFor="newEmail">Novo e-mail</label>
                      <input
                        type="email"
                        id="newEmail"
                        className="form-control"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                      />
                    </div>
                    <div className="form-group mt-2">
                      <label htmlFor="newPassword">Nova senha</label>
                      <input
                        type="password"
                        id="newPassword"
                        className="form-control"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary mt-3">
                      Salvar alterações
                    </button>
                  </form>


                  <button
                    className="btn btn-secondary mt-3"
                    onClick={() => setShowPhotoSelector(false)}
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className='card w-100 mb-2'>
            <div className='card-header'>Estatísticas totais | Questões</div>

            <div className="cartao mt-4">
              <div className="text-center">
                <h6>Respondidas</h6>
                <p className="text-muted">{totalRespondidas}</p>
              </div>
              <div className="text-center">
                <h6>Corretas</h6>
                <p className="text-success">{totalCorretas}</p>
              </div>
              <div className="text-center">
                <h6>Erradas</h6>
                <p className="text-danger">{totalErradas}</p>
              </div>
              <div>
                <div className='pie-chart-container'>
                  <Pie data={pieData} options={pieOptions} />
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className='card'>
          <div className='card-header'>Histórico de simulados</div>
          <div className='d-flex justify-content-center pt-3'>
            <p><small>Ao clicar em um vértice você será levado ao simulado feito no dia escolhido.</small></p>
          </div>
          <div className='parte2'>
            <div style={{ height: '100%', width: '95%' }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>


      </div>

      <div className='parte3'>
        <div className='card'>
          <div className='card-header'>Média de acertos (%) por disciplina</div>
          <div className='spider'>
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>
      </div>

    </div>
  );
}

export default Conta;
