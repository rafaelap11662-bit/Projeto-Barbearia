package com.trabalho.barbershop.dto;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;
import java.util.stream.Collectors;

import com.trabalho.barbershop.models.Agendamento;

public class AgendamentoResponseDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private String data;
    private String horario;
    private String clienteNome;
    private String clienteTelefone;
    private UsuarioResponseDTO usuario;

    // NOVO
    private List<String> servicos;

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

        
        if (agendamento.getServicos() != null) {
            this.servicos = agendamento.getServicos()
                    .stream()
                    .map(servico -> servico.getNome())
                    .collect(Collectors.toList());
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

    // NOVO
    public List<String> getServicos() {
        return servicos;
    }

    public void setServicos(List<String> servicos) {
        this.servicos = servicos;
    }
}