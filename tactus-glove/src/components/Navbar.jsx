import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/logo.png"; 
import titleImg from "../assets/title.png"; 

const Navbar = () => {
  const location = useLocation();
  // Map pathname to page name
  const pages = [
    { path: "/piano", label: "Teclado" },
    { path: "/configuracoes", label: "Configurações" },
    { path: "/ajuda", label: "Sobre" },
  ];
  return (
    <nav className="navbar">
      <div className="logo">
        <img src={logo} alt="Tactus Glove" className="logo-img" />
        <img src={titleImg} alt="Tactus Title" className="title-img" />
      </div>
      <ul className="nav-links">
        {pages.map(page => (
          <li key={page.path}>
            <Link
              to={page.path}
              className={location.pathname === page.path ? "nav-active" : ""}
            >
              {page.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
