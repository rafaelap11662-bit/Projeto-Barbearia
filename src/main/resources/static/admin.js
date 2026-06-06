/* ============================================================
   admin.js — Painel do Administrador
   Acesso total: agendamentos, barbeiros, serviços, novo agendamento
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Guard: apenas ADMINISTRADOR
  const usuario = getUsuario();
  if (!usuario || usuario.tipoUsuario !== 'ADMINISTRADOR') {
    window.location.href = 'index.html';
    return;
  }

  document.getElementById('user-name').textContent = usuario.nome;
  document.getElementById('btn-logout').addEventListener('click', logout);

  initNav();
  setupNavCallback();

  // Carrega página inicial
  loadAgendamentos();
  initFormAgendamento();
});

function setupNavCallback() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      navigateTo(page);
      if (page === 'agendamentos') loadAgendamentos();
      if (page === 'barbeiros')    loadBarbeiros();
      if (page === 'servicos')     loadServicos();
      if (page === 'agendar')      initFormAgendamento();
    });
  });
}

// ── AGENDAMENTOS ───────────────────────────────────────────────
document.getElementById('btn-refresh-agend').addEventListener('click', loadAgendamentos);

async function loadAgendamentos() {
  const el = document.getElementById('lista-agendamentos');
  el.innerHTML = '<p class="loading-txt">Carregando...</p>';
  try {
    const list = await apiFetch('/agendamentos');
    if (!list.length) {
      el.innerHTML = '<div class="empty-state"><div class="empty-icon">📅</div><p>Nenhum agendamento encontrado</p></div>';
      return;
    }
    el.innerHTML = list.map(a => `
      <div class="item-card">
        <div class="item-card-body">
          <div class="item-card-title">${a.clienteNome}</div>
          <div class="item-card-sub">
            ${formatDate(a.data)} às ${a.horario}
            &nbsp;·&nbsp; ${a.usuario?.nome ?? '—'}
          </div>
          <span class="badge">${a.clienteTelefone}</span>
        </div>
        <div class="item-card-actions">
          <button class="btn btn-icon del" title="Excluir" data-id="${a.id}">🗑</button>
        </div>
      </div>
    `).join('');

    el.querySelectorAll('.btn-icon.del').forEach(btn => {
      btn.addEventListener('click', () => {
        confirmDelete(`Excluir agendamento de ${btn.closest('.item-card').querySelector('.item-card-title').textContent}?`, async () => {
          try {
            await apiFetch(`/agendamentos/${btn.dataset.id}`, { method: 'DELETE' });
            showToast('Agendamento excluído', 'success');
            loadAgendamentos();
          } catch (err) { showToast(err.message, 'error'); }
        });
      });
    });
  } catch (err) {
    el.innerHTML = `<p class="loading-txt">Erro: ${err.message}</p>`;
  }
}

// ── BARBEIROS ──────────────────────────────────────────────────
document.getElementById('btn-novo-barbeiro').addEventListener('click', () => {
  limparFormBarbeiro();
  document.getElementById('form-barbeiro-title').textContent = 'Novo Barbeiro';
  document.getElementById('b-senha').placeholder = 'Senha de acesso';
  document.getElementById('b-senha').required = true;
  document.getElementById('form-barbeiro-wrap').style.display = 'block';
  document.getElementById('b-nome').focus();
});

document.getElementById('btn-cancelar-barbeiro').addEventListener('click', () => {
  document.getElementById('form-barbeiro-wrap').style.display = 'none';
});

document.getElementById('btn-salvar-barbeiro').addEventListener('click', async () => {
  const id    = document.getElementById('b-id').value;
  const nome  = document.getElementById('b-nome').value.trim();
  const tel   = document.getElementById('b-telefone').value.trim();
  const email = document.getElementById('b-email').value.trim();
  const senha = document.getElementById('b-senha').value;
  const tipo  = document.getElementById('b-tipo').value;

  if (!nome || !tel || !email || (!id && !senha)) {
    showToast('Preencha todos os campos obrigatórios.', 'error'); return;
  }

  const body = { nome, telefone: tel, email, tipoUsuario: tipo };
  if (senha) body.senha = senha;

  try {
    if (id) {
      await apiFetch(`/barbeiros/${id}`, { method: 'PUT', body: JSON.stringify(body) });
      showToast('Barbeiro atualizado', 'success');
    } else {
      await apiFetch('/barbeiros', { method: 'POST', body: JSON.stringify(body) });
      showToast('Barbeiro criado', 'success');
    }
    document.getElementById('form-barbeiro-wrap').style.display = 'none';
    loadBarbeiros();
  } catch (err) { showToast(err.message, 'error'); }
});

function limparFormBarbeiro() {
  ['b-id','b-nome','b-telefone','b-email','b-senha'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('b-tipo').value = 'BARBEIRO';
}

async function loadBarbeiros() {
  const el = document.getElementById('lista-barbeiros');
  el.innerHTML = '<p class="loading-txt">Carregando...</p>';
  try {
    const list = await apiFetch('/barbeiros');
    if (!list.length) {
      el.innerHTML = '<div class="empty-state"><div class="empty-icon">💈</div><p>Nenhum barbeiro cadastrado</p></div>';
      return;
    }
    el.innerHTML = list.map(b => `
      <div class="item-card">
        <div class="item-card-body">
          <div class="item-card-title">${b.nome}</div>
          <div class="item-card-sub">${b.email} &nbsp;·&nbsp; ${b.telefone}</div>
          <span class="badge">${b.tipoUsuario ?? 'BARBEIRO'}</span>
        </div>
        <div class="item-card-actions">
          <button class="btn btn-icon edit" title="Editar" data-id="${b.id}">✏️</button>
          <button class="btn btn-icon del"  title="Excluir" data-id="${b.id}">🗑</button>
        </div>
      </div>
    `).join('');

    el.querySelectorAll('.btn-icon.edit').forEach(btn => {
      btn.addEventListener('click', async () => {
        const b = await apiFetch(`/barbeiros/${btn.dataset.id}`);
        document.getElementById('b-id').value       = b.id;
        document.getElementById('b-nome').value     = b.nome;
        document.getElementById('b-telefone').value = b.telefone;
        document.getElementById('b-email').value    = b.email;
        document.getElementById('b-senha').value    = '';
        document.getElementById('b-senha').placeholder = 'Nova senha (deixe vazio para manter)';
        document.getElementById('b-tipo').value     = b.tipoUsuario ?? 'BARBEIRO';
        document.getElementById('form-barbeiro-title').textContent = 'Editar Barbeiro';
        document.getElementById('form-barbeiro-wrap').style.display = 'block';
        document.getElementById('b-nome').focus();
      });
    });

    el.querySelectorAll('.btn-icon.del').forEach(btn => {
      btn.addEventListener('click', () => {
        confirmDelete('Excluir este barbeiro?', async () => {
          try {
            await apiFetch(`/barbeiros/${btn.dataset.id}`, { method: 'DELETE' });
            showToast('Barbeiro excluído', 'success');
            loadBarbeiros();
          } catch (err) { showToast(err.message, 'error'); }
        });
      });
    });
  } catch (err) {
    el.innerHTML = `<p class="loading-txt">Erro: ${err.message}</p>`;
  }
}

// ── SERVIÇOS ───────────────────────────────────────────────────
document.getElementById('btn-novo-servico').addEventListener('click', () => {
  ['s-id','s-nome','s-preco','s-duracao','s-descricao'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('form-servico-title').textContent = 'Novo Serviço';
  document.getElementById('form-servico-wrap').style.display = 'block';
  document.getElementById('s-nome').focus();
});

document.getElementById('btn-cancelar-servico').addEventListener('click', () => {
  document.getElementById('form-servico-wrap').style.display = 'none';
});

document.getElementById('btn-salvar-servico').addEventListener('click', async () => {
  const id   = document.getElementById('s-id').value;
  const body = {
    nome:      document.getElementById('s-nome').value.trim(),
    preco:     parseFloat(document.getElementById('s-preco').value),
    duracao:   parseInt(document.getElementById('s-duracao').value),
    descricao: document.getElementById('s-descricao').value.trim(),
  };
  if (!body.nome || isNaN(body.preco) || isNaN(body.duracao)) {
    showToast('Preencha nome, preço e duração.', 'error'); return;
  }
  try {
    if (id) {
      await apiFetch(`/servicos/${id}`, { method: 'PUT', body: JSON.stringify(body) });
      showToast('Serviço atualizado', 'success');
    } else {
      await apiFetch('/servicos', { method: 'POST', body: JSON.stringify(body) });
      showToast('Serviço criado', 'success');
    }
    document.getElementById('form-servico-wrap').style.display = 'none';
    loadServicos();
  } catch (err) { showToast(err.message, 'error'); }
});

async function loadServicos() {
  const el = document.getElementById('lista-servicos');
  el.innerHTML = '<p class="loading-txt">Carregando...</p>';
  try {
    const list = await apiFetch('/servicos');
    if (!list.length) {
      el.innerHTML = '<div class="empty-state"><div class="empty-icon">✂️</div><p>Nenhum serviço cadastrado</p></div>';
      return;
    }
    el.innerHTML = list.map(s => `
      <div class="item-card">
        <div class="item-card-body">
          <div class="item-card-title">${s.nome}</div>
          <div class="item-card-sub">${s.descricao || '—'} &nbsp;·&nbsp; ${s.duracao} min</div>
          <span class="badge">${formatMoney(s.preco)}</span>
        </div>
        <div class="item-card-actions">
          <button class="btn btn-icon edit" title="Editar" data-id="${s.id}">✏️</button>
          <button class="btn btn-icon del"  title="Excluir" data-id="${s.id}">🗑</button>
        </div>
      </div>
    `).join('');

    el.querySelectorAll('.btn-icon.edit').forEach(btn => {
      btn.addEventListener('click', async () => {
        const s = await apiFetch(`/servicos/${btn.dataset.id}`);
        document.getElementById('s-id').value       = s.id;
        document.getElementById('s-nome').value     = s.nome;
        document.getElementById('s-preco').value    = s.preco;
        document.getElementById('s-duracao').value  = s.duracao;
        document.getElementById('s-descricao').value = s.descricao || '';
        document.getElementById('form-servico-title').textContent = 'Editar Serviço';
        document.getElementById('form-servico-wrap').style.display = 'block';
        document.getElementById('s-nome').focus();
      });
    });

    el.querySelectorAll('.btn-icon.del').forEach(btn => {
      btn.addEventListener('click', () => {
        confirmDelete('Excluir este serviço?', async () => {
          try {
            await apiFetch(`/servicos/${btn.dataset.id}`, { method: 'DELETE' });
            showToast('Serviço excluído', 'success');
            loadServicos();
          } catch (err) { showToast(err.message, 'error'); }
        });
      });
    });
  } catch (err) {
    el.innerHTML = `<p class="loading-txt">Erro: ${err.message}</p>`;
  }
}

// ── FORM AGENDAMENTO (admin agenda por qualquer barbeiro) ──────
async function initFormAgendamento() {
  const today = new Date().toISOString().split('T')[0];
  const dataInput = document.getElementById('data');
  dataInput.min   = today;
  if (!dataInput.value) dataInput.value = today;

  // Barbeiros
  try {
    const barbeiros = await apiFetch('/barbeiros');
    const sel = document.getElementById('barbeiroId');
    sel.innerHTML = '<option value="">Selecione um barbeiro</option>';
    barbeiros
      .filter(b => b.tipoUsuario === 'BARBEIRO')
      .forEach(b => { sel.innerHTML += `<option value="${b.id}">${b.nome}</option>`; });
    sel.addEventListener('change', () => carregarHorarios(dataInput.value, sel.value));
  } catch {
    document.getElementById('barbeiroId').innerHTML = '<option value="">Erro ao carregar</option>';
  }

  // Serviços
  await carregarServicosCheck('servicos-grid');

  // Horários ao mudar data
  dataInput.addEventListener('change', () => {
    const bId = document.getElementById('barbeiroId').value;
    carregarHorarios(dataInput.value, bId);
  });

  await carregarHorarios(today, '');

  // Submit
  const form = document.getElementById('form-agendamento');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const nome       = document.getElementById('nomeCliente').value.trim();
    const telefone   = document.getElementById('telefoneCliente').value.trim();
    const data       = dataInput.value;
    const horario    = document.getElementById('horario').value;
    const barbeiroId = document.getElementById('barbeiroId').value;
    const servicosIds = [...document.querySelectorAll('#servicos-grid input:checked')].map(cb => Number(cb.value));

    if (!nome || !telefone || !data || !horario || !barbeiroId || !servicosIds.length) {
      showToast('Preencha todos os campos e selecione ao menos um serviço.', 'error'); return;
    }

    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true; btn.textContent = 'Salvando...';

    try {
      await apiFetch('/agendamentos', {
        method: 'POST',
        body: JSON.stringify({ nomeCliente: nome, telefoneCliente: telefone, data, horario, barbeiroId: Number(barbeiroId), servicosIds }),
      });
      showToast('Agendamento confirmado! ✓', 'success');
      form.reset();
      document.querySelectorAll('.servico-card-check').forEach(c => c.classList.remove('checked'));
      document.getElementById('resumo').style.display = 'none';
      await carregarHorarios(today, '');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false; btn.textContent = 'Confirmar Agendamento';
    }
  };
}
