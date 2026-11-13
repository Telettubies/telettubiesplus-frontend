import { ChatIndexRecovery } from '@/features/connected/ChatIndexRecovery';
import React, { useState, useRef, useEffect } from 'react';
import { shouldUseMock } from '@/shared/utils/mockSwitch';
import { services } from '@/features/connected/services';
import {
  FiPaperclip,
  FiX,
  FiSend,
  FiFileText,
  FiMessageSquare,
  FiCheck,
} from 'react-icons/fi';
import { MOCK_SUGGESTED_QUESTIONS } from '../mockups/chatObservaciones.mock';
import { useTenderChat, type ChatScenarioState } from '../hooks/useTenderChat';
import { ClickableNumeralText } from './ClickableNumeralText';
import { sanitizeText } from '@/shared/utils/sanitizeText';
import { TYPOGRAPHY } from '@/shared/components/typography/Typography';
import '../styles/chat.animations.css';

export interface TenderChatPanelProps {
  licitacionId?: string;
  externalScenario?: ChatScenarioState;
  onJumpToPdfPage?: (page: number, label: string) => void;
}

const QUICK_CONTEXT_OPTIONS = [
  { id: 'ctx-3.2', label: 'Numeral 3.2 — Experiencia específica (Pág. 14)' },
  { id: 'ctx-3.3', label: 'Numeral 3.3 — Personal clave mínimo (Pág. 15)' },
  { id: 'ctx-4.2', label: 'Numeral 4.2 — Índice de liquidez (Pág. 22)' },
  { id: 'ctx-5.1', label: 'Numeral 5.1 — Plazos y cronograma (Pág. 31)' },
  { id: 'ctx-garantias', label: 'Sección Garantías y pólizas de seriedad (Pág. 11)' },
  { id: 'ctx-1.8', label: 'Numeral 1.8 — Plazos del cronograma (Pág. 6)' },
];

