import React from 'react'
import './detail.css'
import { auth,db } from '../../lib/firebase'
import {useChatStore} from '../../lib/chatStore'
import { useUserStore } from '../../lib/userStore'
import { arrayRemove, arrayUnion, updateDoc, doc } from 'firebase/firestore';

const Detail=()=>{
  
  const {chatId,user,isCurrentUserBlocked,isReceiverBlocked,changeBlock} =useChatStore();
  const {currentUser}=useUserStore();

  const handleBlock=async()=>{
     if(!user)return null;
     
     const userDocRef=doc(db,"users",currentUser.id);
     try {
      await updateDoc(userDocRef,{
        blocked: isReceiverBlocked ? arrayRemove(user.id):arrayUnion(user.id),
      })
      changeBlock()
     } catch (error) {
       console.log(error);
     }
  }
  return (
    <div className="detail">
      <div className="user">
        <img src={user?.avatar || "./avatar.png"} alt="" />
        <h2>{user?.username}</h2>
        <p>lorem ipsum lorem ipsum</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>chat setting</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Privacy & help</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Photos</span>
            <img src="./arrowDown.png" alt="" />
          </div>
          <div className="photos">
            <div className="photoitem">
              <div className="photoDetails">
                <img src="https://plus.unsplash.com/premium_photo-1676637000058-96549206fe71?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
                <span>photo_2024_04.png</span>
              </div>
            <img src="./download.png" alt="" className='icon' />
            </div>
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <button onClick={handleBlock}>{
          isCurrentUserBlocked ? "You are Blocked" : isReceiverBlocked ? "User Blocked" : "Block User"
        }</button>
        <button className='logout' onClick={()=>auth.signOut()}>Logout</button>
      </div>
    </div>
  )
}

export default Detail