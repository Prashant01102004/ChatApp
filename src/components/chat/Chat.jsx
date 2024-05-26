import React, { useEffect, useRef, useState } from 'react'
import './chat.css'
import EmojiPicker from 'emoji-picker-react'
import { arrayUnion, doc,onSnapshot,updateDoc, getDoc } from 'firebase/firestore';
import {db} from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import upload from '../../lib/upload';


const Chat=()=> {
  const [chat,setChat]=useState();
  const [open,setopen]=useState(false);
  const [text,setText]=useState("");
  const {chatId,user,isCurrentUserBlocked,isReceiverBlocked}=useChatStore();
  const {currentUser}=useUserStore();
  const [img,setImg]=useState({
     file:null,
     url:"",
  });

  const endRef=useRef(null);
  
  
  useEffect(()=>{
    endRef.current?.scrollIntoView({behavior: 'smooth'});
  },[]);

  useEffect(()=>{
    const unSub=onSnapshot(doc(db,'chats',chatId),(res)=>{
      setChat(res.data());
    })
    return ()=>{
      unSub();
    }
  },[chatId])
  const handleEmoji=(e)=>{
        console.log(e);
         setText((prev)=>prev+e.emoji);
  }
  const handleImg=(e)=>{
    if(e.target.files[0]){
    setImg({
      file:e.target.files[0],
      url:URL.createObjectURL(e.target.files[0])
    })
    }
  }
  console.log(text);

  const handleSend=async()=>{
    if(text==="")return;
    

    let imgUrl=null;

    try {
      if(img.file){
        imgUrl=await upload (img.file);
      }
      await updateDoc(doc(db,'chats',chatId),{
        message:arrayUnion({
          senderId:currentUser.id,
          text,
          createdAt:new Date(),
          ...(imgUrl && {img:imgUrl})
        }),
      });
      
      const userIDs=[currentUser.id,user.id];
      userIDs.forEach(async (id)=>{
      const userChatsRef=doc(db,"userchats",id);
      const userChatsSnapshot=await getDoc(userChatsRef);
      
      if(userChatsSnapshot.exists()){
        const userChatsData=userChatsSnapshot.data();

        const chatIndex=userChatsData.chats.findIndex(
          (c)=>c.chatId === chatId
        );

        userChatsData.chats[chatIndex].lastMessage = text;
        userChatsData.chats[chatIndex].isSeen = id===currentUser.id ? true : false;
        userChatsData.chats[chatIndex].updatedAt = Date.now();

        await updateDoc(userChatsRef,{
          chats:userChatsData.chats,
        });
      }
      })
      
    } catch (error) {
       console.log(error);
    }

    setImg({
      file:null,
      url:""
    });
    setText("");
  }
  return (
    <div className='chat'>
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>Lorem ipsum njnjre erver</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>
      <div className="center">
        {chat?.message?.map((message)=>(
        <div className={message.senderId===currentUser?.id ? "message own" : "message"} key={message?.createAt}>
          <div className="texts">
            {message.img && <img src={message.img} alt="" />}
            <p>{message.text}</p>
          </div>
        </div>))}
        {img.url && 
        <div className="message own">
          <div className="texts">
            <img src={img.url} alt="" />
          </div>
        </div>
        }
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
          <img src="./img.png" alt="" />
          </label>
          <input type="file"  id="file" style={{display:"none"}} onChange={handleImg}/>
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <input type="text" value={text} placeholder='Type your message...' onChange={(e)=>setText(e.target.value)} disabled={isCurrentUserBlocked || isReceiverBlocked}/>
        <div className="emoji">
          <img src="./emoji.png" alt="" onClick={()=>setopen((prev)=>!prev)}/>
          <div className="picker">
          <EmojiPicker open={open} onEmojiClick={handleEmoji}/>
          </div>
        </div>
        <button className='sendButton' onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>send</button>
      </div>
    </div>
  )
}

export default Chat