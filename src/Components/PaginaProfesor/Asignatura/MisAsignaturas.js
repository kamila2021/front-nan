import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MisAsignaturas.css';
import { GrAccessibility } from 'react-icons/gr';

const MisAsignaturas = () => {
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
          grades: Array.isArray(student.grades) ? student.grades : [null, null, null]  // Asegura que grades siempre sea un array
        }))); // Aseguramos que `grades` sea un array
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

  
const handleInputChange = (e, studentId, gradeIndex) => {
  const value = e.target.value;
  if (value === "") {
    updateStudentGrade(studentId, gradeIndex, null);
    return;
  }

  const newGrade = parseFloat(value);


  if (!isNaN(newGrade)) {
  
    updateStudentGrade(studentId, gradeIndex, newGrade);
  } else {
   
    console.log("Valor no válido.");
  }
};

const updateStudentGrade = (studentId, gradeIndex, grade) => {

  const updatedStudents = students.map((student) => {
    if (student.id_student === studentId) {
      const updatedGrades = [...student.grades];
      updatedGrades[gradeIndex] = grade; // Actualiza la nota en el índice correspondiente
      return { ...student, grades: updatedGrades };
    }
    return student;
  });

  setStudents(updatedStudents); // Actualiza el estado con los nuevos valores de notas
};


  // Manejo de la selección de asignatura
  const seleccionarAsignatura = (asignatura) => {
    setSelectedAsignatura(asignatura); // Almacena la asignatura seleccionada
    fetchStudents(asignatura.id); // Fetch de estudiantes
  };

  const crearNuevaNota = async (studentId, newGrade) => {
    try {
      setLoading(true);
  
      const asignaturaId = parseInt(selectedAsignatura?.id, 10);
      const nivel = selectedAsignatura?.level;
      const year = new Date().getFullYear();
      const studentIdInt = parseInt(studentId, 10);
  
      if (isNaN(newGrade)) return;
  
      // Realiza la solicitud para crear una nueva calificación
      const response = await axios.post('http://localhost:3000/grade', {
        grade: newGrade,
        level: nivel,
        year: year,
        id_student: studentIdInt,
        id_subject: asignaturaId
      });
  
      if (response.data) {
        alert('Nueva nota creada exitosamente!');
      } else if (response.status == 500) {
        setError('Hubo un error al crear la nota.');
      }
    } catch (error) {
      console.error('Error al crear la nota:', error.response || error.message);
      setError(`Error al crear la nota: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  

  const actualizarNota = async (gradeId, newGrade) => {
    if (isNaN(newGrade)) {
      setError('La calificación no es válida.');
      return;
    }
  
    try {
      setLoading(true);
  
      // Realiza la solicitud para actualizar la calificación
      const response = await axios.patch(`http://localhost:3000/grade/${gradeId}`, { grade: newGrade });
  
      if (response.data) {
        alert('Nota actualizada exitosamente!');
      } else if (response.status == 500){
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
    } finally {
      setLoading(false);
    }
  };
  
  
  

  const handleSubmitNotas = async (e, studentId, grades) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario
  
    // Verificar si las calificaciones son válidas
    console.log(grades)
    if(grades == undefined){
      return
    }
    console.log("llega 1")
    const validGrades = grades.map(grade => !isNaN(grade) && grade >= 1.0 && grade <= 7.0); 
    console.log("llega 2")
    if (!validGrades.includes(true)) {
      console.log("llega 3")
      setError("Las calificaciones deben ser válidas (entre 1.0 y 7.0).");
      return;
    }
    console.log("llega 3,5")
    try {
      console.log("llega 4")
      // Para cada nota (en este caso asumimos 3 notas)
      for (let i = 0; i < grades.length; i++) {
        console.log("llega 5")
        const grade = grades[i];
  
        // Buscar si la calificación ya existe para ese estudiante
        const student = students.find(student => student.id_student === studentId);
        console.log("llega 6")
        const existingGrade = student ? student.grades[i] : null;
  
        if (existingGrade && existingGrade.id_grade) {
          console.log("llega 7")
          // Si la calificación ya existe, la actualizamos
          await actualizarNota(existingGrade.id_grade, grade);
        } else {
          console.log("llega 8")
          // Si la calificación no existe, la creamos
          await crearNuevaNota(studentId, grade);
        }
      }
  
      // Actualizar el estado de los estudiantes localmente después de las operaciones
      setStudents(prevStudents => {
        console.log("llega 9")
        return prevStudents.map(student => {
          console.log("llega 10")
          if (student.id_student === studentId) {
            console.log("llega 11")
            const updatedGrades = [...student.grades];
            updatedGrades[0] = { grade: grades[0] }; // Aquí deberías asegurarte de tener el ID correcto si ya existe
            updatedGrades[1] = { grade: grades[1] };
            updatedGrades[2] = { grade: grades[2] };
            return { ...student, grades: updatedGrades };
          }
          console.log("llega 12")
          return student;
       
        });
      });
  
      // Alerta de éxito
      alert('Notas guardadas exitosamente!');
  
    } catch (error) {
      console.error('Error al guardar la nota:', error.message);
      setError(`Error al guardar la nota: ${error.message}`);
    } finally {
      setLoading(false); // Desactivar el estado de "cargando"
    }
  };
  
  
  
  
  
  // Calcular el promedio de las notas
  const calcularPromedio = (grades) => {
    const total = grades.reduce((acc, grade) => acc + (grade || 0), 0);
    return (total / grades.length).toFixed(2);
  };

  // Mostrar el formulario para editar las notas
  const mostrarFormularioNotas = () => {
    if (selectedAsignatura) {
      return (
        <div className="notas-container">
          <h2>Notas de {selectedAsignatura.name} ({selectedAsignatura.level})</h2>
          <form>
            <table className="notas-table">
              <thead>
                <tr>
                  <th>Alumno</th>
                  <th>Nota 1</th>
                  <th>Nota 2</th>
                  <th>Nota 3</th>
                  <th>Promedio</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
  {students.length > 0 ? (
    students.map((student) => (
      <tr key={student.id_student}>
        <td>{student.name}</td>
        <td>
          <input
            type="number"
            step="0.1"
            value={student.grades[0] || ''}
            onChange={(e) => handleInputChange(e, student.id_student, 0)}
          />
        </td>
        <td>
          <input
            type="number"
            step="0.1"
            value={student.grades[1] || ''}
            onChange={(e) => handleInputChange(e, student.id_student, 1)}
            min="1.0"
            max="7.0"
          />
        </td>
        <td>
          <input
            type="number"
            step="0.1"
            value={student.grades[2] || ''}
            onChange={(e) => handleInputChange(e, student.id_student, 2)}
            min="1.0"
            max="7.0"
          />
        </td>
        <td>{calcularPromedio(student.grades)}</td>
        <td>
          <button
            onClick={(e) => handleSubmitNotas(e, student.id_student, student.grades)}
          >
            Guardar
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="6">No hay estudiantes en este nivel para esta asignatura.</td>
    </tr>
  )}
</tbody>

            </table>
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

      {mostrarFormularioNotas()}

      {loading && <div>Cargando...</div>}
      {error && <div>{error}</div>}
    </div>
  );
};

export default MisAsignaturas;
