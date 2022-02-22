
import './App.css';
import{useState} from 'react';






function App() {
  const[name, setName]= useState("")
  const[email, setEmail]= useState("")
  const[password, setPassword]= useState("")
  // https://authentication-shortner.herokuapp.com/users/signup

  async function registerUser(event){
    event.preventDefault()
    
    const response = await fetch('https://authentication-shortner.herokuapp.com/users/signup',
    {
      method:'POST',
      body:JSON.stringify({
        name,
        email,
        password
      }),
      headers:{
        "Content-Type":"application/json"
      }
    })
  
    const data = await response.json();
    alert(data.message);

  }


  return (
    <div className="App">
     <h1>Register</h1>
      <form onSubmit={registerUser}>
        <input
        value ={name}
        onChange={(event)=> setName(event.target.value)}
        type="text"
        placeholder='Name'
        />
           <input
        value ={email}
        onChange={(event)=> setEmail(event.target.value)}
        type="email"
        placeholder='email'
        />
           <input
        value ={password}
        onChange={(event)=> setPassword(event.target.value)}
        type="password"
        placeholder='password'
        />
        <input type ="submit" value ="Register"/>
      </form>
    </div>
  );
}

export default App;
