package com.trabalho.barbershop;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.trabalho.barbershop.dto.AgendamentoRequestDTO;
import com.trabalho.barbershop.dto.AgendamentoResponseDTO;
import com.trabalho.barbershop.models.Agendamento;
import com.trabalho.barbershop.models.Usuario;
import com.trabalho.barbershop.repositories.AgendamentoRepository;
import com.trabalho.barbershop.repositories.UsuarioRepository;
import com.trabalho.barbershop.repositories.ServicoRepository;
import com.trabalho.barbershop.services.AgendamentoService;
import com.trabalho.barbershop.services.exceptions.DatabaseException;

@ExtendWith(MockitoExtension.class)
class AgendamentoServiceTest {

    @Mock
    private AgendamentoRepository agendamentoRepository;
    @Mock
    private UsuarioRepository barbeiroRepository;
    @Mock
    private ServicoRepository servicoRepository;
    @InjectMocks
    private AgendamentoService service;


    @Test
    void deveSalvarAgendamentoComSucesso() { // Testa o cenário de sucesso ao salvar um agendamento, verificando se o resultado não é nulo e se os dados estão corretos

        // ARRANGE
        AgendamentoRequestDTO dto = new AgendamentoRequestDTO();

        dto.setNomeCliente("João");
        dto.setTelefoneCliente("43999999999");
        dto.setData("2026-05-20");
        dto.setHorario("14:00");
        dto.setBarbeiroId(1L);
        dto.setServicosIds(Collections.singletonList(1L)); 

        Usuario barbeiro = new Usuario();
        barbeiro.setId(1L);
        barbeiro.setNome("Rafael");
        barbeiro.setTelefone("43999999999");
        barbeiro.setEmail("rafael@gmail.com");

        Agendamento agendamento = new Agendamento();
        agendamento.setNomeCliente("João");
        agendamento.setTelefoneCliente("43999999999");
        agendamento.setData("2026-05-20");
        agendamento.setHorario("14:00");
        agendamento.setUsuario(barbeiro);


        when(barbeiroRepository.findById(1L)).thenReturn(Optional.of(barbeiro)); // Simula a busca do barbeiro pelo ID

        when(servicoRepository.findAllById(org.mockito.ArgumentMatchers.any())).thenReturn(Collections.emptyList()); // Simula a busca dos serviços pelos IDs

        when(agendamentoRepository.existsByUsuarioAndDataAndHorario(barbeiro, "2026-05-20", "14:00")).thenReturn(false); // Simula que o horário não está ocupado

        when(agendamentoRepository.save(org.mockito.ArgumentMatchers.any(Agendamento.class))).thenReturn(agendamento); // Simula a gravação do agendamento e retorna o objeto salvo

        // ACT
        AgendamentoResponseDTO result = service.salvar(dto); // Chama o método de salvar o agendamento com os dados do DTO

        // ASSERT
        assertThat(result).isNotNull(); 
    }

    @Test
    void deveLancarErroQuandoHorarioEstiverOcupado() { // Testa o cenário em que o horário do agendamento já está ocupado, esperando que uma exceção seja lançada

        // ARRANGE
        AgendamentoRequestDTO dto = new AgendamentoRequestDTO();

        dto.setData("2026-05-20");
        dto.setHorario("14:00");
        dto.setBarbeiroId(1L);
        dto.setServicosIds(Collections.singletonList(1L)); 

        Usuario barbeiro = new Usuario();
        
        when(barbeiroRepository.findById(1L)).thenReturn(Optional.of(barbeiro));

        when(servicoRepository.findAllById(org.mockito.ArgumentMatchers.any())).thenReturn(Collections.emptyList());

        when(agendamentoRepository.existsByUsuarioAndDataAndHorario( barbeiro, "2026-05-20", "14:00")).thenReturn(true);

        // ACT + ASSERT
        assertThrows(DatabaseException.class,() -> service.salvar(dto));
    }
}