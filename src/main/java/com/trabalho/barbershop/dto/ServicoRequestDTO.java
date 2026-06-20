package com.trabalho.barbershop.dto;

public class ServicoRequestDTO {

    private String nome;            // nome do serviço
    private String descricao;       // descrição do serviço
    private Double preco;           // preço em reais
    private Integer duracao;        // duração em minutos
    private String imagemUrl;       // foto ilustrativa do serviço (catálogo)

    public ServicoRequestDTO() {
    }

    public ServicoRequestDTO(String nome, String descricao, Double preco, Integer duracao) {
        this.nome = nome;
        this.descricao = descricao;
        this.preco = preco;
        this.duracao = duracao;
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
