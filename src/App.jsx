import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8080/api/chamados';

function App() {
  const [chamados, setChamados] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [ordenacao, setOrdenacao] = useState({ campo: 'dataAbertura', direcao: 'desc' });
  const [erro, setErro] = useState(null);

  // ==========================================
  // BUSCANDO OS DADOS DA API
  // ==========================================
  const carregarFilaTI = async () => {
    try {
      // ALTERAÇÃO 1 AQUI: Adicionamos sort=status,asc para os Resolvidos ficarem no final
      const url = `${API_BASE_URL}?page=${paginaAtual}&size=10&sort=status,asc&sort=${ordenacao.campo},${ordenacao.direcao}`;
      const resposta = await fetch(url);
      
      if (!resposta.ok) throw new Error('Falha ao buscar os dados da API.');
      
      const dadosPaginados = await resposta.json();
      setChamados(dadosPaginados.content);
      setTotalPages(dadosPaginados.totalPages === 0 ? 1 : dadosPaginados.totalPages);
      setErro(null);
    } catch (erro) {
      console.error(erro);
      setErro('Erro ao conectar com o servidor Java.');
    }
  };

  useEffect(() => {
    carregarFilaTI();
  }, [paginaAtual, ordenacao]);

  // ==========================================
  // AÇÕES E ORDENAÇÃO
  // ==========================================
  const assumirChamado = async (id) => {
    if (!window.confirm(`Deseja assumir o chamado #${id}?`)) return;
    try {
      await fetch(`${API_BASE_URL}/${id}/atender`, { method: 'PUT' });
      carregarFilaTI(); 
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

  const mudarOrdenacao = (campo) => {
    setOrdenacao(prev => ({
      campo: campo,
      direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc'
    }));
    setPaginaAtual(0);
  };


  // ==========================================
  // O VISUAL (JSX)
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
                    
                    {/* ALTERAÇÃO 2 AQUI: A Prioridade limpando o V1_ */}
                    <td>
                      {chamado.prioridade ? (
                        <span style={{ color: getCorPrioridade(chamado.prioridade), fontWeight: 'bold' }}>
                          {/* O .split('_')[1] pega tudo depois do underline. Ex: V1_ALTA vira ALTA */}
                          {chamado.prioridade.includes('_') ? chamado.prioridade.split('_')[1] : chamado.prioridade}
                        </span>
                      ) : '-'}
                    </td>

                    <td>{chamado.dataAbertura ? new Date(chamado.dataAbertura).toLocaleDateString('pt-BR') : '-'}</td>
                    
                    <td style={{ display: 'flex', gap: '10px' }}>
                      {chamado.status === 'ABERTO' && (
                        <button style={{ backgroundColor: '#ffc107', color: '#333', padding: '0.4rem 0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => assumirChamado(chamado.id)}>
                          Assumir
                        </button>
                      )}
                      {chamado.status === 'EM_ANDAMENTO' && (
                        <button style={{ backgroundColor: '#28a745', color: 'white', padding: '0.4rem 0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => resolverChamado(chamado.id)}>
                          Resolver
                        </button>
                      )}
                      {chamado.status === 'RESOLVIDO' && (
                        <span style={{ color: 'green', fontWeight: 'bold' }}>✔ Finalizado</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Paginação */}
          <div className="paginacao" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <button 
              disabled={paginaAtual === 0} 
              onClick={() => setPaginaAtual(prev => prev - 1)}
              style={{ padding: '0.5rem 1rem', cursor: paginaAtual === 0 ? 'not-allowed' : 'pointer' }}
            >
              « Anterior
            </button>
            <span style={{ alignSelf: 'center', fontWeight: 'bold' }}>Página {paginaAtual + 1} de {totalPages}</span>
            <button 
              disabled={paginaAtual + 1 >= totalPages} 
              onClick={() => setPaginaAtual(prev => prev + 1)}
              style={{ padding: '0.5rem 1rem', cursor: paginaAtual + 1 >= totalPages ? 'not-allowed' : 'pointer' }}
            >
              Próxima »
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;