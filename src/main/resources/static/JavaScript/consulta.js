document.addEventListener('DOMContentLoaded', () => {

    const telefoneInput = document.getElementById('telefone-consulta');

    aplicarMascaraTelefone(telefoneInput);

    const btn = document.getElementById('btn-consultar');

    if (!btn) {
        console.error('Botão btn-consultar não encontrado');
        return;
    }

    btn.addEventListener('click', async () => {

        const telefone =
        document.getElementById('telefone-consulta').value.replace(/\D/g, '');

        try {

            const agendamentos =
                await apiFetch(`/agendamentos/telefone/${telefone}`);

            const resultado =
                document.getElementById('resultado-consulta');

            if (!agendamentos.length) {
                resultado.innerHTML =
                    '<p>Nenhum agendamento encontrado.</p>';
                return;
            }

            resultado.innerHTML = agendamentos.map(a => `
                <div class="item-card">

                    <div class="item-card-body">
                        <strong>${a.clienteNome}</strong><br>
                        Data: ${formatDate(a.data)}<br>
                        Horário: ${a.horario}<br>
                        Barbeiro: ${a.usuario?.nome ?? '-'}<br>
                        Corte: ${a.servicos?.join(', ') ?? '-'}
                    </div>

                    <div class="item-card-actions">
                        <button
                            type="button"
                            class="btn btn-danger btn-cancelar"
                            data-id="${a.id}">
                            Cancelar
                        </button>
                    </div>

                </div>
            `).join('');

            document.querySelectorAll('.btn-cancelar').forEach(btn => {
                btn.addEventListener('click', () => {
                    confirmDelete('Cancelar este agendamento?', async () => {
                    try {
                        await apiFetch(`/agendamentos/${btn.dataset.id}`, {
                        method: 'DELETE'
                    });

                    showToast('Agendamento cancelado', 'success');

                    btn.closest('.item-card').remove();
                    } catch (err) { showToast(err.message, 'error'); }
                    });
                });
                });

        } catch (e) {
            console.error(e);
            showToast('Erro ao consultar agendamentos', 'error');
        }

    });

});