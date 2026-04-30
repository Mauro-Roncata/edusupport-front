# EduSupport Frontend - SMED

Interface de usuário (SPA - Single Page Application) do sistema EduSupport, projetada para gerenciar o ciclo de vida dos chamados técnicos da Secretaria Municipal de Educação. O projeto oferece painéis de controle distintos e otimizados de acordo com o perfil do usuário logado (Diretoria de Escola vs. Equipe de TI).

## 📖 Sobre o Projeto

O frontend do EduSupport atua como a camada de interação da central de serviços de TI. A aplicação foi concebida com foco em usabilidade e redução de atrito: não há necessidade de preenchimento de formulários de registro ou criação de senhas. Ao acessar o sistema, o usuário é direcionado para a autenticação do Google Workspace. 

Após o login, a aplicação consome um endpoint de sessão da API para determinar o nível de acesso. Se for um e-mail de escola, a interface renderiza um ambiente focado na abertura rápida de chamados e acompanhamento de status. Se o e-mail pertencer à equipe de infraestrutura, o sistema revela um painel administrativo com controle de filas, paginação em tempo real e ações diretas sobre as demandas.

## 🚀 Tecnologias e Arquitetura

O projeto foi construído utilizando a biblioteca React, priorizando componentes funcionais e gerenciamento de estado local.

* **Biblioteca Core:** React 18
* **Roteamento:** React Router DOM v6
* **Estilização:** Inline CSS e Flexbox (arquitetura livre de dependências visuais pesadas)
* **Comunicação HTTP:** Native Fetch API com suporte a CORS e injeção automática de credenciais (Cookies de Sessão `JSESSIONID`).
* **Padrões de UI:** Conditional Rendering, Accordion Tables (Tabelas expansíveis), e Componentização.

## ⚙️ Principais Funcionalidades

* **Login Transparente (OAuth2 UI):** Tela de login simplificada que delega a autenticação para o provedor externo (Google), aguardando a resposta silenciosa do backend.
* **Roteamento Protegido:** Utilização do `react-router-dom` para blindar URLs (`/ti` e `/secretaria`). O acesso direto via barra de endereços é validado contra o perfil atual do usuário, redirecionando o tráfego não autorizado.
* **Tabelas Interativas (Sanfona):** Listagens de chamados com arquitetura de expansão detalhada (`React.Fragment`), permitindo a visualização de descrições complexas sem poluir a tabela principal.
* **Integração Dinâmica com a API:** 
  * Consumo de dados paginados (`Pageable` do Spring Boot).
  * Atualização dinâmica de ordenação via cliques nos cabeçalhos da tabela.
  * Captura e envio de objetos JSON (DTOs) padronizados.

## 🛠️ Como Executar

Para que o frontend funcione corretamente, é estritamente necessário que a [API do EduSupport (Backend)](https://github.com/seu-usuario/edusupport-api) esteja em execução local na porta `8080`.

1. Clone este repositório: `git clone https://github.com/seu-usuario/edusupport-frontend.git`
2. Certifique-se de ter o **Node.js** (v18+) instalado na sua máquina.
3. Acesse a pasta do projeto via terminal e instale as dependências:
   ```bash
   npm install
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   
```
5. A aplicação estará disponível no endereço `http://localhost:5173`.

## 🌐 Estrutura de Rotas

O sistema baseia-se na leitura do endpoint `/api/usuario/me` para liberar o acesso:

* `/` - Redirecionamento condicional inicial ou exibição da `<TelaLogin/>`.
* `/secretaria` - Área de atuação das escolas (Abertura e leitura de chamados próprios).
* `/ti` - Painel de controle da equipe técnica (Fila completa, filtros de prioridade e botões de ação 'Assumir'/'Resolver').