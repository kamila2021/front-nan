import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MisAsignaturas.css';

const MisAsignaturas = () => {
  const [asignaturas, setAsignaturas] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accessToken] = useState(localStorage.getItem('accessToken'));
  const [selectedAsignatura, setSelectedAsignatura] = useState(null);
  const [selectedAlumno, setSelectedAlumno] = useState(null);

  useEffect(() => {
    if (accessToken) {
      fetchAsignaturas(accessToken);
    } else {
      setError('El token no es válido.');
    }
  }, [accessToken]);

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

  const fetchStudents = async (asignaturaId) => {
    if (!asignaturaId) {
      setError('El ID de la asignatura es inválido.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/subject/students/${asignaturaId}`);
      
      if (response.data) {
        setStudents(response.data); 
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

  const fetchStudentsGrades = async (studentId) => {
    if (!studentId || !selectedAsignatura) {
      setError('Datos inválidos para obtener las calificaciones.');
      return;
    }

    setLoading(true);
    try {
      // Obtener las calificaciones del estudiante en la asignatura seleccionada
      const response = await axios.get(`http://localhost:3000/student/${studentId}/grades/${selectedAsignatura.id}`);
      if (response.data && Array.isArray(response.data)) {
        const grades = response.data.map(grade => ({
          id_grade: grade.id_grade,
          grade: grade.grade,
        }));

        // Asegurar que siempre haya 3 notas
        while (grades.length < 3) {
          grades.push({ id_grade: null, grade: null });
        }

        setSelectedAlumno(prevAlumno => ({ ...prevAlumno, grades }));
        setError(null);
      } else {
        // Si no hay calificaciones, inicializar con notas vacías
        const grades = [
          { id_grade: null, grade: null },
          { id_grade: null, grade: null },
          { id_grade: null, grade: null },
        ];
        setSelectedAlumno(prevAlumno => ({ ...prevAlumno, grades }));
        setError(null);
      }
    } catch (error) {
      console.error('Error al obtener las calificaciones:', error);
      setError(`Error al obtener las calificaciones del estudiante. Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e, gradeIndex) => {
    const value = e.target.value;
    const newGrade = value === "" ? null : parseFloat(value);

    setSelectedAlumno(prevAlumno => {
      const updatedGrades = [...prevAlumno.grades];
      if (!updatedGrades[gradeIndex]) {
        updatedGrades[gradeIndex] = { id_grade: null, grade: newGrade };
      } else {
        updatedGrades[gradeIndex] = { ...updatedGrades[gradeIndex], grade: newGrade };
      }
      return { ...prevAlumno, grades: updatedGrades };
    });
  };

  const seleccionarAsignatura = (asignatura) => {
    setSelectedAsignatura(asignatura);
    setSelectedAlumno(null);
    setStudents([]);
    fetchStudents(asignatura.id);
  };

  const seleccionarAlumno = (student) => {
    setSelectedAlumno(student);
    fetchStudentsGrades(student.id_student);
  };

  const crearNuevaNota = async (studentId, newGrade) => {
    try {
      const asignaturaId = parseInt(selectedAsignatura?.id, 10);
      const nivel = selectedAsignatura?.level;
      const year = new Date().getFullYear();
      const studentIdInt = parseInt(studentId, 10);

      if (isNaN(newGrade)) return;

      const response = await axios.post('http://localhost:3000/grade', {
        grade: newGrade,
        level: nivel,
        year: year,
        id_student: studentIdInt,
        id_subject: asignaturaId
      });

      if (response.data) {
        return {
          id_grade: response.data.id_grade,
          grade: response.data.grade,
        };
      } else if (response.status === 500) {
        setError('Hubo un error al crear la nota.');
      }
    } catch (error) {
      console.error('Error al crear la nota:', error.response || error.message);
      setError(`Error al crear la nota: ${error.message}`);
    }
  };

  const actualizarNota = async (gradeId, newGrade) => {
    if (isNaN(newGrade)) {
      setError('La calificación no es válida.');
      return;
    }

    try {
      const response = await axios.patch(`http://localhost:3000/grade/${gradeId}`, { grade: newGrade });

      if (response.data) {
        return {
          id_grade: response.data.id_grade,
          grade: response.data.grade,
        };
      } else if (response.status === 500){
        setError('Hubo un error al actualizar la nota.');
      }
    } catch (error) {
      console.error('Error al actualizar la nota:', error.response || error.message);

      if (error.response && error.response.status === 404) {
        setError(`La calificación con ID ${gradeId} no existe. No se puede actualizar.`);
      } else if (error.response && error.response.status === 500) {
        setError('Error interno del servidor al intentar actualizar la nota.');
      } else {
        setError(`Error desconocido: ${error.response ? error.response.data : error.message}`);
      }
    }
  };

  const handleSubmitNotas = async (e) => {
    e.preventDefault();

    setLoading(true);

    const studentId = selectedAlumno.id_student;
    const grades = selectedAlumno.grades;

    if (!grades || grades.length === 0) {
      setError('No hay calificaciones para guardar.');
      setLoading(false);
      return;
    }

    try {
      const updatedGrades = [...grades];
      for (let i = 0; i < grades.length; i++) {
        const gradeObj = grades[i];
        const gradeValue = gradeObj?.grade;
        const gradeId = gradeObj?.id_grade;

        if (gradeValue == null) continue;

        if (gradeId) {
          const updatedGrade = await actualizarNota(gradeId, gradeValue);
          updatedGrades[i] = updatedGrade;
        } else {
          const newGrade = await crearNuevaNota(studentId, gradeValue);
          updatedGrades[i] = newGrade;
        }
      }

      setSelectedAlumno(prevAlumno => ({ ...prevAlumno, grades: updatedGrades }));
      setStudents(prevStudents =>
        prevStudents.map(student => {
          if (student.id_student === studentId) {
            return { ...student, grades: updatedGrades };
          }
          return student;
        })
      );

      alert('Notas guardadas exitosamente!');
    } catch (error) {
      console.error('Error al guardar la nota:', error.message);
      setError(`Error al guardar la nota: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const calcularPromedio = (grades) => {
    const validGrades = grades.filter(gradeObj => gradeObj?.grade != null);
    if (validGrades.length === 0) return '-';
    const total = validGrades.reduce((acc, gradeObj) => acc + gradeObj.grade, 0);
    return (total / validGrades.length).toFixed(2);
  };

  const mostrarListaEstudiantes = () => {
    if (selectedAsignatura) {
      return (
        <div className="estudiantes-container">
          <h2>Estudiantes de {selectedAsignatura.name} ({selectedAsignatura.level})</h2>
          <table className="estudiantes-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((student) => (
                  <tr
                    key={student.id_student}
                    onClick={() => seleccionarAlumno(student)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{student.name}</td>
                    <td>{student.id_student}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2">No hay estudiantes disponibles para esta asignatura.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }
    return null;
  };

  const mostrarFormularioNotas = () => {
    if (selectedAlumno) {
      return (
        <div className="notas-container">
          <h2>Notas de {selectedAlumno.name}</h2>
          
          {selectedAlumno.grades && selectedAlumno.grades.length > 0 ? (
            <table className="notas-table">
              <thead>
                <tr>
                  <th>Nota 1</th>
                  <th>Nota 2</th>
                  <th>Nota 3</th>
                  <th>Promedio</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <input
                      type="number"
                      value={selectedAlumno.grades[0]?.grade || ''}
                      onChange={(e) => handleInputChange(e, 0)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={selectedAlumno.grades[1]?.grade || ''}
                      onChange={(e) => handleInputChange(e, 1)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={selectedAlumno.grades[2]?.grade || ''}
                      onChange={(e) => handleInputChange(e, 2)}
                    />
                  </td>
                  <td>{calcularPromedio(selectedAlumno.grades)}</td>
                  <td>
                    <button onClick={handleSubmitNotas}>
                      Guardar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div>Este estudiante no tiene notas asignadas.</div>
          )}
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

      {mostrarListaEstudiantes()}

      {mostrarFormularioNotas()}

      {loading && <div>Cargando...</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default MisAsignaturas;
