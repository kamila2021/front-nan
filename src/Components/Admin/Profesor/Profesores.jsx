// Components/Profesores.js
import React, { useState, useEffect } from 'react';
import './Profesores.css';
import axios from 'axios';

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
const Profesores = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [profesores, setProfesores] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [currentProfesor, setCurrentProfesor] = useState(null);
    const [showModal, setShowModal] = useState(false);

     // Cargar los profesores  existentes cuando el componente se monta
     useEffect(() => {
        const fetchProfesores = async () => {
            try {
                const response = await axios.get('http://192.168.0.15:3000/professor');
                setProfesores(response.data);
            } catch (error) {
                console.error('Error al cargar profesores:', error);
            }
        };
        fetchProfesores();
    }, []);

    // Manejar el registro de un nuevo profesor
    const handleRegister = async () => {
        const newProfesor = { name, email, password };

        // Validaciones
        if (!validateName(newProfesor.name)) {
            console.log('Error', 'Ingrese un nombre válido');
            return;
        }
        if (!validateEmail(newProfesor.email)) {
            console.log('Error', 'Ingrese un correo válido');
            return;
        }
        if (!validatePassword(newProfesor.password)) {
            console.log('Error', 'Ingrese una contraseña válida');
            return;
        }

        try {
            const response = await fetch ('http://192.168.0.15:3000/professor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newProfesor),
            });
            const data = await response.json();
            console.log('Profesor registrado:', response.data);
            setProfesores((prev) => [...prev, data]); // Actualiza la lista con el nuevo profesor
            handleCloseModal(); // Cierra el modal después de guardar
        } catch (error) {
            console.log('Error de servidor', error.response ? error.response.data : error);
            if (error.response && error.response.status === 409) {
                console.log('El correo ya existe');
            }
        }
    };

    // Manejar la actualización de un profesor
    const handleUpdate = async () => {
        
        if (!currentProfesor || !currentProfesor.id_professor) {
            console.error("ID del profesor no proporcionado para actualización");
            return; // Asegúrate de que el id esté definido
        }

        const updatedProfesor= { name, email };

        // Validaciones
        if (!validateName(updatedProfesor.name)) {
            console.log('Error', 'Ingrese un nombre válido');
            return;
        }
        if (!validateEmail(updatedProfesor.email)) {
            console.log('Error', 'Ingrese un correo válido');
            return;
        }
      
        try {
            const response = await fetch(`http://192.168.0.15:3000/professor/${currentProfesor.id_professor}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedProfesor),
            });
        
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        
            const data = await response.json();
            console.log('Profesor actualizado:', data);
            setProfesores((prev) => 
                prev.map(profesor => profesor.id_professor === currentProfesor.id_professor ? { ...profesor, ...data } : profesor)
            );
            handleCloseModal(); // Cierra el modal después de actualizar
        } catch (error) {
            console.log('Error de servidor', error.message);
        }
    };

    // Manejar la apertura del modal para nuevo apoderado
    const handleNew = () => {
        setShowModal(true);
        setEditMode(false);
        setName('');
        setEmail('');
        setPassword('');
    };

    // Manejar la selección de un profesor de la lista para editar
    const handleRowClick = (profesor) => {
        console.log(profesor)
        setCurrentProfesor(profesor); // Almacena el profesor actual, que incluye su ID
        setName(profesor.name);
        setEmail(profesor.email);
        setPassword(profesor.password);
        setEditMode(true);
        setShowModal(true);
    };


    const handleDelete = async (profesor) => {
        // Asegúrate de que el profesor tenga un id válido
        if (!profesor || !profesor.id_professor) {
            console.error("ID del profesor no proporcionado para eliminar");
            return; // Salir si no hay profesor seleccionado
        }
    
        const idToDelete = profesor.id_professor; // Guarda el ID del apoderado a eliminar
        console.log("ID del profesor a eliminar:", idToDelete);
    
        try {
            // Realiza la solicitud DELETE
            const response = await axios.delete(`http://10.115.75.137:3000/professor/${idToDelete}`);
            
            // Actualiza la lista de apoderados en el estado
            setProfesores((prevProfesores) =>
                prevProfesores.filter((item) => item.id_professor !== idToDelete)
            );
    
            console.log("Profesor eliminado:", response.data);
        } catch (error) {
            // Manejo de errores más descriptivo
            console.error("Error eliminando profesor:", error.response ? error.response.data : error.message);
        }
    };

    // Cerrar el modal
    const handleCloseModal = () => {
        setShowModal(false);
        setEditMode(false);
        setCurrentProfesor(null);
        setName('');
        setEmail('');
        setPassword('');
    };

    // Filtrar apoderados basados en el término de búsqueda
    const filteredProfesores = profesores.filter(profesor =>
        profesor.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="profesores-container">
            <h2 className="title">Lista de Profesores</h2>
            <div className="top-bar">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Buscar profesor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="new-profesor" onClick={handleNew}>
                    <i className="fas fa-plus"></i> {/* Ícono de más */}
                </button>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProfesores.map((profesor) => (
                        <tr key={profesor.id} onClick={() => handleRowClick(profesor)}> {/* Evento onClick para capturar el ID del usuario */}
                            <td>{profesor.name}</td>
                            <td>{profesor.email}</td>
                            <td>
                                <button onClick={(e) => {e.stopPropagation(); handleRowClick(profesor);}}>
                                    <i className="fas fa-edit"></i> {/* Icono para editar */}
                                </button>
                                <button onClick={(e) => {e.stopPropagation(); handleDelete(profesor);}}>
                                    <i className="fas fa-trash"></i> {/* Icono para eliminar */}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal para agregar o editar apoderado */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>{editMode ? 'Editando profesor' : 'Creando Nuevo profesor'}</h3>
                        <form className="form-modal" onSubmit={(e) => {
                            e.preventDefault();
                            if (editMode) {
                                handleUpdate(); // Llama a la función de actualización
                            } else {
                                handleRegister(); // Llama a la función de registro
                            }
                        }}>
                            <label htmlFor="nombre">Nombre:</label>
                            <input
                                type="text"
                                id="nombre"
                                placeholder="Ingrese el nombre del profesor"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />

                            <label htmlFor="email">Email:</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="Ingrese el email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <label htmlFor="password">Clave:</label>
                            <input
                                type="password" // Cambiado a "password" para ocultar la contraseña
                                id="password"
                                placeholder="Contraseña"
                                value={editMode ? '' : password} // Solo permite ingresar contraseña si no está en modo edición
                                onChange={(e) => !editMode && setPassword(e.target.value)} // Permitir cambios solo en el registro
                                required={!editMode} // Requerir contraseña solo en el registro
                                readOnly={editMode} // Solo lectura en modo de edición
                            />


                            <div className="modal-buttons">
                                <button type="submit">{editMode ? 'Actualizar' : 'Guardar'}</button>
                                <button type="button" onClick={handleCloseModal}>Cerrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profesores;
