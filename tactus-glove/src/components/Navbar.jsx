import React from "react";
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">Logo</div>
      <ul className="nav-links">
        <li><a href="#" className="active">Teclado virtual</a></li>
        <li><a href="#">Configurações</a></li>
        <li><a href="#">Ajuda</a></li>
      </ul>
      <div className="nav-buttons">
        <button className="btn-create">Criar conta</button>
        <button className="btn-login">Login</button>
      </div>
    </nav>
  );
};

export default Navbar;
