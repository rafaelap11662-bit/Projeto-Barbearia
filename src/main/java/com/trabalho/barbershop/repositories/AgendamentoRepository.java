package com.trabalho.barbershop.repositories;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.trabalho.barbershop.models.Agendamento;
import com.trabalho.barbershop.models.Usuario;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {
    
    boolean existsByUsuarioAndDataAndHorario(
    Usuario usuario,
    String data,
    String horario
);

boolean existsByUsuarioAndDataAndHorarioAndIdNot(
    Usuario usuario,
    String data,
    String horario,
    Long id
);

    List<Agendamento> findByData(String data);
}
