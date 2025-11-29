# Jarvis HUD (backend + frontend) — Ready for Render

## O que está aqui
- `server.js` — Node/Express backend que serve o HUD e fornece endpoints proxy + cache.
- `public/index.html` — Frontend HUD (simples, abre direto no navegador).
- `package.json` — Dependências e start script.
- `.env.example` — modelo de variáveis de ambiente.

## Variáveis de ambiente
Create a `.env` file with:
```
COINGLASS_KEY=your_coinglass_key_here
NODE_ENV=production
```

## Como testar localmente (PC)
1. Instale Node.js (v18+ recomendado).
2. Copie `.env.example` → `.env` e preencha COINGLASS_KEY.
3. `npm install`
4. `node server.js`
5. Abra `http://localhost:3000`

## Deploy rápido na Render (recomendado)
1. Crie uma conta em https://render.com
2. Crie um novo **Web Service** → **Deploy from GitHub** (ou "Manual Deploy" se preferir).
3. Aponte para o repositório que contenha esses arquivos (ou faça upload do ZIP).
4. Configure as Environment Variables no painel do serviço (COINGLASS_KEY).
5. Build & Deploy → pronto: o serviço vai expor uma URL pública.
6. Abra a URL no navegador do celular (modo desktop) e o HUD vai carregar.

## Observações
- O backend faz cache por alguns segundos para reduzir uso de requests nas APIs (ajuste TTL em `server.js`).
- Não commit suas chaves em repositórios públicos. Use as configurações de Environment Variables do Render.
- Se quiser, posso gerar o ZIP pronto com estes arquivos para você enviar no Render web UI (drag & drop) — e já inclui instruções passo-a-passo para subir pelo celular.