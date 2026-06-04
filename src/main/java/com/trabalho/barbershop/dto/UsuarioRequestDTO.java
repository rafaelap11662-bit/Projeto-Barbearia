package com.trabalho.barbershop.dto;


public class UsuarioRequestDTO {
    
    private String nome;            // nome do usuário
    private String telefone;        // telefone de contato
    private String email;           // email de contato

    public UsuarioRequestDTO() {
    }

    public UsuarioRequestDTO(String nome, String telefone, String email) {
        this.nome = nome;
        this.telefone = telefone;
        this.email = email;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

}
