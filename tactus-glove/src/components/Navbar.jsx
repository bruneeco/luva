import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/logo.png"; 

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">
        <img src={logo} alt="Tactus Glove" className="logo-img" />
      </div>
      <ul className="nav-links">
        <li><Link to="/piano" className="active">Teclado virtual</Link></li>
        <li><Link to="/configuracoes">Configurações</Link></li>
        <li><Link to="/ajuda">Ajuda</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
