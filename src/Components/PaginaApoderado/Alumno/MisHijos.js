// src/Components/Alumno/MisHijos.js

import React, { useState } from 'react';
import AlumnoPerfil from './AlumnoPerfil';
import './MisHijos.css'; // Importa el CSS

const MisHijos = () => {
    const [alumnos] = useState([
        { id: 1, nombre: 'Juan', apellido: 'Pérez', nivel: '4to Básico', asistenciaPorcentaje: 85 },
        { id: 2, nombre: 'María', apellido: 'González', nivel: '5to Básico', asistenciaPorcentaje: 90 },
        { id: 3, nombre: 'Luis', apellido: 'Martínez', nivel: '6to Básico', asistenciaPorcentaje: 75 },
    ]);

    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);

    const handleVerAsistencia = () => {
        if (alumnoSeleccionado) {
            alert(`Ver asistencia de ${alumnoSeleccionado.nombre} ${alumnoSeleccionado.apellido}`);
        }
    };

    const handleVerCalificaciones = () => {
        if (alumnoSeleccionado) {
            alert(`Ver calificaciones de ${alumnoSeleccionado.nombre} ${alumnoSeleccionado.apellido}`);
        }
    };

    const seleccionarAlumno = (alumno) => {
        setAlumnoSeleccionado(alumno);
    };

    return (
        <div className="mis-hijos">
            <h1>Datos Alumno</h1>
            <div className="top-bar">
                <div className="search-container">
                    <input type="text" placeholder="Buscar alumno..." />
                </div>
               
            </div>
            <table className="alumno-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Nivel</th>
                    </tr>
                </thead>
                <tbody>
                    {alumnos.map((alumno) => (
                        <tr key={alumno.id} onClick={() => seleccionarAlumno(alumno)} style={{ cursor: 'pointer' }}>
                            <td>{alumno.nombre}</td>
                            <td>{alumno.apellido}</td>
                            <td>{alumno.nivel}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {alumnoSeleccionado && (
                <AlumnoPerfil 
                    alumno={alumnoSeleccionado} 
                    onVerAsistencia={handleVerAsistencia} 
                    onVerCalificaciones={handleVerCalificaciones} 
                />
            )}
        </div>
    );
};

export default MisHijos;
