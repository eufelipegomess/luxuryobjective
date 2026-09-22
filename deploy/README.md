# Instalação num servidor próprio (VPS)

O site é uma aplicação Next.js: precisa de um processo Node a correr, não de
alojamento PHP. É esse processo que trata dos formulários, do painel de
administração (`/admin`) e da atualização automática das páginas de projetos.

Um alojamento partilhado (planos Web/Business/Cloud da Hostinger, hPanel) não
serve para isto. Num plano desses só seria possível publicar páginas estáticas,
e perder-se-iam os formulários, o painel e a ligação ao Supabase.

Testado com **Node 22**.

---

## 1. Preparar o servidor

```bash
# Node 22 (via nvm, sem mexer no Node do sistema)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc && nvm install 22 && nvm alias default 22

sudo apt update && sudo apt install -y nginx git
```

## 2. Trazer o código

```bash
sudo mkdir -p /var/www/luxuryobjective && sudo chown "$USER" /var/www/luxuryobjective
git clone https://github.com/eufelipegomess/luxuryobjective.git /var/www/luxuryobjective
cd /var/www/luxuryobjective
```

## 3. Variáveis de ambiente

Criar `/var/www/luxuryobjective/.env.production` a partir de `.env.example`.
**Não** versionar este ficheiro. As chaves do Supabase estão no painel do
Supabase, em *Project Settings → API Keys*.

```ini
NEXT_PUBLIC_SITE_URL=https://luxuryobjective.com
# `true` enquanto for ambiente de aprovação; `false` no domínio definitivo,
# senão o site fica invisível no Google.
NEXT_PUBLIC_NOINDEX=false

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # só no servidor, nunca no cliente

RATE_LIMIT_SALT=...             # string longa e aleatória
```

## 4. Build

```bash
./deploy/build.sh
```

O script instala as dependências, compila em modo `standalone` e junta ao
resultado o `public/` e o `.next/static` — sem esses dois o site arranca mas
fica sem imagens nem estilos.

## 5. Manter o site a correr

```bash
sudo cp deploy/luxury-objective.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now luxury-objective
sudo systemctl status luxury-objective
```

O serviço arranca sozinho com o servidor e reinicia se o processo cair.

## 6. Servidor web e HTTPS

```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/luxuryobjective
# trocar o domínio dentro do ficheiro
sudo ln -s /etc/nginx/sites-available/luxuryobjective /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d luxuryobjective.com -d www.luxuryobjective.com
```

## 7. Atualizar o site

```bash
cd /var/www/luxuryobjective
git pull
./deploy/build.sh
sudo systemctl restart luxury-objective
```

---

## Notas

- **Memória:** o build precisa de ~1 GB livre. Num VPS de 1 GB sem swap pode
  falhar; nesse caso, compilar noutra máquina e enviar a pasta `.next`.
- **Vídeos da hero:** ~68 MB dentro do repositório (`public/media`). O `git
  clone` demora por causa disso.
- **Uploads do painel** vão para o Supabase Storage, não para o disco do
  servidor — mudar de servidor não perde ficheiros.
- **`netlify.toml`** só é lido pela Netlify. Fica no repositório sem efeito
  aqui; as regras que importam (cache e `X-Robots-Tag`) estão em
  `next.config.ts` e no `nginx.conf.example`, e valem em qualquer servidor.
