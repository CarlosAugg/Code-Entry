import React from "react";
import { AlertTriangle, ArrowDown, ArrowRight, Check, Cpu, Trophy, X } from "lucide-react";
import type { TheaterVisualModel } from "../../types/theater";

interface TheaterVisualStageProps {
  model: TheaterVisualModel;
}

export const TheaterVisualStage: React.FC<TheaterVisualStageProps> = React.memo(({ model }) => {
  if (model.kind === "memory-boxes") {
    return (
      <div className="ce-lia-boxes-canvas">
        {model.boxes.map(box => {
          const isCyan = box.tone === "cyan";
          const calloutTone = box.callout?.tone ?? (isCyan ? "cyan" : "violet");
          return (
            <div
              key={box.id}
              className={`ce-mem-box ${isCyan ? "is-cyan" : "is-violet"} ${
                box.focused ? "is-focused" : ""
              } ${box.dimmed ? "is-dimmed" : ""}`}
            >
              <div className="ce-mem-lid" />
              <span className={`ce-mem-sticker ${isCyan ? "is-cyan" : ""}`}>
                etiqueta: {box.label}
              </span>
              <span className={`ce-mem-type ${isCyan ? "is-cyan" : ""}`}>{box.typeTag}</span>

              <div className="ce-mem-value" key={`${box.id}-${box.value}`}>
                {box.value}
              </div>
              <span className="ce-mem-caption">{box.caption ?? "VALOR GUARDADO"}</span>

              {box.callout && (
                <span
                  className={`ce-mem-floating-callout ${
                    calloutTone === "read" ? "is-read" : calloutTone === "cyan" ? "is-cyan" : ""
                  }`}
                >
                  {box.callout.text}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (model.kind === "expression-compare") {
    return (
      <div className="ce-th-compare-grid">
        {model.cards.map(card => (
          <div
            key={card.id}
            className={`ce-th-compare-card is-${card.tone} ${card.focused ? "is-focused" : ""}`}
          >
            <div className="ce-th-compare-head">
              <span className={`ce-th-compare-badge is-${card.tone}`}>{card.badge}</span>
            </div>
            <code className="ce-th-compare-expr">{card.expression}</code>
            <div className="ce-th-compare-steps">
              {card.steps.map((step, idx) => (
                <div key={idx} className="ce-th-compare-step">
                  <ArrowRight size={12} />
                  <span>{step}</span>
                </div>
              ))}
            </div>
            <div className={`ce-th-compare-result is-${card.tone}`}>
              <span>Resultado:</span>
              <strong>{card.result}</strong>
            </div>
            {card.note && <p className="ce-th-compare-note">{card.note}</p>}
          </div>
        ))}
      </div>
    );
  }

  if (model.kind === "logic-gates") {
    const stage = model.stage ?? 3;
    return (
      <div className="ce-th-gates-stage">
        <div className="ce-th-gate-inputs">
          {model.inputs.map(inp => (
            <div
              key={inp.label}
              className={`ce-th-gate-node ${inp.truthy ? "is-true" : "is-false"} ${
                inp.focused ? "is-focused" : ""
              }`}
            >
              <span className="ce-th-gate-label">{inp.label}</span>
              <strong className="ce-th-gate-val">{inp.value}</strong>
              <span className="ce-th-gate-bool">{inp.truthy ? "verdadeiro" : "falso"}</span>
            </div>
          ))}
        </div>

        <div
          className="ce-th-gate-wire"
          aria-hidden="true"
          style={{ opacity: stage >= 2 ? 1 : 0.22, transition: "opacity 240ms ease" }}
        >
          <ArrowDown size={16} />
          <span className="ce-th-gate-op">{model.operator}</span>
          <ArrowDown size={16} />
        </div>

        <div
          className={`ce-th-gate-result ${model.result ? "is-true" : "is-false"}`}
          style={{ opacity: stage >= 3 ? 1 : 0.2, transition: "opacity 260ms ease" }}
        >
          <div className="ce-th-gate-result-top">
            <code>{model.expression}</code>
            <span className="ce-th-gate-lamp">
              {model.result ? <Check size={16} /> : <X size={16} />}
              <strong>{stage >= 3 ? model.resultLabel : "..."}</strong>
            </span>
          </div>
          {model.note && <p className="ce-th-gate-note">{model.note}</p>}
        </div>
      </div>
    );
  }

  if (model.kind === "branch-flow") {
    return (
      <div className="ce-th-branch-stage">
        <div className="ce-th-branch-input">
          <span>Entrada:</span>
          <code>{model.inputChip}</code>
        </div>

        <div className={`ce-th-branch-cond ${model.conditionResult ? "is-true" : "is-false"}`}>
          <span>Teste lógico</span>
          <code>{model.condition}</code>
          <strong>{model.conditionResult ? "VERDADEIRO" : "FALSO"}</strong>
        </div>

        <div className="ce-th-branch-paths">
          <div
            className={`ce-th-branch-card is-true ${
              model.conditionResult ? "is-active" : "is-dimmed"
            }`}
          >
            <div className="ce-th-branch-card-head">
              <Check size={14} />
              <span>{model.trueBranch.label}</span>
            </div>
            <code>{model.trueBranch.action}</code>
          </div>

          <div
            className={`ce-th-branch-card is-false ${
              !model.conditionResult ? "is-active" : "is-dimmed"
            }`}
          >
            <div className="ce-th-branch-card-head">
              <X size={14} />
              <span>{model.falseBranch.label}</span>
            </div>
            <code>{model.falseBranch.action}</code>
          </div>
        </div>

        {model.note && <p className="ce-th-stage-note">{model.note}</p>}
      </div>
    );
  }

  if (model.kind === "tier-ladder") {
    return (
      <div className="ce-th-ladder-stage">
        <div className="ce-th-ladder-header">
          <span>{model.inputLabel}</span>
          <strong>{model.inputValue}</strong>
        </div>

        <div className="ce-th-ladder-list">
          {model.tiers.map((tier, idx) => (
            <div
              key={idx}
              className={`ce-th-ladder-rung ${tier.matched ? "is-matched" : ""} ${
                tier.skipped ? "is-skipped" : ""
              } ${tier.wronglyCaught ? "is-wrongly-caught" : ""} ${
                model.activeRung === idx ? "is-scanning" : ""
              }`}
            >
              <span className="ce-th-ladder-idx">{idx + 1}</span>
              <code className="ce-th-ladder-cond">{tier.condition}</code>
              <ArrowRight size={13} />
              <strong className="ce-th-ladder-res">{tier.result}</strong>
            </div>
          ))}
        </div>

        {model.warning && (
          <div className="ce-th-warning-pill">
            <AlertTriangle size={14} />
            <span>{model.warning}</span>
          </div>
        )}
      </div>
    );
  }

  if (model.kind === "loop-stepper") {
    return (
      <div className="ce-th-loop-stage">
        <div className="ce-th-loop-top">
          <code className="ce-th-loop-pill">{model.loopLabel}</code>
          <span className="ce-th-loop-counter">
            Volta {model.currentStep} de {model.totalSteps}
          </span>
        </div>

        <div className="ce-th-loop-vars">
          {model.vars.map(v => (
            <div
              key={v.label}
              className={`ce-th-loop-var is-${v.tone ?? "violet"} ${
                v.highlight ? "is-highlighted" : ""
              }`}
            >
              <span>{v.label}</span>
              <strong key={`${v.label}-${v.value}`}>{v.value}</strong>
            </div>
          ))}
        </div>

        {model.items && (
          <div className="ce-th-loop-items-box">
            <span className="ce-th-loop-items-label">{model.itemsLabel ?? "Lista gerada"}</span>
            <div className="ce-th-loop-items">
              {model.items.length === 0 ? (
                <span className="ce-th-loop-empty">[ ] (vazia)</span>
              ) : (
                model.items.map((item, idx) => (
                  <span key={idx} className="ce-th-loop-chip">
                    {item}
                  </span>
                ))
              )}
            </div>
          </div>
        )}

        {model.warning ? (
          <div className="ce-th-warning-pill">
            <AlertTriangle size={14} />
            <span>{model.warning}</span>
          </div>
        ) : (
          <p className="ce-th-stage-note">{model.statusText}</p>
        )}
      </div>
    );
  }

  if (model.kind === "array-scanner") {
    return (
      <div className="ce-th-scanner-stage">
        <div className="ce-th-scanner-head">
          <code>{model.arrayLabel}</code>
          <div className="ce-th-scanner-champion">
            <Trophy size={14} />
            <span>
              {model.championLabel}: <strong>{model.championValue}</strong>
            </span>
          </div>
        </div>

        <div className="ce-th-scanner-cells">
          {model.items.map((val, idx) => (
            <div
              key={idx}
              className={`ce-th-scanner-cell ${idx === model.activeIndex ? "is-active" : ""} ${
                idx === model.championIndex ? "is-champion" : ""
              }`}
            >
              <span className="ce-th-scanner-idx">[{idx}]</span>
              <strong className="ce-th-scanner-val">{val}</strong>
            </div>
          ))}
        </div>

        <div className="ce-th-scanner-compare">
          <span>{model.comparisonText}</span>
          {model.verdictBadge && <span className="ce-th-scanner-verdict">{model.verdictBadge}</span>}
        </div>
        {model.note && <p className="ce-th-stage-note">{model.note}</p>}
      </div>
    );
  }

  if (model.kind === "function-machine") {
    const phase = model.phase ?? 3;
    return (
      <div className="ce-th-fn-stage">
        <div className="ce-th-fn-pipeline">
          <div className="ce-th-fn-io">
            <span>{model.inputLabel}</span>
            <strong>{model.inputValue}</strong>
          </div>

          <ArrowRight size={16} className="ce-th-fn-arrow" />

          <div
            className="ce-th-fn-machine"
            style={{ opacity: phase >= 2 ? 1 : 0.25, transition: "opacity 240ms ease" }}
          >
            <div className="ce-th-fn-machine-head">
              <Cpu size={14} />
              <code>{model.fnName}</code>
            </div>
            <div className="ce-th-fn-rule">{model.ruleText}</div>
          </div>

          <ArrowRight size={16} className="ce-th-fn-arrow" />

          <div
            className={`ce-th-fn-io is-output is-${model.outputTone ?? "green"}`}
            style={{ opacity: phase >= 3 ? 1 : 0.2, transition: "opacity 260ms ease" }}
          >
            <span>retorne</span>
            <strong key={model.outputValue}>{phase >= 3 ? model.outputValue : "..."}</strong>
          </div>
        </div>

        {model.cases && (
          <div className="ce-th-fn-cases">
            {model.cases.map((c, idx) => (
              <div key={idx} className={`ce-th-fn-case ${c.active ? "is-active" : ""}`}>
                <code>{c.input}</code>
                <ArrowRight size={11} />
                <strong>{c.output}</strong>
              </div>
            ))}
          </div>
        )}

        {model.note && <p className="ce-th-stage-note">{model.note}</p>}
      </div>
    );
  }

  if (model.kind === "story-scene") {
    return (
      <div className={`ce-th-story-stage is-tone-${model.tone ?? "violet"}`}>
        <span className="ce-th-story-eyebrow">{model.eyebrow}</span>
        <h2 className="ce-th-story-headline">{model.headline}</h2>
        <p className="ce-th-story-subtext">{model.subtext}</p>

        <div className="ce-th-story-art-wrap">
          {model.floatingTags && model.floatingTags.length > 0 && (
            <div className="ce-th-meme-tags" aria-hidden="true">
              {model.floatingTags.map((tag, idx) => (
                <span key={idx} className={`ce-th-meme-tag is-pos-${idx % 4}`}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {model.mediaUrl ? (
            <img src={model.mediaUrl} alt={model.headline} className="ce-th-story-media" />
          ) : model.sceneArt === "pizza-split" ? (
            <svg viewBox="0 0 360 175" className="ce-th-story-svg" aria-hidden="true">
              <rect x="18" y="20" width="150" height="135" rx="16" fill="var(--bg-surface-elevated)" stroke="rgba(245, 158, 11, 0.5)" strokeWidth="2" />
              <path d="M93 36 L142 108 Q93 128 44 108 Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="3" />
              <circle cx="88" cy="72" r="7" fill="#ef4444" />
              <circle cx="106" cy="92" r="6" fill="#ef4444" />
              <circle cx="74" cy="94" r="5.5" fill="#ef4444" />
              <text x="93" y="142" textAnchor="middle" fill="var(--text-primary)" fontSize="12" fontWeight="700">
                Pizza 40 + Refri 20
              </text>

              <path d="M174 88 L202 88" stroke="var(--accent-secondary)" strokeWidth="3" strokeLinecap="round" />
              <polygon points="200,82 210,88 200,94" fill="var(--accent-secondary)" />

              <rect x="216" y="20" width="128" height="60" rx="12" fill="rgba(248, 113, 113, 0.14)" stroke="#f87171" strokeWidth="1.8" />
              <text x="280" y="44" textAnchor="middle" fill="#f87171" fontSize="11" fontWeight="800">
                40 + 20 / 2
              </text>
              <text x="280" y="65" textAnchor="middle" fill="var(--text-primary)" fontSize="16" fontWeight="800">
                R$ 50 ?!
              </text>

              <rect x="216" y="94" width="128" height="60" rx="12" fill="rgba(34, 197, 94, 0.14)" stroke="#22c55e" strokeWidth="1.8" />
              <text x="280" y="118" textAnchor="middle" fill="#4ade80" fontSize="11" fontWeight="800">
                (40 + 20) / 2
              </text>
              <text x="280" y="139" textAnchor="middle" fill="var(--text-primary)" fontSize="16" fontWeight="800">
                R$ 30 cada!
              </text>
            </svg>
          ) : model.sceneArt === "confused-math" ? (
            <svg viewBox="0 0 360 175" className="ce-th-story-svg" aria-hidden="true">
              <circle cx="180" cy="92" r="54" fill="rgba(var(--accent-rgb), 0.16)" stroke="var(--accent-secondary)" strokeWidth="2.5" />
              <circle cx="161" cy="82" r="7" fill="#38bdf8" />
              <circle cx="199" cy="82" r="7" fill="#38bdf8" />
              <path d="M156 112 Q180 102 204 114" fill="none" stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />
              <text x="64" y="46" fill="#fbbf24" fontSize="16" fontWeight="800" opacity="0.88">
                9 ÷ 2 = 4.5
              </text>
              <text x="255" y="42" fill="#c084fc" fontSize="18" fontWeight="900" opacity="0.9">
                ???
              </text>
              <text x="40" y="142" fill="#f87171" fontSize="15" fontWeight="800" opacity="0.9">
                7 + 4.5 = 11.5?!
              </text>
              <text x="242" y="142" fill="#38bdf8" fontSize="14" fontWeight="800" opacity="0.88">
                ( ) salva!
              </text>
            </svg>
          ) : model.sceneArt === "road-fork" ? (
            <svg viewBox="0 0 360 175" className="ce-th-story-svg" aria-hidden="true">
              <path d="M180 162 L180 105" stroke="var(--border-accent)" strokeWidth="14" strokeLinecap="round" />
              <path d="M180 105 Q176 74 96 48" fill="none" stroke="#22c55e" strokeWidth="11" strokeLinecap="round" />
              <path d="M180 105 Q184 74 264 48" fill="none" stroke="#f59e0b" strokeWidth="11" strokeLinecap="round" />
              <circle cx="180" cy="105" r="14" fill="var(--accent-primary)" stroke="#ffffff" strokeWidth="2.5" />
              <text x="180" y="109" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="900">
                ?
              </text>
              <rect x="26" y="16" width="124" height="32" rx="10" fill="rgba(34, 197, 94, 0.2)" stroke="#22c55e" strokeWidth="1.8" />
              <text x="88" y="36" textAnchor="middle" fill="#4ade80" fontSize="12" fontWeight="800">
                SIM · Pista Livre
              </text>
              <rect x="210" y="16" width="124" height="32" rx="10" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" strokeWidth="1.8" />
              <text x="272" y="36" textAnchor="middle" fill="#fbbf24" fontSize="12" fontWeight="800">
                NÃO · Desvio
              </text>
            </svg>
          ) : (
            <svg viewBox="0 0 360 175" className="ce-th-story-svg" aria-hidden="true">
              <rect x="65" y="28" width="230" height="118" rx="18" fill="var(--bg-surface-elevated)" stroke="var(--border-accent)" strokeWidth="2" />
              <text x="180" y="84" textAnchor="middle" fill="var(--accent-secondary)" fontSize="22" fontWeight="800">
                VIP ACCESS
              </text>
              <text x="180" y="114" textAnchor="middle" fill="var(--text-secondary)" fontSize="13">
                Só passa quem cumprir a regra!
              </text>
            </svg>
          )}
        </div>

        {model.captionBadge && <span className="ce-th-story-badge">{model.captionBadge}</span>}
      </div>
    );
  }

  if (model.kind === "bill-discovery") {
    const s = model.stage;
    return (
      <div className="ce-bill-stage">
        <span className="ce-th-story-eyebrow">{model.eyebrow}</span>
        <h2 className="ce-th-story-headline">{model.headline}</h2>

        <div className="ce-bill-grid">
          <div className="ce-bill-receipt">
            <div className="ce-bill-receipt-head">CONTA DA MESA · 2 PESSOAS</div>

            <div className={`ce-bill-item ${s >= 0 ? "is-shown" : ""}`}>
              <div className="ce-bill-item-icon" aria-hidden="true">
                <svg viewBox="0 0 36 36" width="28" height="28">
                  <path d="M18 4 L32 28 Q18 33 4 28 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
                  <circle cx="17" cy="17" r="2.6" fill="#ef4444" />
                  <circle cx="22" cy="23" r="2.2" fill="#ef4444" />
                  <circle cx="13" cy="23" r="2.2" fill="#ef4444" />
                </svg>
              </div>
              <span className="ce-bill-item-name">Pizza Grande</span>
              <strong className="ce-bill-item-price">R$ 40</strong>
            </div>

            <div className={`ce-bill-item ${s >= 1 ? "is-shown" : ""}`}>
              <div className="ce-bill-item-icon" aria-hidden="true">
                <svg viewBox="0 0 36 36" width="28" height="28">
                  <rect x="11" y="7" width="14" height="23" rx="4" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
                  <rect x="13" y="4" width="10" height="4" rx="1.5" fill="#bae6fd" />
                  <line x1="11" y1="16" x2="25" y2="16" stroke="#ffffff" strokeWidth="2" opacity="0.7" />
                </svg>
              </div>
              <span className="ce-bill-item-name">Refrigerante 2L</span>
              <strong className="ce-bill-item-price">R$ 20</strong>
            </div>

            <div className={`ce-bill-expected ${s >= 2 ? "is-shown" : ""}`}>
              <span>Total R$ 60 ÷ 2 amigos</span>
              <strong>R$ 30 cada</strong>
            </div>
          </div>

          <div className={`ce-bill-computer ${s >= 3 ? "is-shown" : ""}`}>
            <span className="ce-bill-comp-tag">COMO O COMPUTADOR LEU</span>
            <div className="ce-bill-expr-row">
              <span className="ce-bill-tok">40</span>
              <span className="ce-bill-tok is-op">+</span>
              <span className={`ce-bill-tok-group ${s >= 4 ? "is-hot" : ""}`}>
                <span className="ce-bill-tok">20</span>
                <span className="ce-bill-tok is-op">/</span>
                <span className="ce-bill-tok">2</span>
              </span>
            </div>

            <div className={`ce-bill-priority-note ${s >= 4 ? "is-shown" : ""}`}>
              <ArrowDown size={14} />
              <span>1º divide: 20 / 2 = 10 · depois soma 40 + 10</span>
            </div>

            <div className={`ce-bill-stamp ${s >= 5 ? "is-shown" : ""}`}>
              <span>COBRANÇA:</span>
              <strong>R$ 50?!</strong>
            </div>
          </div>
        </div>

        {model.caption && <span className="ce-th-story-badge">{model.caption}</span>}
      </div>
    );
  }

  if (model.kind === "expr-evaluator") {
    return (
      <div className="ce-eval-stage">
        {model.showPriorityRuler && (
          <div className="ce-eval-ruler" aria-label="Ordem de prioridade">
            <span className={`ce-eval-rule ${model.activeRule === "parens" ? "is-active is-parens" : ""}`}>
              1º ( ) Área VIP
            </span>
            <span className={`ce-eval-rule ${model.activeRule === "muldiv" ? "is-active is-muldiv" : ""}`}>
              2º * e /
            </span>
            <span className={`ce-eval-rule ${model.activeRule === "addsub" ? "is-active is-addsub" : ""}`}>
              3º + e -
            </span>
          </div>
        )}

        <div className={`ce-eval-grid is-${model.mode}`}>
          {model.items.map(item => (
            <div
              key={item.id}
              className={`ce-eval-card is-${item.tone} ${item.focused ? "is-focused" : ""} ${
                item.dimmed ? "is-dimmed" : ""
              }`}
            >
              <div className="ce-eval-card-head">
                <span className={`ce-th-compare-badge is-${item.tone}`}>{item.badge}</span>
                {item.showVerdict && item.verdictStamp && (
                  <span className={`ce-eval-stamp is-${item.tone}`}>{item.verdictStamp}</span>
                )}
              </div>

              <div className="ce-eval-tokens">
                {item.tokens.map((tok, idx) => (
                  <span
                    key={idx}
                    className={`ce-eval-tok is-${tok.kind ?? "num"} ${tok.active ? "is-active" : ""} ${
                      tok.grouped ? "is-grouped" : ""
                    }`}
                  >
                    {tok.text}
                  </span>
                ))}
              </div>

              <div className="ce-eval-steps">
                {item.steps
                  .filter(st => st.visible)
                  .map((st, idx) => (
                    <div
                      key={`${item.id}-st-${idx}`}
                      className={`ce-eval-step is-${st.tone ?? "neutral"} ${st.active ? "is-active" : ""}`}
                    >
                      <span className="ce-eval-step-label">{st.label}</span>
                      <code className="ce-eval-step-expr">{st.expr}</code>
                    </div>
                  ))}
              </div>

              {item.finalResult !== undefined && (
                <div className={`ce-th-compare-result is-${item.tone}`}>
                  <span>Resultado:</span>
                  <strong>{item.finalResult}</strong>
                </div>
              )}

              {item.note && <p className="ce-th-compare-note">{item.note}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (model.kind === "turnstile-scene") {
    const s = model.stage;
    const isAllowed = model.activeTest?.allowed ?? true;
    const hasTest = Boolean(model.activeTest);
    return (
      <div className="ce-turnstile-stage">
        <span className="ce-th-story-eyebrow">{model.eyebrow}</span>
        <h2 className="ce-th-story-headline">{model.headline}</h2>

        <div className="ce-turnstile-canvas">
          {s === 0 ? (
            <div className="ce-turnstile-linear">
              <div className="ce-turnstile-step-pill">Linha 1</div>
              <ArrowRight size={16} />
              <div className="ce-turnstile-step-pill">Linha 2</div>
              <ArrowRight size={16} />
              <div className="ce-turnstile-step-pill">Linha 3</div>
              <span className="ce-turnstile-linear-note">Sem escolhas · sempre em linha reta</span>
            </div>
          ) : (
            <div className="ce-turnstile-fork">
              <div className={`ce-turnstile-visitor ${hasTest ? (isAllowed ? "is-yes" : "is-no") : ""}`}>
                <span>{model.activeTest ? model.activeTest.label : "Entrada"}</span>
                <strong>{model.activeTest ? model.activeTest.value : "idade = ?"}</strong>
              </div>

              <div className={`ce-turnstile-sensor ${hasTest ? (isAllowed ? "is-yes" : "is-no") : ""}`}>
                <span className="ce-turnstile-sensor-tag">CATRACA · TESTE</span>
                <code>idade &gt;= 18 ?</code>
                {hasTest && (
                  <strong className="ce-turnstile-verdict">
                    {isAllowed ? "VERDADEIRO" : "FALSO"}
                  </strong>
                )}
              </div>

              <div className="ce-turnstile-lanes">
                <div className={`ce-turnstile-lane is-yes ${hasTest && isAllowed ? "is-active" : hasTest ? "is-dimmed" : ""}`}>
                  <Check size={16} />
                  <div>
                    <strong>se (caminho SIM)</strong>
                    <span>Catraca abre · Pista livre</span>
                  </div>
                </div>
                <div className={`ce-turnstile-lane is-no ${hasTest && !isAllowed ? "is-active" : hasTest ? "is-dimmed" : ""}`}>
                  <X size={16} />
                  <div>
                    <strong>senao (caminho NÃO)</strong>
                    <span>Desvio · Área acompanhada</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {model.caption && <span className="ce-th-story-badge">{model.caption}</span>}
      </div>
    );
  }

  if (model.kind === "svg-flowchart") {
    const hi = model.highlightPart ?? "all";
    const reveal = model.revealStage ?? 4;
    const trueActive = model.isTrue;
    const falseActive = !model.isTrue;
    const showDiamond = reveal >= 2;
    const showBranches = reveal >= 3;
    const showEnd = reveal >= 4;
    const activeBranchPath = trueActive
      ? "M 188 134 L 116 134 Q 100 134 100 150 L 100 198"
      : "M 452 134 L 524 134 Q 540 134 540 150 L 540 198";
    const activeEndPath = trueActive
      ? "M 118 256 L 118 296 Q 118 308 134 308 L 245 308"
      : "M 522 256 L 522 296 Q 522 308 506 308 L 395 308";

    return (
      <div className="ce-th-flowchart-wrap">
        {model.compareBanner && (
          <div className={`ce-flow-compare-banner is-${model.compareBanner.tone}`}>
            {model.compareBanner.text}
          </div>
        )}

        <svg viewBox="0 0 640 340" className="ce-th-flowchart-svg" role="img" aria-label="Fluxograma de decisão">
          <rect
            x="210"
            y="10"
            width="220"
            height="42"
            rx="21"
            className={`ce-flow-node ${hi === "start" || hi === "all" ? "is-accent" : ""}`}
          />
          <text x="320" y="29" textAnchor="middle" className="ce-flow-title">
            {model.startLabel}
          </text>
          <text x="320" y="44" textAnchor="middle" className="ce-flow-sub">
            {model.inputBadge}
          </text>

          <g style={{ opacity: showDiamond ? 1 : 0.14, transition: "opacity 280ms ease" }}>
            <line x1="320" y1="52" x2="320" y2="76" className="ce-flow-edge-active" />

            <polygon
              points="320,76 452,134 320,192 188,134"
              className={`ce-flow-diamond ${hi === "decision" || hi === "all" ? "is-accent" : ""}`}
            />
            <text x="320" y="138" textAnchor="middle" className="ce-flow-diamond-text">
              {model.decisionLabel}
            </text>

            {model.verdictBadge && showBranches && (
              <g>
                <rect
                  x="262"
                  y="198"
                  width="116"
                  height="22"
                  rx="11"
                  className={`ce-flow-verdict-pill ${trueActive ? "is-true" : "is-false"}`}
                />
                <text x="320" y="213" textAnchor="middle" className="ce-flow-pill-text">
                  {model.verdictBadge}
                </text>
              </g>
            )}
          </g>

          <g style={{ opacity: showBranches ? 1 : 0.28, transition: "opacity 320ms ease" }}>
            <path
              d="M 188 134 L 116 134 Q 100 134 100 150 L 100 198"
              fill="none"
              className={trueActive ? "ce-flow-edge-active is-true" : "ce-flow-edge-dimmed"}
            />
            <rect
              x="114"
              y="118"
              width="64"
              height="22"
              rx="11"
              className={`ce-flow-pill ${trueActive ? "is-true" : "is-dimmed"}`}
            />
            <text x="146" y="133" textAnchor="middle" className="ce-flow-pill-text">
              {model.trueLabel}
            </text>

            <rect
              x="22"
              y="198"
              width="192"
              height="58"
              rx="14"
              className={`ce-flow-node ${trueActive ? "is-true-active" : "is-dimmed"}`}
            />
            <text x="118" y="232" textAnchor="middle" className="ce-flow-action-text">
              {model.trueAction}
            </text>

            <path
              d="M 452 134 L 524 134 Q 540 134 540 150 L 540 198"
              fill="none"
              className={falseActive ? "ce-flow-edge-active is-false" : "ce-flow-edge-dimmed"}
            />
            <rect
              x="462"
              y="118"
              width="64"
              height="22"
              rx="11"
              className={`ce-flow-pill ${falseActive ? "is-false" : "is-dimmed"}`}
            />
            <text x="494" y="133" textAnchor="middle" className="ce-flow-pill-text">
              {model.falseLabel}
            </text>

            <rect
              x="426"
              y="198"
              width="192"
              height="58"
              rx="14"
              className={`ce-flow-node ${falseActive ? "is-false-active" : "is-dimmed"}`}
            />
            <text x="522" y="232" textAnchor="middle" className="ce-flow-action-text">
              {model.falseAction}
            </text>

            {model.animatePulse !== false && (
              <circle r="6" className={`ce-flow-pulse-dot ${trueActive ? "is-true" : "is-false"}`}>
                <animateMotion dur="1.5s" repeatCount="indefinite" path={activeBranchPath} />
              </circle>
            )}
          </g>

          <g style={{ opacity: showEnd ? 1 : 0.28, transition: "opacity 320ms ease" }}>
            <path
              d="M 118 256 L 118 296 Q 118 308 134 308 L 245 308"
              fill="none"
              className={trueActive ? "ce-flow-edge-active is-true" : "ce-flow-edge-dimmed"}
            />
            <path
              d="M 522 256 L 522 296 Q 522 308 506 308 L 395 308"
              fill="none"
              className={falseActive ? "ce-flow-edge-active is-false" : "ce-flow-edge-dimmed"}
            />

            <rect x="245" y="289" width="150" height="38" rx="19" className="ce-flow-node" />
            <text x="320" y="313" textAnchor="middle" className="ce-flow-title">
              {model.endLabel}
            </text>

            {model.animatePulse !== false && (
              <circle r="5" className={`ce-flow-pulse-dot ${trueActive ? "is-true" : "is-false"}`}>
                <animateMotion dur="1.4s" repeatCount="indefinite" path={activeEndPath} />
              </circle>
            )}
          </g>
        </svg>

        {model.note && <p className="ce-th-stage-note">{model.note}</p>}
      </div>
    );
  }

  if (model.kind === "concept-hook") {
    return (
      <div className={`ce-hook-stage is-tone-${model.tone ?? "violet"}`}>
        <span className="ce-th-story-eyebrow">{model.eyebrow}</span>
        <h2 className="ce-th-story-headline">{model.headline}</h2>

        <div className="ce-hook-cards">
          {model.cards.map((c, idx) => (
            <div
              key={`${c.title}-${idx}`}
              className={`ce-hook-card is-${c.state ?? "neutral"} ${c.visible ? "is-shown" : ""}`}
            >
              <span className="ce-hook-card-badge">{c.badge}</span>
              <strong className="ce-hook-card-title">{c.title}</strong>
              <code className="ce-hook-card-val">{c.value}</code>
            </div>
          ))}
        </div>

        {model.verdict && (
          <div
            className={`ce-hook-verdict is-${model.verdict.tone} ${model.verdict.visible ? "is-shown" : ""}`}
          >
            {model.verdict.text}
          </div>
        )}

        {model.caption && <span className="ce-th-story-badge">{model.caption}</span>}
      </div>
    );
  }

  const visibleCount = model.visibleCount ?? model.stages.length;
  return (
    <div className="ce-th-arch-stage">
      <div className="ce-th-arch-grid">
        {model.stages.map((st, idx) => {
          const isShown = idx < visibleCount;
          return (
            <div
              key={st.id}
              className={`ce-th-arch-card is-${st.tone ?? "violet"} ${st.active ? "is-active" : ""}`}
              style={{
                opacity: isShown ? 1 : 0.2,
                transform: isShown ? "translateY(0)" : "translateY(6px)",
                transition: "opacity 260ms ease, transform 260ms ease",
              }}
            >
              <span className="ce-th-arch-tag">{st.tag}</span>
              <strong>{st.title}</strong>
              <span>{st.detail}</span>
            </div>
          );
        })}
      </div>

      {model.summaryCard && (
        <div className="ce-th-arch-summary">
          <span className="ce-th-arch-summary-title">{model.summaryCard.title}</span>
          <div className="ce-th-arch-summary-entries">
            {model.summaryCard.entries.map(ent => (
              <div key={ent.key} className="ce-th-arch-entry">
                <span>{ent.key}:</span>
                <strong>{ent.value}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

TheaterVisualStage.displayName = "TheaterVisualStage";
