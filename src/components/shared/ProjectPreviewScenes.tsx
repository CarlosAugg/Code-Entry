import React from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Check,
  CheckCircle2,
  Clock,
  Command,
  Database,
  Globe,
  Link2,
  Lock,
  Moon,
  Plus,
  Search,
  Server,
  ShieldCheck,
  Terminal,
} from "lucide-react";

export interface ProjectReferenceMeta {
  siteName: string;
  url: string;
  demoUrl: string;
  domainTag: string;
  whyReference: string;
  lightSurface?: boolean;
}

export const PROJECT_REFERENCES: Record<string, ProjectReferenceMeta> = {
  "fs-cp-static": {
    siteName: "Stripe Pricing",
    url: "https://stripe.com/pricing",
    demoUrl: "devflow.app/planos",
    domainTag: "Landing Page & Planos",
    whyReference: "Referência global de hierarquia visual clara, cartões de preços comparativos e layout responsivo sem poluição.",
    lightSurface: true,
  },
  "fe-checkpoint-ui": {
    siteName: "Todoist",
    url: "https://todoist.com",
    demoUrl: "metas-estudo.app/hoje",
    domainTag: "Lista Interativa & Filtros",
    whyReference: "Exemplifica filtros instantâneos, barras de progresso por categoria e alternância fluida entre temas claro e escuro.",
    lightSurface: true,
  },
  "fs-cp-interactive": {
    siteName: "Trello",
    url: "https://trello.com",
    demoUrl: "quadro-estudos.app/sprint",
    domainTag: "Workspace Kanban & Estado",
    whyReference: "Mostra gerenciamento visual de tarefas por estágios com contadores de avanço persistidos no navegador.",
  },
  "fe-project-spa": {
    siteName: "Linear",
    url: "https://linear.app",
    demoUrl: "workspace-spa.dev/modulo",
    domainTag: "SPA + Busca por Teclado",
    whyReference: "Referência moderna de aplicação web rápida no navegador com paleta de comandos (Ctrl+K) e estados tratados.",
  },
  "fs-cp-crud": {
    siteName: "Notion",
    url: "https://www.notion.so",
    demoUrl: "meu-controle.app/crud",
    domainTag: "CRUD Autenticado + SQL",
    whyReference: "Mostra organização limpa de banco estruturado, ações de criação/edição/remoção e indicadores autenticados.",
    lightSurface: true,
  },
  "fs-project-complete": {
    siteName: "Vercel Dashboard",
    url: "https://vercel.com",
    demoUrl: "saas-producao.dev/deploy",
    domainTag: "SaaS em Produção & CI/CD",
    whyReference: "Ilustra um produto web publicado em HTTPS com telemetria real, pipeline automático e saúde de banco.",
  },
  "be-checkpoint-api": {
    siteName: "Swagger UI",
    url: "https://petstore.swagger.io",
    demoUrl: "api.cursos.dev/docs",
    domainTag: "API REST + Swagger / JWT",
    whyReference: "Interface padrão da indústria para testar rotas GET/POST autenticadas por token e inspecionar JSON retornado.",
    lightSurface: true,
  },
  "be-project-service": {
    siteName: "Bitly",
    url: "https://bitly.com",
    demoUrl: "sho.rt/painel-links",
    domainTag: "Encurtador + Cache Redis",
    whyReference: "Mostra o produto real por trás de um encurtador: URLs curtas, contagem analítica SQL e latência em cache.",
    lightSurface: true,
  },
  "sn-ops-project": {
    siteName: "Cloudflare",
    url: "https://www.cloudflare.com",
    demoUrl: "ops-dmz.internal/auditoria",
    domainTag: "Auditoria Linux & Rede DMZ",
    whyReference: "Combina inspeção de logs de serviço com painel claro de regras de tráfego e portas liberadas na DMZ.",
  },
  "ds-checkpoint-report": {
    siteName: "Metabase",
    url: "https://www.metabase.com",
    demoUrl: "bi.vendas.sql/relatorio",
    domainTag: "Relatório SQL Analítico",
    whyReference: "Mostra como consultas SQL com JOIN e GROUP BY viram gráficos executivos e alertas acionáveis de estoque.",
    lightSurface: true,
  },
  "cs-checkpoint-algo": {
    siteName: "LeetCode",
    url: "https://leetcode.com",
    demoUrl: "judge.cs/validar-pilha",
    domainTag: "Juiz Online & Testes de Pilha",
    whyReference: "Experiência clássica de desafios algorítmicos: enunciado, código com estrutura de pilha e bateria de casos aprovados.",
  },
};

