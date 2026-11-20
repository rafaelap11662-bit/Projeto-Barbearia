
package com.trabalho.barbershop;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.trabalho.barbershop.dto.ServicoRequestDTO;
import com.trabalho.barbershop.dto.ServicoResponseDTO;
import com.trabalho.barbershop.models.Servico;
import com.trabalho.barbershop.repositories.ServicoRepository;
import com.trabalho.barbershop.services.ServicoService;
import com.trabalho.barbershop.services.exceptions.DatabaseException;

@ExtendWith(MockitoExtension.class)
class ServicoServiceTest {

    @Mock
    private ServicoRepository repository;

    @InjectMocks
    private ServicoService service;

    @Test
    void deveSalvarServicoComSucesso() {

        // ARRANGE
        ServicoRequestDTO dto = new ServicoRequestDTO();
        dto.setNome("Corte masculino");
        dto.setDescricao("Corte tradicional");
        dto.setPreco(40.0);
        dto.setDuracao(30);

        Servico servico = new Servico();
        servico.setNome(dto.getNome());
        servico.setDescricao(dto.getDescricao());
        servico.setPreco(dto.getPreco());
        servico.setDuracao(dto.getDuracao());

        when(repository.findByNome(dto.getNome()))
                .thenReturn(Optional.empty());

        when(repository.save(org.mockito.ArgumentMatchers.any(Servico.class)))
                .thenReturn(servico);

        // ACT
        ServicoResponseDTO response = service.salvar(dto);

        // ASSERT
        assertThat(response).isNotNull();
        assertThat(response.getNome()).isEqualTo("Corte masculino");
    }

    @Test
    void deveLancarErroQuandoNomeDoServicoJaExistir() {

        // ARRANGE
        ServicoRequestDTO dto = new ServicoRequestDTO();
        dto.setNome("Corte masculino");

        Servico servico = new Servico();
        servico.setNome("Corte masculino");

        when(repository.findByNome(dto.getNome())).thenReturn(Optional.of(servico));

        // ACT + ASSERT
        assertThrows(DatabaseException.class, () -> service.salvar(dto)
        );
    }
}
