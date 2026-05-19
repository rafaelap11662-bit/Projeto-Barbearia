package com.trabalho.barbershop.repositories;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.trabalho.barbershop.models.Agendamento;
import com.trabalho.barbershop.models.Barbeiro;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {
    
    boolean existsByBarbeiroAndDataAndHorario(
    Barbeiro barbeiro,
    String data,
    String horario
);

boolean existsByBarbeiroAndDataAndHorarioAndIdNot(
    Barbeiro barbeiro,
    String data,
    String horario,
    Long id
);

    List<Agendamento> findByData(String data);
}
