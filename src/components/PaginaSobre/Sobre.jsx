import React from 'react';
import { Link } from 'react-router-dom';

const Sobre = () => {

  return (
    <div className="container mt-4">
      <h1>Sobre esse projeto</h1>
      <p>
        Este projeto foi desenvolvido como Trabalho de Conclusão de Curso (TCC) em 2024 por alunos do IFSC - Campus Lages. O projeto teve um prazo de desenvolvimento de aproximadamente 5 a 6 meses. A plataforma foi criada utilizando o framework React, contando com Bootstrap para estilização, Firebase para gerenciamento de dados e autenticação, e Typesense para buscas rápidas e eficientes.
      </p>
      <p>
        O objetivo da plataforma é facilitar o estudo e a preparação para os exames POSCOMP e Enade, proporcionando funcionalidades como a pesquisa detalhada de questões, a criação de simulados personalizados e a geração de relatórios de desempenho individual e geral, promovendo uma experiência de aprendizado mais direcionada e eficiente.
      </p>

      <div className='gap-2 d-md-flex justify-content-center mt-3'>
        <Link>
          <button type="button" className="btn btn-outline-success">Link para o artigo</button>
        </Link>

        <Link to='https://github.com/FelipeDNL/TCC-SitePesquisaEnadePOSCOMP' target="_blank">
          <button type="button" className="btn btn-outline-success">Link para o reposítório publico do projeto</button>
        </Link>
      </div>
      <div className="row d-flex justify-content-between mt-3">

        <div className='col-md-3'>
          <div className='text-center mt-2'>
            <h1>Orientador</h1>
            <img className='rounded-circle img-thumbnail img-fluid' src="/edinilson.jfif" alt="Foto do contribuidor Felipe" />
            <div className='mt-2'>
              <h4>Edinilson da Silva Vida</h4>
              <a href="mailto:some@email.com" target="_blank" >edinilson.vida@ifsc.edu.br</a>
              <p className='mt-2'>Orientador do projeto</p>


              <div className='row d-flex justify-content-center'>
                <div className='col-2'>
                  <Link to="https://github.com/edinilsonvida" target="_blank">
                    <button type="button" class="btn btn-secondary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-github" viewBox="0 0 16 16">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"></path>
                      </svg>
                    </button>
                  </Link>
                </div>

                <div className='col-2'>
                  <Link to="https://www.linkedin.com/in/edinilsonvida" target="_blank">
                    <button type="button" class="btn btn-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-linkedin" viewBox="0 0 16 16">
                        <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"></path>
                      </svg>
                    </button>
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </div>

        <div className='col-md-3'>
          <div className='text-center mt-2'>
            <h1>Aluno</h1>
            <img className='rounded-circle img-thumbnail img-fluid' src="/felipe.jfif" alt="Foto do contribuidor Felipe" />
            <div className='mt-2'>
              <h4>Felipe Davi</h4>
              <a href="mailto:some@email.com" target="_blank" >felipe.dn@aluno.ifsc.edu.br</a>
              <p className='mt-2'>Desenvolvedor Full Stack</p>


              <div className='row d-flex justify-content-center'>
                <div className='col-2'>
                  <Link to="https://github.com/FelipeDNL" target="_blank">
                    <button type="button" class="btn btn-secondary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-github" viewBox="0 0 16 16">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"></path>
                      </svg>
                    </button>
                  </Link>
                </div>

                <div className='col-2'>
                  <Link to="https://www.linkedin.com/in/felipednl/" target="_blank">
                    <button type="button" class="btn btn-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-linkedin" viewBox="0 0 16 16">
                        <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"></path>
                      </svg>
                    </button>
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </div>

        <div className='col-md-3'>
          <div className='text-center mt-2'>
            <h1>Aluno</h1>
            <img className='rounded-circle img-thumbnail img-fluid' src="/lucas.jfif" alt="Foto do contribuidor Felipe" />
            <div className='mt-2'>
              <h4>Lucas Bleyer</h4>
              <a href="mailto:some@email.com" target="_blank" >lucas.b2003@aluno.ifsc.edu.br</a>
              <p className='mt-2'>Organizador do artigo</p>


              <div className='row d-flex justify-content-center'>
                <div className='col-2'>
                  <Link to="https://github.com/LucasBleyer" target="_blank">
                    <button type="button" class="btn btn-secondary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-github" viewBox="0 0 16 16">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"></path>
                      </svg>
                    </button>
                  </Link>
                </div>

                <div className='col-2'>
                  <Link to="https://www.linkedin.com/in/lucas-oliveira-bleyer-208774224/" target="_blank">
                    <button type="button" class="btn btn-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-linkedin" viewBox="0 0 16 16">
                        <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"></path>
                      </svg>
                    </button>
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );

};

export default Sobre;