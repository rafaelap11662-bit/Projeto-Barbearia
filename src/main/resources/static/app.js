const API = 'http://localhost:9090';

async function apiFetch(path, options = {}) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.message || data?.error || `Erro ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

let toastTimer;
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = 'toast'; }, 3000);
}

function formatMoney(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-');
  if (d) return `${d}/${m}/${y}`;
  return str;
}

let confirmCallback = null;
document.getElementById('modal-confirm').addEventListener('click', () => {
  if (confirmCallback) confirmCallback();
  closeModal();
});
document.getElementById('modal-cancel').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});

function confirmDelete(msg, cb) {
  document.getElementById('modal-msg').textContent = msg;
  document.getElementById('modal-overlay').style.display = 'flex';
  confirmCallback = cb;
}
function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
  confirmCallback = null;
}

// NAVEGAÇÃO
const nav = document.getElementById('nav');
const hamburger = document.getElementById('hamburger');

hamburger.addEventListener('click', () => nav.classList.toggle('open'));
nav.addEventListener('click', (e) => {
  if (e.target.classList.contains('nav-link')) nav.classList.remove('open');
});

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo(link.dataset.page);
  });
});

function navigateTo(page) {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.page === page));
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === 'page-' + page));
  if (page === 'agendamentos') loadAgendamentos();
  if (page === 'servicos')     loadServicos();
  if (page === 'barbeiros')    loadBarbeiros();
}

// PAGE: AGENDAR
let todosServicos = [];

async function initAgendar() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('data').min = today;
  document.getElementById('data').value = today;

  try {
    const barbeiros = await apiFetch('/barbeiros');
    const sel = document.getElementById('barbeiroId');
    sel.innerHTML = '<option value="">Selecione um barbeiro</option>';
    barbeiros.forEach(b => {
      sel.innerHTML += `<option value="${b.id}">${b.nome}</option>`;
    });
  } catch {
    document.getElementById('barbeiroId').innerHTML = '<option value="">Erro ao carregar barbeiros</option>';
  }

  try {
    todosServicos = await apiFetch('/servicos');
    renderServicosCheck(todosServicos);
  } catch {
    document.getElementById('servicos-grid').innerHTML = '<p class="loading-txt">Erro ao carregar serviços</p>';
  }

  document.getElementById('data').addEventListener('change', loadHorarios);
  await loadHorarios();
}

async function loadHorarios() {
  const data = document.getElementById('data').value;
  const sel = document.getElementById('horario');
  sel.innerHTML = '<option value="">Carregando...</option>';
  if (!data) { sel.innerHTML = '<option value="">Selecione a data primeiro</option>'; return; }
  try {
    const horarios = await apiFetch(`/agendamentos/horarios?data=${data}`);
    if (!horarios.length) { sel.innerHTML = '<option value="">Sem horários disponíveis</option>'; return; }
    sel.innerHTML = '<option value="">Escolha um horário</option>';
    horarios.forEach(h => { sel.innerHTML += `<option value="${h}">${h}</option>`; });
  } catch {
    sel.innerHTML = '<option value="">Erro ao carregar horários</option>';
  }
}

function renderServicosCheck(servicos) {
  const grid = document.getElementById('servicos-grid');
  if (!servicos.length) { grid.innerHTML = '<p class="loading-txt">Nenhum serviço cadastrado</p>'; return; }
  grid.innerHTML = servicos.map(s => `
    <label class="servico-card-check" data-id="${s.id}">
      <input type="checkbox" value="${s.id}" />
      <div class="check-mark">✓</div>
      <div class="sc-nome">${s.nome}</div>
      <div class="sc-preco">${formatMoney(s.preco)}</div>
      <div class="sc-duracao">${s.duracao} min</div>
    </label>
  `).join('');

  grid.querySelectorAll('.servico-card-check').forEach(card => {
    card.addEventListener('click', () => {
      const cb = card.querySelector('input[type="checkbox"]');
      cb.checked = !cb.checked;
      card.classList.toggle('checked', cb.checked);
      updateResumo();
    });
  });
}

function updateResumo() {
  const checked = [...document.querySelectorAll('#servicos-grid input:checked')];
  const resumo = document.getElementById('resumo');
  const items = document.getElementById('resumo-items');
  const total = document.getElementById('resumo-total');
  if (!checked.length) { resumo.style.display = 'none'; return; }
  resumo.style.display = 'block';
  let sum = 0;
  items.innerHTML = checked.map(cb => {
    const s = todosServicos.find(x => x.id == cb.value);
    sum += s.preco;
    return `<div class="resumo-item"><span>${s.nome}</span><span>${formatMoney(s.preco)}</span></div>`;
  }).join('');
  total.textContent = `Total: ${formatMoney(sum)}`;
}

document.getElementById('form-agendamento').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nome = document.getElementById('nomeCliente').value.trim();
  const telefone = document.getElementById('telefoneCliente').value.trim();
  const data = document.getElementById('data').value;
  const horario = document.getElementById('horario').value;
  const barbeiroId = document.getElementById('barbeiroId').value;
  const servicosIds = [...document.querySelectorAll('#servicos-grid input:checked')].map(cb => Number(cb.value));

  if (!nome || !telefone || !data || !horario || !barbeiroId || !servicosIds.length) {
    showToast('Preencha todos os campos e selecione ao menos um serviço.', 'error');
    return;
  }

  const btn = e.target.querySelector('[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Salvando...';

  try {
    await apiFetch('/agendamentos', {
      method: 'POST',
      body: JSON.stringify({ nomeCliente: nome, telefoneCliente: telefone, data, horario, barbeiroId: Number(barbeiroId), servicosIds }),
    });
    showToast('Agendamento confirmado! ✓', 'success');
    e.target.reset();
    document.querySelectorAll('.servico-card-check').forEach(c => c.classList.remove('checked'));
    document.getElementById('resumo').style.display = 'none';
    await loadHorarios();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Confirmar Agendamento';
  }
});

// PAGE: AGENDAMENTOS
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
          <div class="item-card-sub">${formatDate(a.data)} às ${a.horario} &nbsp;·&nbsp; ${a.barbeiro?.nome ?? '—'}</div>
          <div><span class="badge">${a.clienteTelefone}</span></div>
        </div>
        <div class="item-card-actions">
          <button class="btn btn-icon del" title="Excluir" data-id="${a.id}">🗑</button>
        </div>
      </div>
    `).join('');

    el.querySelectorAll('.btn-icon.del').forEach(btn => {
      btn.addEventListener('click', () => {
        confirmDelete(`Excluir agendamento #${btn.dataset.id}?`, async () => {
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

// PAGE: SERVIÇOS
document.getElementById('btn-novo-servico').addEventListener('click', () => {
  document.getElementById('s-id').value = '';
  document.getElementById('s-nome').value = '';
  document.getElementById('s-preco').value = '';
  document.getElementById('s-duracao').value = '';
  document.getElementById('s-descricao').value = '';
  document.getElementById('form-servico-title').textContent = 'Novo Serviço';
  document.getElementById('form-servico-wrap').style.display = 'block';
  document.getElementById('s-nome').focus();
});

document.getElementById('btn-cancelar-servico').addEventListener('click', () => {
  document.getElementById('form-servico-wrap').style.display = 'none';
});

document.getElementById('btn-salvar-servico').addEventListener('click', async () => {
  const id = document.getElementById('s-id').value;
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
          <div><span class="badge">${formatMoney(s.preco)}</span></div>
        </div>
        <div class="item-card-actions">
          <button class="btn btn-icon edit" title="Editar" data-id="${s.id}">✏️</button>
          <button class="btn btn-icon del" title="Excluir" data-id="${s.id}">🗑</button>
        </div>
      </div>
    `).join('');

    el.querySelectorAll('.btn-icon.edit').forEach(btn => {
      btn.addEventListener('click', async () => {
        const s = await apiFetch(`/servicos/${btn.dataset.id}`);
        document.getElementById('s-id').value = s.id;
        document.getElementById('s-nome').value = s.nome;
        document.getElementById('s-preco').value = s.preco;
        document.getElementById('s-duracao').value = s.duracao;
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

// PAGE: BARBEIROS
document.getElementById('btn-novo-barbeiro').addEventListener('click', () => {
  document.getElementById('b-id').value = '';
  document.getElementById('b-nome').value = '';
  document.getElementById('b-telefone').value = '';
  document.getElementById('b-email').value = '';
  document.getElementById('form-barbeiro-title').textContent = 'Novo Barbeiro';
  document.getElementById('form-barbeiro-wrap').style.display = 'block';
  document.getElementById('b-nome').focus();
});

document.getElementById('btn-cancelar-barbeiro').addEventListener('click', () => {
  document.getElementById('form-barbeiro-wrap').style.display = 'none';
});

document.getElementById('btn-salvar-barbeiro').addEventListener('click', async () => {
  const id = document.getElementById('b-id').value;
  const body = {
    nome:     document.getElementById('b-nome').value.trim(),
    telefone: document.getElementById('b-telefone').value.trim(),
    email:    document.getElementById('b-email').value.trim(),
  };
  if (!body.nome || !body.telefone || !body.email) {
    showToast('Preencha todos os campos.', 'error'); return;
  }
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
        </div>
        <div class="item-card-actions">
          <button class="btn btn-icon edit" title="Editar" data-id="${b.id}">✏️</button>
          <button class="btn btn-icon del" title="Excluir" data-id="${b.id}">🗑</button>
        </div>
      </div>
    `).join('');

    el.querySelectorAll('.btn-icon.edit').forEach(btn => {
      btn.addEventListener('click', async () => {
        const b = await apiFetch(`/barbeiros/${btn.dataset.id}`);
        document.getElementById('b-id').value = b.id;
        document.getElementById('b-nome').value = b.nome;
        document.getElementById('b-telefone').value = b.telefone;
        document.getElementById('b-email').value = b.email;
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

// INIT
initAgendar();