export const TenderChatPanel: React.FC<TenderChatPanelProps> = ({
  licitacionId = 'LP-MIN-001-2026',
  externalScenario,
  onJumpToPdfPage,
}) => {
  const {
    setScenario,
    displayedMessages,
    quotaAvailable,
    quotaTotal,
    inputText,
    setInputText,
    sendMessage,
  } = useTenderChat(licitacionId, externalScenario ?? 'default_chat');

  // Contexto adjunto a la pregunta que se está redactando actualmente (estilo Gemini / ChatGPT)
  const [attachedContext, setAttachedContext] = useState<string | null>(null);
  const [contextOptions, setContextOptions] = useState(shouldUseMock() ? QUICK_CONTEXT_OPTIONS : []);
  useEffect(() => {
    if (shouldUseMock()) return;
    const controller = new AbortController();
    services.result(licitacionId, controller.signal).then(result => {
      if (!controller.signal.aborted && result.kind === 'ready') setContextOptions(result.value.items.map(item => ({ id: item.requisito_id, label: `Numeral ${item.numeral} — ${item.descripcion_item} (Pág. ${item.ubicacion.pagina})` })));
    }).catch(() => {});
    return () => controller.abort();
  }, [licitacionId]);
  const [showContextPicker, setShowContextPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (externalScenario) {
      setScenario(externalScenario);
    }
  }, [externalScenario, setScenario]);

  // Cerrar picker al hacer clic fuera o presionar Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowContextPicker(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowContextPicker(false);
      }
    };

    if (showContextPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showContextPicker]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const currentQuestion = inputText.trim();
    const currentContext = attachedContext ?? undefined;
    sendMessage(currentQuestion, currentContext);
    setAttachedContext(null);
    setShowContextPicker(false);
  };

  const handleSuggestedClick = (question: string) => {
    sendMessage(question, attachedContext ?? undefined);
    setAttachedContext(null);
    setShowContextPicker(false);
  };

  return (
    <div
      id="tour-step-chat-assistant"
      className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-card flex flex-col min-h-[660px] h-[calc(100vh-210px)] max-h-[880px] overflow-hidden font-sans"
    >
      {!shouldUseMock('VITE_MOCK_CHAT') && <ChatIndexRecovery licitacionId={licitacionId}/>}
      {/* Top Chat Header - Limpio sin contexto global */}
      <div className="px-6 py-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
            <FiMessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className={`${TYPOGRAPHY.title} text-base`}>
              Asistente Legal del Pliego ({licitacionId})
            </h3>
            <p className="text-xs text-slate-500">
              Realice preguntas específicas sobre cláusulas, requisitos o condiciones del documento
            </p>
          </div>
        </div>

        <div className={TYPOGRAPHY.label}>
          Consultas disponibles hoy: {quotaAvailable} / {quotaTotal}
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {displayedMessages.length === 0 ? (
          <div className="flex h-[280px] flex-col items-center justify-center text-center">
            <div className={`mb-3 ${TYPOGRAPHY.label}`}>
              Preguntas frecuentes sugeridas sobre este pliego
            </div>
            <div className="flex flex-wrap justify-center gap-2.5 max-w-xl">
              {MOCK_SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSuggestedClick(q)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  &quot;{q}&quot;
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedMessages.map((msg) => {
              if (msg.rol === 'usuario') {
                return (
                  <div key={msg.id} className="flex flex-col items-end gap-1.5">
                    {/* Contexto adjunto a esta pregunta específica (estilo Gemini / ChatGPT) */}
                    {msg.contexto && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/80 shadow-2xs">
                        <FiFileText className="w-3 h-3 text-brand-primary" />
                        <span className="text-slate-500 font-normal">Contexto:</span>
                        <span className="font-semibold text-slate-800">{msg.contexto}</span>
                      </div>
                    )}
                    <div className="max-w-[80%] rounded-2xl bg-brand-primary text-white px-4 py-3 text-xs font-normal leading-relaxed shadow-2xs">
                      {sanitizeText(msg.contenido)}
                    </div>
                  </div>
                );
              }

              if (msg.rol === 'error_429') {
                return (
                  <div
                    key={msg.id}
                    role="alert"
                    className="rounded-2xl border border-[#FECDD3] dark:border-red-500/30 bg-[#FFF1F2] dark:bg-red-500/10 px-4 py-3 text-xs font-medium leading-relaxed text-[#BE123C] dark:text-red-300"
                  >
                    {sanitizeText(msg.contenido)}
                  </div>
                );
              }

              if (msg.rol === 'FueraDeAlcance') {
                return (
                  <div
                    key={msg.id}
                    role="status"
                    className="rounded-2xl border border-[#FDE68A] dark:border-amber-500/30 bg-[#FFFBEB] dark:bg-amber-500/10 px-4 py-3 text-xs font-medium leading-relaxed text-[#B45309] dark:text-amber-300"
                  >
                    {sanitizeText(msg.contenido)}
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className="rounded-2xl bg-slate-50 dark:bg-[#232323] border border-slate-200/70 dark:border-[#2E2E2E] p-4 text-xs leading-relaxed text-slate-700 dark:text-zinc-200 space-y-2 shadow-2xs"
                >
                  <p>{sanitizeText(msg.contenido)}</p>
                  <ClickableNumeralText
                    referencias={msg.referencias}
                    onJumpToPage={onJumpToPdfPage}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Input Composer (Estilo Gemini / ChatGPT con contexto adjunto por pregunta) */}
      <div className="p-4 bg-slate-50/60 border-t border-slate-200/80 relative">
        <form onSubmit={handleFormSubmit} className="space-y-2">
          {/* Chip de contexto adjunto a la pregunta actual */}
          {attachedContext && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200/90 rounded-xl text-xs w-fit shadow-2xs soft-page-enter">
              <FiFileText className="w-3.5 h-3.5 text-brand-primary shrink-0" />
              <span className="text-slate-500 text-[11px]">Contexto adjunto:</span>
              <span className="font-semibold text-slate-800 text-xs">{attachedContext}</span>
              <button
                type="button"
                onClick={() => setAttachedContext(null)}
                className="ml-1 p-0.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                title="Quitar contexto de esta pregunta"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Menú flotante desplegable para seleccionar contexto */}
          {showContextPicker && (
            <div
              ref={pickerRef}
              className="absolute bottom-full left-4 right-4 sm:left-4 sm:right-auto sm:w-96 mb-2 p-3 bg-white border border-slate-200 rounded-2xl shadow-xl space-y-2.5 z-30 soft-page-enter"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-900 pb-1.5 border-b border-slate-100">
                <span className="flex items-center gap-1.5">
                  <FiFileText className="w-3.5 h-3.5 text-brand-primary" />
                  Adjuntar cláusula o sección a la pregunta
                </span>
                <button
                  type="button"
                  onClick={() => setShowContextPicker(false)}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1">
                {contextOptions.map((option) => {
                  const isSelected = attachedContext === option.label;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setAttachedContext(option.label);
                        setShowContextPicker(false);
                        inputRef.current?.focus();
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-brand-primary text-white font-medium'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                      }`}
                    >
                      <span className="truncate pr-2">{option.label}</span>
                      {isSelected && <FiCheck className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fila del input con botón de adjuntar contexto estilo Gemini */}
          <div className="flex items-center gap-3 bg-white rounded-2xl border border-slate-200/90 px-4 py-2 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/10 transition-all shadow-sm">
            {/* Botón para abrir el selector de contexto */}
            <button
              type="button"
              onClick={() => setShowContextPicker((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                attachedContext
                  ? 'bg-brand-primary/10 text-brand-primary font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Adjuntar una cláusula o sección del pliego como contexto a esta pregunta"
            >
              <FiPaperclip className="w-3.5 h-3.5" />
              <span>
                {attachedContext ? 'Cambiar contexto' : 'Añadir contexto'}
              </span>
            </button>

            {/* Input para redactar la pregunta */}
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escriba su pregunta sobre el pliego (ej. ¿Cómo se acredita la experiencia del director de obra?)..."
              className="flex-1 bg-transparent py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2.5 text-xs font-semibold text-white hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <span>Preguntar</span>
              <FiSend className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
