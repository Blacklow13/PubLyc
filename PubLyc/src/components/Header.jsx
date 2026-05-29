import React from 'react';
import './comp_src/header.css'

function Header(props) {
  const openHomePage = (event) => {
    props.setCurrentPage("posts");
  }
  const openProfilePage = (event) => {
    props.setCurrentPage("profile");
  }
  return (
    <header id="posts_header">

            <div className="nav-pannel">
              <button className="home-page" onClick={openHomePage}>🏠</button>
            </div>
            <div className="nav-pannel">
              <h1 className="nickname">{props.user.name}</h1>
              <div className="avatar">{props.user.avatar}</div>
              <button className="profile" onClick={openProfilePage}>👤</button>
            </div>

    </header> 
  );
}

export default Header