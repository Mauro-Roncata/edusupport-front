import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8080/api/chamados';

// =========================================================================
// TELA DE LOGIN (Mostrada apenas se o usuário não estiver autenticado)
// =========================================================================
function TelaLogin() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f4f7f6' }}>
       <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '400px' }}>
          <h1 style={{ color: '#0056b3', marginBottom: '0.5rem' }}>EduSupport</h1>
          <p style={{ marginBottom: '2rem', color: '#666' }}>Central de Atendimentos SMED</p>
          
          {/* Este link aponta direto para a porta do Spring Boot que inicia o fluxo do Google */}
          <a href="http://localhost:8080/oauth2/authorization/google" style={{ textDecoration: 'none' }}>
            <button style={{ backgroundColor: '#4285F4', color: 'white', padding: '1rem 2rem', border: 'none', borderRadius: '4px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'center' }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" style={{ width: '20px', backgroundColor: 'white', padding: '2px', borderRadius: '50%' }}/>
              Entrar com Google
            </button>
          </a>
       </div>
    </div>
  );
}

// =========================================================================
// O CABEÇALHO COM OS DADOS DO USUÁRIO LOGADO
// =========================================================================
function HeaderNavegacao({ usuario }) {
  const isTI = usuario.perfil === 'TI';

  return (
    <header style={{ backgroundColor: isTI ? '#343a40' : '#0056b3', padding: '1rem 2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background-color 0.3s' }}>
      <div>
        <h2 style={{ margin: 0 }}>EduSupport SMED</h2>
        <small>{isTI ? 'Painel de Controle da TI' : 'Área da Secretaria'}</small>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{usuario.nome}</p>
          <small style={{ opacity: 0.8 }}>{usuario.perfil}</small>
        </div>
        {usuario.foto && <img src={usuario.foto} alt="Perfil" style={{ width: '40px', borderRadius: '50%' }} />}
        
        {/* Botão de Sair aponta para a rota padrão de logout do Spring Security */}
        <a href="http://localhost:8080/logout">
          <button style={{ marginLeft: '10px', padding: '0.4rem 0.8rem', backgroundColor: 'transparent', color: 'white', border: '1px solid white', borderRadius: '4px', cursor: 'pointer' }}>
            Sair
          </button>
        </a>
      </div>
    </header>
  );
}

