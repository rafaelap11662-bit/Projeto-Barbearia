# Deploy da Barbearia em uma EC2 (t3.micro) — Passo a passo

Guia para subir a aplicação **Spring Boot + MySQL + nginx** em uma instância
EC2 e disponibilizar na internet. Pensado como exemplo de **Sistemas Distribuídos**
(load balancer + réplicas).

> ⚠️ **Atenção à RAM:** a `t3.micro` tem **1 GiB de RAM**. Rodar MySQL + 2 réplicas
> Java + nginx é apertado. Por isso o passo de **swap** abaixo é importante.
> Se faltar memória, reduza para 1 réplica (`replicas: 1` no `docker-compose.yml`).

---

## 1. Criar a instância EC2

1. Console AWS → **EC2** → **Launch instance**.
2. **Name:** `barbearia-sd`.
3. **AMI:** Amazon Linux 2023 (ou Ubuntu 22.04 — comandos abaixo cobrem os dois).
4. **Instance type:** `t3.micro`.
5. **Key pair:** crie/escolha um par de chaves `.pem` (usado no SSH).
6. **Storage:** 8 GiB já basta.

## 2. Security Group (firewall) — liberar acesso

Crie/edite o Security Group com estas regras de **Inbound**:

| Tipo  | Protocolo | Porta | Origem        | Para quê                         |
|-------|-----------|-------|---------------|----------------------------------|
| SSH   | TCP       | 22    | **Seu IP**    | acessar a máquina (não use 0.0.0.0/0) |
| HTTP  | TCP       | 80    | 0.0.0.0/0     | acesso público à aplicação (nginx) |

> Não precisa abrir 8080 nem 3306: a app e o banco ficam internos à rede do Docker.
> O nginx (porta 80) é a única porta de entrada.

## 3. Conectar via SSH

```bash
# de o nome do seu arquivo .pem e o IP publico da instancia
chmod 400 minha-chave.pem
# Amazon Linux:
ssh -i minha-chave.pem ec2-user@SEU_IP_PUBLICO
# Ubuntu:
# ssh -i minha-chave.pem ubuntu@SEU_IP_PUBLICO
```

## 4. Instalar Docker + Docker Compose

### Amazon Linux 2023
```bash
sudo dnf update -y
sudo dnf install -y docker git
sudo systemctl enable --now docker
# rodar docker sem sudo (precisa relogar depois)
sudo usermod -aG docker $USER
# plugin do compose v2
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
```

### Ubuntu 22.04
```bash
sudo apt update && sudo apt install -y docker.io docker-compose-v2 git
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

**Saia e entre de novo no SSH** (`exit` e reconecte) para o grupo `docker` valer.
Confira:
```bash
docker --version
docker compose version
```

## 5. Criar SWAP (essencial na t3.micro de 1 GiB)

Swap = "memória virtual" em disco. Evita que o build do Maven / a JVM
sejam mortos por falta de RAM (`OOM Killer`).

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
# tornar permanente (sobrevive a reboot)
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h   # confirma o swap ativo
```

## 6. Clonar o projeto

```bash
git clone https://github.com/SEU_USUARIO/Projeto-Barbearia.git
cd Projeto-Barbearia
```

## 7. Subir a aplicação

```bash
# --build  : constroi a imagem da app pelo Dockerfile
# -d       : roda em background (detached)
docker compose up --build -d
```

O primeiro build baixa dependências e demora alguns minutos.
Acompanhe a inicialização:

```bash
docker compose ps          # estado dos containers (espere ficarem "Up")
docker compose logs -f app # logs da aplicacao (espere "Started BarbershopApplication")
```

> Sem healthcheck a app pode tentar conectar antes do MySQL terminar de subir.
> Se a app falhar na 1a vez, rode `docker compose restart app` que ela reconecta.

## 8. Testar o acesso

No navegador: `http://SEU_IP_PUBLICO`

Ou pelo terminal:
```bash
curl http://SEU_IP_PUBLICO/actuator/health   # deve responder {"status":"UP"}
```

---

## 9. Demonstrações de Sistemas Distribuídos (para a aula)

### Ver as réplicas rodando
```bash
docker compose ps
# deve aparecer barbearia-app-1 e barbearia-app-2
```

### Provar o balanceamento de carga
Cada requisição pode cair em uma réplica diferente. Veja os logs de cada uma
enquanto faz vários `curl http://SEU_IP_PUBLICO/...` — as linhas aparecem
alternando entre as réplicas:
```bash
docker compose logs -f app
```

### Escalar em tempo real (sem editar arquivo)
```bash
docker compose up -d --scale app=3   # sobe para 3 replicas
docker compose up -d --scale app=1   # volta para 1
```
> Lembre do limite de RAM: 3 réplicas + MySQL na t3.micro pode estourar.

### Testar resiliência (derrubar uma réplica)
```bash
docker compose ps                 # pegue o nome de uma replica
docker kill barbearia-app-2       # mata uma replica
# o nginx continua servindo pela replica que sobrou; o Compose recria a morta
```

### Ver consumo de recursos (os limits em ação)
```bash
docker stats
```

---

## 10. Comandos úteis do dia a dia

```bash
docker compose logs -f            # logs de tudo
docker compose restart            # reinicia os servicos
docker compose down               # derruba tudo (mantem o volume do banco)
docker compose down -v            # derruba E apaga os dados do MySQL
docker compose up --build -d      # rebuild apos mudar o codigo
```

---

## 11. Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| App reinicia em loop / `OOMKilled` | Falta de RAM | Crie o swap (passo 5) e/ou reduza `replicas` para 1 |
| App não conecta no banco | MySQL ainda subindo | `docker compose restart app` (reconecta); veja `docker compose logs mysql` |
| `http://IP` não abre | Porta 80 fechada | Revise o Security Group (passo 2) |
| Build muito lento / trava | Pouca memória no `mvn package` | Garanta o swap antes do `up --build` |
| Mudei o código e não atualizou | Imagem antiga | `docker compose up --build -d` |

---

## (Opcional) Domínio + HTTPS

Para um endereço amigável e cadeado verde:
1. Aponte um domínio (Route 53 ou outro) para o IP público da EC2.
2. Adicione um container `certbot` ou use o **Caddy** no lugar do nginx
   (gera TLS automático). Abra a porta **443** no Security Group.
