import { useState, useRef, useEffect } from "react";

const JARDEL_SYSTEM_PROMPT = `You are Jardel Kerr — a 26-year-old Android/Flutter/KMP mobile engineer based in Walthamstow, London. You're talking to visitors on your portfolio site who want to get to know you better.

WHO YOU ARE:
- Mobile engineer (Android, Flutter, KMP) with 3 years experience and a strong product mindset
- Currently job hunting for product-focused engineering roles
- Building JournalCapture (a KMP journaling app) and other side projects
- You write on Substack, do Morning Pages, and voice journal
- Based in Walthamstow, East London

YOUR PERSONALITY (this is key — let it SHOW):
- Energetic, charismatic, warm
- Love to tease and joke around — you're funny and quick
- Direct — you don't waffle
- Loving and genuinely interested in people
- Quirky, weird, flamboyant in the best way
- Deep thinker with strong emotional intelligence
- Resilient — you've pushed through hard things
- You love to push the boat out / take risks
- Easy to talk to — this is important, make visitors feel at ease

YOUR INTERESTS:
- Basketball (big passion)
- Fitness
- Neuroscience (genuinely fascinated by how the brain works)
- Gaming
- Music — hip hop and melodic rap
- Personal growth and self-awareness

WHAT YOU WANT PEOPLE TO KNOW:
- You have strong genuine interests, not just surface-level stuff
- You're easy to talk to and want to actually connect
- You're not your CV — there's a whole person here

TONE RULES:
- Talk in first person as Jardel
- Be warm, a little playful, genuinely curious back
- Keep answers punchy — no essays unless they ask something deep
- It's okay to be a bit cheeky or funny
- Don't be corporate or robotic. Never say "Certainly!" or "Great question!"
- If someone asks something you don't know, be honest and playful about it
- Occasionally flip it and show curiosity about THEM
- You can mention your work but don't lead with it — lead with the person

EXAMPLE STARTER ENERGY:
If someone says "hi" — don't just say hi back formally. Match energy. Be real.`;

const PROMPT_SUGGESTIONS = [
  "What are you actually like as a person?",
  "What's your biggest passion outside of coding?",
  "Tell me something weird about you 👀",
  "What are you building right now?",
  "What music are you listening to?",
  "How do you think about your career?",
];

async function callClaude(messages) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: JARDEL_SYSTEM_PROMPT,
      messages,
    }),
  });
  const data = await response.json();
  return data.content?.[0]?.text || "Something went wrong — try again?";
}

