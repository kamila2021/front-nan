import React, { useState } from 'react';
import './ForgotForm.css';

const ForgotForm = ({ onBackToLogin, onCodeSent }) => {
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email) {
            setErrorMessage('Por favor ingrese su correo.');
            return;
        }
        if (!validateEmail(email)) {
            setErrorMessage('Por favor ingrese un correo válido.');
            return;
        }
        setErrorMessage('');
        setSuccessMessage('Se ha enviado un código de recuperación a su correo.');
        
        // Simula el envío del código
        setTimeout(() => {
            onCodeSent(email); // Aquí se llama la prop onCodeSent para pasar el email al componente principal
        }, 2000);
    };

    return (
        <div className='wrapper'>
            <form onSubmit={handleSubmit}>
                <h1>Recuperar Contraseña</h1>
                <div className='input-box'>
                    <input
                        type='text'
                        placeholder='Correo'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                {errorMessage && <p className='error-message'>{errorMessage}</p>}
                {successMessage && <p className='success-message'>{successMessage}</p>}
                <button type='submit'>Enviar</button>
                <button type='button' onClick={onBackToLogin}>Volver al Login</button>
            </form>
        </div>
    );
};

export default ForgotForm;
