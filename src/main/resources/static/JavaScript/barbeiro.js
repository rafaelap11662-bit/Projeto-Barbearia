/* ============================================================
   barbeiro.js — Painel do Barbeiro
   Acesso: apenas sua própria agenda + criar agendamento
   ============================================================ */

let usuarioLogado = null;

document.addEventListener('DOMContentLoaded', () => {
  // Guard: apenas BARBEIRO
  usuarioLogado = getUsuario();
  if (!usuarioLogado || usuarioLogado.tipoUsuario !== 'BARBEIRO') {
    window.location.href = '../HTML/index.html';
    return;
  }

  document.getElementById('user-name').textContent = usuarioLogado.nome;
  document.getElementById('btn-logout').addEventListener('click', logout);

  initNav();
  setupNavCallback();

  // Filtro de data — padrão hoje
  const hoje = new Date().toISOString().split('T')[0];
  document.getElementById('filtro-data').value = hoje;

  loadMinhaAgenda(hoje);
  initFormAgendamento();

  document.getElementById('btn-filtrar').addEventListener('click', () => {
    const data = document.getElementById('filtro-data').value;
    loadMinhaAgenda(data);
  });

  document.getElementById('btn-refresh-agenda').addEventListener('click', () => {
    const data = document.getElementById('filtro-data').value;
    loadMinhaAgenda(data);
  });
});

function setupNavCallback() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      navigateTo(page);
      if (page === 'minha-agenda') {
        const data = document.getElementById('filtro-data').value;
        loadMinhaAgenda(data);
      }
      if (page === 'agendar') initFormAgendamento();
    });
  });
}

// ── MINHA AGENDA ───────────────────────────────────────────────
async function loadMinhaAgenda(data) {
  const el = document.getElementById('lista-minha-agenda');
  el.innerHTML = '<p class="loading-txt">Carregando...</p>';
  try {
    // Busca todos e filtra pelo barbeiro logado + data
    let url = '/agendamentos';
    if (data) url += `?data=${data}`;
    const list = await apiFetch(url);

    // Filtra pelo id do barbeiro logado
    const meus = list.filter(a => a.usuario?.id === usuarioLogado.id);

    if (!meus.length) {
      el.innerHTML = `<div class="empty-state"><div class="empty-icon">📅</div><p>Sem agendamentos${data ? ' nesta data' : ''}</p></div>`;
      return;
    }

    el.innerHTML = meus.map(a => `
      <div class="item-card">
        <div class="item-card-body">
          <div class="item-card-title">${a.clienteNome}</div>
          <div class="item-card-sub">${formatDate(a.data)} às ${a.horario}</div>
          <span class="badge">${a.clienteTelefone}</span>
        </div>
        <div class="item-card-actions">
          <button class="btn btn-icon del" title="Excluir" data-id="${a.id}">🗑</button>
        </div>
      </div>
    `).join('');

    el.querySelectorAll('.btn-icon.del').forEach(btn => {
      btn.addEventListener('click', () => {
        confirmDelete('Cancelar este agendamento?', async () => {
          try {
            await apiFetch(`/agendamentos/${btn.dataset.id}`, { method: 'DELETE' });
            showToast('Agendamento cancelado', 'success');
            loadMinhaAgenda(document.getElementById('filtro-data').value);
          } catch (err) { showToast(err.message, 'error'); }
        });
      });
    });
  } catch (err) {
    el.innerHTML = `<p class="loading-txt">Erro: ${err.message}</p>`;
  }
}

// ── NOVO AGENDAMENTO (barbeiro agenda no próprio horário) ──────
async function initFormAgendamento() {
  const hoje = new Date().toISOString().split('T')[0];
  const dataInput = document.getElementById('data');
  dataInput.min = hoje;
  if (!dataInput.value) dataInput.value = hoje;

  // Serviços
  await carregarServicosCheck('servicos-grid');

  // Horários disponíveis para o próprio barbeiro
  await carregarHorarios(hoje, usuarioLogado.id);

  dataInput.addEventListener('change', () => {
    carregarHorarios(dataInput.value, usuarioLogado.id);
  });

  const form = document.getElementById('form-agendamento');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const nome      = document.getElementById('nomeCliente').value.trim();
    const telefone  = document.getElementById('telefoneCliente').value.trim();
    const data      = dataInput.value;
    const horario   = document.getElementById('horario').value;
    const servicosIds = [...document.querySelectorAll('#servicos-grid input:checked')].map(cb => Number(cb.value));

    if (!nome || !telefone || !data || !horario || !servicosIds.length) {
      showToast('Preencha todos os campos e selecione ao menos um serviço.', 'error'); return;
    }

    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true; btn.textContent = 'Salvando...';

    try {
      await apiFetch('/agendamentos', {
        method: 'POST',
        body: JSON.stringify({
          nomeCliente: nome,
          telefoneCliente: telefone,
          data,
          horario,
          barbeiroId: usuarioLogado.id,  // sempre o próprio barbeiro
          servicosIds,
        }),
      });
      showToast('Agendamento confirmado! ✓', 'success');
      form.reset();
      document.querySelectorAll('.servico-card-check').forEach(c => c.classList.remove('checked'));
      document.getElementById('resumo').style.display = 'none';
      await carregarHorarios(hoje, usuarioLogado.id);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false; btn.textContent = 'Confirmar Agendamento';
    }
  };
}
