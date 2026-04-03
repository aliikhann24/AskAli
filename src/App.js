import { useState, useRef, useEffect } from 'react';
import { askGemini } from './services/geminiService';
import profile from './data/profile';
import './App.css';

const suggestions = [
  "What projects has Ali built?",
  "What are his top skills?",
  "Is he available for internships?",
  "Tell me about his experience",
  "How can I contact Ali?",
];

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '2px 0' }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: '#484f58', display: 'inline-block',
          animation: `blink 1.2s infinite ${i * 0.2}s`
        }}/>
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', gap: '8px', alignItems: 'flex-end' }}>
      {!isUser && (
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: '#1d6fd8', color: '#fff', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', fontWeight: '700', flexShrink: 0
        }}>AI</div>
      )}
      <div style={{
        maxWidth: '75%', padding: '10px 14px', fontSize: '14px', lineHeight: '1.6',
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        background: isUser ? '#1d6fd8' : '#21262d',
        color: isUser ? '#fff' : '#c9d1d9',
        border: isUser ? 'none' : '1px solid #30363d',
      }}>
        {msg.text}
      </div>
    </div>
  );
}

function App() {
  const [messages, setMessages] = useState([{
    role: 'model',
    text: `Hey! I'm Ali's AI assistant. Ask me anything about Muhammad Ali Khan — his projects, skills, availability, or how to reach him.`
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const reply = await askGemini(text, messages);
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'model', text: 'Something went wrong. Try again!' }]);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#010409',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '660px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '68px', height: '68px', borderRadius: '50%',
            border: '2px solid #1d6fd8', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px', background: '#0d1f3c'
          }}>
            <div style={{
              width: '54px', height: '54px', borderRadius: '50%',
              background: '#1d6fd8', color: '#fff', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', fontWeight: '700'
            }}>A</div>
          </div>
          <h1 style={{ color: '#e6edf3', fontSize: '22px', fontWeight: '600', margin: '0 0 5px' }}>
            Ask Ali
          </h1>
          <p style={{ color: '#7d8590', fontSize: '13px', margin: '0 0 8px' }}>
            AI assistant · {profile.name}
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#3fb950' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3fb950', display: 'inline-block' }}/>
            Online · {profile.title}
          </div>
        </div>

        {/* Chat window */}
        <div style={{
          background: '#161b22', border: '1px solid #21262d',
          borderRadius: '14px', padding: '20px',
          minHeight: '360px', maxHeight: '420px',
          overflowY: 'auto', marginBottom: '12px',
          display: 'flex', flexDirection: 'column', gap: '12px'
        }}>
          {messages.map((msg, i) => <Message key={i} msg={msg} />)}
          {loading && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: '#1d6fd8', color: '#fff', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: '700', flexShrink: 0
              }}>AI</div>
              <div style={{
                padding: '10px 14px', background: '#21262d',
                border: '1px solid #30363d', borderRadius: '16px 16px 16px 4px'
              }}>
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestion chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => sendMessage(s)} disabled={loading}
              style={{
                background: '#161b22', border: '1px solid #30363d',
                color: '#8b949e', padding: '5px 12px', borderRadius: '20px',
                fontSize: '12px', cursor: 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'border-color .15s, color .15s'
              }}
              onMouseEnter={e => { e.target.style.borderColor = '#1d6fd8'; e.target.style.color = '#58a6ff'; }}
              onMouseLeave={e => { e.target.style.borderColor = '#30363d'; e.target.style.color = '#8b949e'; }}
            >{s}</button>
          ))}
        </div>

        {/* Input row */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text" value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder="Ask anything about Ali..."
            disabled={loading}
            style={{
              flex: 1, background: '#161b22', border: '1px solid #30363d',
              borderRadius: '10px', padding: '12px 16px', color: '#e6edf3',
              fontSize: '14px', outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = '#1d6fd8'}
            onBlur={e => e.target.style.borderColor = '#30363d'}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            style={{
              background: '#1d6fd8', border: 'none', borderRadius: '10px',
              padding: '12px 22px', color: '#fff', fontSize: '14px',
              fontWeight: '500', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !input.trim() ? 0.5 : 1,
              transition: 'opacity .15s'
            }}
          >Send</button>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '20px' }}>
          {[
            { label: 'GitHub', url: ("https://github.com/aliikhann24") },
            { label: 'Portfolio', url: ("https://portfolio-murex-zeta-r1kpl6bzix.vercel.app/") },
          ].map(link => (
            <a key={link.label} href={link.url} target="_blank" rel="noreferrer"
              style={{ color: '#484f58', fontSize: '12px', textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.color = '#58a6ff'}
              onMouseLeave={e => e.target.style.color = '#484f58'}
            >{link.label}</a>
          ))}
        </div>

      </div>
    </div>
  );
}

export default App;