import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Code2, Compass, FolderKanban, Layers, User } from "lucide-react";
import { usePlatform } from "../../context/PlatformContext";
import { AmbientAurora } from "../motion/AmbientAurora";
import { InteractiveBackground } from "../motion/InteractiveBackground";
import { LessonStageBackground } from "../motion/LessonStageBackground";

export const PersonalizationModal: React.FC = () => {
  const {
    data,
    personalizationOpen,
    justReset,
    resetEpoch,
    clearJustReset,
    completePersonalization,
    skipPersonalization,
  } = usePlatform();

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!personalizationOpen) return;
    setName(data.settings.displayName === "Estudante" ? "" : data.settings.displayName);
    setErrorMsg(null);
  }, [personalizationOpen, resetEpoch, data.settings.displayName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      clearJustReset();
      await completePersonalization({
        displayName: name.trim() || "Estudante",
        dailyGoalMinutes: data.settings.dailyGoalMinutes || 30,
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

  const photoUrl = `${import.meta.env.BASE_URL}images/welcome-coding.jpg`;

  return (
    <AnimatePresence>
      {personalizationOpen && (
        <motion.div
          className="ce-welcome-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.14 } }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ce-welcome-title"
        >
          <AmbientAurora speed={0.5} />
          <InteractiveBackground
            reducedMotion={Boolean(data.settings.reducedMotion)}
            theme={data.settings.theme}
            paletteId={data.settings.themePalette}
          />
          <LessonStageBackground />

          <a
            href="https://github.com/CarlosAugg/Code-Entry"
            target="_blank"
            rel="noopener noreferrer"
            className="ce-welcome-github-link"
            aria-label="Repositório do Code Entry no GitHub"
            title="GitHub · CarlosAugg/Code-Entry"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
              <path d="M12 0.3C5.37 0.3 0 5.67 0 12.3c0 5.31 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.22.7.83.58C20.57 22.1 24 17.61 24 12.3 24 5.67 18.63 0.3 12 0.3Z" />
            </svg>
          </a>

          <motion.div
            className="ce-welcome-open-grid"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.24 }}
          >
            {/* Coluna Esquerda: Cena em formato D com desfoque sutil de 1px (Lia 2D integrada na imagem) */}
            <div className="ce-welcome-visual-col">
              <div className="ce-welcome-photo-frame">
                <img
                  src={photoUrl}
                  alt="Estudante programando no Code Entry acompanhado pela robô Lia em 2D"
                  className="ce-welcome-photo"
                />
              </div>
            </div>

            {/* Coluna Direita: Identidade centralizada, Pilares e Formulário sobre o fundo Aurora */}
            <div className="ce-welcome-content-col">
              <div className="ce-welcome-glow-orb" aria-hidden="true" />

              <motion.div
                className="ce-welcome-brand"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: 0.05 }}
              >
                <div className="ce-brand-mark" aria-hidden="true">
                  <Code2 size={32} strokeWidth={2.3} />
                </div>
                <div className="ce-welcome-brand-text">
                  <strong>Code Entry</strong>
                  <span>Aprenda. Pratique. Evolua.</span>
                </div>
              </motion.div>

              {justReset && (
                <div className="ce-welcome-reset-notice" role="status">
                  Progresso local apagado com sucesso. Tudo pronto para começar do zero.
                </div>
              )}

              <motion.div
                className="ce-welcome-copy"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: 0.1 }}
              >
                <h1 id="ce-welcome-title">Aprenda tecnologia praticando direto no navegador</h1>
              </motion.div>

              <motion.div
                className="ce-welcome-pillars"
                aria-label="Pilares da plataforma"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: 0.15 }}
              >
                <span>
                  <Layers size={15} style={{ color: "var(--accent-secondary)" }} />
                  Trilhas guiadas
                </span>
                <span>
                  <Compass size={15} style={{ color: "var(--accent-tertiary)" }} />
                  Roadmaps por objetivo
                </span>
                <span>
                  <FolderKanban size={15} style={{ color: "var(--accent-success)" }} />
                  Projetos integradores
                </span>
              </motion.div>

              <motion.form
                onSubmit={handleSubmit}
                className="ce-welcome-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: 0.2 }}
              >
                <label htmlFor="ce-welcome-name-input" className="ce-welcome-label is-centered">
                  <User size={15} />
                  <span>Como devemos chamar você?</span>
                </label>

                <input
                  id="ce-welcome-name-input"
                  autoFocus
                  className="ce-input ce-welcome-input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={32}
                  placeholder="Seu primeiro nome ou apelido"
                />

                {errorMsg && (
                  <div role="alert" style={{ fontSize: 12.5, color: "var(--accent-danger)" }}>
                    {errorMsg}
                  </div>
                )}

                <div className="ce-welcome-actions">
                  <button type="submit" className="ce-btn ce-btn-primary" disabled={saving}>
                    <span>{saving ? "Entrando..." : "Entrar no Code Entry"}</span>
                    <ArrowRight size={15} />
                  </button>
                  <button
                    type="button"
                    className="ce-welcome-skip-link"
                    onClick={() => {
                      clearJustReset();
                      skipPersonalization();
                    }}
                  >
                    Pular por enquanto
                  </button>
                </div>
              </motion.form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
