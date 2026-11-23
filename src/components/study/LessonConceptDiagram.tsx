import React from "react";
import { ArrowRight, Box, Database, GitBranch, GitMerge, Layers, Network, Terminal } from "lucide-react";
import type { Lesson, TrackMeta } from "../../types/curriculum";

interface LessonConceptDiagramProps {
  lesson: Lesson;
  track: TrackMeta;
}

type DiagramVariant =
  | "variables"
  | "conditionals"
  | "loops"
  | "dom"
  | "box-model"
  | "flex-grid"
  | "sql"
  | "network"
  | "linux";

function resolveDiagramVariant(lesson: Lesson): DiagramVariant | null {
  if (lesson.trackId === "database") return "sql";
  if (lesson.trackId === "networks") return "network";
  if (lesson.trackId === "linux") return "linux";

  if (lesson.id === "web-04") return "box-model";
  if (lesson.id === "web-05") return "flex-grid";
  if (lesson.id === "web-06" || lesson.id === "web-07" || lesson.id === "web-08") return "dom";

  if (["logic-01", "cpp-02", "js-01", "py-01"].includes(lesson.id)) return "variables";
  if (["logic-04", "logic-05", "cpp-05", "js-03", "py-03"].includes(lesson.id)) return "conditionals";
  if (["logic-06", "logic-07", "cpp-06", "js-04", "py-04"].includes(lesson.id)) return "loops";

  return null;
}