export function getProjectReference(nodeId: string): ProjectReferenceMeta {
  return PROJECT_REFERENCES[nodeId] ?? PROJECT_REFERENCES["fs-project-complete"];
}

const MockBrowserShell: React.FC<{
  url: string;
  light?: boolean;
  children: React.ReactNode;
}> = ({ url, light = false, children }) => (
  <div className={`ce-mock-browser ${light ? "is-light" : "is-dark"}`}>
    <div className="ce-mock-chrome">
      <div className="ce-mock-dots">
        <span style={{ background: "#ff5f57" }} />
        <span style={{ background: "#febc2e" }} />
        <span style={{ background: "#28c840" }} />
      </div>
      <div className="ce-mock-url-bar">
        <Lock size={10} />
        <span>{url}</span>
      </div>
      <span className="ce-mock-live-tag">Resultado final esperado</span>
    </div>
    <div className="ce-mock-body">{children}</div>
  </div>
);

export const ProjectRealisticScene: React.FC<{ nodeId: string }> = ({ nodeId }) => {
  const refMeta = getProjectReference(nodeId);

  if (nodeId === "fs-cp-static") {
    return (
      <MockBrowserShell url={refMeta.demoUrl} light>
        <div className="ce-m-pricing">
          <div className="ce-m-p-nav">
            <strong>DevFlow Cloud</strong>
            <div className="ce-m-p-links">
              <span>Recursos</span>
              <span>Planos</span>
              <span>Documentação</span>
            </div>
            <span className="ce-m-pill-cta">Começar agora</span>
          </div>
          <div className="ce-m-p-hero">
            <h3>Planos transparentes para escalar seu projeto</h3>
            <p>Grade comparativa responsiva em HTML &amp; CSS com destaque visual para a opção principal.</p>
          </div>
          <div className="ce-m-p-cards">
            {[
              { name: "Starter", price: "R$ 0", items: ["3 projetos públicos", "Deploy HTTPS gratuito", "Suporte comunidade"] },
              { name: "Pro", price: "R$ 49", featured: true, items: ["Projetos ilimitados", "Domínio customizado", "Analytics em tempo real"] },
              { name: "Equipe", price: "R$ 149", items: ["10 membros inclusos", "Auditorias e permissões", "SLA prioritário 24h"] },
            ].map(tier => (
              <div key={tier.name} className={`ce-m-p-card ${tier.featured ? "is-featured" : ""}`}>
                <div className="ce-m-p-card-top">
                  <span>{tier.name}</span>
                  {tier.featured && <em className="ce-m-p-badge">Recomendado</em>}
                </div>
                <div className="ce-m-p-price">
                  {tier.price}
                  <small>/mês</small>
                </div>
                <ul>
                  {tier.items.map(it => (
                    <li key={it}>
                      <Check size={12} />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
                <div className={`ce-m-p-btn ${tier.featured ? "is-primary" : ""}`}>Selecionar plano</div>
              </div>
            ))}
          </div>
        </div>
      </MockBrowserShell>
    );
  }

  if (nodeId === "fe-checkpoint-ui") {
    return (
      <MockBrowserShell url={refMeta.demoUrl} light>
        <div className="ce-m-goals">
          <aside className="ce-m-g-side">
            <div className="ce-m-g-brand">MetasDev</div>
            <div className="ce-m-g-nav is-active">Hoje (4)</div>
            <div className="ce-m-g-nav">Frontend &amp; CSS</div>
            <div className="ce-m-g-nav">JavaScript</div>
            <div className="ce-m-g-nav">Concluídas (12)</div>
          </aside>
          <section className="ce-m-g-main">
            <div className="ce-m-g-topbar">
              <div>
                <h4>Metas de estudo · Hoje</h4>
                <span>3 de 4 metas concluídas (75%)</span>
              </div>
              <div className="ce-m-g-controls">
                <span className="ce-m-g-tab is-active">Todas</span>
                <span className="ce-m-g-tab">Ativas</span>
                <span className="ce-m-g-theme">
                  <Moon size={12} /> Tema
                </span>
              </div>
            </div>
            <div className="ce-m-g-list">
              {[
                { title: "Refatorar layout comparativo com CSS Grid responsivo", tag: "Layout", pct: 100, done: true },
                { title: "Implementar filtro dinâmico de categorias sem recarregar", tag: "DOM", pct: 100, done: true },
                { title: "Garantir foco visível e atributos aria-label nos botões", tag: "A11y", pct: 80, done: false },
                { title: "Salvar tema escolhido no localStorage do navegador", tag: "Persistência", pct: 45, done: false },
              ].map(item => (
                <div key={item.title} className={`ce-m-g-row ${item.done ? "is-done" : ""}`}>
                  <span className={`ce-m-g-check ${item.done ? "is-checked" : ""}`}>
                    {item.done && <Check size={11} />}
                  </span>
                  <div className="ce-m-g-text">
                    <strong>{item.title}</strong>
                    <div className="ce-m-g-bar">
                      <span style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                  <span className="ce-m-g-tag">{item.tag}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </MockBrowserShell>
    );
  }

  if (nodeId === "fs-cp-interactive") {
    return (
      <MockBrowserShell url={refMeta.demoUrl}>
        <div className="ce-m-kanban">
          <div className="ce-m-k-head">
            <div className="ce-m-k-title">
              <strong>Sprint de Estudos Full Stack</strong>
              <span className="ce-m-k-sync">Salvo localmente · 9 cards</span>
            </div>
            <div className="ce-m-k-stats">
              <span className="ce-m-k-ring">75%</span>
              <span>Progresso semanal</span>
            </div>
          </div>
          <div className="ce-m-k-cols">
            {[
              {
                name: "Planejado",
                color: "#60a5fa",
                cards: [
                  { t: "Validação de formulário HTML", tag: "UI", meta: "2/4 etapas" },
                  { t: "Atalhos de teclado na lista", tag: "JS", meta: "1/3 etapas" },
                ],
              },
              {
                name: "Em prática",
                color: "#a78bfa",
                cards: [
                  { t: "Filtro combinado por status e busca", tag: "DOM", meta: "3/4 etapas" },
                  { t: "Atualizar contador em tempo real", tag: "Estado", meta: "2/2 pronto" },
                ],
              },
              {
                name: "Validado",
                color: "#34d399",
                cards: [
                  { t: "Persistência automática via JSON", tag: "Storage", meta: "4/4 pronto" },
                  { t: "Design responsivo mobile-first", tag: "CSS", meta: "3/3 pronto" },
                ],
              },
            ].map(col => (
              <div key={col.name} className="ce-m-k-col">
                <div className="ce-m-k-colhead">
                  <span className="ce-m-k-dot" style={{ background: col.color }} />
                  <span>{col.name}</span>
                </div>
                {col.cards.map(card => (
                  <div key={card.t} className="ce-m-k-card">
                    <span className="ce-m-k-tag">{card.tag}</span>
                    <strong>{card.t}</strong>
                    <small>{card.meta}</small>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </MockBrowserShell>
    );
  }

  if (nodeId === "fe-project-spa") {
    return (
      <MockBrowserShell url={refMeta.demoUrl}>
        <div className="ce-m-spa">
          <div className="ce-m-s-rail">
            <span className="ce-m-s-logo">L</span>
            <span className="ce-m-s-ico is-active" />
            <span className="ce-m-s-ico" />
            <span className="ce-m-s-ico" />
          </div>
          <div className="ce-m-s-main">
            <div className="ce-m-s-cmd">
              <Search size={13} />
              <span>Buscar catálogo, repositório ou rota da API...</span>
              <kbd>
                <Command size={10} /> K
              </kbd>
            </div>
            <div className="ce-m-s-grid">
              <div className="ce-m-s-cards">
                {[
                  { id: "FE-104", name: "Catálogo filtrável com debounce", st: "Ativo" },
                  { id: "FE-108", name: "Navegação acessível por teclado", st: "Pronto" },
                  { id: "FE-112", name: "Estado vazio & retry elegante", st: "Pronto" },
                ].map(item => (
                  <div key={item.id} className="ce-m-s-item">
                    <code>{item.id}</code>
                    <strong>{item.name}</strong>
                    <span>{item.st}</span>
                  </div>
                ))}
              </div>
              <div className="ce-m-s-inspector">
                <div className="ce-m-s-inshead">
                  <span>Visualizador API Pública</span>
                  <span className="ce-m-ok">200 OK · 42ms</span>
                </div>
                <pre>{`{
  "items": 24,
  "theme": "dark",
  "cached": true
}`}</pre>
                <div className="ce-m-s-pills">
                  <span className="is-on">Dados carregados</span>
                  <span>Estado vazio</span>
                  <span>Erro de rede</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MockBrowserShell>
    );
  }

  if (nodeId === "fs-cp-crud") {
    return (
      <MockBrowserShell url={refMeta.demoUrl} light>
        <div className="ce-m-crud">
          <div className="ce-m-c-top">
            <div>
              <h4>Gerenciador CRUD · Finanças &amp; Trilhas</h4>
              <span>Autenticado como ana@dev.br · SQLite/PostgreSQL conectado</span>
            </div>
            <span className="ce-m-c-new">
              <Plus size={12} /> Novo registro
            </span>
          </div>
          <div className="ce-m-c-kpis">
            <div className="ce-m-c-kpi">
              <span>Saldo líquido</span>
              <strong>R$ 6.420,00</strong>
            </div>
            <div className="ce-m-c-kpi">
              <span>Registros salvos</span>
              <strong>148 itens</strong>
            </div>
            <div className="ce-m-c-kpi">
              <span>Meta concluída</span>
              <strong>84%</strong>
            </div>
          </div>
          <div className="ce-m-c-table">
            <div className="ce-m-c-row is-head">
              <span>Título</span>
              <span>Categoria</span>
              <span>Valor / Status</span>
              <span>Ações</span>
            </div>
            {[
              { t: "Assinatura Cloud VPS", cat: "Infra", val: "-R$ 49,00", st: "Pago" },
              { t: "Freela Landing Page", cat: "Receita", val: "+R$ 1.850,00", st: "Confirmado" },
              { t: "Certificação SQL Avançado", cat: "Educação", val: "-R$ 190,00", st: "Agendado" },
            ].map(r => (
              <div key={r.t} className="ce-m-c-row">
                <strong>{r.t}</strong>
                <span className="ce-m-c-tag">{r.cat}</span>
                <span>{r.val}</span>
                <span className="ce-m-c-actions">Editar · Excluir</span>
              </div>
            ))}
          </div>
        </div>
      </MockBrowserShell>
    );
  }

  if (nodeId === "fs-project-complete") {
    return (
      <MockBrowserShell url={refMeta.demoUrl}>
        <div className="ce-m-vercel">
          <div className="ce-m-v-head">
            <div>
              <strong>plataforma-estudos-saas.com.br</strong>
              <span>Produção · branch main · último deploy há 4 min</span>
            </div>
            <span className="ce-m-v-live">
              <ShieldCheck size={13} /> HTTPS · CI/CD Ativo
            </span>
          </div>
          <div className="ce-m-v-metrics">
            <div className="ce-m-v-card">
              <span>Disponibilidade</span>
              <strong>99.98%</strong>
              <small>Sem quedas em 30 dias</small>
            </div>
            <div className="ce-m-v-card">
              <span>Latência média API</span>
              <strong>38 ms</strong>
              <small>P95 abaixo de 80ms</small>
            </div>
            <div className="ce-m-v-card">
              <span>Banco PostgreSQL</span>
              <strong>Saudável</strong>
              <small>Backup automático ativo</small>
            </div>
          </div>
          <div className="ce-m-v-bottom">
            <div className="ce-m-v-panel">
              <h5>Pipeline CI/CD (GitHub Actions)</h5>
              <div className="ce-m-v-step">
                <CheckCircle2 size={13} /> TypeScript + Build Vite sem erros
              </div>
              <div className="ce-m-v-step">
                <CheckCircle2 size={13} /> Testes de integração &amp; migrações SQL
              </div>
              <div className="ce-m-v-step">
                <CheckCircle2 size={13} /> Publicação zero-downtime concluída
              </div>
            </div>
            <div className="ce-m-v-panel">
              <h5>Atividade do Painel SaaS</h5>
              <div className="ce-m-v-feed">Reserva de mentoria confirmada · 14:30</div>
              <div className="ce-m-v-feed">Novo usuário autenticado via JWT · 14:12</div>
            </div>
          </div>
        </div>
      </MockBrowserShell>
    );
  }

  if (nodeId === "be-checkpoint-api") {
    return (
      <MockBrowserShell url={refMeta.demoUrl} light>
        <div className="ce-m-swagger">
          <div className="ce-m-sw-top">
            <div>
              <strong>Catálogo API v1.0</strong>
              <span>OpenAPI 3.1 · SQL Validado</span>
            </div>
            <span className="ce-m-sw-auth">
              <Lock size={11} /> Authorize (JWT Bearer)
            </span>
          </div>
          <div className="ce-m-sw-grid">
            <div className="ce-m-sw-routes">
              <div className="ce-m-sw-route is-get">
                <span className="ce-m-method">GET</span>
                <code>/api/v1/cursos?categoria=web&amp;page=1</code>
              </div>
              <div className="ce-m-sw-route is-post">
                <span className="ce-m-method">POST</span>
                <code>/api/v1/auth/token</code>
              </div>
              <div className="ce-m-sw-route is-get">
                <span className="ce-m-method">GET</span>
                <code>/api/v1/relatorios/matriculas</code>
              </div>
              <div className="ce-m-sw-params">Parâmetros validados · Paginação limit=20</div>
            </div>
            <div className="ce-m-sw-json">
              <div className="ce-m-sw-jhead">
                <span className="ce-m-ok">200 OK</span>
                <span>application/json · 18ms</span>
              </div>
              <pre>{`{
  "page": 1,
  "total": 42,
  "cursos": [
    { "id": 7, "titulo": "APIs REST", "ativos": 318 },
    { "id": 9, "titulo": "SQL Seguro", "ativos": 274 }
  ]
}`}</pre>
            </div>
          </div>
        </div>
      </MockBrowserShell>
    );
  }

  if (nodeId === "be-project-service") {
    return (
      <MockBrowserShell url={refMeta.demoUrl} light>
        <div className="ce-m-bitly">
          <div className="ce-m-b-top">
            <div className="ce-m-b-title">
              <Link2 size={15} />
              <strong>ShortFlow · Encurtador &amp; Telemetria</strong>
            </div>
            <span className="ce-m-b-redis">Redis Cache: 1.4ms HIT</span>
          </div>
          <div className="ce-m-b-inputbar">
            <span>https://codeentry.dev/trilhas/fullstack/modulo-producao</span>
            <strong>Encurtar Link</strong>
          </div>
          <div className="ce-m-b-body">
            <div className="ce-m-b-links">
              <div className="ce-m-b-card is-active">
                <code>sho.rt/dev26</code>
                <span>8.940 cliques · 99.9% cache hit</span>
              </div>
              <div className="ce-m-b-card">
                <code>sho.rt/api-sql</code>
                <span>3.540 cliques · JWT protegido</span>
              </div>
            </div>
            <div className="ce-m-b-chart">
              <div className="ce-m-b-chead">
                <BarChart3 size={13} />
                <span>Cliques em tempo real (SQL agregado)</span>
              </div>
              <div className="ce-m-b-bars">
                {[38, 62, 54, 86, 72, 95, 81].map((h, idx) => (
                  <span key={idx} style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </MockBrowserShell>
    );
  }

  if (nodeId === "sn-ops-project") {
    return (
      <MockBrowserShell url={refMeta.demoUrl}>
        <div className="ce-m-ops">
          <div className="ce-m-o-term">
            <div className="ce-m-o-head">
              <Terminal size={13} />
              <span>Auditoria Linux · journalctl &amp; tar</span>
            </div>
            <pre>{`$ sudo journalctl -u api-gateway -n 4
[OK] Porta 443 escutando após reinício
[OK] Erro de permissão corrigido em /var/log
$ tar -czf auditoria-dmz.tar.gz /var/log/api
[OK] Pacote gerado (2.4 MB)`}</pre>
          </div>
          <div className="ce-m-o-net">
            <div className="ce-m-o-head">
              <Globe size={13} />
              <span>Fluxo de Rede &amp; Regras DMZ</span>
            </div>
            <div className="ce-m-o-flow">
              <div className="ce-m-o-node">Cliente Web</div>
              <span className="ce-m-o-arrow">→ HTTPS :443 →</span>
              <div className="ce-m-o-node is-ok">Firewall DMZ</div>
              <span className="ce-m-o-arrow">→</span>
              <div className="ce-m-o-node is-srv">
                <Server size={12} /> Serviço OK
              </div>
            </div>
            <div className="ce-m-o-rules">
              <span className="is-allow">ALLOW TCP/443 (DMZ Pública)</span>
              <span className="is-block">DENY TCP/5432 Externo</span>
            </div>
          </div>
        </div>
      </MockBrowserShell>
    );
  }

  if (nodeId === "ds-checkpoint-report") {
    return (
      <MockBrowserShell url={refMeta.demoUrl} light>
        <div className="ce-m-bi">
          <div className="ce-m-bi-sql">
            <Database size={13} />
            <code>SELECT c.nome, SUM(p.total) AS receita ... INNER JOIN estoque e ON ... GROUP BY c.id</code>
          </div>
          <div className="ce-m-bi-grid">
            <div className="ce-m-bi-panel">
              <h5>Ranking de Faturamento por Cliente</h5>
              {[
                { name: "TechSul Ltda", val: "R$ 48.200", w: 92 },
                { name: "NorteData SA", val: "R$ 39.150", w: 76 },
                { name: "Atlas Varejo", val: "R$ 28.900", w: 58 },
              ].map(c => (
                <div key={c.name} className="ce-m-bi-barrow">
                  <span>{c.name}</span>
                  <div className="ce-m-bi-bar">
                    <span style={{ width: `${c.w}%` }} />
                  </div>
                  <strong>{c.val}</strong>
                </div>
              ))}
            </div>
            <div className="ce-m-bi-panel">
              <h5>Alerta Cruzado de Estoque</h5>
              {[
                { p: "Notebook Pro 14", q: "4 un.", warn: true },
                { p: "Monitor 27 UHD", q: "6 un.", warn: true },
                { p: "Teclado Mecânico", q: "42 un.", warn: false },
              ].map(row => (
                <div key={row.p} className="ce-m-bi-stock">
                  <span>{row.p}</span>
                  <span className={`ce-m-bi-badge ${row.warn ? "is-warn" : "is-ok"}`}>
                    {row.warn ? <AlertTriangle size={11} /> : <Check size={11} />}
                    {row.q} {row.warn ? "· Repor" : "· OK"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MockBrowserShell>
    );
  }

  // cs-checkpoint-algo
  return (
    <MockBrowserShell url={refMeta.demoUrl}>
      <div className="ce-m-algo">
        <div className="ce-m-a-left">
          <div className="ce-m-a-badge">Algoritmos · Estrutura de Pilha</div>
          <h4>Validar Parênteses Balanceados</h4>
          <p>Implemente fatorial, palíndromos, busca binária e validação de pares sem funções prontas.</p>
          <div className="ce-m-a-ex">
            <div>Entrada: <code>"{`{[()]}`}"</code></div>
            <div>Saída esperada: <strong style={{ color: "#34d399" }}>true</strong></div>
          </div>
        </div>
        <div className="ce-m-a-right">
          <pre className="ce-m-a-code">{`function validarPilha(expr) {
  const pilha = [];
  for (const ch of expr) {
    if ("([{".includes(ch)) pilha.push(ch);
    else if (!casaPar(pilha.pop(), ch)) return false;
  }
  return pilha.length === 0;
}`}</pre>
          <div className="ce-m-a-tests">
            <div className="ce-m-a-test is-pass">
              <CheckCircle2 size={13} />
              <span>Caso 1: "{`{[()]}`}" → Aceito</span>
              <small><Clock size={10} /> 0.2ms</small>
            </div>
            <div className="ce-m-a-test is-pass">
              <CheckCircle2 size={13} />
              <span>Caso 2: buscaBinaria(arr, 42) → Aceito</span>
              <small><Activity size={10} /> O(log n)</small>
            </div>
          </div>
        </div>
      </div>
    </MockBrowserShell>
  );
};
