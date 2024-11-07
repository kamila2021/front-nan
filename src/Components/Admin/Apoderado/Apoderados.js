import { useState, useEffect } from 'react';
import axios from 'axios';
import './Apoderados.css';

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

const Apoderados = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [apoderados, setApoderados] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [currentApoderado, setCurrentApoderado] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Cargar los apoderados existentes cuando el componente se monta
    useEffect(() => {
        const fetchApoderados = async () => {
            try {
                const response = await axios.get('http://localhost:3000/parent');
                setApoderados(response.data);
            } catch (error) {
                console.error('Error al cargar apoderados:', error);
            }
        };
        fetchApoderados();
    }, []);

   // Manejar el registro de un nuevo apoderado
    const handleRegister = async () => {
        const newApoderado = { name, email, password };

        // Validaciones
        if (!validateName(newApoderado.name)) {
            console.log('Error', 'Ingrese un nombre válido');
            return;
        }
        if (!validateEmail(newApoderado.email)) {
            console.log('Error', 'Ingrese un correo válido');
            return;
        }
        if (!validatePassword(newApoderado.password)) {
            console.log('Error', 'Ingrese una contraseña válida');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/parent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newApoderado),
            });
            const data = await response.json();
            console.log('Apoderado registrado:', data);
            setApoderados((prev) => [...prev, data]); // Actualiza la lista con el nuevo apoderado
            handleCloseModal(); // Cierra el modal después de guardar
        } catch (error) {
            console.log('Error de servidor', error.response ? error.response.data : error);
            if (error.response && error.response.status === 409) {
                console.log('El correo ya existe');
            }
        }
    };
    const handleUpdate = async () => {
        if (!currentApoderado || !currentApoderado.id_parent) {
            console.error("ID del apoderado no proporcionado para actualización");
            return;
        }

        const updatedApoderado = { name, email }; // No incluir la contraseña

        // Validaciones
        if (!validateName(updatedApoderado.name)) {
            console.log('Error', 'Ingrese un nombre válido');
            return;
        }
        if (!validateEmail(updatedApoderado.email)) {
            console.log('Error', 'Ingrese un correo válido');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/parent/${currentApoderado.id_parent}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedApoderado),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Apoderado actualizado:', data);
            setApoderados((prev) => 
                prev.map(apoderado => apoderado.id_parent === currentApoderado.id_parent ? { ...apoderado, ...data } : apoderado)
            );
            handleCloseModal(); // Cierra el modal después de actualizar
        } catch (error) {
            console.log('Error de servidor', error.message);
        }
    };

    const handleDelete = async (apoderado) => {
        if (!apoderado || !apoderado.id_parent) {
            console.error("ID del apoderado no proporcionado para eliminar");
            return; // Salir si no hay apoderado seleccionado
        }

        const idToDelete = apoderado.id_parent; // Guarda el ID del apoderado a eliminar
        console.log("ID del apoderado a eliminar:", idToDelete);

        try {
            // Realiza la solicitud DELETE
            const response = await axios.delete(`http://localhost:3000/parent/${idToDelete}`);
            // Actualiza la lista de apoderados en el estado
            setApoderados((prevApoderados) => prevApoderados.filter((item) => item.id_parent !== idToDelete));
            console.log("Apoderado eliminado:", response.data);
        } catch (error) {
            console.error("Error eliminando apoderado:", error.response ? error.response.data : error.message);
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

    const handleEdit = (apoderado) => {
        setCurrentApoderado(apoderado);
        setName(apoderado.name); // Cargar el nombre actual
        setEmail(apoderado.email); // Cargar el email actual
        setPassword(''); // Resetea la contraseña (no se puede editar)
        setEditMode(true);
        setShowModal(true);
    };

    // Cerrar el modal
    const handleCloseModal = () => {
        setShowModal(false);
        setEditMode(false);
        setCurrentApoderado(null);
        setName('');
        setEmail('');
        setPassword('');
    };

    // Filtrar apoderados basados en el término de búsqueda
    const filteredApoderados = apoderados.filter(apoderado =>
        apoderado.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="apoderados-container">
            <h2 className="title">Lista de Apoderados</h2>
            <div className="top-bar">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Buscar apoderado..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="new-apoderado" onClick={handleNew}>
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
                    {filteredApoderados.map((apoderado) => (
                        <tr key={apoderado.id_parent} onClick={() => setCurrentApoderado(apoderado)}>
                            <td>{apoderado.name}</td>
                            <td>{apoderado.email}</td>
                            <td>
                                <button onClick={(e) => { e.stopPropagation(); handleEdit(apoderado); }}>
                                    <i className="fas fa-edit"></i> {/* Icono para editar */}
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(apoderado); }}>
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
                        <h3>{editMode ? 'Editando Apoderado' : 'Creando Nuevo Apoderado'}</h3>
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
                                placeholder="Ingrese el nombre del apoderado"
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
                                type="text" // Cambiado a "text" para mostrar la contraseña
                                id="password"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required // Este campo es solo para lectura
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

export default Apoderados;
