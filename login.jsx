import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="container">
      <form>
        <h1>Login</h1>
        <input type="text" placeholder="Username" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">Login</button>
        <p>Don't have an account? <Link to="/register">Register</Link></p>
      </form>
    </div>
  );
}

export default Login;
