# Home — Ricardo Tocha

Atualizado: 15/10/2026. Implementação local da navegação entre ambientes, autorizada por Ricardo.

Copy e decisão vigente: [brief](/Users/tocha/Dev/maquina-mkt-content/clientes/ricardo-tocha/estrategia/sites/ricardotocha.md). Texto em `src/pages/index.astro` e `src/components/LabConsole.astro`; não duplicar a copy neste documento.

## Experiência

- "Explorar o laboratório" abre o portão. A câmera atravessa a entrada e chega ao ambiente "Para quem quer".
- Quatro ambientes próprios: bancada em "O que eu faço", monitores em "Athena", mesa de seis etapas em "Como eu trabalho" e espaço de conversa em "Como começar".
- Portas no cenário, mapa e links conduzem a câmera. URLs com fragmento, voltar e avançar preservam a navegação.
- Cada ambiente apresenta apenas a copy do brief. Exemplos de atendimento e títulos comerciais acrescentados pela versão anterior foram retirados.
- Conteúdo e controles em HTML. Etapas expansíveis, foco após a chegada, painel rolável para textos longos.
- Pausa e preferência de movimento reduzido interrompem os movimentos e tornam a troca de ambientes imediata. Sem WebGL, conteúdo continua navegável; sem JavaScript, seções ficam em fluxo normal.
- Decisão de 15/10/2026: remover o formulário da home e manter contato somente pelo botão do WhatsApp. Evento de WhatsApp e acessos existentes preservados.

## Arquivos

- `src/components/LabConsole.astro`: benefícios do brief e inicialização.
- `src/scripts/lab.ts`: navegação, histórico, foco e controles.
- `src/scripts/lab-scene.ts`: ambientes, objetos, trajetos de câmera e renderização.
- `src/styles/laboratory.css`: apresentação responsiva.

Versões anteriores em `docs/archive/2026-10-14-laboratorio/`: `site-antes-da-home.tar.gz`, `home-antes-da-experiencia.tar.gz` e `home-antes-dos-ambientes.tar.gz`.

Roteiro reproduzível: `scripts/check-home-lab.mjs`. Usa Playwright instalado ou `PLAYWRIGHT_MODULE` com o caminho do módulo. Grava capturas e resultado JSON em `/tmp/tocha-rooms-check`; não envia o formulário. A conferência desta revisão foi feita na prévia pelo navegador, com build e checagem de tipos locais.
