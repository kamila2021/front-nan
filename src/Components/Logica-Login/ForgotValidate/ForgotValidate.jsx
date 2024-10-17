import React, { useState } from 'react';
import './ForgotValidate.css';

const ForgotValidate = ({ email, onBackToLogin }) => {
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        // Aquí iría la lógica para validar el código y permitir el cambio de contraseña
        if (!code) {
            setErrorMessage('Por favor ingrese el código.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage('Las contraseñas no coinciden.');
            return;
        }

        setErrorMessage('');
        setSuccessMessage('Contraseña actualizada con éxito.');
        // Aquí iría la lógica para actualizar la contraseña en el servidor
    };

    return (
        <div className='wrapper'>
            <form onSubmit={handleSubmit}>
                <h1>Validar Código</h1>
                <p>Hemos enviado un código de verificación a: {email}</p>
                <div className='input-box'>
                    <input
                        type='text'
                        placeholder='Código de Verificación'
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                    />
                </div>
                <div className='input-box'>
                    <input
                        type='password'
                        placeholder='Nueva Contraseña'
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <div className='input-box'>
                    <input
                        type='password'
                        placeholder='Confirmar Contraseña'
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                {errorMessage && <p className='error-message'>{errorMessage}</p>}
                {successMessage && <p className='success-message'>{successMessage}</p>}
                <button type='submit'>Validar y Cambiar Contraseña</button>
                <button type='button' onClick={onBackToLogin}>Volver al Login</button>
            </form>
        </div>
    );
};

export default ForgotValidate;