// =========================================================================
// TELA DA SECRETARIA
// =========================================================================
function PainelSecretaria() {
  const [chamados, setChamados] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [prioridade, setPrioridade] = useState('V2_MEDIA'); 
  const [idExpandido, setIdExpandido] = useState(null);

  const carregarMeusChamados = async () => {
    try {
      // O SEGREDO ESTÁ AQUI: credentials: 'include' envia o crachá pro Java!
      const resposta = await fetch(`${API_BASE_URL}?page=0&size=20&sort=dataAbertura,desc`, { credentials: 'include' });
      const dados = await resposta.json();
      setChamados(dados.content);
    } catch (erro) { console.error(erro); }
  };

  useEffect(() => { carregarMeusChamados(); }, []);

  const abrirChamado = async (e) => {
    e.preventDefault();
    const novoChamado = { titulo, descricao, categoria, prioridade };

    try {
      const resposta = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // <--- AQUI TAMBÉM
        body: JSON.stringify(novoChamado)
      });

      if (resposta.ok) {
        alert('Chamado aberto com sucesso!');
        setTitulo(''); setDescricao(''); setCategoria(''); setPrioridade('V2_MEDIA');
        carregarMeusChamados();
      } else { alert('Erro ao abrir chamado.'); }
    } catch (erro) { alert('Erro de conexão.'); }
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '800px', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h2>Abrir Novo Chamado</h2>
        <form onSubmit={abrirChamado} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div><label style={{ fontWeight: 'bold' }}>Título:</label><input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} required style={{ width: '100%', padding: '0.6rem', marginTop: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} /></div>
          <div><label style={{ fontWeight: 'bold' }}>Descrição:</label><input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} required style={{ width: '100%', padding: '0.6rem', marginTop: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} /></div>
          <div><label style={{ fontWeight: 'bold' }}>Categoria:</label><select value={categoria} onChange={(e) => setCategoria(e.target.value)} required style={{ width: '100%', padding: '0.6rem', marginTop: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}><option value="">Selecione...</option><option value="REDE_INTERNET">Rede / Internet</option><option value="HARDWARE">Equipamento / Hardware</option><option value="IMPRESSORA">Impressora</option><option value="SISTEMA_SOFTWARE">Sistemas / Software</option></select></div>
          <div><label style={{ fontWeight: 'bold' }}>Prioridade:</label><select value={prioridade} onChange={(e) => setPrioridade(e.target.value)} required style={{ width: '100%', padding: '0.6rem', marginTop: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}><option value="V1_ALTA">Alta</option><option value="V2_MEDIA">Média</option><option value="V3_BAIXA">Baixa</option></select></div>
          <button type="submit" style={{ backgroundColor: '#0056b3', color: 'white', padding: '1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '1rem' }}>Registrar Chamado</button>
        </form>
      </section>

      <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '800px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h2>Meus Chamados Recentes</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead><tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}><th>ID</th><th>Título</th><th>Status</th><th>Categoria</th></tr></thead>
          <tbody>
            {chamados.map(chamado => (
              <React.Fragment key={chamado.id}>
                <tr onClick={() => setIdExpandido(idExpandido === chamado.id ? null : chamado.id)} style={{ borderBottom: '1px solid #eee', cursor: 'pointer', backgroundColor: idExpandido === chamado.id ? '#f0f7ff' : 'transparent' }}>
                  <td style={{ padding: '0.5rem 0' }}>{chamado.id}</td><td style={{ fontWeight: 'bold' }}>{chamado.titulo} ℹ️</td>
                  <td><span style={{ color: chamado.status === 'RESOLVIDO' ? 'green' : (chamado.status === 'EM_ANDAMENTO' ? 'orange' : 'red'), fontWeight: 'bold' }}>{chamado.status}</span></td>
                  <td>{chamado.categoria ? chamado.categoria.replace('_', ' ') : '-'}</td>
                </tr>
                {idExpandido === chamado.id && (<tr><td colSpan="4" style={{ padding: '1.5rem', backgroundColor: '#fdfdfd', borderLeft: '4px solid #0056b3', borderBottom: '2px solid #ccc' }}><strong style={{ color: '#0056b3' }}>Descrição:</strong><p style={{ marginTop: '0.5rem', color: '#444' }}>{chamado.descricao || "Nenhuma descrição."}</p></td></tr>)}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

// =========================================================================
// TELA DA TI
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
      const resposta = await fetch(url, { credentials: 'include' }); // <--- AQUI TAMBÉM
      const dadosPaginados = await resposta.json();
      setChamados(dadosPaginados.content);
      setTotalPages(dadosPaginados.totalPages === 0 ? 1 : dadosPaginados.totalPages);
    } catch (erro) { console.error(erro); }
  };

  useEffect(() => { carregarFilaTI(); }, [paginaAtual, ordenacao]);

  const assumirChamado = async (id) => {
    if (!window.confirm(`Deseja assumir o chamado #${id}?`)) return;
    await fetch(`${API_BASE_URL}/${id}/atender`, { method: 'PUT', credentials: 'include' }); // E AQUI
    carregarFilaTI(); 
  };

  const resolverChamado = async (id) => {
    if (!window.confirm(`Deseja resolver o chamado #${id}?`)) return;
    await fetch(`${API_BASE_URL}/${id}/resolver`, { method: 'PUT', credentials: 'include' }); // E AQUI
    carregarFilaTI();
  };

  const mudarOrdenacao = (campo) => {
    setOrdenacao(prev => ({ campo: campo, direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc' }));
    setPaginaAtual(0);
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
      <section style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '1000px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h2>Fila de Atendimentos</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead><tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}><th>ID</th><th>Título</th><th>Status</th><th onClick={() => mudarOrdenacao('prioridade')} style={{ cursor: 'pointer' }}>Prioridade ↕</th><th onClick={() => mudarOrdenacao('dataAbertura')} style={{ cursor: 'pointer' }}>Data ↕</th><th>Ações</th></tr></thead>
          <tbody>
            {chamados.map(chamado => (
              <React.Fragment key={chamado.id}>
                <tr onClick={() => setIdExpandido(idExpandido === chamado.id ? null : chamado.id)} style={{ borderBottom: '1px solid #eee', cursor: 'pointer', backgroundColor: idExpandido === chamado.id ? '#f0f7ff' : 'transparent' }}>
                  <td style={{ padding: '0.5rem 0' }}>{chamado.id}</td><td style={{ fontWeight: 'bold' }}>{chamado.titulo} ℹ️</td>
                  <td><span style={{ color: chamado.status === 'RESOLVIDO' ? 'green' : (chamado.status === 'EM_ANDAMENTO' ? 'orange' : 'red'), fontWeight: 'bold' }}>{chamado.status}</span></td>
                  <td><span style={{ fontWeight: 'bold' }}>{chamado.prioridade ? (chamado.prioridade.includes('_') ? chamado.prioridade.split('_')[1] : chamado.prioridade) : '-'}</span></td>
                  <td>{chamado.dataAbertura ? new Date(chamado.dataAbertura).toLocaleDateString('pt-BR') : '-'}</td>
                  <td style={{ display: 'flex', gap: '10px', padding: '0.5rem 0' }} onClick={(e) => e.stopPropagation()}>
                    {chamado.status === 'ABERTO' && <button style={{ backgroundColor: '#ffc107', padding: '0.4rem 0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => assumirChamado(chamado.id)}>Assumir</button>}
                    {chamado.status === 'EM_ANDAMENTO' && <button style={{ backgroundColor: '#28a745', color: 'white', padding: '0.4rem 0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => resolverChamado(chamado.id)}>Resolver</button>}
                    {chamado.status === 'RESOLVIDO' && <span style={{ color: 'green', fontWeight: 'bold' }}>✔ Finalizado</span>}
                  </td>
                </tr>
                {idExpandido === chamado.id && (<tr><td colSpan="6" style={{ padding: '1.5rem', backgroundColor: '#fdfdfd', borderLeft: '4px solid #0056b3', borderBottom: '2px solid #ccc' }}><strong style={{ color: '#0056b3' }}>Descrição:</strong><p style={{ marginTop: '0.5rem', color: '#444' }}>{chamado.descricao || "Nenhuma descrição."}</p></td></tr>)}
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
// O ROTEADOR PRINCIPAL (O Cérebro da Operação)
// =========================================================================
function App() {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Assim que o React abre, ele pergunta pro Java: "Tem alguém logado aí?"
  useEffect(() => {
    const verificarSessao = async () => {
      try {
        const resposta = await fetch('http://localhost:8080/api/usuario/me', { credentials: 'include' });
        if (resposta.ok) {
          const dados = await resposta.json();
          if (dados.nome) {
            setUsuario(dados); // Achamos o usuário!
          }
        }
      } catch (error) {
        console.log("Usuário não está logado.");
      } finally {
        setCarregando(false); // Terminou de carregar, mostra a tela
      }
    };
    verificarSessao();
  }, []);

  // Tela de loading enquanto espera o Java responder
  if (carregando) return <div style={{ textAlign: 'center', marginTop: '20%' }}><h3>Carregando EduSupport...</h3></div>;

  // Se o Java disse que não tem ninguém, mostra a tela de Login
  if (!usuario) return <TelaLogin />;

  // Se tem usuário, renderiza o sistema protegido!
  return (
    <BrowserRouter>
      <div>
        <HeaderNavegacao usuario={usuario} />
        <main style={{ padding: '2rem 0', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
          <Routes>
            {/* Roteamento Baseado no Perfil do Banco de Dados! */}
            {usuario.perfil === 'TI' ? (
              <>
                <Route path="/ti" element={<PainelTI />} />
                <Route path="*" element={<Navigate to="/ti" />} />
              </>
            ) : (
              <>
                <Route path="/secretaria" element={<PainelSecretaria />} />
                <Route path="*" element={<Navigate to="/secretaria" />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;