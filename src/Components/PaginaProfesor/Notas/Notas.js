import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Notas.css';  // Ajusta el nombre del archivo si es necesario

const Notas = () => {
  const { asignaturaId } = useParams();  // Obtenemos el ID de la asignatura desde la URL
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notas, setNotas] = useState({});

  useEffect(() => {
    fetchAlumnos(asignaturaId);
  }, [asignaturaId]);

  const fetchAlumnos = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/students/${id}`);
      setAlumnos(response.data);
    } catch (error) {
      setError('Error al obtener los alumnos');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeNota = (alumnoId, nota, value) => {
    setNotas(prevNotas => ({
      ...prevNotas,
      [alumnoId]: {
        ...prevNotas[alumnoId],
        [nota]: value,
      },
    }));
  };

  const handleGuardarNotas = async () => {
    try {
      await axios.post(`http://localhost:3000/students/${asignaturaId}/notas`, { notas });
      alert('Notas guardadas correctamente.');
    } catch (error) {
      alert('Error al guardar las notas.');
    }
  };

  return (
    <div>
      <h1>Alumnos de la Asignatura</h1>
      {loading && <p>Cargando alumnos...</p>}
      {error && <p>{error}</p>}

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Nota 1</th>
            <th>Nota 2</th>
            <th>Nota 3</th>
          </tr>
        </thead>
        <tbody>
          {alumnos.map((alumno) => (
            <tr key={alumno.id}>
              <td>{alumno.nombre}</td>
              <td>{alumno.apellido}</td>
              <td>
                <input 
                  type="number" 
                  value={notas[alumno.id]?.nota1 || ''} 
                  onChange={(e) => handleChangeNota(alumno.id, 'nota1', e.target.value)} 
                />
              </td>
              <td>
                <input 
                  type="number" 
                  value={notas[alumno.id]?.nota2 || ''} 
                  onChange={(e) => handleChangeNota(alumno.id, 'nota2', e.target.value)} 
                />
              </td>
              <td>
                <input 
                  type="number" 
                  value={notas[alumno.id]?.nota3 || ''} 
                  onChange={(e) => handleChangeNota(alumno.id, 'nota3', e.target.value)} 
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={handleGuardarNotas}>Guardar Notas</button>
    </div>
  );
};



export default Notas;
