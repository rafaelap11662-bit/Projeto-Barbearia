package com.trabalho.barbershop.dto;

import com.trabalho.barbershop.models.Usuario;

public class AuthResponseDTO {
    private String token;
    private UsuarioResponseDTO usuario;

    public AuthResponseDTO(Usuario usuario) {
        this.token = "token-" + usuario.getId(); // token simples por enquanto
        this.usuario = new UsuarioResponseDTO(usuario);
    }

    public String getToken() { return token; }
    public UsuarioResponseDTO getUsuario() { return usuario; }
}