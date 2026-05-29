
import React, { useState } from 'react';
import './comp_src/sort_filters.css'

function TitleSortFilters(props) {
    const [sortType, setSortType] = useState("asc")
    return (
    
            <div id="title_and_ordering">
                <h1 id="title_posts">Посты</h1>
                <div id="categories_to_sort">
                    <h2 className="categories-title">Категории</h2>
                    <div id="radio_buttons">
                        <div className="radio_choice">
                            <input type='radio' value="Новость" id="news" onChange={props.filter_posts} checked={props.isSelected === "Новость"}></input>
                            <h3>Новость</h3>
                        </div>
                        <div className="radio_choice">
                            <input type='radio' value="Объявление" id="announcement" onChange={props.filter_posts} checked={props.isSelected === "Объявление" }></input>
                            <h3>Объявление</h3>
                        </div>
                        <div className="radio_choice">
                            <input type='radio' value="Мероприятие" id="event" onChange={props.filter_posts} checked={props.isSelected === "Мероприятие" }></input>
                            <h3>Мероприятие</h3>
                        </div>
                        <div className="radio_choice">
                            <input type='radio' value="none" id="event" onChange={props.filter_posts} checked={props.isSelected === "none" }></input>
                            <h3>Все</h3>
                        </div>
                    </div>
                </div>
                <input className='search-post-input' type="text" onKeyPress={props.search_post}/>
                <div className='sort-select-div'>
                    <div className='select-div'>
                        <h2 className="categories-title">Сортировать по</h2>
                <select className="sort-by"  onChange={props.sort_by}>
                    <option value="date">Дате</option>
                    <option value="popularity" selected>Популярности</option>
                </select>
                    </div>
                    
                <button id="sort_by" onClick={props.reverse_sort}>
                    {
                    props.sort_type == "desc" ? <><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 3V21M7 3L11 7M7 3L3 7M14 3H21M14 9H19M14 15H17M14 21H15" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg></> : <><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 3V21M7 3L11 7M7 3L3 7M14 3H15M14 9H17M14 15H19M14 21H21" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg></>}
                    </button>
                </div>
                
                
            </div>

    );
}

export default TitleSortFilters