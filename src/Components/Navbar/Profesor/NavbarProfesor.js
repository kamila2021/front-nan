// Navbar.js
import React, { Component } from "react";
import "./NavbarProfesor";

class NavbarProfesor extends Component {
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
              <a className={currentScreen === 'chat' ? 'active' : ''} href="#" onClick={() => this.props.onNavigate('chat')}>
                Chat
              </a>
            </li>
            <li>
              <a  className={currentScreen === 'misAsignaturas' ? 'active' : ''} href="#" onClick={() => this.props.onNavigate('misAsignaturas')}>
                Mis Asignaturas
                </a>
            </li>
            <li>
              <a  className={currentScreen === 'asistencia' ? 'active' : ''} href="#" onClick={() => this.props.onNavigate('asistencia')}>
                Asistencia
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

export default NavbarProfesor;
