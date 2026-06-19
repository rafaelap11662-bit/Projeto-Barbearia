/* ============================================================
   app.js — utilitários compartilhados entre todas as páginas
   ============================================================ */

const API = '';

// ── Fetch wrapper ──────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = sessionStorage.getItem('token');
  const res = await fetch(API + path, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
      ...options.headers,
    },
    ...options,
  });
  if (res.status === 204) return null;
  if (res.status === 401) { throw new Error("Não autorizado");} //
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || data?.error || `Erro ${res.status}`);
  return data;
}

// ── Toast ──────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = 'toast'; }, 3200);
}

// ── Formatação ─────────────────────────────────────────────────
function formatMoney(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-');
  return d ? `${d}/${m}/${y}` : str;
}

// ── Modal confirm ──────────────────────────────────────────────
let confirmCallback = null;

function confirmDelete(msg, cb) {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;
  document.getElementById('modal-msg').textContent = msg;
  overlay.style.display = 'flex';
  confirmCallback = cb;
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.style.display = 'none';
  confirmCallback = null;
}

document.addEventListener('DOMContentLoaded', () => {
  const confirmBtn = document.getElementById('modal-confirm');
  const cancelBtn  = document.getElementById('modal-cancel');
  const overlay    = document.getElementById('modal-overlay');

  if (confirmBtn) confirmBtn.addEventListener('click', () => { if (confirmCallback) confirmCallback(); closeModal(); });
  if (cancelBtn)  cancelBtn.addEventListener('click', closeModal);
  if (overlay)    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
});

// ── Navegação SPA ──────────────────────────────────────────────
function initNav() {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => nav.classList.toggle('open'));
    nav.addEventListener('click', (e) => { if (e.target.classList.contains('nav-link')) nav.classList.remove('open'); });
  }

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(link.dataset.page);
    });
  });
}

function navigateTo(page, onEnter) {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.page === page));
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === 'page-' + page));
  if (onEnter) onEnter(page);
}

// ── Sessão ─────────────────────────────────────────────────────
function getUsuario() {
  try { return JSON.parse(sessionStorage.getItem('usuario')); } catch { return null; }
}

function logout() {
  sessionStorage.clear();
  window.location.href = '../HTML/login.html';
}

// ── Serviços (checkboxes compartilhado) ───────────────────────
let _todosServicos = [];

async function carregarServicosCheck(gridId) {
  const grid = document.getElementById(gridId);
  try {
    _todosServicos = await apiFetch('/servicos');
    if (!_todosServicos.length) { grid.innerHTML = '<p class="loading-txt">Nenhum serviço cadastrado</p>'; return; }
    grid.innerHTML = _todosServicos.map(s => `
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
        updateResumo(gridId);
      });
    });
  } catch {
    grid.innerHTML = '<p class="loading-txt">Erro ao carregar serviços</p>';
  }
}

function updateResumo(gridId = 'servicos-grid') {
  const checked = [...document.querySelectorAll(`#${gridId} input:checked`)];
  const resumo  = document.getElementById('resumo');
  const items   = document.getElementById('resumo-items');
  const total   = document.getElementById('resumo-total');
  if (!resumo) return;
  if (!checked.length) { resumo.style.display = 'none'; return; }
  resumo.style.display = 'block';
  let sum = 0;
  items.innerHTML = checked.map(cb => {
    const s = _todosServicos.find(x => x.id == cb.value);
    if (!s) return '';
    sum += s.preco;
    return `<div class="resumo-item"><span>${s.nome}</span><span>${formatMoney(s.preco)}</span></div>`;
  }).join('');
  total.textContent = `Total: ${formatMoney(sum)}`;
}

async function carregarHorarios(data, barbeiroId) {
  const sel = document.getElementById('horario');
  sel.innerHTML = '<option value="">Carregando...</option>';
  if (!data) { sel.innerHTML = '<option value="">Selecione a data primeiro</option>'; return; }
  try {
    const params = barbeiroId ? `?data=${data}&barbeiroId=${barbeiroId}` : `?data=${data}`;
    const horarios = await apiFetch('/agendamentos/horarios' + params);
    if (!horarios.length) { sel.innerHTML = '<option value="">Sem horários disponíveis</option>'; return; }
    sel.innerHTML = '<option value="">Escolha um horário</option>';
    horarios.forEach(h => { sel.innerHTML += `<option value="${h}">${h}</option>`; });
  } catch {
    sel.innerHTML = '<option value="">Erro ao carregar horários</option>';
  }
}