export default function JardelChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");
    setStarted(true);

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const reply = await callClaude(newMessages);
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "My brain glitched — hit me again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={styles.root}>
      <style>{css}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.avatarWrap}>
          <div style={styles.avatar}>JK</div>
          <div style={styles.onlineDot} />
        </div>
        <div>
          <div style={styles.headerName}>Jardel Kerr</div>
          <div style={styles.headerSub}>Ask me anything — I don't bite 😄</div>
        </div>
      </div>

      {/* Chat area */}
      <div style={styles.chatArea}>
        {!started && (
          <div style={styles.intro}>
            <p style={styles.introText}>
              Hey 👋 I'm Jardel. This is a chat powered by AI but trained on <em>my</em> personality, interests, and vibe. Ask me something real.
            </p>
            <div style={styles.prompts}>
              {PROMPT_SUGGESTIONS.map((p) => (
                <button
                  key={p}
                  style={styles.promptBtn}
                  className="prompt-btn"
                  onClick={() => sendMessage(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.messageRow,
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            {m.role === "assistant" && (
              <div style={styles.msgAvatar}>JK</div>
            )}
            <div
              style={{
                ...styles.bubble,
                ...(m.role === "user" ? styles.bubbleUser : styles.bubbleAssistant),
              }}
              className={m.role === "assistant" ? "assistant-bubble" : ""}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ ...styles.messageRow, justifyContent: "flex-start" }}>
            <div style={styles.msgAvatar}>JK</div>
            <div style={{ ...styles.bubble, ...styles.bubbleAssistant, ...styles.typingBubble }}>
              <span className="dot" /><span className="dot" /><span className="dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={styles.inputRow}>
        <textarea
          style={styles.input}
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask Jardel something..."
          rows={1}
        />
        <button
          style={{
            ...styles.sendBtn,
            opacity: !input.trim() || loading ? 0.4 : 1,
          }}
          className="send-btn"
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
        >
          ↑
        </button>
      </div>
    </div>
  );
}

const styles = {
  root: {
    fontFamily: "'DM Mono', 'Courier New', monospace",
    background: "#0a0a0a",
    border: "1px solid #1f1f1f",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: "520px",
    height: "600px",
    margin: "0 auto",
    overflow: "hidden",
    color: "#e8e8e8",
    boxShadow: "0 0 60px rgba(255,255,255,0.03), 0 20px 60px rgba(0,0,0,0.6)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 20px",
    borderBottom: "1px solid #1a1a1a",
    background: "#0d0d0d",
    flexShrink: 0,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #e8e8e8 0%, #888 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "700",
    color: "#0a0a0a",
    letterSpacing: "0.5px",
  },
  onlineDot: {
    position: "absolute",
    bottom: "1px",
    right: "1px",
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    background: "#4ade80",
    border: "2px solid #0d0d0d",
  },
  headerName: {
    fontSize: "14px",
    fontWeight: "600",
    letterSpacing: "0.3px",
    color: "#f0f0f0",
  },
  headerSub: {
    fontSize: "11px",
    color: "#555",
    marginTop: "2px",
    fontStyle: "italic",
  },
  chatArea: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  intro: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginBottom: "4px",
  },
  introText: {
    fontSize: "13px",
    color: "#888",
    lineHeight: "1.6",
    margin: 0,
    padding: "14px 16px",
    background: "#111",
    borderRadius: "12px",
    border: "1px solid #1e1e1e",
  },
  prompts: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  promptBtn: {
    background: "transparent",
    border: "1px solid #2a2a2a",
    borderRadius: "20px",
    padding: "7px 13px",
    fontSize: "11.5px",
    color: "#aaa",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s ease",
    letterSpacing: "0.2px",
  },
  messageRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
  },
  msgAvatar: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #e8e8e8 0%, #888 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "8px",
    fontWeight: "700",
    color: "#0a0a0a",
    flexShrink: 0,
  },
  bubble: {
    maxWidth: "78%",
    padding: "10px 14px",
    borderRadius: "14px",
    fontSize: "13px",
    lineHeight: "1.6",
    letterSpacing: "0.1px",
  },
  bubbleUser: {
    background: "#f0f0f0",
    color: "#0a0a0a",
    borderBottomRightRadius: "4px",
  },
  bubbleAssistant: {
    background: "#141414",
    color: "#d8d8d8",
    border: "1px solid #1f1f1f",
    borderBottomLeftRadius: "4px",
  },
  typingBubble: {
    display: "flex",
    gap: "5px",
    alignItems: "center",
    padding: "14px 16px",
  },
  inputRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "10px",
    padding: "14px 16px",
    borderTop: "1px solid #1a1a1a",
    background: "#0d0d0d",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    background: "#111",
    border: "1px solid #222",
    borderRadius: "10px",
    padding: "10px 14px",
    color: "#e8e8e8",
    fontSize: "13px",
    fontFamily: "inherit",
    resize: "none",
    outline: "none",
    lineHeight: "1.5",
    letterSpacing: "0.1px",
  },
  sendBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "#e8e8e8",
    color: "#0a0a0a",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.15s ease",
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  .prompt-btn:hover {
    border-color: #444 !important;
    color: #e8e8e8 !important;
    background: #141414 !important;
  }

  .send-btn:hover:not(:disabled) {
    background: #fff !important;
    transform: scale(1.05);
  }

  .chat-input:focus {
    border-color: #333 !important;
  }

  .assistant-bubble {
    animation: fadeUp 0.2s ease;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #444;
    display: inline-block;
    animation: bounce 1.2s infinite;
  }
  .dot:nth-child(2) { animation-delay: 0.15s; }
  .dot:nth-child(3) { animation-delay: 0.3s; }

  @keyframes bounce {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-5px); background: #888; }
  }

  div[style*="overflow-y"]::-webkit-scrollbar {
    width: 4px;
  }
  div[style*="overflow-y"]::-webkit-scrollbar-track {
    background: transparent;
  }
  div[style*="overflow-y"]::-webkit-scrollbar-thumb {
    background: #222;
    border-radius: 4px;
  }
`;
