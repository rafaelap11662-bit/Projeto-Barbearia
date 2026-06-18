package com.trabalho.barbershop.services;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.trabalho.barbershop.dto.AuthRequestDTO;
import com.trabalho.barbershop.dto.AuthResponseDTO;
import com.trabalho.barbershop.models.Usuario;
import com.trabalho.barbershop.repositories.UsuarioRepository;
import com.trabalho.barbershop.services.exceptions.DatabaseException;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public AuthResponseDTO login(AuthRequestDTO dto) {
        Usuario usuario = usuarioRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new DatabaseException("E-mail ou senha inválidos"));

        if (!encoder.matches(dto.getSenha(), usuario.getSenha())) {
            throw new DatabaseException("E-mail ou senha inválidos");
        }

        return new AuthResponseDTO(usuario);
    }
}