import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import JoditEditor from 'jodit-react';
import CreatableSelect from "react-select/creatable";
import Swal from 'sweetalert2';
import { collection, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db, syncFirestoreToTypesense, auth } from '../../Firebase/Firebase';
import './RegistrarQuestoes.css'

const RegistrarQuestoes = ({ placeholder }) => {
  const editor = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  // ID da questão para edição
  const questaoId = location.state?.id || null;
  const user = auth.currentUser;
  const [content, setContent] = useState('');
  const [tipoProva, setTipoProva] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [numeroQuestao, setNumeroQuestao] = useState(0);
  const [anoProva, setAnoProva] = useState(0);
  const [alternativaA, setAlternativaA] = useState('');
  const [alternativaB, setAlternativaB] = useState('');
  const [alternativaC, setAlternativaC] = useState('');
  const [alternativaD, setAlternativaD] = useState('');
  const [alternativaE, setAlternativaE] = useState('');
  const [alternativaCorreta, setAlternativaCorreta] = useState(0);
  const isEditing = useMemo(() => !!questaoId, [questaoId]); // Verifica se está editando com base no valor inicial


  // Configuração para o editor de texto da questão
  const config = useMemo(() => ({
    readonly: false,
    placeholder: isEditing ? '' : 'Insira o texto base da questão...', // Sem placeholder se estiver editando
  }), [isEditing]);

  // Configuração para o editor das alternativas
  const alternativeConfig = useMemo(() => ({
    readonly: false,
    toolbarAdaptive: false,
    toolbarSticky: false,
    buttons: ['image', 'superscript', 'subscript'],
    placeholder: isEditing ? '' : 'Insira o texto da alternativa...',
    height: 50,
    width: '100%',
  }), [isEditing]);

  const disciplinaOptions = [
    { value: 'Complexidade de Algoritmos', label: 'Complexidade de Algoritmos' },
    { value: 'Linguagens Formais e Autômatos', label: 'Linguagens Formais e Autômatos' },
    { value: 'Circuitos Digitais', label: 'Circuitos Digitais' },
  ];

  const handleChange = (newValue) => {
    setSelectedTags(newValue);
  };

  // Recuperar dados da questão para edição
  useEffect(() => {
    if (questaoId) {
      const fetchQuestion = async () => {
        const docRef = doc(db, 'Questoes', questaoId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTipoProva(data.tipoProva || '');
          setSelectedTags(data.tags?.map(tag => ({ value: tag, label: tag })) || []);
          setNumeroQuestao(data.numeroQuestao || 0);
          setAnoProva(data.anoProva || 0);
          setContent(data.textoBase || '');
          setAlternativaA(data.alternativas[0] || '');
          setAlternativaB(data.alternativas[1] || '');
          setAlternativaC(data.alternativas[2] || '');
          setAlternativaD(data.alternativas[3] || '');
          setAlternativaE(data.alternativas[4] || '');
          setAlternativaCorreta(data.alternativaCorreta || 0);
        }
      };
      fetchQuestion();
    }
  }, [questaoId]);

  // Função para submeter o formulário e gerar o JSON
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Criar um array de alternativas
    const alternativas = [
      alternativaA,
      alternativaB,
      alternativaC,
      alternativaD,
      alternativaE
    ];

    if (!e.target.checkValidity()) {
      e.stopPropagation();
      e.target.classList.add('was-validated');
      return;
    }

    const questaoData = {
      tipoProva,
      tags: selectedTags.map(tag => tag.value),
      numeroQuestao: parseInt(numeroQuestao, 10),
      anoProva: parseInt(anoProva, 10),
      textoBase: content,
      alternativas,
      alternativaCorreta: parseInt(alternativaCorreta, 10),
      user: user.uid
    };

    try {
      if (questaoId) {
        // Atualiza questão existente
        await setDoc(doc(db, 'Questoes', questaoId), questaoData);
        Swal.fire('Sucesso!', 'Questão editada com sucesso!', 'success');

        syncFirestoreToTypesense()

        navigate('/');

      } else {
        // Adiciona a questão como um novo documento com ID automático
        await addDoc(collection(db, 'Questoes'), questaoData);

        Swal.fire('Sucesso!', 'Questão cadastrada com sucesso!', 'success');

        syncFirestoreToTypesense()

        // Recarrega página após cadastrar questão
        navigate('/')

        //console.log("Dados da questão:", JSON.stringify(questaoData, null, 2));
      }
    } catch (error) {
      console.error("Erro ao registrar a questão no Firestore:", error);

      Swal.fire({
        icon: "error",
        title: "Erro ao registrar a questão no Firestore.",
        text: error.message
      });
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center">
      <div className="col-xl-6">
        <div className="p-md-5 text-black">
          <h3 className="mb-5">{questaoId ? 'Editar questão' : 'Registrar questão'}</h3>
          <form className="row g-3 needs-validation" noValidate onSubmit={handleSubmit}>
            <div className="d-md-flex justify-content-start align-items-center mb-4 py-2">
              <h5 className="mb-0 me-4">Prova: </h5>

              <div className="form-check form-check-inline mb-0 me-4">
                <input
                  className="form-check-input"
                  type="radio"
                  name="tipoProva"
                  id="Enade"
                  value="Enade"
                  onChange={(e) => setTipoProva(e.target.value)}
                  checked={tipoProva === 'Enade'}
                  required
                />
                <label className="form-check-label" htmlFor="Enade">Enade</label>
                <div className="invalid-feedback">Por favor selecione uma opção.</div>
              </div>

              <div className="form-check form-check-inline mb-0 me-4">
                <input
                  className="form-check-input"
                  type="radio"
                  name="tipoProva"
                  id="POSCOMP"
                  value="POSCOMP"
                  onChange={(e) => setTipoProva(e.target.value)}
                  checked={tipoProva === 'POSCOMP'}
                  required
                />
                <label className="form-check-label" htmlFor="POSCOMP">POSCOMP</label>
                <div className="invalid-feedback">Por favor selecione uma opção.</div>
              </div>
            </div>

            {/* Campo de input para adicionar tags com autocompletar */}
            <div className="col-md-12 mb-4">

              <h5>Tags (disciplinas): </h5>
              <CreatableSelect
                isMulti
                value={selectedTags} // Tags selecionadas
                onChange={handleChange} // Atualiza as tags selecionadas
                options={disciplinaOptions} // Lista de disciplinas
                placeholder={isEditing ? '' : 'Digite a tag da questão...'} // Placeholder vazio se estiver editando
                className="react-select-container"
                classNamePrefix="react-select"
                required
              />
            </div>

            <div className="col-md-6 mb-4">
              <h5 className="form-label" htmlFor="numeroQuestao">Nº da questão:</h5>
              <input
                type="number"
                id="numeroQuestao"
                className="form-control"
                value={numeroQuestao}
                onChange={(e) => setNumeroQuestao(e.target.value)}
                min="1"
                required
              />
              <div className="invalid-feedback">Por favor insira o número da questão.</div>
            </div>

            <div className="col-md-6 mb-4">
              <h5 className="form-label" htmlFor="anoProva">Ano da prova:</h5>
              <input
                type="number"
                id="anoProva"
                className="form-control"
                value={anoProva}
                onChange={(e) => setAnoProva(e.target.value)}
                min="1900"
                max={new Date().getFullYear()}
                required
              />
              <div className="invalid-feedback">Por favor insira o ano da prova.</div>
            </div>

            <div className="mb-4">
              <h5>Texto base: </h5>
              <JoditEditor
                ref={editor}
                value={content}
                config={config}
                tabIndex={1}
                onBlur={newContent => setContent(newContent)}
              />
              <div className="invalid-feedback">O texto base é obrigatório.</div>
            </div>

            <div className="alternativasRegistro">
              <h5>Alternativas:</h5>
              <p>Adicione as alternativas individualmente e marque a correta:</p>
              {['A', 'B', 'C', 'D', 'E'].map((label, index) => (
                <div className="col-auto mb-3 alternativa-editor" key={label}>
                  <div className="input-group-text">
                    <input
                      className="form-check-input d-flex m-1"
                      type="radio"
                      name="alternativaCorreta"
                      value={index}
                      onChange={(e) => setAlternativaCorreta(Number(e.target.value))}
                      checked={alternativaCorreta === index}
                    /> Alternativa {label}
                  </div>
                  <JoditEditor
                    ref={editor}
                    value={eval(`alternativa${label}`)}
                    config={alternativeConfig}
                    tabIndex={1}
                    onBlur={(newContent) => eval(`setAlternativa${label}(newContent)`)}
                  />
                </div>
              ))}
            </div>

            <div className="d-flex justify-content-end pt-3">
              <button type="submit" className="btn btn-success btn-lg ms-2">
                Registrar questão
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrarQuestoes;
