import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from "sweetalert2";
import BarraProcura from '../../components/barraProcura/barraProcura.jsx';
import './Inicial.css'

const Inicial = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Função para verificar se o dispositivo é mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      // Verifica agentes típicos de dispositivos móveis
      const isMobileDevice = /android|webOS|iPhone|iPad|iPod|blackberry|IEMobile|Opera Mini/i.test(userAgent);
      setIsMobile(isMobileDevice);
    };

    checkMobile();

    // Exibe mensagem de aviso caso seja mobile
    if (isMobile) {
      Swal.fire({
        title: 'Atenção!',
        text: 'O site para dispositivos móveis ainda está em construção. Acesse via desktop para a melhor experiência.',
        icon: 'info',
        confirmButtonText: 'Entendi',
      });
    }
  }, [isMobile]);

  return (
    <div className="conteudo">
      <div className="typewriter pt-5 m-5">
        <h1>Bem-vindo!</h1>
      </div>
      <div className="d-flex justify-content-center align-items-center">
        <div className="fonte text-center">
          <p>Digite a questão, prova ou disciplina na barra de procura abaixo.</p>
          <p>Você pode refinar sua pesquisa colocando quantas palavras-chaves achar necessário.</p>
        </div>
      </div>

      <div className="bar vh-100">
        <BarraProcura />
      </div>

      <div className="col fonte">
        <Link to="/sobre">
          <button type="button" className="btn btn-outline-success my-2 my-sm-0 m-3">Sobre</button>
        </Link>
      </div>
    </div>
  );

}

export default Inicial