/* ============================================================
   cliente.js — Página do Cliente (requer login)
   ============================================================ */

let barbeiroPick = null;

document.addEventListener('DOMContentLoaded', async () => {

  const usuario = getUsuario();
  if (!usuario || usuario.tipoUsuario !== 'CLIENTE') {
    window.location.href = 'index.html';
    return;
  }

  document.getElementById('user-name').textContent = usuario.nome;
  document.getElementById('btn-logout').addEventListener('click', logout);

  const hoje = new Date().toISOString().split('T')[0];
  const dataInput = document.getElementById('data');
  dataInput.min   = hoje;
  dataInput.value = hoje;

  await carregarBarbeiros();
  await carregarServicosCheck('servicos-grid');

  dataInput.addEventListener('change', () => {
    carregarHorarios(dataInput.value, barbeiroPick);
  });

  await carregarHorarios(hoje, null);

  document.getElementById('form-cliente').addEventListener('submit', enviarAgendamento);

  document.getElementById('btn-novo-agend').addEventListener('click', () => {
    document.getElementById('confirm-box').style.display = 'none';
    document.getElementById('form-cliente').style.display = 'block';
    document.getElementById('form-cliente').reset();
    document.querySelectorAll('.servico-card-check').forEach(c => c.classList.remove('checked'));
    document.querySelectorAll('.barbeiro-card-check').forEach(c => c.classList.remove('selected'));
    document.getElementById('resumo').style.display = 'none';
    barbeiroPick = null;
    dataInput.value = hoje;
    carregarHorarios(hoje, null);
  });
});

async function carregarBarbeiros() {
  const grid = document.getElementById('barbeiros-grid');
  try {
    const list = await apiFetch('/barbeiros');
    const barbeiros = list.filter(b => b.tipoUsuario === 'BARBEIRO');
    
    if (!barbeiros.length) { grid.innerHTML = '<p class="loading-txt">Nenhum barbeiro disponível</p>'; return; }

    grid.innerHTML = barbeiros.map(b => {
      const inicial = b.nome.charAt(0).toUpperCase();
      return `
        <label class="barbeiro-card-check" data-id="${b.id}">
          <input type="radio" name="barbeiro" value="${b.id}" />
          <div class="bc-avatar">${inicial}</div>
          <div class="bc-nome">${b.nome}</div>
        </label>
      `;
    }).join('');

    grid.querySelectorAll('.barbeiro-card-check').forEach(card => {
      card.addEventListener('click', () => {
        grid.querySelectorAll('.barbeiro-card-check').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        barbeiroPick = Number(card.dataset.id);
        const data = document.getElementById('data').value;
        carregarHorarios(data, barbeiroPick);
      });
    });
  } catch {
    grid.innerHTML = '<p class="loading-txt">Erro ao carregar barbeiros</p>';
  }
}

async function enviarAgendamento(e) {
  e.preventDefault();

  const nome       = document.getElementById('nomeCliente').value.trim();
  const telefone   = document.getElementById('telefoneCliente').value.trim();
  const data       = document.getElementById('data').value;
  const horario    = document.getElementById('horario').value;
  const servicosIds = [...document.querySelectorAll('#servicos-grid input:checked')].map(cb => Number(cb.value));

  if (!nome || !telefone) { showToast('Informe seu nome e telefone.', 'error'); return; }
  if (!barbeiroPick)      { showToast('Selecione um barbeiro.', 'error'); return; }
  if (!data || !horario)  { showToast('Selecione data e horário.', 'error'); return; }
  if (!servicosIds.length){ showToast('Selecione ao menos um serviço.', 'error'); return; }

  const btn = document.querySelector('#form-cliente [type="submit"]');
  btn.disabled = true; btn.textContent = 'Confirmando...';

  try {
    await apiFetch('/agendamentos', {
      method: 'POST',
      body: JSON.stringify({
        nomeCliente: nome,
        telefoneCliente: telefone,
        data,
        horario,
        barbeiroId: barbeiroPick,
        servicosIds,
      }),
    });

    const nomeBarbeiro = document.querySelector('.barbeiro-card-check.selected .bc-nome')?.textContent ?? '';
    document.getElementById('confirm-msg').textContent =
      `${nome}, seu horário com ${nomeBarbeiro} está marcado para ${formatDate(data)} às ${horario}.`;

    document.getElementById('form-cliente').style.display = 'none';
    document.getElementById('confirm-box').style.display = 'block';

  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false; btn.textContent = 'Confirmar Agendamento';
  }
}
