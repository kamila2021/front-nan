import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MisHijos.css';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PDF from '../../PDF';

const MisHijos = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [error, setError] = useState(null);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notas, setNotas] = useState({});
  const [asistencia, setAsistencia] = useState({});
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));

  useEffect(() => {
    if (accessToken) {
      if (isValidJWT(accessToken)) {
        fetchStudents(accessToken);
      } else {
        setError('El token no es válido.');
      }
    } else {
      setError('No se ha encontrado el token. Por favor, inicia sesión.');
    }
  }, [accessToken]);

  const isValidJWT = (token) => {
    const parts = token.split('.');
    return parts.length === 3;
  };

  const fetchStudents = async (accessToken) => {
    if (!accessToken) {
      setError('Token is missing');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/parent/get-students/${accessToken}`);
      if (response.data && Array.isArray(response.data)) {
        setAlumnos(response.data);
        setError(null);
      } else {
        setError('No se encontraron alumnos.');
      }
    } catch (error) {
      setError(`No se pudieron obtener los estudiantes. Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchCursos = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/subject/subjects/${id}`);
      if (response.data) {
        const cursosOrdenados = response.data.sort((a, b) => a.name.localeCompare(b.name));
        setCursos(cursosOrdenados);
        setError(null);
        return cursosOrdenados;
      } else {
        setError('No se encontraron cursos para este alumno.');
        return [];
      }
    } catch (error) {
      setError(`Error al obtener los cursos. Error: ${error.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchAllNotasAndAsistencia = async (alumnoId, cursos) => {
    setLoading(true);
    try {
      const notasMap = {};
      const asistenciaMap = {};

      for (const curso of cursos) {
        // Obtener notas
        try {
          const responseNotas = await axios.get(`http://localhost:3000/student/${alumnoId}/grades/${curso.id_subject}`);
          notasMap[curso.id_subject] = responseNotas.data;
        } catch (error) {
          notasMap[curso.id_subject] = [];
        }

        // Obtener asistencia
        try {
          const responseAsistencia = await axios.get(`http://localhost:3000/attendance/subject/${curso.id_subject}/student/${alumnoId}/percentage`);
          asistenciaMap[curso.id_subject] = responseAsistencia.data;
        } catch (error) {
          asistenciaMap[curso.id_subject] = null;
        }
      }

      setNotas(notasMap);
      setAsistencia(asistenciaMap);
    } catch (error) {
      setError(`Error al obtener las notas y asistencia. Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const seleccionarAlumno = async (alumno) => {
    setAlumnoSeleccionado(alumno);
    setCursoSeleccionado(null);
    setNotas({});
    setAsistencia({});
    setCursos([]);
    const cursosObtenidos = await fetchCursos(alumno.id);
    await fetchAllNotasAndAsistencia(alumno.id, cursosObtenidos);
  };

  const seleccionarCurso = (curso) => {
    if (cursoSeleccionado && cursoSeleccionado.id_subject === curso.id_subject) {
      setCursoSeleccionado(null);
    } else {
      setCursoSeleccionado(curso);
    }
  };

  const filteredAlumnos = alumnos.filter((alumno) => {
    const query = searchQuery.toLowerCase();
    return alumno.name.toLowerCase().includes(query) || alumno.lastname.toLowerCase().includes(query);
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

      {loading && <p>Cargando...</p>}

      <table className="alumno-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Nivel</th>
          </tr>
        </thead>
        <tbody>
          {filteredAlumnos.length > 0 ? (
            filteredAlumnos.map((alumno) => (
              <tr
                key={alumno.id}
                onClick={() => seleccionarAlumno(alumno)}
                style={{ cursor: 'pointer' }}
              >
                <td>{alumno.id}</td>
                <td>{alumno.name}</td>
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

      {error && <p className="error-message">{error}</p>}

      {alumnoSeleccionado && (
        <div>
          <h2>Perfil del Alumno: {alumnoSeleccionado.name} {alumnoSeleccionado.lastname}</h2>

          {/* Mostrar los cursos del alumno */}
          <h3>Cursos de {alumnoSeleccionado.name}:</h3>
          <table>
            <thead>
              <tr>
                <th>ID Curso</th>
                <th>Nombre Curso</th>
              </tr>
            </thead>
            <tbody>
              {cursos.length > 0 ? (
                cursos.map((curso) => (
                  <tr
                    key={curso.id_subject}
                    onClick={() => seleccionarCurso(curso)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{curso.id_subject}</td>
                    <td>{curso.name}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2">No hay cursos disponibles para este alumno.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mostrar el porcentaje de asistencia sobre las notas */}
          {cursoSeleccionado && (
            <div>
              <h4>Porcentaje de Asistencia:</h4>
              <p>
                {asistencia && asistencia[cursoSeleccionado.id_subject] !== undefined && asistencia[cursoSeleccionado.id_subject] !== null ? (
                  typeof asistencia[cursoSeleccionado.id_subject] === 'number'
                    ? `${asistencia[cursoSeleccionado.id_subject].toFixed(2)}%`
                    : 'Sin datos'
                ) : (
                  'Sin datos de asistencia'
                )}
              </p>
            </div>
          )}

          {/* Mostrar las notas del curso seleccionado */}
          {cursoSeleccionado && notas[cursoSeleccionado.id_subject] && (
            <div>
              <h3>Notas del curso: {cursoSeleccionado.name}</h3>
              <table>
                <thead>
                  <tr>
                    <th>Nota 1</th>
                    <th>Nota 2</th>
                    <th>Nota 3</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{notas[cursoSeleccionado.id_subject][0]?.grade || '-'}</td>
                    <td>{notas[cursoSeleccionado.id_subject][1]?.grade || '-'}</td>
                    <td>{notas[cursoSeleccionado.id_subject][2]?.grade || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {alumnoSeleccionado && notas && asistencia && cursos && (
        <div style={{ marginTop: '20px' }}>
          <PDFDownloadLink
            document={
              <PDF
                alumno={alumnoSeleccionado}
                nivel={alumnoSeleccionado.level}
                notas={notas}
                asistencia={asistencia}
                cursos={cursos}
              />
            }
            fileName={`Informe-${alumnoSeleccionado.name}.pdf`}
          >
            {({ loading }) => (loading ? <button>Cargando documento...</button> : <button>Descargar PDF</button>)}
          </PDFDownloadLink>
        </div>
      )}
    </div>
  );
};

export default MisHijos;
