import { useState } from 'react'
import Weather from './Weather'
import "./App.css";  // ⬅️  add this line

function App() {
  const [count, setCount] = useState(0)

  return (
    <>

      <h1>Smart Weather Assistant!!</h1>

      {/* 👇 New Weather component goes right here */}
      <Weather />

      <div className="card">
        
  
      </div>

    
    </>
  )
}

export default App
