/* ============================================================
   catalogo.js — Catálogo virtual de serviços (página pública)
   ============================================================ */

let _servicosCatalogo = [];

document.addEventListener('DOMContentLoaded', async () => {
  await carregarCatalogo();

  document.getElementById('corte-modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) fecharCorteModal();
  });
});

async function carregarCatalogo() {
  const grid = document.getElementById('catalogo-grid');
  grid.innerHTML = '<p class="loading-txt">Carregando catálogo...</p>';
  try {
    _servicosCatalogo = await apiFetch('/servicos');
    renderCatalogo();
  } catch (err) {
    grid.innerHTML = `<p class="loading-txt">Erro ao carregar catálogo: ${err.message}</p>`;
  }
}

function renderCatalogo() {
  const grid = document.getElementById('catalogo-grid');

  if (!_servicosCatalogo.length) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">✂️</div><p>Nenhum estilo cadastrado ainda</p></div>';
    return;
  }

  grid.innerHTML = _servicosCatalogo.map(s => `
    <div class="catalogo-card" data-id="${s.id}">
      ${s.imagemUrl
        ? `<img class="catalogo-card-img" src="${s.imagemUrl}" alt="${s.nome}" onerror="this.outerHTML='<div class=&quot;catalogo-card-img placeholder&quot;>✂️</div>'" />`
        : `<div class="catalogo-card-img placeholder">✂️</div>`
      }
      <div class="catalogo-card-body">
        <div class="catalogo-card-nome">${s.nome}</div>
        <div class="catalogo-card-preco">${formatMoney(s.preco)}</div>
        <div class="catalogo-card-duracao">${s.duracao} min</div>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.catalogo-card').forEach(card => {
    card.addEventListener('click', () => abrirCorteModal(card.dataset.id));
  });
}

function abrirCorteModal(id) {
  const s = _servicosCatalogo.find(x => x.id == id);
  if (!s) return;

  const content = document.getElementById('corte-modal-content');
  content.innerHTML = `
    ${s.imagemUrl
      ? `<img class="corte-modal-img" src="${s.imagemUrl}" alt="${s.nome}" style="width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:10px;margin-bottom:16px;" onerror="this.outerHTML='<div class=&quot;catalogo-card-img placeholder&quot; style=&quot;aspect-ratio:1/1;border-radius:10px;margin-bottom:16px;&quot;>✂️</div>'" />`
      : `<div class="catalogo-card-img placeholder" style="aspect-ratio:1/1;border-radius:10px;margin-bottom:16px;">✂️</div>`
    }
    <h2 style="font-family:'Playfair Display',serif;font-size:20px;margin-bottom:6px;">${s.nome}</h2>
    <span class="badge">${formatMoney(s.preco)} · ${s.duracao} min</span>
    <p style="color:var(--muted);font-size:14px;margin:12px 0 20px;">${s.descricao || 'Sem descrição.'}</p>
    <div class="modal-actions">
      <a href="../index.html" class="btn btn-primary btn-full">Agendar este estilo</a>
    </div>
  `;
  document.getElementById('corte-modal-overlay').style.display = 'flex';
}

function fecharCorteModal() {
  document.getElementById('corte-modal-overlay').style.display = 'none';
}