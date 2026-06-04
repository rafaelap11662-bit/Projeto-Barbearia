package com.trabalho.barbershop.services;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import com.trabalho.barbershop.dto.AgendamentoResponseDTO;
import com.trabalho.barbershop.models.Agendamento;
import com.trabalho.barbershop.models.Usuario;
import com.trabalho.barbershop.models.Servico;
import com.trabalho.barbershop.repositories.AgendamentoRepository;
import com.trabalho.barbershop.repositories.UsuarioRepository;
import com.trabalho.barbershop.repositories.ServicoRepository;
import com.trabalho.barbershop.services.exceptions.DatabaseException;
import com.trabalho.barbershop.dto.AgendamentoRequestDTO;   
import jakarta.transaction.Transactional;

@Service
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final UsuarioRepository barbeiroRepository;
    private final ServicoRepository servicoRepository;

    public AgendamentoService(AgendamentoRepository agendamentoRepository, UsuarioRepository barbeiroRepository, ServicoRepository servicoRepository) { 
        this.agendamentoRepository = agendamentoRepository;
        this.barbeiroRepository = barbeiroRepository;
        this.servicoRepository = servicoRepository;
    }

    @Transactional
    public AgendamentoResponseDTO salvar(AgendamentoRequestDTO dto) { 
        Usuario barbeiro = barbeiroRepository.findById(dto.getBarbeiroId())
                .orElseThrow(() -> new DatabaseException("Barbeiro não encontrado"));

        List<Servico> servicos = servicoRepository.findAllById(dto.getServicosIds());



        boolean ocupado = agendamentoRepository.existsByUsuarioAndDataAndHorario(
            barbeiro,
            dto.getData(),
            dto.getHorario()
        );
        if (ocupado) {
            throw new DatabaseException("Este horário já está ocupado");
        }

        Agendamento agendamento = new Agendamento();
        agendamento.setNomeCliente(dto.getNomeCliente());
        agendamento.setTelefoneCliente(dto.getTelefoneCliente());
        agendamento.setData(dto.getData());
        agendamento.setHorario(dto.getHorario());
        agendamento.setUsuario(barbeiro);
        agendamento.setServicos(servicos);

        Agendamento salvo = agendamentoRepository.save(agendamento);

        return new AgendamentoResponseDTO(salvo);
    }



    public AgendamentoResponseDTO buscarPorId(Long id) {
        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new DatabaseException("Agendamento não encontrado com id: " + id));

        return new AgendamentoResponseDTO(agendamento);
    }



    public List<AgendamentoResponseDTO> listarTodos() {
        List<Agendamento> list = agendamentoRepository.findAll();
        return list.stream().map(AgendamentoResponseDTO::new).collect(java.util.stream.Collectors.toList());
    }



    public void deletar(Long id) {
        buscarPorId(id);

        agendamentoRepository.deleteById(id);
    }


    
    @Transactional
    public AgendamentoResponseDTO atualizar(Long id, AgendamentoRequestDTO dto) {
        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new DatabaseException("Agendamento não encontrado com id: " + id)); 

        Usuario barbeiro = barbeiroRepository.findById(dto.getBarbeiroId())
                .orElseThrow(() -> new DatabaseException("Barbeiro não encontrado"));

        List<Servico> servicos = servicoRepository.findAllById(dto.getServicosIds());

        boolean ocupado = agendamentoRepository.existsByUsuarioAndDataAndHorarioAndIdNot(
            barbeiro,
            dto.getData(),
            dto.getHorario(),
            id
        );
        if (ocupado) {
            throw new DatabaseException("Este horário já está ocupado");
        }

        agendamento.setNomeCliente(dto.getNomeCliente());
        agendamento.setTelefoneCliente(dto.getTelefoneCliente());
        agendamento.setData(dto.getData());
        agendamento.setHorario(dto.getHorario());
        agendamento.setUsuario(barbeiro);
        agendamento.setServicos(servicos);

        Agendamento atualizado = agendamentoRepository.save(agendamento);
        return new AgendamentoResponseDTO(atualizado);
    }

    public List<String> horariosPadrao(){
        return List.of(
            "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
        );
    }

    public List<String> listarHorariosDisponiveis(
    String data
) {

    List<String> horarios = new ArrayList<>(
        horariosPadrao()
    );

    List<Agendamento> ocupados =
        agendamentoRepository.findByData(data);

    for (Agendamento agendamento : ocupados) {

        horarios.remove(
            agendamento.getHorario()
        );
    }

    return horarios;
}
}
