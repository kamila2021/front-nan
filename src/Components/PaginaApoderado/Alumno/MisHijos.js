import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MisHijos.css';

const MisHijos = () => {
  const [alumnos, setAlumnos] = useState([]); // Alumnos
  const [error, setError] = useState(null);   // Para manejar errores
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null); // Alumno seleccionado
  const [loading, setLoading] = useState(false); // Para manejar el estado de carga
  const [searchQuery, setSearchQuery] = useState(''); // Para el filtro de búsqueda
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));

  useEffect(() => {
    if (accessToken) {
      // Verificar si el accessToken es válido antes de hacer la solicitud
      if (isValidJWT(accessToken)) {
        fetchStudents(accessToken);
      } else {
        setError('El token no es válido.');
      }
    } else {
      setError('No se ha encontrado el token. Por favor, inicia sesión.');
    }
  }, [accessToken]);

  // Función para verificar si el accessToken tiene el formato válido de un JWT
  const isValidJWT = (token) => {
    const parts = token.split('.');
    return parts.length === 3; // Un JWT válido tiene 3 partes: header, payload, signature
  };

  // Función para obtener los estudiantes
  const fetchStudents = async (accessToken) => {
    if (!accessToken) {
      setError('Token is missing');
      return;
    }

    setLoading(true); // Iniciar la carga de datos

    try {
      console.log('Token enviado como parámetro:', accessToken);

      // Agregar el token como parámetro en la URL
      const response = await axios.get(`http://localhost:3000/parent/get-students/${accessToken}`);

      console.log("Respuesta de los estudiantes:", response);

      if (response.data && Array.isArray(response.data)) {
        setAlumnos(response.data);
        setError(null);
      } else {
        setError('No se encontraron alumnos.');
      }
    } catch (error) {
      console.error('Error al obtener los estudiantes:', error);
      setError(`No se pudieron obtener los estudiantes. Error: ${error.message}`);
    } finally {
      setLoading(false); // Finalizar la carga de datos
    }
  };

  // Función para manejar la visualización de asistencia
  const handleVerAsistencia = () => {
    if (alumnoSeleccionado) {
      alert(`Ver asistencia de ${alumnoSeleccionado.name} ${alumnoSeleccionado.lastname}`);
    }
  };

  // Función para manejar la visualización de calificaciones
  const handleVerCalificaciones = () => {
    if (alumnoSeleccionado) {
      alert(`Ver calificaciones de ${alumnoSeleccionado.name} ${alumnoSeleccionado.lastname}`);
    }
  };

  // Función para seleccionar un alumno
  const seleccionarAlumno = (alumno) => {
    setAlumnoSeleccionado(alumno);
  };

  // Filtrar los alumnos según el query de búsqueda
  const filteredAlumnos = alumnos.filter((alumno) => {
    const query = searchQuery.toLowerCase();
    return (
      alumno.name.toLowerCase().includes(query) ||
      alumno.lastname.toLowerCase().includes(query)
    );
  });

  return (
    <div className="mis-hijos">
      <h1>Datos Alumno</h1>
      
      <div className="top-bar">
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Buscar alumno..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>
      </div>

      {/* Mostrar mensaje de carga mientras se obtienen los datos */}
      {loading && <p>Cargando estudiantes...</p>}

      {/* Mostramos los alumnos en una tabla */}
      <table className="alumno-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Nivel</th>
          </tr>
        </thead>
        <tbody>
          {filteredAlumnos.length > 0 ? (
            filteredAlumnos.map((alumno) => (
              <tr
                key={alumno.id}
                onClick={() => seleccionarAlumno(alumno)}  // Seleccionamos el alumno al hacer clic
                style={{ cursor: 'pointer' }}
              >
                <td>{alumno.name}</td>
                <td>{alumno.lastname}</td>
                <td>{alumno.level}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No hay alumnos disponibles o no se encontraron resultados para la búsqueda.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Mostramos los errores si ocurren */}
      {error && <p className="error-message">{error}</p>}

      {/* Mostrar información del alumno seleccionado */}
      {alumnoSeleccionado && (
        <div>
          <h2>Perfil del Alumno: {alumnoSeleccionado.name} {alumnoSeleccionado.lastname}</h2>
          <button onClick={handleVerAsistencia}>Ver Asistencia</button>
          <button onClick={handleVerCalificaciones}>Ver Calificaciones</button>
        </div>
      )}
    </div>
  );
};

export default MisHijos;
