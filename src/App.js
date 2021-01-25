import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

// import React from 'react';
// import './App.css';

// //firebase sdk
// import firebase from 'firebase/app'
// //firebase db
// import 'firebase/firestore'
// //firebase user authentication
// import 'firebase/auth'

// //Firebase hooks
// import {useAuthState} from 'react-firebase-hooks/auth';
// import { useCollectionData } from 'react-firebase-hooks/firestore';
//import {useCollectionData} from 'react-firebase-hooks/firestore';

//we call fb intialize app to identify our project
if (!firebase.apps.length) {
firebase.initializeApp({
  apiKey: "AIzaSyD6Ei9gnYaZ7f6cndoNWCnYZ2ERyQ1lIoc",
    authDomain: "chatapp-e5ba9.firebaseapp.com",
    projectId: "chatapp-e5ba9",
    storageBucket: "chatapp-e5ba9.appspot.com",
    messagingSenderId: "617069936760",
    appId: "1:617069936760:web:5336e5f22bfd949165ad8d",
    measurementId: "G-PBK7J33DSF"
})
}else {
  firebase.app(); // if already initialized, use that one
}
//we make ref to our databse and authentication SDK as global variables
const auth=firebase.auth();
const firestore=firebase.firestore();

function App() {

  const [user]=useAuthState(auth);
  //console.log(user);

  return (
    <div className="App">
      <header >
        <SignOut/>
        </header>
        <section>
          {user ? <ChatRoom/>: <SignIn/>}
        </section>

      
    </div>
  );
}


function ChatRoom(){

  const dummy=useRef();
  //create a reference to firestore collection
const messagesRef=firestore.collection('messages');
console.log(messagesRef)
//query for a subset of documents
const query=messagesRef.orderBy('createdAt').limit(25);
console.log(query)
//listen to any updates in realtime using useCollectionData hook
const [messages] = useCollectionData(query, { idField: 'id' });
const [formValue,setFormValue]=useState('');

const sendMessage= async(e) =>{
  e.preventDefault();
  const { uid,photoURL }=auth.currentUser;
  await messagesRef.add({
    text:formValue,
    createdAt:firebase.firestore.FieldValue.serverTimestamp(),
    uid,
    photoURL
  });

  setFormValue('');
  dummy.current.scrollIntoView({behavior:'smooth'});
}
//const [messages] = useCollectionData(query, {idField: 'id'});
//Every message is represented as a doc in firestore
//messages is a array of objects where each object is a chat message in db 
  return(
  <>
   <main>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)} 
    <div ref={dummy}></div>
   </main>

   {/*On submit the sendMessage updates the new message to firebase*/}
    <form onSubmit={sendMessage}>

    <input value={formValue} onChange={(e)=>setFormValue(e.target.value)}/>
    <button type="submit">Send</button>
    </form>
  </>

  )
}

function ChatMessage(props){
  console.log(props)
  const {text, uid, photoURL}=props.message;
  const messageClass= uid === auth.currentUser.uid ? 'sent':'received';

  return(
    <div className={`message ${messageClass}`}>
    <img src={photoURL} />
    <p>{text}</p>
    </div>
    
  )
}
function SignIn(){

  const signInWithGoogle= ()=> {
    const provider=new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  
  return(
    <button onClick={signInWithGoogle}>Sign In with Google</button>
  )
}
function SignOut(){

  return auth.currentUser && (
    <button className="sign-out" onClick={()=>auth.signOut()}>Sign Out</button>
)
}

export default App;
