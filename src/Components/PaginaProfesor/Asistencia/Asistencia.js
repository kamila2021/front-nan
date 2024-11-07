import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Asistencia.css'; // Asegúrate de tener el archivo CSS correspondiente
import { GrAccessibility } from 'react-icons/gr';

const Asistencia = () => {
  const [asignaturas, setAsignaturas] = useState([]); // Estado para asignaturas
  const [students, setStudents] = useState([]); // Estado para los estudiantes de la asignatura seleccionada
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Para manejar errores
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [selectedAsignatura, setSelectedAsignatura] = useState(null); // Para almacenar la asignatura seleccionada

  useEffect(() => {
    if (accessToken) {
      fetchAsignaturas(accessToken);
    } else {
      setError('El token no es válido.');
    }
  }, [accessToken]);

  // Fetch para obtener asignaturas
  const fetchAsignaturas = async (accessToken) => {
    if (!accessToken) {
      setError('Token is missing');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(`http://localhost:3000/professor/subjects/${accessToken}`);
      if (response.data && Array.isArray(response.data)) {
        setAsignaturas(response.data);
        setError(null);
      } else {
        setError('No se encontraron asignaturas.');
      }
    } catch (error) {
      setError(`Error al obtener las asignaturas. Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch para obtener los estudiantes de la asignatura seleccionada
  const fetchStudents = async (asignaturaId) => {
    if (!asignaturaId) {
      setError('El ID de la asignatura es inválido.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/subject/students/${asignaturaId}`);
      if (response.data) {
        setStudents(response.data.map(student => ({
          ...student,
          attendance: 'ausente',  // Inicialmente, todos están ausentes
        }))); // Inicializa la asistencia de todos los estudiantes
        setError(null);
      } else {
        setError('No se encontraron estudiantes para esta asignatura.');
      }
    } catch (error) {
      setError(`Error al obtener los estudiantes. Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Manejo de la selección de asignatura
  const seleccionarAsignatura = (asignatura) => {
    setSelectedAsignatura(asignatura); // Almacena la asignatura seleccionada
    fetchStudents(asignatura.id); // Fetch de estudiantes
  };

  // Función para cambiar el estado de la asistencia
  const handleAsistenciaChange = (studentId, status) => {
    const updatedStudents = students.map((student) => {
      if (student.id_student === studentId) {
        return { ...student, attendance: status }; // Cambia la asistencia a "presente" o "ausente"
      }
      return student;
    });

    setStudents(updatedStudents); // Actualiza el estado
  };

  // Guardar la asistencia al backend
  const handleSubmitAsistencia = async (e) => {
    e.preventDefault();

    // Filtrar los estudiantes que están presentes y convertir sus IDs a cadenas
    const estudiantesPresentes = students
      .filter(student => student.attendance === 'presente') // Filtramos los presentes
      .map(student => student.id_student.toString()) // Convertimos cada ID a string
      .filter(id => id !== ""); // Filtramos los IDs vacíos

    if (estudiantesPresentes.length === 0) {
      setError('Debe marcar al menos un estudiante como presente.');
      return;
    }

    try {
      setLoading(true);

      // Verificamos si el nivel de la asignatura es válido (entre 1 y 13)
      const level = selectedAsignatura.level;
      if (level < 1 || level > 13) {
        setError('El nivel de la asignatura debe estar entre 1 y 13.');
        return;
      }

      const response = await axios.post('http://localhost:3000/attendance', {
        level: level, // Asignatura como string
        id_subject: selectedAsignatura.id.toString(),   
        date: new Date().toISOString(), // Fecha actual en formato ISO
        studentIds: estudiantesPresentes, // IDs de los estudiantes presentes como array de cadenas
      });

      if (response.data) {
        alert('Asistencia guardada exitosamente!');
      } else {
        setError('Hubo un error al guardar la asistencia.');
      }
    } catch (error) {
      console.error('Error al guardar la asistencia:', error.response || error.message);
      setError(`Error al guardar la asistencia: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar el formulario de asistencia
  const mostrarFormularioAsistencia = () => {
    if (selectedAsignatura) {
      return (
        <div className="asistencia-container">
          <h2>Asistencia de {selectedAsignatura.name} ({selectedAsignatura.level})</h2>
          <form onSubmit={handleSubmitAsistencia}>
            <table className="asistencia-table">
              <thead>
                <tr>
                  <th>Alumno</th>
                  <th>Presente</th>
                  <th>Ausente</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? (
                  students.map((student) => (
                    <tr key={student.id_student}>
                      <td>{student.name}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleAsistenciaChange(student.id_student, 'presente')}
                          style={{ backgroundColor: student.attendance === 'presente' ? 'green' : 'lightgreen' }}
                        >
                          Presente
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleAsistenciaChange(student.id_student, 'ausente')}
                          style={{ backgroundColor: student.attendance === 'ausente' ? 'red' : 'lightcoral' }}
                        >
                          Ausente
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3">No hay estudiantes en este nivel para esta asignatura.</td>
                  </tr>
                )}
              </tbody>
            </table>
            <button type="submit">Guardar Asistencia</button>
          </form>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mis-asignaturas">
      <h1>Mis Asignaturas</h1>

      <div className="top-bar">
        <div className="search-container">
          <input type="text" placeholder="Buscar asignatura..." />
        </div>
      </div>

      <table className="asignatura-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Clase</th>
            <th>Nivel</th>
          </tr>
        </thead>
        <tbody>
          {asignaturas.length > 0 ? (
            asignaturas.map((asignatura) => (
              <tr
                key={asignatura.id}
                onClick={() => seleccionarAsignatura(asignatura)}
                style={{ cursor: 'pointer' }}
              >
                <td>{asignatura.id}</td>
                <td>{asignatura.name}</td>
                <td>{asignatura.level}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No hay asignaturas disponibles.</td>
            </tr>
          )}
        </tbody>
      </table>

      {mostrarFormularioAsistencia()}

      {loading && <div>Cargando...</div>}
      {error && <div>{error}</div>}
    </div>
  );
};

export default Asistencia;
