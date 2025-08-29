import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">Tactus</div>
      <ul className="nav-links">
        <li><Link to="/" className="active">Teclado virtual</Link></li>
        <li><Link to="/configuracoes">Configurações</Link></li>
        <li><Link to="/ajuda">Ajuda</Link></li>
      </ul>
      <div className="nav-buttons">
        <button className="btn-create">Criar conta</button>
        <button className="btn-login">Login</button>
      </div>
    </nav>
  );
};

export default Navbar;
