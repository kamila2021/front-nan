import React, { useState, useEffect } from "react";
import MainNav from "./Components/Navbar/MainNav"; 
import MisHijos from "./Components/PaginaApoderado/Alumno/MisHijos"; 
import LoginForm from './Components/Logica-Login/LoginForm/LoginForm';
import ForgotForm from './Components/Logica-Login/ForgotPasswordForm/ForgotForm';
import ForgotValidate from './Components/Logica-Login/ForgotValidate/ForgotValidate';
import ImageBanner from './Components/Banner/Banner';
import Alumnos from "./Components/Admin/Alumno/Alumnos";
import Profesores from "./Components/Admin/Profesor/Profesores";
import Apoderados from "./Components/Admin/Apoderado/Apoderados";
import './Components/Botones/Boton.css'; 
import './App.css'; 
import Asignaturas from "./Components/Admin/Asignaturas/Asignaturas";
import MisAsignaturas from "./Components/PaginaProfesor/Asignatura/MisAsignaturas";
import Asistencia from "./Components/PaginaProfesor/Asistencia/Asistencia";
function App() {
    const [screen, setScreen] = useState('login');
    const [email, setEmail] = useState('');
    const [userType, setUserType] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Al cargar la página, recuperamos los datos de localStorage
        const token = localStorage.getItem('token');
        const storedUserType = localStorage.getItem('userType');
        
        // Si hay un token y un userType, el usuario está autenticado
        if (token && storedUserType) {
            setIsAuthenticated(true);
            setUserType(storedUserType); 
            setScreen(storedUserType === 'parent' ? 'inicio' : storedUserType); // Redirige según el tipo de usuario
        } else {
            setScreen('login'); // Si no hay token, redirige al login
        }
    }, []);

    const handleForgotPasswordClick = () => {
        setScreen('forgot');
    };

    const handleCodeSent = (email, userType) => {
        setEmail(email);
        setUserType(userType);
        setScreen('validate');
    };

    const handleBackToLogin = () => {
        setScreen('login');
    };

    const handleLoginSuccess = (userType) => {
        console.log("User type:", userType); // Para depuración
        setUserType(userType); 
        setIsAuthenticated(true);
        
        // Guardar los datos en localStorage
     
        localStorage.setItem('userType', userType);
        
        // Cambiar a la pantalla correspondiente según el tipo de usuario
        if (userType === 'parent') {
            setScreen('inicio');
        } else {
            setScreen(userType === 'professor' ? 'admin' : 'admin');
        }
    };

    const handleNavigate = (section) => {
        console.log("Navegando a:", section); 
        setScreen(section);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('token'); 
        localStorage.removeItem('userType'); // También eliminamos el tipo de usuario
        setScreen('login');
    };

    return (
        <div>
            {isAuthenticated && (
                <MainNav 
                    userType={userType} 
                    currentScreen={screen}
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
                {screen === 'validate' && 
                    <ForgotValidate 
                        email={email} 
                        userType={userType} 
                        onBackToLogin={handleBackToLogin} 
                    />
                }

                {/* Pantallas de Alumnos, Profesores y Apoderados */}
                {screen === 'alumnos' && <Alumnos />}
                {screen === 'profesores' && <Profesores />}
                {screen === 'apoderados' && <Apoderados />}
                
                {/* Componente de Asignaturas, siempre visible para admin */}
                {screen === 'asignaturas' && <Asignaturas />}
                
                {/* Pantalla de Mis Hijos Matriculados */}
                {screen === 'misHijos' && <MisHijos />}

                {screen === 'misAsignaturas' && <MisAsignaturas />} 
                {screen === 'asistencia' && <Asistencia />} 
                

                {/* Pantalla de Inicio */}
                {screen === 'inicio' && (
                    <div className="inicio-container">
                        <ImageBanner />
                        <div className="inicio-buttons">
                            <button className="agenda-button" onClick={() => handleNavigate('agenda')}>Agenda Escolar</button>
                            {userType === 'parent' && (
                                <button className="Mi-Alumno" onClick={() => handleNavigate('misHijos')}>Mi Alumno</button>
                            )}
                        </div>
                    </div>
                )}

                {/* Banner de imágenes y botones para el admin */}
                {screen === 'admin' && (
                    <>
                        <ImageBanner />
                        <div className="button-container">
                            <button className="agenda-button" onClick={() => handleNavigate('agenda')}>Agenda Escolar</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default App;
