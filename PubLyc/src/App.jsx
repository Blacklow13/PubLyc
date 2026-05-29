import { Component, useState, useEffect } from 'react'
import React from 'react';
import './App.css'
import Header from './components/Header' 
import Posts from './components/Posts';
import Chats from './components/Chats';
import Chat from './components/Chat';
import Profile from './components/Profile';

function App() {
  const [currentPage, setCurrentPage] = useState('posts');
  const [userId, setUserId] = useState(1);
  const [activeChatId, setActiveChatId] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [subs, setSubs] = useState(new Set());
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [errorSubs, setErrorSubs] = useState(null);
  const [chatItems, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [errorChats, setErrorChats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const user_data = {
    name: "Aspas",
    status: "Admin",
    avatar: "👤",
    email: "aspas@doogle.com"
  }

  const [user, setUser] = useState(user_data);

  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/api/users/${userId}/subscriptions`)
      .then(res => {
        if (!res.ok) throw new Error(`Ошибка сервера: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setSubs(new Set(data));
        console.log(data, 8)
        setLoadingSubs(false);
      })
      .catch(err => {
        console.error('Ошибка загрузки подписок:', err);
        setErrorSubs(err.message);
        setLoadingSubs(false);
      });
  }, [userId]); 
  

  useEffect(() => {
    fetch('http://localhost:5000/api/posts')
      .then(res => {
        if (!res.ok) throw new Error(`Ошибка сервера: ${res.status}`);
        return res.json();
      })
      .then(data => {
      const processedPosts = data.map(post => ({
        ...post,
        date: post.date ? new Date(post.date) : new Date()
      }));
      
      setPosts(processedPosts);
      setLoading(false);
    })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

    const postsContent = loading 
      ? <p style={{padding: '20px'}}>⏳ Загрузка постов...</p>
      : error 
        ? <p style={{padding: '20px', color: '#dc3545'}}>❌ {error}</p>
        : <Posts posts={posts} subs={subs} setSubs={setSubs} />;
  
useEffect(() => {
  fetch(`http://localhost:5000/api/users/1/chats`)
    .then(res => {
      if (!res.ok) throw new Error(`Ошибка сервера: ${res.status}`);
      return res.json();
    })
    .then(data => {
      const chatsArray = data.chats || [];
      
      const processedChats = chatsArray.map(chat => ({
        ...chat,
        id: chat.chat?.id || chat.id,
        title: chat.chat?.title || chat.title,
        last_message: chat.chat?.last_message || chat.last_message || 'Нет сообщений',
        user_message_count: chat.user_message_count || 0,
        last_user_message_at: chat.last_user_message_at
      }));
      
      setChats(processedChats);
      console.log('✅ Загружено чатов:', processedChats.length);
      setLoadingChats(false);
    })
    .catch(err => {
      console.error('❌ Ошибка загрузки чатов:', err);
      setErrorChats(err.message);
      setLoadingChats(false);
    });
}, []);
  const renderPage = () => {
        if (currentPage === 'chat') {
            return <> 
                    <Chats activeChatId={activeChatId} setActiveChatId={setActiveChatId} chats={chatItems} setCurrentPage={setCurrentPage} user={user}></Chats>
                    <main className="content">
                      <Header setCurrentPage={setCurrentPage} user={user}></Header>
                      <Chat activeChatId={activeChatId} setActiveChatId={setActiveChatId} user={user}></Chat>
                    </main> </>;
                    
        } else if (currentPage === 'posts') {
            return <> 
            <Chats activeChatId={activeChatId} setActiveChatId={setActiveChatId} chats={chatItems} setCurrentPage={setCurrentPage} user={user}></Chats>
                    <main className="content">
                      <Header setCurrentPage={setCurrentPage} user={user} ></Header>
                      
                       {postsContent}
                    </main> </>;
        }else if (currentPage === 'profile') {
            return<>
            <Chats activeChatId={activeChatId} setActiveChatId={setActiveChatId} chats={chatItems} setCurrentPage={setCurrentPage} user={user}></Chats>
                    <main className="content">
                      <Header setCurrentPage={setCurrentPage} user={user} ></Header>
                        <Profile user={user} setUser={setUser}></Profile>
                    </main> </>;
          
        }
    };

  return (
   renderPage()
  );
}

export default App