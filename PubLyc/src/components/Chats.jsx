import React from 'react';
import './comp_src/chats.css';
import { useState } from 'react';

function Chats(props) {
  if (props.loading) return <div style={{padding: 20}}>⏳ Загрузка чатов...</div>;
  if (props.error) return <div style={{padding: 20, color: 'red'}}>❌ {error}</div>;
  if (!props.chats.length) return <div style={{padding: 20}}>Чаты не найдены</div>;

  const  serachChat = (event) => {
  if (event.key == 'Enter' && event.target.value.trim().length !== 0) {

    const  findChatByTitle = (searchTitle) => {
    const title = searchTitle.toLowerCase();
    return props.chats.filter(chat => 
        chat.title.toLowerCase().includes(title)
    )[0];
    }
    const result = findChatByTitle(event.target.value)
    
    if (result != undefined){
      props.setActiveChatId(result.id);      
      props.setCurrentPage('chat'); 
    }else{
      confirm("Чат не найден")
    }
     
    
  }

}
  const handleChatClick = (chatId) => {
    props.setActiveChatId(chatId);      
    props.setCurrentPage('chat');       
  };
  return (
    <>
    <div id="chats_chart">
        <header id="chats_header">
            <h1 className="chats-title">Чаты</h1>
            <div id="search_div">
                <input className='search-chat-input' onKeyPress={serachChat}></input>
                <button className='search-btn'>⫶☰</button>
            </div>
        </header>
     
            <div className="chat-list">
                
              {props.chats.map((item) => (
              <ChatItem
                key={item.id}  
                id={item.id}
                title={item.title}
                last_message={item.last_message}
                isActive={props.activeChatId === item.id}
                onClick={() => handleChatClick(item.id)}
              />
              ))}
             
        
          </div>
       
        
    </div>
    </>
  );
  
}



function ChatItem(props) {
  return (
    <div 
      className={`chat-item ${props.isActive ? 'active-chat' : ''}`}
      onClick={props.onClick}
    >
      <div className="chat-icon">🐕</div>
      <div className="chat-info">
        <h4>{props.title}</h4>
        <p>{props.last_message}</p>
      </div>
    </div>
  );
}




export default Chats