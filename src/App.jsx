import { useState, useEffect } from 'react';

// O endereço da sua API Spring Boot continua o mesmo!
const API_BASE_URL = 'http://localhost:8080/api/chamados';

function App() {
  // ==========================================
  // 1. ESTADOS (A Memória do React)
  // Em vez de variáveis soltas, usamos useState. 
  // Quando essas variáveis mudam, o React redesenha a tela sozinho!
  // ==========================================
  const [chamados, setChamados] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [ordenacao, setOrdenacao] = useState({ campo: 'dataAbertura', direcao: 'desc' });
  const [erro, setErro] = useState(null);

  // ==========================================
  // 2. BUSCANDO OS DADOS DA API
  // ==========================================
  const carregarFilaTI = async () => {
    try {
      const url = `${API_BASE_URL}?page=${paginaAtual}&size=10&sort=${ordenacao.campo},${ordenacao.direcao}`;
      const resposta = await fetch(url);
      
      if (!resposta.ok) throw new Error('Falha ao buscar os dados da API.');
      
      const dadosPaginados = await resposta.json();
      
      // Atualizamos a "memória". O React vai ver isso e atualizar o HTML automaticamente.
      setChamados(dadosPaginados.content);
      setTotalPages(dadosPaginados.totalPages === 0 ? 1 : dadosPaginados.totalPages);
      setErro(null);
    } catch (erro) {
      console.error(erro);
      setErro('Erro ao conectar com o servidor Java.');
    }
  };

  // useEffect substitui o nosso antigo "DOMContentLoaded". 
  // Ele avisa o React: "Sempre que a página ou a ordenação mudarem, rode essa função de carregar".
  useEffect(() => {
    carregarFilaTI();
  }, [paginaAtual, ordenacao]);

  // ==========================================
  // 3. AÇÕES (Assumir e Resolver)
  // ==========================================
  const assumirChamado = async (id) => {
    if (!window.confirm(`Deseja assumir o chamado #${id}?`)) return;
    try {
      await fetch(`${API_BASE_URL}/${id}/atender`, { method: 'PUT' });
      carregarFilaTI(); // Recarrega a lista para atualizar o status
    } catch (e) {
      alert("Erro ao assumir chamado.");
    }
  };

  const resolverChamado = async (id) => {
    if (!window.confirm(`Deseja resolver o chamado #${id}?`)) return;
    try {
      await fetch(`${API_BASE_URL}/${id}/resolver`, { method: 'PUT' });
      carregarFilaTI();
    } catch (e) {
      alert("Erro ao resolver chamado.");
    }
  };

  // Função para lidar com o clique no cabeçalho da tabela
  const mudarOrdenacao = (campo) => {
    setOrdenacao(prev => ({
      campo: campo,
      direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc'
    }));
    setPaginaAtual(0);
  };

  // ==========================================
  // 4. O VISUAL (JSX)
  // Aqui misturamos HTML com JavaScript usando as chaves { }
  // ==========================================
  return (
    <div>
      <header className="header-ti">
        <h1>EduSupport SMED - Central de TI</h1>
        <p>Visão do Técnico (React Edition 🚀)</p>
      </header>

      <main className="container">
        <section className="painel-listagem-ti">
          <h2>Fila de Atendimentos</h2>
          
          {erro && <p style={{ color: 'red', textAlign: 'center' }}>{erro}</p>}

          <table id="tabela-chamados">
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Status</th>
                <th onClick={() => mudarOrdenacao('prioridade')} style={{ cursor: 'pointer' }}>Prioridade ↕</th>
                <th onClick={() => mudarOrdenacao('dataAbertura')} style={{ cursor: 'pointer' }}>Data ↕</th>
                <th>Ações (TI)</th>
              </tr>
            </thead>
            <tbody>
              {/* O famoso .map()! Ele substitui o forEach e os insertRow() */}
              {chamados.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center' }}>Nenhum chamado no momento.</td></tr>
              ) : (
                chamados.map(chamado => (
                  <tr key={chamado.id}>
                    <td>{chamado.id}</td>
                    <td>{chamado.titulo}</td>
                    <td>
                      <span style={{ 
                        color: chamado.status === 'RESOLVIDO' ? 'green' : (chamado.status === 'EM_ANDAMENTO' ? 'orange' : 'red'),
                        fontWeight: 'bold' 
                      }}>
                        {chamado.status}
                      </span>
                    </td>
                    <td>{chamado.prioridade || '-'}</td>
                    <td>{chamado.dataAbertura ? new Date(chamado.dataAbertura).toLocaleDateString('pt-BR') : '-'}</td>
                    
                    {/* Botões Dinâmicos! */}
                    <td style={{ display: 'flex', gap: '10px' }}>
                      {chamado.status === 'ABERTO' && (
                        <button style={{ backgroundColor: '#ffc107', color: '#333' }} onClick={() => assumirChamado(chamado.id)}>
                          Assumir
                        </button>
                      )}
                      {chamado.status === 'EM_ANDAMENTO' && (
                        <button style={{ backgroundColor: '#28a745' }} onClick={() => resolverChamado(chamado.id)}>
                          Resolver
                        </button>
                      )}
                      {chamado.status === 'RESOLVIDO' && (
                        <span style={{ color: 'green' }}>✔ Finalizado</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Paginação */}
          <div className="paginacao">
            <button disabled={paginaAtual === 0} onClick={() => setPaginaAtual(prev => prev - 1)}>
              « Anterior
            </button>
            <span>Página {paginaAtual + 1} de {totalPages}</span>
            <button disabled={paginaAtual + 1 >= totalPages} onClick={() => setPaginaAtual(prev => prev + 1)}>
              Próxima »
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;