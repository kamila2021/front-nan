import React, { useState } from 'react';
import './LoginForm.css';
import { FaUser, FaLock } from "react-icons/fa";
import axios from 'axios'; // Importar axios para hacer peticiones

const LoginForm = ({ onForgotPasswordClick, onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [userType, setUserType] = useState(''); // Estado para el tipo de usuario

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setErrorMessage('Debe completar el correo y la contraseña.');
            return;
        }

        // Validación local para el usuario "admin"
        if (email === 'admin' && password === 'admin') {
            onLoginSuccess();  // Llama a la función para redirigir al portal del admin
            return;
        }

        // Si no es "admin", hacemos la solicitud al backend
        try {
            const response = await axios.post('http://localhost:3000/auth/login', {
                email,
                password,
                userType, // Asegurarse de enviar el tipo de usuario seleccionado (Student, Parent, Professor)
            });

            const { accessToken, refreshToken } = response.data;

            // Aquí puedes manejar el éxito del login y guardar los tokens si es necesario
            console.log('Login exitoso', accessToken, refreshToken);

            onLoginSuccess();  // Redirigir a la página principal tras el login exitoso
        } catch (error) {
            console.error('Error en el login:', error.response ? error.response.data : error.message);
            setErrorMessage('Usuario o contraseña incorrectos.');
        }
    };

    return (
        <div className='wrapper'>
            <form onSubmit={handleSubmit}>
                <h1>Inicio Sesion</h1>
                <div className='input-box'>
                    <input
                        type='text'
                        placeholder='Correo'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <FaUser className='icon' />
                </div>
                <div className='input-box'>
                    <input
                        type='password'
                        placeholder='Contraseña'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <FaLock className='icon' />
                </div>

                {/* Selector de tipo de usuario */}
                <div className='input-box'>
                    <select value={userType} onChange={(e) => setUserType(e.target.value)} required>
                        <option value="">Selecciona tipo de usuario</option>
                        <option value="student">Estudiante</option>
                        <option value="parent">Padre</option>
                        <option value="professor">Profesor</option>
                    </select>
                </div>

                <div className='recordar-olvidar'>
                    <label>
                        <input type='checkbox' /> Recordarme
                    </label>
                    <a href='#' onClick={onForgotPasswordClick}>Olvidaste tu contraseña?</a>
                </div>
                {errorMessage && <p className='error-message'>{errorMessage}</p>}
                <button type='submit'>Login</button>
            </form>
        </div>
    );
};

export default LoginForm;
