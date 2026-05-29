import React, { useState, useEffect } from 'react';
import './comp_src/posts.css'
import Header from './Header' 
import TitleSortFilters from './TitleSortFilters'
import Post from './Post';




function Posts(props) {
  const [sortBy, setSortBy] = useState("popularity");
  const [orderingType, setOrderingType] = useState("desc");
  const [filterBy, setFilterBy] = useState("none");
 
  let select = null;
  useEffect(() => {

        select = document.querySelector(".sort-by");
      
    })
  

  let posts = props.posts;
  
  
  
  const filterPosts = () => {

    if (filterBy !== "none"){
     return posts.filter(post => post.category === filterBy).map(post => post.id);
     
    }else{
      
      
      return posts.map(post => post.id);
    }
  }

  let filteredPosts = filterPosts(posts);


  const searchPost = (event) => {
  if (event.key === 'Enter' && event.target.value.trim().length !== 0) {

    const PostIndexByTitle = (searchTitle) => {
      const title = searchTitle.toLowerCase();
     return posts.findIndex(post => 
      post.title.toLowerCase().includes(title)
      );
    }
    const postIndex = PostIndexByTitle(event.target.value);
    
    
    
    if (postIndex !== undefined) {
      const postElement = document.getElementsByClassName("post-card")[postIndex -1 ];
      if (postElement) {
        postElement.scrollIntoView({ behavior: 'smooth' });
      }
    
      
    } else {
      confirm("Ничего не найдено");
    }
  }
}

  const handleFilterChange = (event) => {
    if (event.target.value == filterBy){
      setFilterBy("none");
      event.target.checked = false;
    }else{
      setFilterBy(event.target.value);
    }
  };

  const handleSortChange = () => {
    setSortBy(select.value);
  };


  const sort_posts = () =>{
 
    
    
    if (orderingType === "desc"){
      if (sortBy === "popularity"){
      posts = [...props.posts].sort((a, b) => {
        const aIsSubscribed = props.subs.has(a.author_id);
        const bIsSubscribed = props.subs.has(b.author_id);
        if (aIsSubscribed === bIsSubscribed) {
        if (a.views !== b.views) {
            return b.views - a.views
        } else {
            return b.likes - a.likes
        }
        } return aIsSubscribed ? -1 : 1
        });
      }else{
        posts = [...props.posts].sort((a, b) => {
              return b.date - a.date
          
        });
      }
    }else{
      
      if (sortBy === "popularity"){
      posts = [...props.posts].sort((a, b) => {
        const aIsSubscribed = props.subs.has(a.author_id);
        const bIsSubscribed = props.subs.has(b.author_id);
        if (aIsSubscribed === bIsSubscribed) {
        if (a.views !== b.views) {
            return a.views - b.views
        } else {
            return a.likes - b.likes
        }
        } return aIsSubscribed ? -1 : 1
        });
      }else{
        posts = [...props.posts].sort((a, b) => {
              return a.date - b.date
          
        });
      }
    }
  }
    

  

  const reverse_sort = (event) =>{
    if (orderingType === "desc"){
      setOrderingType("asc")
  
    }else{
      setOrderingType("desc")

    }setSortBy(select.value);
  }

  sort_posts();

  return (
    <> <main id="posts">
          <TitleSortFilters sort_type={orderingType} sort_by={handleSortChange} search_post={searchPost} filter_posts={handleFilterChange} reverse_sort={reverse_sort} isSelected={filterBy}></TitleSortFilters>
          <div id="posts_div">
            {posts.filter(post => filteredPosts.includes(post.id)).map((item) => 
              (<Post key={item.id} info={item} subs={props.subs} setSubs={props.setSubs}></Post>))}
            
          </div>
          
        </main>
     </>
  );
}

export default Posts