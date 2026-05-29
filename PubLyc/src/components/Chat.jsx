import './comp_src/chat-area.css'
import { Component, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client';

function Chat(props){
  const handleSubmit = (e) => {
    e.preventDefault(); 
  };
  const [messages, setMessages1] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [errorMessages, setErrorMessages] = useState(null);
  const [newMessageText, setNewMessageText] = useState('');

  useEffect(() => {
    fetch(`http://localhost:5000/api/chats/${props.activeChatId}`)
      .then(res => {
        if (!res.ok) throw new Error(`Ошибка сервера: ${res.status}`);
        return res.json();
      })
      .then(data => {
        const messagesArray = data.messages || [];
        console.log(messagesArray)
        
        const processedMessages = messagesArray.map(msg => ({
          ...msg,
          sent_at: msg.sent_at ? new Date(msg.sent_at) : new Date(),
        }));
        
        setMessages1(processedMessages);
        setLoadingMessages(false);
      })
      .catch(err => {
        console.error('Ошибка загрузки сообщений:', err);
        setErrorMessages(err.message);
        setLoadingMessages(false);
      });
  }, [props.activeChatId]);

  const [inputValue, setInputValue] = useState('');
    return (
    <>
    
    <div className="content-page chat-page">
      <div className="chat-header">
        <h2>Приют для собак</h2>
      </div>

    <div className="messages-container">
        {messages.map((msg) => (
          <Message key={msg.id} msg={msg} ></Message>
        ))}
      </div>

      <form className="message-input-form" onSubmit={handleSubmit} >
      <div className="input-wrapper">
        <input
          type="text"
          className="message-input"
          placeholder="Введите сообщение..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          
        />
        
        <div className="input-actions">
          
          <button className="send-btn" onClick={sendMessage} >
            ➤
          </button>
        </div>
      </div>
    </form>
    </div>
    
  
      
    </>);
  
  async function sendMessage(e){
    const message = { user_id: 1, id: messages.length + 1, author: props.user.name, role: props.user.status, text: document.getElementsByClassName("message-input")[0].value, avatar: props.user.avatar } 
    
  
    if (document.getElementsByClassName("message-input")[0].value != ""){
      if (e) e.preventDefault();

    
    try {
      const res = await fetch(`http://localhost:5000/api/chats/${props.activeChatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: document.getElementsByClassName("message-input")[0].value })
      });
      
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Ошибка ${res.status}`);
      }
      
      const data = await res.json();
     
      
      setMessages1([...messages, message])

    } catch (err) {
      console.error('Ошибка отправки:', err);
      alert('Не удалось отправить: ' + err.message);
    }

      const messangesDiv = document.getElementsByClassName("messages-container")[0];
      const messageContainer = document.getElementsByClassName("content")[0];
      const tempDiv = document.createElement('div');
      
      const root = createRoot(tempDiv);

    setTimeout(() => {
        if (tempDiv.firstChild) {
          messangesDiv.appendChild(tempDiv.firstChild);
          messageContainer.scrollTo({
      top: messageContainer.scrollHeight,
      behavior: 'smooth'
      });
        }

      }, 10);
    }  
  }
}

function Message(props){
    return (
    <>
      <div key={props.msg.id} className={`message-row ${(props.msg.user_id == 1) ? 'right' : 'left'}`}>
              <div className="message-bubble">
                <div className="bubble-avatar">{props.msg.avatar}</div>
                <div className="bubble-content">
                  <div className="bubble-header">
                    <span className="bubble-author">{props.msg.author}</span>
                    {props.msg.role && <span className="bubble-role">{props.msg.status}</span>}
                  </div>
                  <div className="bubble-text">
                    {props.msg.text || ""}
                  </div>

                </div>
              </div>
            </div>
    </>
    );
  }
export default Chat