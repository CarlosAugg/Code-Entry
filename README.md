# Code Entry

Plataforma educacional interativa de programação e tecnologia. O aplicativo funciona inteiramente no navegador, sem servidor ou chamadas para uma API própria.

## Recursos

- 7 trilhas com 58 aulas e 21 desafios.
- Execução local no navegador para Portugol, JavaScript, Python, C++, Linux virtual, redes e SQL.
- 8 paletas de tema, personalização, tour interativo, metas, progresso, histórico e conquistas.
- Dados mantidos no próprio navegador usando IndexedDB. As preferências pequenas de tema e layout usam localStorage.
- Exportação e importação de backup JSON para levar os dados entre navegadores ou dispositivos.

## Executar durante o desenvolvimento

Requer Node.js 22.5 ou superior para ferramentas de build e verificação.

~~~bash
npm ci
npm run dev
~~~

Abra o endereço informado pelo Vite. Para validar o projeto:

~~~bash
npm run typecheck
npm run verify
npm run build
~~~

## GitHub Pages

O workflow .github/workflows/pages.yml compila o projeto com a base /Code-Entry/, executa typecheck e verificações, publica dist/ como artifact e contém um job de deploy manual, limitado a execuções workflow_dispatch na branch main.

A etapa de build do Pages não publica automaticamente. Para publicar, a execução manual precisa ser iniciada em main depois que essa alteração for integrada. O workflow cria dist/404.html para permitir abrir diretamente as rotas do React Router no domínio do Pages.

## Dados locais e backups

O progresso fica isolado por navegador e dispositivo e não é enviado a serviços externos. Limpar os dados do site ou trocar de navegador remove o acesso ao banco local, por isso exporte backups JSON periodicamente.

Para migrar dados do antigo aplicativo local, abra a versão antiga enquanto ela ainda tem o arquivo SQLite disponível, use Perfil e Preferências → Exportar e importe o JSON no Code Entry publicado. O site não consegue ler arquivos SQLite do computador sem o usuário selecionar e importar um arquivo; o backup JSON preserva o formato v4 e também aceita backups legados compatíveis.

## SQL

A bancada SQL usa SQLite compilado para WebAssembly no navegador. Os datasets didáticos E-commerce TechStore e Corporação NexusRH são recriados para cada execução, preservando o comportamento atual do sandbox em memória. As demais preferências, rascunhos, progresso, atividades e workspaces persistem localmente.
