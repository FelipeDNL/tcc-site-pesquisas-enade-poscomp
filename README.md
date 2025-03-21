# Plataforma Web de Auxílio de Discentes e Docentes

Este projeto foi desenvolvido como Trabalho de Conclusão de Curso (TCC) em 2024 por alunos do IFSC - Campus Lages. O projeto teve um prazo de desenvolvimento de aproximadamente 5 a 6 meses. A plataforma foi criada utilizando o framework React, contando com Bootstrap para estilização, Firebase para gerenciamento de dados e autenticação, e Typesense para buscas rápidas e eficientes.

O objetivo da plataforma é facilitar o estudo e a preparação para os exames POSCOMP e Enade, proporcionando funcionalidades como a pesquisa detalhada de questões, a criação de simulados personalizados e a geração de relatórios de desempenho individual e geral, promovendo uma experiência de aprendizado mais direcionada e eficiente.

Este é o repositório público do projeto. O site está disponivel para uso a partir do link https://tcc-site-33c66.web.app/.

### 1 - Página inicial do site
![image](https://github.com/user-attachments/assets/71135bd0-82b6-43bb-971c-3a252d6c3572)

### 2 - Pesquisa de questões e customização dos simulados
![pesquisa](https://github.com/user-attachments/assets/6fd6088d-620c-4c20-bc98-510e4e27c06e)

### 3 - Realizando simulado
<p align="center">
  <img height='500' src="https://github.com/user-attachments/assets/c5b63d7d-4915-4fab-8a6f-5078594db206">
</p>

### 4 - Resultado do simulado
*nessa etapa é utilizado ChartJS para dar o feedback ao usuário
![simuladoResultado](https://github.com/user-attachments/assets/f0bf01f9-44c6-4c88-864a-7e4eb84610e9)

### 5 - Página de resultados gerais do usuário
*ChartJS também é usuado nessa página
![desempenhoUsuario](https://github.com/user-attachments/assets/4dc40024-74d8-400b-ad28-f0bdbea77995)

## Funcionalidades

- Pesquisa detalhada de questões por ano, disciplina, dificuldade e tipo de prova.
- Criação de simulados personalizados.
- Feedback imediato sobre respostas e relatórios de desempenho detalhados.
- Interface intuitiva e responsiva.
- Gerenciamento de níveis de acesso (admin e usuário).
- Sincronização de dados em tempo real com Firebase.

## Tecnologias Utilizadas

- **Frontend**: [React](https://react.dev) com suporte a componentes reutilizáveis e responsividade.
- **Backend**: [Firebase](https://firebase.google.com/), com Firestore para banco de dados NoSQL e Firebase Auth para autenticação.
- **Design e Protótipos**: [Figma](https://figma.com) para desenvolvimento de interfaces.
- **Gerenciamento de Projetos**: [Trello](https://trello.com) e metodologia Scrum.
- **Outras Ferramentas**: Typesense para buscas rápidas, Node.js para scripts de carregamento de dados e ChartJS para mostrar gráficos revelantes.

## Público-Alvo

- **Estudantes**: Facilita a prática e a revisão de conteúdos específicos para POSCOMP e Enade.
- **Professores**: Disponibiliza ferramentas para criar simulados e analisar o desempenho dos estudantes.

## Estrutura do Projeto

1. **Módulo de Autenticação do Usuário**:
   - Login seguro com Firebase Auth.
   - Registro de novos usuários com validações de segurança.
   - Recuperação de senha.

2. **Módulo de Questões**:
   - Cadastro e edição de questões para administradores.
   - Sincronização de questões com Typesense para busca eficiente.

3. **Módulo de Pesquisa e Simulados**:
   - Busca avançada por palavras-chave, tags, e filtros.
   - Geração de simulados personalizados.
   - Feedback e estatísticas detalhadas.

4. **Módulo de Relatórios e Desempenho**:
   - Dashboard de desempenho do usuário.
   - Gráficos dinâmicos para análise de acertos, erros e evolução ao longo do tempo.

## Testes e Usabilidade

O sistema foi avaliado utilizando o **System Usability Scale (SUS)**, obtendo uma pontuação média de **86,9**, considerada excelente. Feedbacks dos usuários ajudaram a identificar melhorias e validar as funcionalidades.

---

Desenvolvido por **Felipe Davi do Nascimento Lopes**, **Lucas Oliveira Bleyer** e orientado por **Edinilson da Silva Vida**.
