package com.trabalho.barbershop.dto;
import java.io.Serial;
import java.io.Serializable;

import com.trabalho.barbershop.models.Agendamento;

public class AgendamentoResponseDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;                        // identificador único do agendamento
    private String data;
    private String horario;                 // data e hora do agendamento
    private String clienteNome;             // nome do cliente
    private String clienteTelefone;         // telefone do cliente
    private UsuarioResponseDTO usuario;   // informações do barbeiro
    
    public AgendamentoResponseDTO() {
    }
    
    public AgendamentoResponseDTO(Agendamento agendamento) { 
        this.id = agendamento.getId();
        this.data = agendamento.getData().toString();
        this.horario = agendamento.getHorario().toString();
        this.clienteNome = agendamento.getNomeCliente();
        this.clienteTelefone = agendamento.getTelefoneCliente();
        if (agendamento.getUsuario() != null) {
            this.usuario = new UsuarioResponseDTO(agendamento.getUsuario());
        }
    }

    public static long getSerialversionuid() {
        return serialVersionUID;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    public String getHorario() {
        return horario;
    }

    public void setHorario(String horario) {
        this.horario = horario;
    }

    public String getClienteNome() {
        return clienteNome;
    }

    public void setClienteNome(String clienteNome) {
        this.clienteNome = clienteNome;
    }

    public String getClienteTelefone() {
        return clienteTelefone;
    }

    public void setClienteTelefone(String clienteTelefone) {
        this.clienteTelefone = clienteTelefone;
    }

    public UsuarioResponseDTO getUsuario() {
        return usuario;
    }


    public void setUsuario(UsuarioResponseDTO usuario) {
        this.usuario = usuario;
    }

}