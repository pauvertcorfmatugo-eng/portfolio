import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Mail, MessageCircle, Send, X } from 'lucide-react';
import { profil } from '../../data/profil';
import { useEscape } from '../../lib/hooks';
import MessageForm from '../MessageForm.jsx';
import { normalize, reply, welcome } from './brain';
import { useChat } from './ChatContext.jsx';
import './Chat.css';

let lastId = 0;
const nextId = () => ++lastId;
const isSmallScreen = () => window.matchMedia('(max-width: 640px)').matches;

/** Texte avec **gras** et retours à la ligne. */
function RichText({ text }) {
  return text.split('\n').map((line, i) =>
    line.trim() === '' ? (
      <span key={i} className="chat-gap" />
    ) : (
      <p key={i}>
        {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
          part.startsWith('**') && part.endsWith('**') ? <strong key={j}>{part.slice(2, -2)}</strong> : part,
        )}
      </p>
    ),
  );
}

export default function ChatWidget() {
  const { isOpen, open, close, queued, clearQueued } = useChat();
  const [messages, setMessages] = useState(() => [{ id: nextId(), from: 'bot', ...welcome }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [form, setForm] = useState(null); // { prefill, key } quand le formulaire est ouvert
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const timer = useRef(null);

  useEscape(close, isOpen);
  useEffect(() => () => clearTimeout(timer.current), []);

  const ask = useCallback((raw) => {
    const question = raw.trim();
    if (!question) return;
    setMessages((m) => [...m, { id: nextId(), from: 'user', text: question }]);
    setInput('');
    setForm(null);
    setTyping(true);

    const answer = reply(question);
    const delay = 380 + Math.min(answer.text.length * 3, 900);
    timer.current = setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: nextId(), from: 'bot', ...answer }]);
    }, delay);
  }, []);

  // Question envoyée depuis un bouton du site.
  useEffect(() => {
    if (isOpen && queued) {
      ask(queued);
      clearQueued();
    }
  }, [isOpen, queued, ask, clearQueued]);

  useEffect(() => {
    if (isOpen && !isSmallScreen()) {
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, typing, form]);

  const onInternalLink = () => {
    if (isSmallScreen()) close();
  };

  const last = messages[messages.length - 1];
  // On ne repropose pas une question qui vient d'être posée.
  const asked = new Set(messages.filter((m) => m.from === 'user').map((m) => normalize(m.text)));
  const suggestions = (last.suggestions ?? []).filter((s) => !asked.has(normalize(s)));

  return (
    <>
      <button
        type="button"
        className={`chat-launcher${isOpen ? ' is-hidden' : ''}`}
        onClick={() => open()}
        aria-label="Ouvrir l'assistant du portfolio"
        aria-expanded={isOpen}
        aria-controls="chat-panel"
      >
        <MessageCircle />
        <span>Une question ?</span>
      </button>

      <section
        id="chat-panel"
        className={`chat-panel${isOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-label="Assistant du portfolio"
        inert={!isOpen}
      >
        <header className="chat-head">
          <div className="chat-avatar" aria-hidden="true">
            u<span>.</span>
          </div>
          <div className="chat-head-text">
            <p className="chat-title">Assistant du portfolio</p>
            <p className="chat-status">
              <span className="chat-status-dot" /> Réponses automatiques
            </p>
          </div>
          <button type="button" className="icon-btn bare" onClick={close} aria-label="Fermer l'assistant">
            <X />
          </button>
        </header>

        <div className="chat-body" ref={bodyRef} aria-live="polite">
          {messages.map((m) => (
            <div key={m.id} className={`chat-msg from-${m.from}`}>
              <div className="chat-bubble">
                <RichText text={m.text} />
              </div>

              {m.links?.length > 0 && (
                <div className="chat-links">
                  {m.links.map((l) =>
                    l.to ? (
                      <Link key={l.label} to={l.to} onClick={onInternalLink}>
                        {l.label} <ArrowUpRight />
                      </Link>
                    ) : (
                      <a
                        key={l.label}
                        href={l.href}
                        download={l.download || undefined}
                        target={l.download || l.href.startsWith('mailto:') ? undefined : '_blank'}
                        rel="noreferrer"
                      >
                        {l.label} <ArrowUpRight />
                      </a>
                    ),
                  )}
                </div>
              )}

              {m.action?.type === 'message' && (
                <button
                  type="button"
                  className="chat-action"
                  onClick={() => setForm({ prefill: m.action.prefill, key: m.id })}
                >
                  <Mail /> Écrire à {profil.prenom}
                </button>
              )}
            </div>
          ))}

          {typing && (
            <div className="chat-msg from-bot">
              <div className="chat-bubble chat-typing" aria-label="L'assistant écrit">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}

          {form && (
            <div className="chat-form">
              <div className="chat-form-head">
                <strong>Message pour {profil.prenom}</strong>
                <button type="button" className="icon-btn bare" onClick={() => setForm(null)} aria-label="Annuler">
                  <X />
                </button>
              </div>
              <MessageForm key={form.key} source="chat" prefill={form.prefill} compact />
            </div>
          )}

          {!typing && !form && last.from === 'bot' && suggestions.length > 0 && (
            <div className="chat-suggestions">
              {suggestions.map((s) => (
                <button type="button" key={s} onClick={() => ask(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <form
          className="chat-input"
          onSubmit={(e) => {
            e.preventDefault();
            if (!typing) ask(input);
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                e.preventDefault();
                if (!typing) ask(input);
              }
            }}
            placeholder="Posez votre question…"
            maxLength={300}
            aria-label="Votre question"
            autoComplete="off"
          />
          <button type="submit" className="chat-send" disabled={!input.trim() || typing} aria-label="Envoyer">
            <Send />
          </button>
        </form>
      </section>
    </>
  );
}
