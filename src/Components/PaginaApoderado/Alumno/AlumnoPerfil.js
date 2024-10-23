

import React from 'react';
import './AlumnoPerfil.css';

const AlumnoPerfil = ({ alumno, onVerAsistencia, onVerCalificaciones }) => {
    if (!alumno) return null; // Asegurarse de que alumno no sea null

    return (
        <div className="alumno-perfil">
            <h2>Perfil del Alumno</h2>
            <p><strong>Nombre:</strong> {alumno.nombre}</p>
            <p><strong>Apellido:</strong> {alumno.apellido}</p>
            <p><strong>Nivel:</strong> {alumno.nivel}</p>
            <p><strong>Asistencia:</strong> {alumno.asistenciaPorcentaje}%</p>

            <div className="button-container">
                <button onClick={onVerAsistencia}>Ver Asistencia</button>
                <button onClick={onVerCalificaciones}>Ver Calificaciones</button>
            </div>
        </div>
    );
};

export default AlumnoPerfil;
