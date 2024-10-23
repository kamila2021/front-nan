import React, { useState } from 'react';
import './ForgotValidate.css';

const ForgotValidate = ({ email, onBackToLogin, userType }) => {
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Log para depuración
    console.log('userType:', userType);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!code) {
            setErrorMessage('Por favor ingrese el código.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage('Las contraseñas no coinciden.');
            return;
        }

        // Validación del userType
        if (!userType) {
            setErrorMessage('Tipo de usuario no válido.');
            return;
        }

        setErrorMessage('');

        let verifyEndpoint = '';
        let resetEndpoint = '';

        // Determina las endpoints basadas en userType
        switch (userType) {
            case 'student':
                verifyEndpoint = `http://192.168.0.15:3000/student/verify-password-recovery/${email}`;
                resetEndpoint = `http://192.168.0.15:3000/student/reset-password-recovery/${email}`;
                break;
            case 'professor':
                verifyEndpoint = `http://192.168.0.15:3000/professor/verify-password-recovery/${email}`;
                resetEndpoint = `http://192.168.0.15:3000/professor/reset-password-recovery/${email}`;
                break;
            case 'parent':
                verifyEndpoint = `http://192.168.0.15:3000/parent/verify-password-recovery/${email}`;
                resetEndpoint = `http://192.168.0.15:3000/parent/reset-password-recovery/${email}`;
                break;
            default:
                setErrorMessage('Tipo de usuario no válido.');
                return;
        }

        try {
            // Verificar el código de recuperación
            const verifyResponse = await fetch(verifyEndpoint, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }), // Envía el código al servidor
            });

            if (!verifyResponse.ok) {
                const errorData = await verifyResponse.json();
                setErrorMessage(errorData.message || 'Error al verificar el código.');
                return;
            }

            // Si el código es verificado, procede a restablecer la contraseña
            const resetResponse = await fetch(resetEndpoint, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code, newPassword }), // Envía el código y nueva contraseña
            });

            if (resetResponse.ok) {
                setSuccessMessage('Contraseña actualizada con éxito.');
                setErrorMessage('');
            } else {
                const errorData = await resetResponse.json();
                setErrorMessage(errorData.message || 'Error al restablecer la contraseña.');
                setSuccessMessage('');
            }
        } catch (error) {
            setErrorMessage('Error de conexión. Inténtelo de nuevo más tarde.');
            setSuccessMessage('');
        }
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
