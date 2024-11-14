import React, { useState } from 'react';
import './LoginForm.css';
import { FaUser, FaLock } from "react-icons/fa";
import axios from 'axios'; // Importar axios para hacer peticiones

const LoginForm = ({ onForgotPasswordClick, onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [userType, setUserType] = useState(''); // Estado para el tipo de usuario

    // Validación de email
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Verificamos que todos los campos estén completos
        if (!email || !password || !userType) {
            setErrorMessage('Debe completar el correo, la contraseña y seleccionar un tipo de usuario.');
            return;
        }

        // Limpiar los valores antiguos de localStorage antes de iniciar sesión
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userType');
        
        // Verificar si el usuario es admin y la clave también es admin
        if (email === 'admin' && password === 'admin' && userType === 'admin') {
            // Enviar acceso directo como admin
            const accessToken = 'dummyAccessTokenForAdmin';  // Token ficticio para admin
            const refreshToken = 'dummyRefreshTokenForAdmin'; // Token ficticio de refresh para admin

            // Guardar los tokens en localStorage para el admin
            localStorage.setItem('accessToken', accessToken);  // Guardar el accessToken
            localStorage.setItem('refreshToken', refreshToken);  // Guardar el refreshToken
            localStorage.setItem('userType', 'admin');  // Guardar el tipo de usuario como admin

            // Llamamos a onLoginSuccess para redirigir al admin
            onLoginSuccess('admin');
            return; // Finalizamos el proceso de login para admin
        }

        // Para otros usuarios, realizar la solicitud de login al backend
        try {
            const response = await axios.post('http://localhost:3000/auth/login', {
                email,
                password,
                userType,
            });
    
            const { accessToken, refreshToken } = response.data;

            // Verificar si los tokens se recibieron correctamente
            console.log('Response from server:', response.data);  // Ver los datos completos
            console.log('Access Token:', accessToken);  // Ver si el accessToken es válido
            console.log('Refresh Token:', refreshToken); // Ver si el refreshToken es válido

            // Validar que los tokens no estén vacíos y tengan el formato adecuado (JWT)
            if (!accessToken || !refreshToken) {
                throw new Error('Tokens inválidos recibidos del servidor.');
            }

            // Verificar si el accessToken tiene la estructura correcta de un JWT (3 partes separadas por '.')
            if (accessToken.split('.').length !== 3) {
                throw new Error('El Access Token no tiene el formato adecuado.');
            }

            // Guardar los tokens en localStorage
            localStorage.setItem('accessToken', accessToken);  // Guardar el accessToken
            localStorage.setItem('refreshToken', refreshToken);  // Guardar el refreshToken
            localStorage.setItem('userType', userType);  // Guardar el tipo de usuario

            // Verificar que los tokens se hayan almacenado correctamente
            console.log('Tokens almacenados en localStorage:');
            console.log('Access Token:', localStorage.getItem('accessToken'));
            console.log('Refresh Token:', localStorage.getItem('refreshToken'));
            console.log('User Type:', localStorage.getItem('userType'));

            // Llamamos a onLoginSuccess para redirigir al usuario
            onLoginSuccess(userType);

        } catch (error) {
            // Si el error es por parte del servidor, mostramos el mensaje de error adecuado
            console.error('Error en el login:', error.response ? error.response.data : error.message);
            setErrorMessage('Usuario o contraseña incorrectos.');
        }
    };

    return (
        <div className='wrapper'>
            <form onSubmit={handleSubmit}>
                <h1>Inicio Sesión</h1>
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
                    <select 
                        className='user-type-select' 
                        value={userType} 
                        onChange={(e) => setUserType(e.target.value)} 
                        required
                    >
                        <option value="">Selecciona tipo de usuario</option>
                        <option value="student">Estudiante</option>
                        <option value="parent">Padre</option>
                        <option value="professor">Profesor</option>
                        <option value="admin">Admin</option>
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
