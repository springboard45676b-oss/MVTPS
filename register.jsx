import { Link } from "react-router-dom";

const Register = () => {
  return (
    <div className="container">
      <form>
        <h2>Register</h2>
        <input type="text" placeholder="Username" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">Register</button>
        <p>Already have an account? <Link to="/">Login</Link></p>
      </form>
    </div>
  );
}

export default Register;
