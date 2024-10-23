// Navbar.js
import React, { Component } from "react";
import "./Navbar.css";

class Navbar extends Component {
  state = { clicked: false };

  handleClick = () => {
    this.setState({ clicked: !this.state.clicked });
  };

  render() {
    const { clicked } = this.state;
    const { currentScreen } = this.props;

    return (
      <nav>
        <div>
          <ul id="navbar" className={clicked ? "active" : ""}>
            <li>
              {/* Aseguramos que la navegación lleve a "inicio" */}
              <a className={currentScreen === 'inicio' ? 'active' : ''} href="#" onClick={() => this.props.onNavigate('inicio')}>
                Inicio
              </a>
            </li>
            <li>
              <a className={currentScreen === 'alumnos' ? 'active' : ''} href="#" onClick={() => this.props.onNavigate('alumnos')}>
                Alumnos
              </a>
            </li>
            <li>
              <a  className={currentScreen === 'apoderados' ? 'active' : ''} href="#" onClick={() => this.props.onNavigate('apoderados')}>
                Apoderados
              </a>
            </li>
            <li>
              <a  className={currentScreen === 'asignaturas' ? 'active' : ''} href="#" onClick={() => this.props.onNavigate('asignaturas')}>
                Asignaturas
              </a>
            </li>
            <li>
              <a  className={currentScreen === 'profesores' ? 'active' : ''} href="#" onClick={() => this.props.onNavigate('profesores')}>
                Profesores
                </a>
            </li>
            <li>
              <a href="#" onClick={this.props.onLogout}>
                Cerrar sesión
              </a>
            </li>
          </ul>
        </div>
        <div id="mobile" onClick={this.handleClick}>
          <i id="bar" className={clicked ? 'fas fa-times' : 'fas fa-bars'}></i>
        </div>
      </nav>
    );
  }
}

export default Navbar;