export const LessonConceptDiagram: React.FC<LessonConceptDiagramProps> = ({ lesson, track }) => {
  const variant = resolveDiagramVariant(lesson);
  if (!variant) return null;

  return (
    <div
      className="ce-diagram-card"
      style={
        {
          "--diag-accent": track.accentColor,
          "--diag-soft": track.accentSoft,
          "--diag-border": track.accentBorder,
        } as React.CSSProperties
      }
    >
      <div className="ce-diagram-head">
        <div className="ce-diagram-title">
          {variant === "variables" && <Box size={14} style={{ color: track.accentColor }} />}
          {variant === "conditionals" && <GitBranch size={14} style={{ color: track.accentColor }} />}
          {variant === "loops" && <Layers size={14} style={{ color: track.accentColor }} />}
          {variant === "dom" && <GitMerge size={14} style={{ color: track.accentColor }} />}
          {(variant === "box-model" || variant === "flex-grid") && (
            <Layers size={14} style={{ color: track.accentColor }} />
          )}
          {variant === "sql" && <Database size={14} style={{ color: track.accentColor }} />}
          {variant === "network" && <Network size={14} style={{ color: track.accentColor }} />}
          {variant === "linux" && <Terminal size={14} style={{ color: track.accentColor }} />}
          <span>
            {variant === "variables"
              ? "Como uma variável funciona na memória"
              : variant === "conditionals"
                ? "Desvio condicional na prática"
                : variant === "loops"
                  ? "Rastreamento de um laço passo a passo"
                  : variant === "dom"
                    ? "Árvore do DOM e Eventos no navegador"
                    : variant === "box-model"
                      ? "Camadas do Box Model CSS"
                      : variant === "flex-grid"
                        ? "Flexbox (1D) vs. CSS Grid (2D)"
                        : variant === "sql"
                          ? "Ordem lógica de execução SQL"
                          : variant === "network"
                            ? "Caminho do pacote na Rede"
                            : "Pipeline de comandos no Shell"}
          </span>
        </div>
        <span className="ce-badge">Exemplo visual</span>
      </div>

      {variant === "variables" && (
        <div className="ce-diagram-flow" aria-label="Exemplo de variáveis armazenando valores na memória">
          <div className="ce-diagram-flow-steps">
            <span className="ce-diagram-node">
              nome = &quot;Ana&quot;
            </span>
            <span className="ce-diagram-node">
              idade = 20
            </span>
            <ArrowRight size={13} className="ce-diagram-arrow" />
            <span className="ce-diagram-node is-highlight">
              Saída: Ana · 20
            </span>
          </div>
          <p className="ce-diagram-caption">
            Cada variável cria uma caixa rotulada na memória: ao citar <code>nome</code> ou <code>idade</code> na saída, o programa lê o valor guardado dentro dela.
          </p>
        </div>
      )}

      {variant === "conditionals" && (
        <div className="ce-diagram-flow" aria-label="Decisão condicional com exemplo concreto">
          <div className="ce-diagram-flow-steps">
            <span className="ce-diagram-node is-root">nota = 75</span>
            <ArrowRight size={13} className="ce-diagram-arrow" />
            <span className="ce-diagram-node is-highlight">nota &gt;= 60 ?</span>
            <ArrowRight size={13} className="ce-diagram-arrow" />
            <span className="ce-diagram-node">Sim → Aprovado</span>
            <span className="ce-diagram-node">Não → Revisão</span>
          </div>
          <p className="ce-diagram-caption">
            O bloco verdadeiro executa apenas se o teste lógico resultar em verdadeiro; caso contrário, o fluxo segue para o <code>senao</code> / <code>else</code>.
          </p>
        </div>
      )}

      {variant === "loops" && (
        <div className="ce-diagram-flow" aria-label="Iterações de um laço acumulador">
          <div className="ce-diagram-flow-steps">
            <span className="ce-diagram-node">i = 1 → soma = 1</span>
            <ArrowRight size={13} className="ce-diagram-arrow" />
            <span className="ce-diagram-node">i = 2 → soma = 3</span>
            <ArrowRight size={13} className="ce-diagram-arrow" />
            <span className="ce-diagram-node is-highlight">i = 3 → soma = 6</span>
          </div>
          <p className="ce-diagram-caption">
            A cada repetição, o contador avança e o acumulador reaproveita o valor anterior até a condição de parada encerrar o laço.
          </p>
        </div>
      )}

      {variant === "dom" && (
        <div className="ce-diagram-tree" aria-label="Estrutura hierárquica do DOM">
          <div className="ce-diagram-tree-row">
            <span className="ce-diagram-node is-root">document</span>
          </div>
          <div className="ce-diagram-connector" aria-hidden="true" />
          <div className="ce-diagram-tree-row">
            <span className="ce-diagram-node">&lt;html&gt;</span>
            <ArrowRight size={13} className="ce-diagram-arrow" />
            <span className="ce-diagram-node">&lt;body&gt;</span>
          </div>
          <div className="ce-diagram-connector" aria-hidden="true" />
          <div className="ce-diagram-tree-row is-branches">
            <span className="ce-diagram-node">&lt;header&gt;</span>
            <span className="ce-diagram-node">&lt;main&gt;</span>
            <span className="ce-diagram-node is-highlight">&lt;button&gt; → evento</span>
          </div>
          <p className="ce-diagram-caption">
            O JavaScript encontra nós via <code>querySelector()</code> e reage a ações do usuário via <code>addEventListener()</code>.
          </p>
        </div>
      )}

      {variant === "box-model" && (
        <div className="ce-diagram-box-model" aria-label="Camadas do Box Model">
          <div className="ce-box-layer is-margin">
            <span>margin (espaço externo)</span>
            <div className="ce-box-layer is-border">
              <span>border (borda do componente)</span>
              <div className="ce-box-layer is-padding">
                <span>padding (respiro interno)</span>
                <div className="ce-box-content">Conteúdo HTML</div>
              </div>
            </div>
          </div>
          <p className="ce-diagram-caption">
            Com <code>box-sizing: border-box</code>, a largura declarada já inclui conteúdo + <code>padding</code> + <code>border</code>.
          </p>
        </div>
      )}

      {variant === "flex-grid" && (
        <div className="ce-diagram-flow" aria-label="Diferença prática entre Flexbox e CSS Grid">
          <div className="ce-diagram-flow-steps">
            <span className="ce-diagram-node">Flexbox: 1 eixo (linha ou coluna)</span>
            <span className="ce-diagram-node is-highlight">Grid: 2 eixos (linhas × colunas)</span>
          </div>
          <p className="ce-diagram-caption">
            Use <code>display: flex</code> para barras e alinhamentos em fila; use <code>display: grid</code> para grades responsivas com <code>@media</code>.
          </p>
        </div>
      )}

      {variant === "sql" && (
        <div className="ce-diagram-flow" aria-label="Ordem lógica de execução SQL">
          <div className="ce-diagram-flow-steps">
            <span className="ce-diagram-node">1. FROM / JOIN</span>
            <ArrowRight size={13} className="ce-diagram-arrow" />
            <span className="ce-diagram-node">2. WHERE</span>
            <ArrowRight size={13} className="ce-diagram-arrow" />
            <span className="ce-diagram-node is-highlight">3. GROUP BY</span>
            <ArrowRight size={13} className="ce-diagram-arrow" />
            <span className="ce-diagram-node">4. SELECT · ORDER BY</span>
          </div>
          <p className="ce-diagram-caption">
            O banco primeiro relaciona tabelas (<code>PK ↔ FK</code>), filtra registros, agrupa métricas e só então projeta e ordena o resultado.
          </p>
        </div>
      )}

      {variant === "network" && (
        <div className="ce-diagram-flow" aria-label="Fluxo de pacote entre camadas de rede">
          <div className="ce-diagram-flow-steps">
            <span className="ce-diagram-node">Cliente + DNS</span>
            <ArrowRight size={13} className="ce-diagram-arrow" />
            <span className="ce-diagram-node">IP / Sub-rede CIDR</span>
            <ArrowRight size={13} className="ce-diagram-arrow" />
            <span className="ce-diagram-node is-highlight">ACL / Firewall</span>
            <ArrowRight size={13} className="ce-diagram-arrow" />
            <span className="ce-diagram-node">Serviço (Porta TCP)</span>
          </div>
          <p className="ce-diagram-caption">
            Cada pacote passa por resolução de nome, roteamento IP entre sub-redes e verificação de firewall antes de atingir a porta da aplicação.
          </p>
        </div>
      )}

      {variant === "linux" && (
        <div className="ce-diagram-flow" aria-label="Fluxo de entrada, pipe e saída no Linux">
          <div className="ce-diagram-flow-steps">
            <span className="ce-diagram-node">stdin / arquivos</span>
            <ArrowRight size={13} className="ce-diagram-arrow" />
            <span className="ce-diagram-node is-highlight">comando -opções</span>
            <ArrowRight size={13} className="ce-diagram-arrow" />
            <span className="ce-diagram-node">| grep / sort</span>
            <ArrowRight size={13} className="ce-diagram-arrow" />
            <span className="ce-diagram-node">stdout / arquivo</span>
          </div>
          <p className="ce-diagram-caption">
            Comandos cooperam via pipe (<code>|</code>) e redirecionamento (<code>&gt;</code>) transformando texto fluxo a fluxo.
          </p>
        </div>
      )}
    </div>
  );
};
