package com.trabalho.barbershop.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.trabalho.barbershop.services.exceptions.DatabaseException;

@RestController
@RequestMapping("/upload")
public class UploadController {

    private final String uploadDir = "uploads";

    @PostMapping
    public ResponseEntity<Map<String, String>> uploadImagem(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new DatabaseException("Arquivo vazio.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new DatabaseException("Apenas arquivos de imagem são permitidos.");
        }

        try {
            Path dirPath = Paths.get(uploadDir);
            if (!Files.exists(dirPath)) {
                Files.createDirectories(dirPath);
            }

            String extensao = "";
            String nomeOriginal = file.getOriginalFilename();
            if (nomeOriginal != null && nomeOriginal.contains(".")) {
                extensao = nomeOriginal.substring(nomeOriginal.lastIndexOf("."));
            }

            String nomeArquivo = UUID.randomUUID().toString() + extensao;
            Path destino = dirPath.resolve(nomeArquivo);
            Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

            String urlPublica = "/uploads/" + nomeArquivo;
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("url", urlPublica));

        } catch (IOException e) {
            throw new DatabaseException("Erro ao salvar a imagem: " + e.getMessage());
        }
    }
}