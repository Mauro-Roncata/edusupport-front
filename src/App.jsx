
import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8080/api/chamados';

// =========================================================================
// 1. TELA DA SECRETARIA / DIRETORA (Modo Abertura e Leitura)
// =========================================================================
function PainelSecretaria() {
  const [chamados, setChamados] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [prioridade, setPrioridade] = useState('V2_MEDIA'); // Estado para a prioridade
  const [idExpandido, setIdExpandido] = useState(null);

  const carregarMeusChamados = async () => {
    try {
      const resposta = await fetch(`${API_BASE_URL}?page=0&size=20&sort=dataAbertura,desc`);
      const dados = await resposta.json();
      setChamados(dados.content);
    } catch (erro) {
      console.error(erro);
    }
  };

  useEffect(() => {
    carregarMeusChamados();
  }, []);

  const abrirChamado = async (e) => {
    e.preventDefault();
    
    // Objeto completo para o Java
    const novoChamado = {
      titulo: titulo,
      descricao: descricao,
      categoria: categoria,
      prioridade: prioridade 
    };

    try {
      const resposta = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoChamado)
      });

      if (resposta.ok) {
        alert('Chamado aberto com sucesso!');
        setTitulo('');
        setCategoria('');
        setPrioridade('V2_MEDIA');
        carregarMeusChamados();
      } else {
        alert('Erro ao abrir chamado. Verifique os campos.');
      }
    } catch (erro) {
      alert('Erro de conexão.');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '800px', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h2>Abrir Novo Chamado</h2>
        <form onSubmit={abrirChamado} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* CAMPO TITULO */}
          <div>
            <label style={{ fontWeight: 'bold' }}>Título do Problema:</label>
            <input 
              type="text" 
              value={titulo} 
              onChange={(e) => setTitulo(e.target.value)} 
              required 
              style={{ width: '100%', padding: '0.6rem', marginTop: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="Ex: Impressora da secretaria travada"
            />
          </div>

          {/* CAMPO DESCRICAO */}
          <div>
            <label style={{ fontWeight: 'bold' }}>Descrição do Problema:</label>
            <input 
              type="text" 
              value={descricao} 
              onChange={(e) => setDescricao(e.target.value)} 
              required 
              style={{ width: '100%', padding: '0.6rem', marginTop: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="Ex: ChromeBook não liga e nem carrega..."
            />
          </div>


          {/* CAMPO CATEGORIA */}
          <div>
            <label style={{ fontWeight: 'bold' }}>Categoria:</label>
            <select 
              value={categoria} 
              onChange={(e) => setCategoria(e.target.value)} 
              required
              style={{ width: '100%', padding: '0.6rem', marginTop: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="">Selecione...</option>
              <option value="REDE_INTERNET">Rede / Internet</option>
              <option value="HARDWARE">Equipamento / Hardware</option>
              <option value="IMPRESSORA">Impressora</option>
              <option value="SOFTWARE">Sistemas / Software</option>
            </select>
          </div>

          {/* NOVO CAMPO PRIORIDADE */}
          <div>
            <label style={{ fontWeight: 'bold' }}>Urgência / Prioridade:</label>
            <select 
              value={prioridade} 
              onChange={(e) => setPrioridade(e.target.value)} 
              required
              style={{ width: '100%', padding: '0.6rem', marginTop: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="V1_ALTA">Alta (Impacta a escola inteira)</option>
              <option value="V2_MEDIA">Média (Impacta uma sala/setor)</option>
              <option value="V3_BAIXA">Baixa (Dúvida ou ajuste simples)</option>
            </select>
          </div>

          <button type="submit" style={{ backgroundColor: '#0056b3', color: 'white', padding: '1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '1rem' }}>
            Registrar Chamado
          </button>
        </form>
      </section>


      {/* Tabela de Leitura (SEM botões de ação) */}
      <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '800px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h2>Meus Chamados Recentes</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
              <th>ID</th>
              <th>Título</th>
              <th>Status</th>
              <th>Categoria</th>
            </tr>
          </thead>
          <tbody>
            {chamados.map(chamado => (
              <tr key={chamado.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem 0' }}>{chamado.id}</td>
                <td>{chamado.titulo}</td>
                <td>
                  <span style={{ color: chamado.status === 'RESOLVIDO' ? 'green' : (chamado.status === 'EM_ANDAMENTO' ? 'orange' : 'red'), fontWeight: 'bold' }}>
                    {chamado.status}
                  </span>
                </td>
                <td>{chamado.categoria ? chamado.categoria.replace('_', ' ') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

// =========================================================================
// 2. TELA DA TI (A sua tela completa, intocada!)
// =========================================================================
function PainelTI() {
  const [chamados, setChamados] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [ordenacao, setOrdenacao] = useState({ campo: 'dataAbertura', direcao: 'desc' });
  const [idExpandido, setIdExpandido] = useState(null);

  const carregarFilaTI = async () => {
    try {
      const url = `${API_BASE_URL}?page=${paginaAtual}&size=10&sort=status,asc&sort=${ordenacao.campo},${ordenacao.direcao}`;
      const resposta = await fetch(url);
      const dadosPaginados = await resposta.json();
      setChamados(dadosPaginados.content);
      setTotalPages(dadosPaginados.totalPages === 0 ? 1 : dadosPaginados.totalPages);
    } catch (erro) {
      console.error(erro);
    }
  };

  useEffect(() => { carregarFilaTI(); }, [paginaAtual, ordenacao]);

  const assumirChamado = async (id) => {
    if (!window.confirm(`Deseja assumir o chamado #${id}?`)) return;
    await fetch(`${API_BASE_URL}/${id}/atender`, { method: 'PUT' });
    carregarFilaTI(); 
  };

  const resolverChamado = async (id) => {
    if (!window.confirm(`Deseja resolver o chamado #${id}?`)) return;
    await fetch(`${API_BASE_URL}/${id}/resolver`, { method: 'PUT' });
    carregarFilaTI();
  };

  const mudarOrdenacao = (campo) => {
    setOrdenacao(prev => ({
      campo: campo,
      direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc'
    }));
    setPaginaAtual(0);
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
      <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '1000px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h2>Fila de Atendimentos</h2>
        <table id="tabela-chamados" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
              <th>ID</th>
              <th>Título</th>
              <th>Status</th>
              <th onClick={() => mudarOrdenacao('prioridade')} style={{ cursor: 'pointer' }}>Prioridade ↕</th>
              <th onClick={() => mudarOrdenacao('dataAbertura')} style={{ cursor: 'pointer' }}>Data ↕</th>
              <th>Ações (TI)</th>
            </tr>
          </thead>
          
          <tbody>
            {chamados.map(chamado => (
              /* React.Fragment substitui a <tr> principal para podermos colocar 2 linhas (tr) juntas */
              <React.Fragment key={chamado.id}>
                
                {/* 1. LINHA PRINCIPAL (Agora ela tem o onClick para expandir) */}
                <tr 
                  onClick={() => setIdExpandido(idExpandido === chamado.id ? null : chamado.id)} 
                  style={{ 
                    borderBottom: '1px solid #eee', 
                    cursor: 'pointer', 
                    backgroundColor: idExpandido === chamado.id ? '#f0f7ff' : 'transparent' 
                  }}
                >
                  <td style={{ padding: '0.5rem 0' }}>{chamado.id}</td>
                  <td style={{ fontWeight: 'bold' }}>{chamado.titulo}</td>
                  <td>
                    <span style={{ color: chamado.status === 'RESOLVIDO' ? 'green' : (chamado.status === 'EM_ANDAMENTO' ? 'orange' : 'red'), fontWeight: 'bold' }}>
                      {chamado.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 'bold' }}>
                      {chamado.prioridade ? (chamado.prioridade.includes('_') ? chamado.prioridade.split('_')[1] : chamado.prioridade) : '-'}
                    </span>
                  </td>
                  <td>{chamado.dataAbertura ? new Date(chamado.dataAbertura).toLocaleDateString('pt-BR') : '-'}</td>
                  
                  {/* Ações não disparam o clique da linha graças ao e.stopPropagation() */}
                  <td style={{ display: 'flex', gap: '10px', padding: '0.5rem 0' }} onClick={(e) => e.stopPropagation()}>
                    {chamado.status === 'ABERTO' && (
                      <button style={{ backgroundColor: '#ffc107', padding: '0.4rem 0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => assumirChamado(chamado.id)}>
                        Assumir
                      </button>
                    )}
                    {chamado.status === 'EM_ANDAMENTO' && (
                      <button style={{ backgroundColor: '#28a745', color: 'white', padding: '0.4rem 0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => resolverChamado(chamado.id)}>
                        Resolver
                      </button>
                    )}
                    {chamado.status === 'RESOLVIDO' && <span style={{ color: 'green', fontWeight: 'bold' }}>✔ Finalizado</span>}
                  </td>
                </tr>

                {/* 2. LINHA DA DESCRIÇÃO (Só renderiza se o ID desta linha for o ID expandido no momento) */}
                {idExpandido === chamado.id && (
                  <tr>
                    <td colSpan="6" style={{ padding: '1.5rem', backgroundColor: '#fdfdfd', borderLeft: '4px solid #0056b3', borderBottom: '2px solid #ccc' }}>
                      <strong style={{ color: '#0056b3' }}>Descrição Detalhada do Problema:</strong>
                      <p style={{ marginTop: '0.5rem', color: '#444', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                        {chamado.descricao || "Nenhuma descrição adicional foi fornecida pela Secretaria no momento da abertura deste chamado."}
                      </p>
                    </td>
                  </tr>
                )}
                
              </React.Fragment>
            ))}
          </tbody>
        </table>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa' }}>
          <button disabled={paginaAtual === 0} onClick={() => setPaginaAtual(p => p - 1)}>« Anterior</button>
          <span>Página {paginaAtual + 1} de {totalPages}</span>
          <button disabled={paginaAtual + 1 >= totalPages} onClick={() => setPaginaAtual(p => p + 1)}>Próxima »</button>
        </div>
      </section>
    </div>
  );
}

// =========================================================================
// 3. O "MAESTRO" (Controla qual tela aparece)
// =========================================================================
function App() {
  // Esse estado simula quem está logado no sistema!
  const [perfilAtivo, setPerfilAtivo] = useState('TI');

  return (
    <div>
      {/* Barra de Navegação / Cabeçalho Global */}
      <header style={{ backgroundColor: perfilAtivo === 'TI' ? '#343a40' : '#0056b3', padding: '1rem', color: 'white', textAlign: 'center', transition: 'background-color 0.3s' }}>
        <h1>EduSupport SMED</h1>
        <p>{perfilAtivo === 'TI' ? 'Visão do Técnico de TI' : 'Visão da Diretoria (Escolas)'}</p>
        
        {/* Simulador de Login */}
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button 
            onClick={() => setPerfilAtivo('SECRETARIA')}
            style={{ padding: '0.5rem 1rem', cursor: 'pointer', backgroundColor: perfilAtivo === 'SECRETARIA' ? 'white' : 'transparent', color: perfilAtivo === 'SECRETARIA' ? '#0056b3' : 'white', border: '1px solid white', borderRadius: '4px' }}
          >
            Simular Login: Diretora
          </button>
          <button 
            onClick={() => setPerfilAtivo('TI')}
            style={{ padding: '0.5rem 1rem', cursor: 'pointer', backgroundColor: perfilAtivo === 'TI' ? 'white' : 'transparent', color: perfilAtivo === 'TI' ? '#343a40' : 'white', border: '1px solid white', borderRadius: '4px' }}
          >
            Simular Login: Equipe de TI
          </button>
        </div>
      </header>

      {/* O React decide qual componente desenhar baseado no botão que você clicou! */}
      <main style={{ padding: '2rem 0', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
        {perfilAtivo === 'TI' ? <PainelTI /> : <PainelSecretaria />}
      </main>
    </div>
  );
}

export default App;