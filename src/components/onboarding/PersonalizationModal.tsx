import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Clock, Code2, Sparkles, User } from "lucide-react";
import { usePlatform } from "../../context/PlatformContext";
import { ThemePalettePicker } from "../shared/ThemePalettePicker";

const DAILY_GOAL_PRESETS = [
  { minutes: 15, label: "15 min", hint: "Ritmo leve" },
  { minutes: 30, label: "30 min", hint: "Equilibrado" },
  { minutes: 45, label: "45 min", hint: "Consistente" },
  { minutes: 60, label: "60 min", hint: "Foco diário" },
  { minutes: 90, label: "90 min", hint: "Imersão" },
];

export const PersonalizationModal: React.FC = () => {
  const { data, personalizationOpen, completePersonalization, skipPersonalization } = usePlatform();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<number | "custom">(30);
  const [customMinutes, setCustomMinutes] = useState("25");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!personalizationOpen) return;
    setStep(1);
    setName(data.settings.displayName === "Estudante" ? "" : data.settings.displayName);
    const goal = data.settings.dailyGoalMinutes || 30;
    const isPreset = DAILY_GOAL_PRESETS.some(p => p.minutes === goal);
    if (isPreset) {
      setSelectedPreset(goal);
    } else {
      setSelectedPreset("custom");
      setCustomMinutes(String(goal));
    }
    setErrorMsg(null);
  }, [personalizationOpen, data.settings.displayName, data.settings.dailyGoalMinutes]);

  const effectiveMinutes =
    selectedPreset === "custom"
      ? Math.max(5, Math.min(240, Math.round(Number(customMinutes) || 30)))
      : selectedPreset;

  const previewName = name.trim() || "Estudante";

  const handleFinish = async () => {
    if (saving) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      await completePersonalization({
        displayName: previewName,
        dailyGoalMinutes: effectiveMinutes,
        theme: data.settings.theme,
        themePalette: data.settings.themePalette,
      });
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Não foi possível salvar suas preferências agora. Tente novamente."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {personalizationOpen && (
        <motion.div
          className="ce-modal-backdrop"
          style={{ zIndex: 982 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
          transition={{ duration: 0.18 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ce-personalize-title"
        >
          <motion.div
            className="ce-personalization-modal"
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
          >
            {/* Cabeçalho */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="ce-brand-mark" aria-hidden="true">
                  <Code2 size={18} strokeWidth={2.3} />
                </div>
                <div>
                  <span style={{ fontSize: 11.5, color: "var(--accent-secondary)", fontWeight: 700, display: "block" }}>
                    Configuração inicial · {step} de 3
                  </span>
                  <strong style={{ fontSize: 15 }}>Code Entry</strong>
                </div>
              </div>

              <div style={{ display: "flex", gap: 5 }} aria-hidden="true">
                {[1, 2, 3].map(idx => (
                  <span
                    key={idx}
                    style={{
                      width: step === idx ? 26 : 14,
                      height: 5,
                      borderRadius: 999,
                      background:
                        step === idx
                          ? "var(--accent-secondary)"
                          : step > idx
                          ? "var(--accent-success)"
                          : "rgba(148,163,184,0.24)",
                      transition: "all 220ms ease",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Corpo animado por etapa */}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.form
                  key="step-name"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={e => {
                    e.preventDefault();
                    setStep(2);
                  }}
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <div>
                    <h2 id="ce-personalize-title" style={{ fontSize: 21, lineHeight: 1.25 }}>
                      Como devemos chamar você?
                    </h2>
                    <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.55 }}>
                      Use apenas seu primeiro nome ou apelido. Vamos usá-lo para deixar o painel e o roteiro de boas-vindas com a sua cara.
                    </p>
                  </div>

                  <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <User size={13} />
                      <span>Nome ou apelido</span>
                    </span>
                    <input
                      autoFocus
                      className="ce-input"
                      style={{ height: 44, fontSize: 15, padding: "0 14px" }}
                      value={name}
                      onChange={e => setName(e.target.value)}
                      maxLength={32}
                      placeholder="Ex.: Marina, Lucas, Dani..."
                      aria-label="Nome ou apelido"
                    />
                  </label>

                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: 11,
                      background: "var(--accent-soft)",
                      border: "1px solid var(--border-accent-soft)",
                      fontSize: 12.5,
                      color: "var(--text-secondary)",
                    }}
                  >
                    <Sparkles size={13} style={{ color: "var(--accent-secondary)", verticalAlign: "middle", marginRight: 6 }} />
                    Prévia da saudação:{" "}
                    <strong style={{ color: "var(--text-primary)" }}>Bem-vindo(a), {previewName}!</strong>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 6 }}>
                    <button
                      type="button"
                      className="ce-btn ce-btn-ghost ce-btn-sm"
                      onClick={() => skipPersonalization()}
                    >
                      Pular esta etapa
                    </button>
                    <button type="submit" className="ce-btn ce-btn-primary">
                      <span>Continuar</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </motion.form>
              )}

              {step === 2 && (
                <motion.div
                  key="step-theme"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <div>
                    <h2 id="ce-personalize-title" style={{ fontSize: 21, lineHeight: 1.25 }}>
                      Personalize o visual do seu ambiente, {previewName}
                    </h2>
                    <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.55 }}>
                      Escolha entre modo escuro ou claro e experimente ao vivo uma das quatro paletas de cada modo. Você poderá alterar quando quiser no seu perfil.
                    </p>
                  </div>

                  <ThemePalettePicker variant="onboarding" />

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 6 }}>
                    <button
                      type="button"
                      className="ce-btn ce-btn-ghost ce-btn-sm"
                      onClick={() => setStep(1)}
                    >
                      <ArrowLeft size={14} />
                      <span>Voltar</span>
                    </button>

                    <button
                      type="button"
                      className="ce-btn ce-btn-primary"
                      onClick={() => setStep(3)}
                    >
                      <span>Definir ritmo diário</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step-goal"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <div>
                    <h2 id="ce-personalize-title" style={{ fontSize: 21, lineHeight: 1.25 }}>
                      Quanto tempo pretende estudar por dia, {previewName}?
                    </h2>
                    <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.55 }}>
                      Essa escolha serve apenas como referência pessoal para acompanhar seu ritmo — sem cobranças e fácil de ajustar depois no seu perfil.
                    </p>
                  </div>

                  <div className="ce-goal-grid" role="radiogroup" aria-label="Meta diária de estudo">
                    {DAILY_GOAL_PRESETS.map(opt => {
                      const active = selectedPreset === opt.minutes;
                      return (
                        <button
                          key={opt.minutes}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          className={`ce-goal-option ${active ? "is-selected" : ""}`}
                          onClick={() => setSelectedPreset(opt.minutes)}
                        >
                          <strong>{opt.label}</strong>
                          <span>{opt.hint}</span>
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      role="radio"
                      aria-checked={selectedPreset === "custom"}
                      className={`ce-goal-option ${selectedPreset === "custom" ? "is-selected" : ""}`}
                      onClick={() => setSelectedPreset("custom")}
                    >
                      <strong>Personalizar</strong>
                      <span>Outro tempo</span>
                    </button>
                  </div>

                  {selectedPreset === "custom" && (
                    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <Clock size={13} />
                        <span>Tempo personalizado em minutos (5 a 240)</span>
                      </span>
                      <input
                        type="number"
                        className="ce-input"
                        style={{ height: 42 }}
                        min={5}
                        max={240}
                        value={customMinutes}
                        onChange={e => setCustomMinutes(e.target.value)}
                        aria-label="Minutos personalizados por dia"
                      />
                    </label>
                  )}

                  {errorMsg && (
                    <div
                      style={{
                        padding: "9px 12px",
                        borderRadius: 10,
                        background: "rgba(248, 113, 113, 0.12)",
                        border: "1px solid rgba(248, 113, 113, 0.35)",
                        fontSize: 12.5,
                        color: "var(--accent-danger)",
                      }}
                    >
                      {errorMsg}
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="ce-btn ce-btn-ghost ce-btn-sm"
                      onClick={() => setStep(2)}
                    >
                      <ArrowLeft size={14} />
                      <span>Voltar</span>
                    </button>

                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        Meta: <strong style={{ color: "var(--text-primary)" }}>{effectiveMinutes} min/dia</strong>
                      </span>
                      <button
                        type="button"
                        className="ce-btn ce-btn-primary"
                        disabled={saving}
                        onClick={handleFinish}
                      >
                        <span>{saving ? "Salvando..." : "Começar tour guiado"}</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
