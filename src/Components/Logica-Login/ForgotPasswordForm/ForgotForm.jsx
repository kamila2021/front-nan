import React, { useState } from 'react';
import './ForgotForm.css';

const ForgotForm = ({ onBackToLogin, onCodeSent }) => {
    const [email, setEmail] = useState('');
    const [userType, setUserType] = useState(''); // Por defecto se selecciona "alumno"
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            setErrorMessage('Por favor ingrese su correo.');
            return;
        }
        if (!validateEmail(email)) {
            setErrorMessage('Por favor ingrese un correo válido.');
            return;
        }

        let apiEndpoint = '';

        switch (userType) {
            case 'student':
                apiEndpoint = `http://localhost:3000/student/initial-password-recovery${email}`;
                break;
            case 'professor':
                apiEndpoint = `http://localhost:3000/professor/initial-password-recovery${email}`;
                break;
            case 'parent':
                apiEndpoint = `http://localhost:3000/parent/initial-password-recovery${email}`;
                break;
            default:
                setErrorMessage('Tipo de usuario no válido.');
                return;
        }

        try {
            console.log(userType)
            const response = await fetch(apiEndpoint, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email,userType}), // Asegúrate de que aquí no hay ningún problema
            });

            if (response.ok) {
                const data = await response.json();
                setSuccessMessage('Se ha enviado un código de recuperación a su correo.');
                setErrorMessage('');
                console.log(userType);
                onCodeSent(email, userType); // Esta función puede ser usada para cambiar la pantalla
            } else {
                const errorData = await response.json();
                setErrorMessage(errorData.message || 'Error al enviar el código de recuperación.');
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
                <h1>Recuperar Contraseña</h1>
                
                {/* Selector de tipo de usuario */}
        <div className='input-box'>
             <select className='user-type-select' value={userType} onChange={(e) => setUserType(e.target.value)} required>
         <option value="">Selecciona tipo de usuario</option>
        <option value="student">Estudiante</option>
        <option value="parent">Padre</option>
        <option value="professor">Profesor</option>
    </select>
        </div>

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
