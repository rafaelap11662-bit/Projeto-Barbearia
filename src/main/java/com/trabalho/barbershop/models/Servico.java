package com.trabalho.barbershop.models;
import java.io.Serial;
import java.io.Serializable;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "servicos")
public class Servico implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;    

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;                // identificador único do serviço
        private String nome;            // nome do serviço
        private String descricao;       // descrição do serviço
        private Double preco;           // preço em reais
        private Integer duracao;        // duração em minutos
        private String imagemUrl;       // foto ilustrativa do serviço (catálogo)

    public Servico() {
    }

    public Servico(String nome, String descricao, Double preco, Integer duracao, String imagemUrl) {
        this.nome = nome;
        this.descricao = descricao;
        this.preco = preco;
        this.duracao = duracao;
        this.imagemUrl = imagemUrl;
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

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0; 
    }

    @Override
    public boolean equals(Object obj) {
            return super.equals(obj);
    }
}