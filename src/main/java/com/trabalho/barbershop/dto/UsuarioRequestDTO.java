package com.trabalho.barbershop.dto;


public class UsuarioRequestDTO {
    
    private String nome;            // nome do usuário
    private String telefone;        // telefone de contato
    private String email;           // email de contato
    private String tipoUsuario;    // tipo do usuário (ADMINISTRADOR, BARBEIRO ou CLIENTE)
    private String senha;          // senha para autenticação

    public UsuarioRequestDTO() {
    }

    // construtor completo
    public UsuarioRequestDTO(String nome, String telefone, String email, String tipoUsuario, String senha) {
        this.nome = nome;
        this.telefone = telefone;
        this.email = email;
        this.tipoUsuario = tipoUsuario;
        this.senha = senha;
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

    public String getTipoUsuario() {
        return tipoUsuario;
    }
    
    public void setTipoUsuario(String tipoUsuario) {
        this.tipoUsuario = tipoUsuario;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

}
