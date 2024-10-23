import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Alumnos.css';

// Funciones de validación
export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

export const validateName = (name) => {
    return name.trim().length > 0;
};

export const validatePassword = (password) => {
    return password.length >= 6; // O cualquier otra regla que desees
};

// Objeto de niveles
const LevelEnum = {
    Level1: '1',
    Level2: '2',
    Level3: '3',
    Level4: '4',
    Level5: '5',
    Level6: '6',
    Level7: '7',
    Level8: '8',
    Level9: '9',
    Level10: '10',
    Level11: '11',
    Level12: '12',
    Level13: '13',
};

const Alumnos = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [course, setCourse] = useState(LevelEnum.Level1); // Estado para el curso (inicializado con Level1)
    const [parentId, setParentId] = useState(''); // Estado para el ID del padre
    const [parents, setParents] = useState([]); // Estado para los padres
    const [alumnos, setAlumnos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [currentAlumno, setCurrentAlumno] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Cargar los padres existentes cuando el componente se monta
    useEffect(() => {
        const fetchParents = async () => {
            try {
                const response = await axios.get('http://192.168.0.15:3000/parent');
                setParents(response.data); // Guardar los padres en el estado
            } catch (error) {
                console.error('Error al cargar padres:', error);
            }
        };

        const fetchAlumnos = async () => {
            try {
                const response = await axios.get('http://192.168.0.15:3000/student');
                setAlumnos(response.data);
            } catch (error) {
                console.error('Error al cargar alumnos:', error);
            }
        };

        fetchParents();
        fetchAlumnos();
    }, []);

    // Manejar el registro de un nuevo alumno
    const handleRegister = async () => {
        const newAlumno = { 
            name, 
            email, 
            password, 
            level: course, // Enviar el nivel basado en el objeto
            id_parent: parentId // Enviar el ID del padre
        };

        // Validaciones
        if (!validateName(newAlumno.name)) {
            console.log('Error', 'Ingrese un nombre válido');
            return;
        }
        if (!validateEmail(newAlumno.email)) {
            console.log('Error', 'Ingrese un correo válido');
            return;
        }
        if (!validatePassword(newAlumno.password)) {
            console.log('Error', 'Ingrese una contraseña válida');
            return;
        }
        if (!newAlumno.id_parent) {
            console.log('Error', 'Seleccione un padre');
            return;
        }

        try {
            const response = await fetch('http://192.168.0.15:3000/student', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newAlumno),
            });
            const data = await response.json();
            console.log('Alumno registrado:', data);
            setAlumnos((prev) => [...prev, data]); // Actualiza la lista con el nuevo alumno
            handleCloseModal(); // Cierra el modal después de guardar
        } catch (error) {
            console.log('Error de servidor', error.response ? error.response.data : error);
            if (error.response && error.response.status === 409) {
                console.log('El correo ya existe');
            }
        }
    };

    const handleUpdate = async () => {
        if (!currentAlumno || !currentAlumno.id_student) {
            console.error("ID del estudiante no proporcionado para actualización");
            return;
        }

        // Crea el objeto updateStudentDto con las propiedades que deseas actualizar
        const updateStudentDto = {
            name,
            email,
            // Añade aquí cualquier otra propiedad que quieras actualizar
            password, // Opcional, dependiendo de tu lógica de actualización
        };

        const requestBody = {
            updateStudentDto,
            level: course, // Asigna el nivel correcto basado en el curso
        };
    
        // Validaciones
        if (!validateName(updateStudentDto.name)) {
            console.log('Error', 'Ingrese un nombre válido');
            return;
        }
        if (!validateEmail(updateStudentDto.email)) {
            console.log('Error', 'Ingrese un correo válido');
            return;
        }
        console.log('Datos enviados para actualización:', requestBody);
    
        try {
            const response = await fetch(`http://192.168.0.15:3000/student/${currentAlumno.id_student}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody), // Enviar el cuerpo modificado
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error en la actualización:', errorData); // Ver el error detallado
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
            console.log('Alumno actualizado:', data);
            setAlumnos((prev) =>
                prev.map(alumno => alumno.id_student === currentAlumno.id_student ? { ...alumno, ...data } : alumno)
            );
            handleCloseModal(); // Cierra el modal después de actualizar
        } catch (error) {
            console.log('Error de servidor', error.message);
        }
    };

    // Manejar la eliminación de un alumno
    const handleDelete = async (alumno) => {
        if (!alumno || !alumno.id_student) {
            console.error("ID del alumno no proporcionado para eliminar");
            return;
        }

        const idToDelete = alumno.id_student; // Guarda el ID del alumno a eliminar
        console.log("ID del alumno a eliminar:", idToDelete);

        try {
            // Realiza la solicitud DELETE
            const response = await axios.delete(`http://192.168.0.15:3000/student/${idToDelete}`);
            // Actualiza la lista de alumnos en el estado
            setAlumnos((prevAlumnos) => prevAlumnos.filter((item) => item.id_student !== idToDelete));
            console.log("Alumno eliminado:", response.data);
        } catch (error) {
            console.error("Error eliminando alumno:", error.response ? error.response.data : error.message);
        }
    };

    // Manejar la apertura del modal para nuevo alumno
    const handleNew = () => {
        setShowModal(true);
        setEditMode(false);
        setName('');
        setEmail('');
        setPassword('');
        setCourse(LevelEnum.Level1); // Resetear curso al crear nuevo
        setParentId(''); // Resetear ID del padre al crear nuevo
    };

    const handleRowClick = (alumno) => {
        setCurrentAlumno(alumno);
        setName(alumno.name); // Cargar el nombre actual
        setEmail(alumno.email); // Cargar el email actual
        setPassword(''); // Resetea la contraseña (no se puede editar)
        setCourse(alumno.level || LevelEnum.Level1); // Cargar el curso actual
        setParentId(alumno.id_parent || ''); // Cargar el ID del padre actual
        setEditMode(true);
        setShowModal(true);
    };

    // Cerrar el modal
    const handleCloseModal = () => {
        setShowModal(false);
        setEditMode(false);
        setCurrentAlumno(null);
        setName('');
        setEmail('');
        setPassword('');
        setCourse(LevelEnum.Level1); // Resetear curso al cerrar modal
        setParentId(''); // Resetear ID del padre al cerrar modal
    };

    // Filtrar alumnos basados en el término de búsqueda
    const filteredAlumnos = alumnos.filter(alumno =>
        alumno.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="alumnos-container">
            <h2 className="title">Lista de Alumnos</h2>
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Buscar alumno"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="new-alumno" onClick={handleNew}>
                    <i className="fas fa-plus"></i> {/* Ícono de más */}
                </button>
            </div>
            <table className="alumnos-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Nivel</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAlumnos.map((alumno) => (
                        <tr key={alumno.id_student}>
                            <td>{alumno.id_student}</td>
                            <td>{alumno.name}</td>
                            <td>{alumno.email}</td>
                            <td>{alumno.level}</td>
                            <td> 
                                <button onClick={(e) => {e.stopPropagation(); handleRowClick(alumno);}}>
                                    <i className="fas fa-edit"></i> {/* Icono para editar */}
                                </button>
                                <button onClick={(e) => {e.stopPropagation(); handleDelete(alumno);}}>
                                    <i className="fas fa-trash"></i> {/* Icono para eliminar */}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={handleCloseModal}>&times;</span>
                        <h2>{editMode ? 'Editar Alumno' : 'Nuevo Alumno'}</h2>
                        <input
                            type="text"
                            placeholder="Nombre"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        {!editMode && (
                            <input
                                type="password"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        )}
                        <select value={course} onChange={(e) => setCourse(e.target.value)}>
                            {Object.entries(LevelEnum).map(([key, value]) => (
                                <option key={key} value={value}>{key}</option>
                            ))}
                        </select>
                        <select value={parentId} onChange={(e) => setParentId(e.target.value)}>
                            <option value="">Seleccione un padre</option>
                            {parents.map((parent) => (
                                <option key={parent.id_parent} value={parent.id_parent}>{parent.name}</option>
                            ))}
                        </select>
                        <button onClick={editMode ? handleUpdate : handleRegister}>
                            {editMode ? 'Actualizar' : 'Registrar'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Alumnos;
