import React, { useState, useEffect } from "react";
import Navbar from './Components/Navbar/Navbar';
import LoginForm from './Components/Logica-Login/LoginForm/LoginForm';
import ForgotForm from './Components/Logica-Login/ForgotPasswordForm/ForgotForm';
import ForgotValidate from './Components/Logica-Login/ForgotValidate/ForgotValidate';
import ImageBanner from './Components/Banner/Banner'; // Importa el banner
import Alumnos from './Components/Alumno/Alumnos'; // Importa el componente de alumnos
import Profesores from './Components/Profesor/Profesores'; // Importa el componente de profesores
import Apoderados from './Components/Apoderado/Apoderados'; // Importa el componente de apoderados
import './Components/Botones/Boton.css'; // Si Boton.css está en la misma carpeta que App.js
import './App.css'; // Asegúrate de tener un archivo CSS para los estilos globales.

function App() {
    const [screen, setScreen] = useState('login');
    const [email, setEmail] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Nuevo estado para manejar autenticación

    useEffect(() => {
        const token = localStorage.getItem('token'); // Revisa si hay un token almacenado
        if (token) {
            setIsAuthenticated(true); // Si hay un token, el usuario está autenticado
            setScreen('admin'); // Redirigir a la pantalla admin si hay token
        }
    }, []);

    const handleForgotPasswordClick = () => {
        setScreen('forgot');
    };

    const handleCodeSent = (email) => {
        setEmail(email);
        setScreen('validate');
    };

    const handleBackToLogin = () => {
        setScreen('login');
    };

    const handleLoginSuccess = () => {
        setIsAuthenticated(true); // Cambia el estado a autenticado
        localStorage.setItem('token', 'someAuthToken'); // Almacena el token de autenticación
        setScreen('admin');
    };

    const handleNavigate = (section) => {
        setScreen(section);
    };

    const handleLogout = () => {
        setIsAuthenticated(false); // Cambia el estado a no autenticado
        localStorage.removeItem('token'); // Elimina el token del localStorage
        setScreen('login'); // Redirigir al login después de cerrar sesión
    };

    return (
        <div>
            {/* El Navbar se muestra en todas las pantallas excepto en la de login */}
            {screen !== 'login' && (
                <Navbar 
                    currentScreen={screen}  // Pasamos la pantalla actual al Navbar
                    onNavigate={handleNavigate} 
                    onLogout={handleLogout} 
                />
            )}

            <div className={`app-content ${screen !== 'admin' ? 'center-content' : ''}`}>
                {/* Pantalla de Login */}
                {screen === 'login' && 
                    <LoginForm 
                        onForgotPasswordClick={handleForgotPasswordClick} 
                        onLoginSuccess={handleLoginSuccess} 
                    />
                }
                
                {/* Pantalla de Recuperación de Contraseña */}
                {screen === 'forgot' && <ForgotForm onBackToLogin={handleBackToLogin} onCodeSent={handleCodeSent} />}
                
                {/* Pantalla de Validación de Código */}
                {screen === 'validate' && <ForgotValidate email={email} onBackToLogin={handleBackToLogin} />}
                
                {/* Pantalla de Alumnos */}
                {screen === 'alumnos' && <Alumnos />}

                {/* Pantalla de Profesores */}
                {screen === 'profesores' && <Profesores />}
                
                {/* Pantalla de Apoderados */}
                {screen === 'apoderados' && <Apoderados />} {/* Agregando la pantalla de Apoderados */}
               
                {/* Pantalla de Inicio */}
                {screen === 'inicio' && (
                    <div className="inicio-container">
                        <ImageBanner />
                        <div className="inicio-buttons">
                            <button className="agenda-button" onClick={() => handleNavigate('agenda')}>Agenda Escolar</button>
                            <button className="subject-button" onClick={() => handleNavigate('asignatura')}>Asignatura</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Banner de imágenes y botones para el admin */}
            {screen === 'admin' && (
                <>
                    <ImageBanner />
                    <div className="button-container">
                        <button className="agenda-button" onClick={() => handleNavigate('agenda')}>Agenda Escolar</button>
                        <button className="subject-button" onClick={() => handleNavigate('asignatura')}>Asignatura</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default App;
