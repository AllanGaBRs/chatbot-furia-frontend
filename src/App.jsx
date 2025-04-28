import React, { useState } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSendMessage = async () => {
    if (input.trim()) {
      const newMessages = [...messages, { sender: 'user', text: input }];
      setMessages(newMessages);
      setInput('');

      const response = await fetch('http://localhost:8080/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sender: 'user', text: input }),
      });

      const botMessage = await response.json();

      const formattedMessage = formatMessage(botMessage.text);
      
      setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: formattedMessage }]);
    }
  };


  
  const formatMessage = (text) => {
    // Remove a data
    const removeDate = text.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/g, '');

    // Torna o link clicável
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    const formattedText = removeDate.replace(linkRegex, '<a href="$1" target="_blank">$1</a>');

    return formattedText;
  };

  return (
    <div className="chat-container">
      <h1>Chatbot FURIA</h1>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <p dangerouslySetInnerHTML={{ __html: msg.text }}></p>
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua mensagem..."
        />
        <button onClick={handleSendMessage}>Enviar</button>
      </div>
    </div>
  );
}

export default App;
