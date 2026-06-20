package com.trabalho.barbershop.dto;
import java.io.Serial;
import java.io.Serializable;

import com.trabalho.barbershop.models.Servico;

public class ServicoResponseDTO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;                // identificador único do serviço
    private String nome;            // nome do serviço
    private String descricao;       // descrição do serviço
    private Double preco;           // preço em reais
    private Integer duracao;        // duração em minutos
    private String imagemUrl;

    public ServicoResponseDTO() {
    }

    public ServicoResponseDTO(Servico servico) {
        id = servico.getId();
        nome = servico.getNome();
        descricao = servico.getDescricao();
        preco = servico.getPreco();
        duracao = servico.getDuracao();
        imagemUrl = servico.getImagemUrl();
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

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Double getPreco() {
        return preco;
    }

    public void setPreco(Double preco) {
        this.preco = preco;
    }

    public Integer getDuracao() {
        return duracao;
    }

    public void setDuracao(Integer duracao) {
        this.duracao = duracao;
    }

    public String getImagemUrl() {
        return imagemUrl;
    }

    public void setImagemUrl(String imagemUrl) {
        this.imagemUrl = imagemUrl;
    }
}
