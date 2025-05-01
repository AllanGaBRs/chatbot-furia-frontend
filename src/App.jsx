import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [furiosoEntered, setFuriosoEntered] = useState(false);
  const chatBoxRef = useRef(null);
  const lastMessageRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim()) {
      const newMessages = [...messages, { sender: 'user', text: input }];
      setMessages(newMessages);
      setInput('');

      if (!furiosoEntered) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'system', text: 'Furioso entrou no chat' },
        ]);
        setFuriosoEntered(true);
      }

      const response = await fetch('http://localhost:8080/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sender: 'user', text: input }),
      });

      const botMessage = await response.json();
      const formattedMessage = formatMessage(botMessage.text);
      const newBotMessage = {
        sender: 'bot',
        text: formattedMessage,
        players: botMessage.players,
        matches: botMessage.matches
      };

      setMessages((prevMessages) => [...prevMessages, newBotMessage]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (text) => {
    const removeDate = text.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/g, '');
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    const formattedText = removeDate.replace(linkRegex, '<a href="$1" target="_blank">$1</a>');
    return formattedText;
  };

  const scrollToBottom = () => {
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="chat-container">
      <h1>FURIOSO</h1>
      <div className="chat-box" ref={chatBoxRef}>
        <div className="default-message">
          <p>Bem-vindo! O Furioso ta sempre por aqui, manda um "salve" ou "opa" que ele aparece!!</p>
        </div>

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender}`}
            ref={index === messages.length - 1 ? lastMessageRef : null}
          >
            {msg.sender === 'bot' && (
              <div className="bot-message">
                <p dangerouslySetInnerHTML={{ __html: msg.text }}></p>
              </div>
            )}

            {msg.sender === 'user' && (
              <div className="user-message">
                <p>{msg.text}</p>
              </div>
            )}

            {msg.sender === 'system' && (
              <div className="system-message">
                <p>{msg.text}</p>
              </div>
            )}

            {msg.matches && msg.matches.length > 0 && (
              msg.matches.map((_, idx) => {
                if (idx % 2 !== 0) return null;

                const team1 = msg.matches[idx];
                const team2 = msg.matches[idx + 1];

                return (
                  <div key={idx} className="match-card">
                    <div className="teams">
                      <div className="team">
                        <p>{team1.name}</p>
                        <img src={team1.logo} alt={team1.name} />
                      </div>
                      <div className="vs">
                        <p>VS</p>
                      </div>
                      <div className="team">
                        <p>{team2.name}</p>
                        <img src={team2.logo} alt={team2.name} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {msg.players && msg.players.length > 0 && !msg.players[0].enemy && msg.players.map((player, idx) => (
              <div key={idx} className="player-card">
                <p>{player.fullname}</p>
                <img src={player.image} alt={player.fullname} />
              </div>
            ))}
          </div>
        ))}
        <div ref={lastMessageRef}></div>
      </div>

      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
        />
        <button onClick={handleSendMessage}>Enviar</button>
      </div>
    </div>
  );
}

export default App;
