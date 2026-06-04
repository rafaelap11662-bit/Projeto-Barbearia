package com.trabalho.barbershop.repositories;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.trabalho.barbershop.models.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByTelefone(String telefone); 

}
