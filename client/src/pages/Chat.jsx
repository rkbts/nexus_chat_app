import React, { useEffect, useState, useRef } from 'react'
import axios from "axios";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { allUsersRoute, host } from "../utils/APIRoutes";
import Contacts from '../components/Contacts';
import Welcome from '../components/Welcome';
import ChatContainer from '../components/ChatContainer';
import {io} from "socket.io-client"
function Chat() {
  const socket = useRef();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [isLoaded, setIsLoaded] = useState(false)
  const myFunc1 = async () => {
    if (!localStorage.getItem('chatt-app-user')) {
      navigate("/login");
    } else {
      setCurrentUser(
        await JSON.parse(
          localStorage.getItem('chatt-app-user')
        )
      );
      setIsLoaded(true);
    }
  }
  useEffect(() => {
     myFunc1()
  }, []);
  useEffect(() => {
    if(currentUser) {
      socket.current = io(host)
      socket.current.emit("add-user", currentUser._id)
    }
  })
  const myFunc2 = async (currentUser) => {
    if (currentUser) {
      if (currentUser.isAvatarImageSet) {
        const data = await axios.get(`${allUsersRoute}/${currentUser._id}`);
        setContacts(data.data);
      } else {
        navigate("/setAvatar");
      }
    }
  }
  useEffect(() => {
     myFunc2(currentUser)
  }, [currentUser]);
  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };
  return (
    <Container>
    <div className='container'>
        <Contacts contacts={contacts} currentUser = {currentUser} changeChat = {handleChatChange}/>
        {isLoaded && currentChat === undefined ? (
            <Welcome currentUser = {currentUser} />
          ) : (
            <ChatContainer currentChat={currentChat} currentUser = {currentUser} socket = {socket}/>
          )}
    </div>
    </Container>
  )
}

export default Chat

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;
