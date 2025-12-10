import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import DashboardOperator from "./components/DashboardOperator";
import DashboardAnalyst from "./components/DashboardAnalyst";
import DashboardAdmin from "./components/DashboardAdmin";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route path="/operator" element={<DashboardOperator />} />
        <Route path="/analyst" element={<DashboardAnalyst />} />
        <Route path="/admin" element={<DashboardAdmin />} />
      </Routes>
    </>
  );
}

export default App;
