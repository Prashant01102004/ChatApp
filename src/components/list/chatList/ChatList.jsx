import React, { useEffect, useState } from 'react'
import './chatList.css'
import AddUser from './addUser/AddUser';
import {useUserStore} from '../../../lib/userStore';
import { doc,onSnapshot,getDoc,updateDoc} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useChatStore } from '../../../lib/chatStore';


const ChatList=()=> {
  const [addmode,setAddMode]=useState(false);
  const [chats,setchats]=useState([]);
  const {currentUser}=useUserStore();
  const {changeChat}=useChatStore();

  const [input,setInput]=useState("");

  useEffect(()=>{
    const unsub=onSnapshot(doc(db,'userchats',currentUser.id),async (res)=>{
      const items=res.data().chats;

      const promises=items.map(async(item)=>{
        const userDocRef=doc(db,"users",item.receiverId);
        const userDocSnap=await getDoc(userDocRef);

        const user=userDocSnap.data();
        return {...item,user};
      })

      const chatData=await Promise.all(promises);

      setchats(chatData.sort((a,b)=>b.updatedAt-a.updatedAt));
    });
    return ()=>{
      unsub();
    }
  },[currentUser.id]);

  const handleSelect=async(chat)=>{
      const userChats = chats.map((item)=>{
        const {user,...rest}=item;
        return rest;
      });

      const chatIndex=userChats.findIndex(item=>item.chatId===chat.chatId);
      userChats[chatIndex].isSeen=true;

      const userChatsRef=doc(db,"userchats",currentUser.id);

      try {
        await updateDoc(userChatsRef,{
          chats:userChats,
        });

        changeChat(chat.chatId,chat.user);

      } catch (error) {
        console.log(error);
      }

       
  }

  const filteredChats=chats.filter((c)=>
  c.user.username.toLowerCase().includes(input.toLowerCase())
);

  return (

    <div className='chatList'>
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="" />
          <input type="text" placeholder='Search'  onChange={(e)=>setInput(e.target.value)}/>
        </div>
        <img src={addmode ? './minus.png' : "./plus.png"} alt="" className='add' onClick={()=>setAddMode((prev)=>!prev)}/>
      </div>
      {filteredChats.map(chat=>(
         <div className="item" key={chat.chatId} 
         onClick={()=>handleSelect(chat)}
         style={{backgroundColor: chat?.isSeen ? 'transparent' : '#5183fe'}}
          >
         <img src={chat.user?.avatar || "./avatar.png"} alt="" />
         <div className="text">
           <span>{chat.user.username}</span>
           <p>{chat.lastMessage}</p>
         </div>
       </div>
      ))}
      
      
      {addmode && <AddUser/>}
    </div>
    
  )
}

export default ChatList