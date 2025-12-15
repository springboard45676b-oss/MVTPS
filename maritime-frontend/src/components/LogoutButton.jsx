// src/components/LogoutButton.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";

export default function LogoutButton(){
  const { logout } = useAuth();
  return <button onClick={()=> logout("/login")} className="btn-primary" style={{background:"#f87171"}}>Logout</button>;
}
