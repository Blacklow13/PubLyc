import React from 'react';
import './comp_src/post.css'
import Header from './Header' 
import TitleSortFilters from './TitleSortFilters'

function Post(props) {
  async function addSubscription(setSubs, subs, author_id){
    const isSubscribed = subs.has(author_id);
    
    const url = isSubscribed 
      ? `http://localhost:5000/api/subscriptions/unsubscribe/${author_id}`
      : 'http://localhost:5000/api/subscriptions';

    const options = {
      method: isSubscribed ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (!isSubscribed) {
      options.body = JSON.stringify({ author_id: Number(author_id) });
    }

    try {
      const res = await fetch(url, options);
      const text = await res.text();
      
      if (!res.ok) {
        const err = JSON.parse(text);
        throw new Error(err.error || `Ошибка ${res.status}`);
      }

      const data = text ? JSON.parse(text) : {};
      
      setSubs((prev) => {
        const newSet = new Set(prev);
        
        if (isSubscribed) {
          newSet.delete(author_id);
          console.log(`✅ Отписались от автора #${author_id}`);
        } else {
          newSet.add(author_id);
          console.log(`✅ Подписались на автора #${author_id}`);
        }
        
        return newSet;
      });
      
      return isSubscribed ? 'unsubscribed' : 'subscribed';
      
    } catch (err) {
      console.error('❌ Ошибка подписки:', err);
      alert('Не удалось изменить подписку: ' + err.message);
      throw err;
    }
  }

  return (
    <> <main className="post-card">
        
                  <div className="post-left">
                    <div className="post-title-subscription">
                      <h3 className="post-title">{props.info.title}</h3>
                      <h3 className="event-date">{props.info.date.toLocaleDateString()}</h3>
                      </div>
                    
                    <div className="post-image-placeholder">
                      <div className="placeholder-x"></div>
                    </div>
                    <div className="post-info">
                    <div className="post-stats">
                      <PostStat className="stat" icon="👁" cnt={props.info.views}></PostStat>
                      <PostStat className="stat" icon="⭐" cnt={props.info.likes}></PostStat>
                      
                    </div>
                    <button className="category-tag">{props.info.category}</button>
                    </div>
                  </div>
                  
                  <div className="post-right">
                    <div className="description-box">
                      <p>{props.info.description}</p>
                    </div>
                    <div className="post-footer">
                      <div className="author">
                        <div className="author-avatar">{props.info.icon}</div>
                  
                        <div className="placeholder-user">{props.info.author}</div>
                        <button className="sub-btn" onClick={() => {addSubscription(props.setSubs, props.subs, props.info.author_id)}}>{(props.subs.has(props.info.author_id) ? "X" : "👤")}</button>
                      </div>
                          
                      
                    </div>
                  </div>
             
       
    
          
        </main>
     </>
  );
}

function PostStat(props){
    return(
        <btn className="stat" onClick={() => {}}>
            <span>{props.icon}</span>
            <p className="stat_cnt" >{props.cnt}</p>
        </btn>
    );
}

export default Post