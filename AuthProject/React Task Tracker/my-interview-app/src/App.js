// import React, { useState } from "react";

// // Simple styles to make it look decent without an external CSS file
// const styles = {
//   container: { maxWidth: "400px", margin: "50px auto", textAlign: "center", fontFamily: "Arial" },
//   input: { padding: "10px", width: "70%", marginRight: "10px" },
//   button: { padding: "10px", backgroundColor: "blue", color: "white", border: "none", cursor: "pointer" },
//   list: { listStyle: "none", padding: 0, marginTop: "20px" },
//   listItem: { display: "flex", justifyContent: "space-between", padding: "10px", borderBottom: "1px solid #ddd" },
//   deleteBtn: { color: "red", cursor: "pointer", border: "none", background: "none" }
// };

// function App() {
//   // 1. STATE: This holds your list of tasks
//   const [tasks, setTasks] = useState([]);
//   // 2. STATE: This holds what the user is currently typing
//   const [input, setInput] = useState("");

//   // Function to add a task
//   const addTask = () => {
//     if (input.trim() === "") return; // Don't add empty tasks
//     const newTask = { id: Date.now(), text: input };
//     setTasks([...tasks, newTask]); // Add new task to the existing list
//     setInput(""); // Clear the input box
//   };

//   // Function to delete a task
//   const deleteTask = (id) => {
//     const updatedTasks = tasks.filter((task) => task.id !== id);
//     setTasks(updatedTasks);
//   };

//   return (
//     // /*<div style={styles.container}>
//     //   <h2>🚀 My Interview Task Tracker</h2>
      
//     //   {/* Input Section */}
//     //   <div>
//     //     <input
//     //       style={styles.input}
//     //       type="text"
//     //       placeholder="Enter a task..."
//     //       value={input}
//     //       onChange={(e) => setInput(e.target.value)}
//     //     />
//     //     <button style={styles.button} onClick={addTask}>Add</button>
//     //   </div>

//     //   {/* List Section */}
//     //   <ul style={styles.list}>
//     //     {tasks.map((task) => (
//     //       <li key={task.id} style={styles.listItem}>
//     //         {task.text}
//     //         <button style={styles.deleteBtn} onClick={() => deleteTask(task.id)}>
//     //           Delete ✖
//     //         </button>
//     //       </li>
//     //     ))}
//     //   </ul>
      
//     //   {tasks.length === 0 && <p>No tasks yet! Add one above.</p>}
//     // <

//     <div>
//       <p> Count:1
//       </p>
//       <button onClick > increment  </button>
//       </div>
    
//   );
// }

// export default App;


import { use, useState } from "react";

function App() {
  const [count, setCount] = useState(0);
const [isVisible , setVisible] = useState(true)
  const incrementCounter = () => {
    setCount(count + 1);
  };
  const decrementCounter = () => {
    setCount(count - 1);
  };
  const togglebox = () => {
    setVisible(!isVisible);
  };

  return (
    <div style={styles.container}>
      <h1>Counter App</h1>
      <h2>{count}</h2>
      <button onClick={incrementCounter} style={styles.button}>
        Increment
      </button>
      <button onClick={decrementCounter} style={styles.button}>
        Decrement
      </button>
      {isVisible && (<div style= {{backgroundColor:'red', width:'100px', height:'100px'}}> box  </div>)}
  
      <button onClick={togglebox}> Hide Box </button>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default App;
