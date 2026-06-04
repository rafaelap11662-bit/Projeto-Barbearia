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
import com.trabalho.barbershop.dto.UsuarioRequestDTO;
import com.trabalho.barbershop.dto.UsuarioResponseDTO;
import com.trabalho.barbershop.models.Usuario;
import com.trabalho.barbershop.repositories.UsuarioRepository;
import com.trabalho.barbershop.services.BarbeiroService;
import com.trabalho.barbershop.services.exceptions.DatabaseException;

@ExtendWith(MockitoExtension.class)
class BarbeiroServiceTest {

    @Mock
    private UsuarioRepository repository;
    @InjectMocks
    private BarbeiroService service;

    
    @Test
    void deveSalvarBarbeiroComSucesso() {

        // ARRANGE
        UsuarioRequestDTO dto = new UsuarioRequestDTO();  
        dto.setNome("Rafael"); 
        dto.setTelefone("43999999999");
        dto.setEmail("rafael@gmail.com");

        Usuario barbeiro = new Usuario();  
        barbeiro.setNome(dto.getNome()); 
        barbeiro.setTelefone(dto.getTelefone());
        barbeiro.setEmail(dto.getEmail());

        when(repository.findByTelefone(dto.getTelefone())).thenReturn(Optional.empty());  

        when(repository.save(org.mockito.ArgumentMatchers.any(Usuario.class))).thenReturn(barbeiro); 

        // ACT
        UsuarioResponseDTO response = service.salvar(dto); 

        // ASSERT
        assertThat(response).isNotNull();  
        assertThat(response.getNome()).isEqualTo("Rafael"); 
    }


    @Test
    void deveLancarErroQuandoTelefoneJaExistir() {

        // ARRANGE
        UsuarioRequestDTO dto =
            new UsuarioRequestDTO();

        dto.setTelefone("439999977799");

        Usuario barbeiro = new Usuario();

        when(repository.findByTelefone(dto.getTelefone()))
                .thenReturn(Optional.of(barbeiro));

        // ACT + ASSERT
        assertThrows(
            DatabaseException.class,
            () -> service.salvar(dto)
        );


    }
}