package com.trabalho.barbershop.dto;
import java.io.Serial;
import java.io.Serializable;
import com.trabalho.barbershop.models.Usuario;

public class UsuarioResponseDTO implements Serializable{
    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;              // identificador único do usuário
    private String nome;            // nome do usuário
    private String telefone;        // telefone de contato
    private String email;           // email de contato

    public UsuarioResponseDTO() {
    }

    public UsuarioResponseDTO(Usuario usuario) {
        id = usuario.getId();
        nome = usuario.getNome();
        telefone = usuario.getTelefone();
        email = usuario.getEmail();
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
