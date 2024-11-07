import React, { useState, useEffect } from 'react';
import './Asignaturas.css'; // Asegúrate de tener el CSS correspondiente
import axios from 'axios';

// Objetos de enumeración
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

const DayEnum = {
    Lunes: 'Lunes',
    Martes: 'Martes',
    Miercoles: 'Miercoles',
    Jueves: 'Jueves',
    Viernes: 'Viernes',
};

const BlockEnum = {
    A: 'A',
    B: 'B',
    C: 'C',
    D: 'D',
    E: 'E',
};

// Funciones de validación
export const validateName = (name) => {
    return name.trim().length > 0;
};

const Asignaturas = () => {
    const [name, setName] = useState('');
    const [level, setLevel] = useState('');
    const [day, setDay] = useState('');
    const [block, setBlock] = useState('');
    const [selectedProfessorId, setSelectedProfessorId] = useState(''); // Estado para el ID del profesor
    const [professors, setProfessors] = useState([]);
    const [asignaturas, setAsignaturas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [currentAsignatura, setCurrentAsignatura] = useState({
        id_subject: null,
        name: '',
        level: '',
        day: '',
        block: '',
    });
    
    const [showModal, setShowModal] = useState(false);

    // Cargar asignaturas cuando el componente se monta
    useEffect(() => {
        const fetchAsignaturas = async () => {
            try {
                const response = await axios.get('http://localhost:3000/subject');
                console.log('Asignaturas cargadas:', response.data); // Verifica la estructura aquí
                setAsignaturas(response.data);
            } catch (error) {
                console.error('Error al cargar asignaturas:', error.response ? error.response.data : error.message);
            }
        };
        
    
        fetchAsignaturas();
    }, []);

    // Cargar profesores cuando el componente se monta
    useEffect(() => {
        const fetchProfessors = async () => {
            try {
                const response = await axios.get('http://localhost:3000/professor');
                setProfessors(response.data);
            } catch (error) {
                console.error('Error al cargar profesores:', error);
            }
        };

        fetchProfessors();
    }, []);

    const handleRegister = async () => {
        const newAsignatura = {
            name,
            level,
            day,
            block,
            id_professor: parseInt(selectedProfessorId, 10),
        };
    
        try {
            console.log(newAsignatura)
            const response = await fetch ('http://localhost:3000/subject',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newAsignatura),
            });
            const data = await response.json();
            console.log('Asignatura registrado:', data);
            setAsignaturas((prev) => [...prev, data]); // Actualiza la lista con el nuevo apoderado
            handleCloseModal(); // Cierra el modal después de guardar
        } catch (error) {
            console.error('Error al registrar:', error.response ? error.response.data : error.message);
        }
    };
    
    const handleUpdate = async () => {
        if (!currentAsignatura) {
            console.error("No hay asignatura seleccionada para actualizar");
            return;
        }
    
        const updatedAsignatura = { 
            name: name || currentAsignatura.name,
            level: level || currentAsignatura.level,
            day: day || currentAsignatura.day,
            block: block || currentAsignatura.block,
          
        };
        console.log("Datos a enviar para actualización:", updatedAsignatura); // Agrega este log
        try {
            console.log("Datos actuales: ",currentAsignatura);
            console.log("Datos nuevos: ", updatedAsignatura);
            const response = await axios.patch(`http://localhost:3000/subject/${currentAsignatura.id_subject}`, updatedAsignatura);
            setAsignaturas((prev) => 
                prev.map(asignatura => asignatura.id_subject === currentAsignatura.id_subject ? { ...asignatura, ...response.data } : asignatura)
            );
            handleCloseModal();
        } catch (error) {
            console.error('Error de servidor:', error.message);
        }
    };
    // Manejar la apertura del modal para nueva asignatura
    const handleNew = () => {
        setShowModal(true);
        setEditMode(false);
        setName('');
        setLevel('');
        setDay('');
        setBlock('');
        setSelectedProfessorId(''); // Reiniciar el ID del profesor seleccionado
        setCurrentAsignatura(null);
    };
    const handleRowClick = (asignatura) => {
        console.log('Asignatura seleccionada:', asignatura);
        console.log('ID de la asignatura:', asignatura.id_subject); // Verifica que este log muestre el ID correcto
    
        // Establecer el estado con los datos de la asignatura seleccionada
        setCurrentAsignatura(asignatura);
        setName(asignatura.name);
        setLevel(asignatura.level);
        setDay(asignatura.day);
        setBlock(asignatura.block);
        setSelectedProfessorId(asignatura.id_professor); // Mantener el ID del profesor actual
        setEditMode(true);
        setShowModal(true);
    };

    const handleDelete = async (asignatura) => {
        if (!asignatura || !asignatura.id_subject) {
            console.error("ID de la asignatura no proporcionado para eliminar");
            return;
        }

        try {
            await axios.delete(`http://localhost:3000/subject/${asignatura.id_subject}`);
            setAsignaturas((prevAsignaturas) =>
                prevAsignaturas.filter((item) => item.id_subject !== asignatura.id_subject)
            );
        } catch (error) {
            console.error("Error eliminando asignatura:", error.response ? error.response.data : error.message);
        }
    };
    
    // Cerrar el modal
    const handleCloseModal = () => {
        setShowModal(false);
        setEditMode(false);
        setCurrentAsignatura(null);
        setName('');
        setLevel('');
        setDay('');
        setBlock('');
        setSelectedProfessorId(''); // Reiniciar el ID del profesor seleccionado
    };

    const filteredAsignaturas = asignaturas.filter(asignatura =>
        asignatura.name && asignatura.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    

    return (
        <div className="asignaturas-container">
            <h2 className="title">Lista de Asignaturas</h2>
            <div className="top-bar">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Buscar asignatura..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="new-asignatura" onClick={handleNew}>
                    <i className="fas fa-plus"></i>
                </button>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Nivel</th>
                        <th>Día</th>
                        <th>Bloque</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                {filteredAsignaturas.map((asignatura) => (
                 <tr key={asignatura.id_subject} onClick={() => handleRowClick(asignatura)}>
            <td>{asignatura.name}</td>
            <td>{asignatura.level}</td>
            <td>{asignatura.day}</td>
            <td>{asignatura.block}</td>
            <td>
                <button onClick={(e) => { e.stopPropagation(); handleRowClick(asignatura); }}>
                    <i className="fas fa-edit"></i>
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(asignatura); }}>
                    <i className="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    ))}
</tbody>
            </table>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>{editMode ? 'Editando Asignatura' : 'Creando Nueva Asignatura'}</h3>
                        <form className="form-modal" onSubmit={(e) => {
                            e.preventDefault();
                            if (editMode) {
                                handleUpdate();
                            } else {
                                handleRegister();
                            }
                        }}>
                            <label htmlFor="nombre">Nombre:</label>
                            <input
                                type="text"
                                id="nombre"
                                placeholder="Ingrese el nombre de la asignatura"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />

                            <label htmlFor="nivel">Nivel:</label>
                            <select
                                id="nivel"
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                                required
                            >
                                <option value="">Seleccione un nivel</option>
                                {Object.values(LevelEnum).map(level => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>

                            <label htmlFor="dia">Día:</label>
                            <select
                                id="dia"
                                value={day}
                                onChange={(e) => setDay(e.target.value)}
                                required
                            >
                                <option value="">Seleccione un día</option>
                                {Object.keys(DayEnum).map(day => (
                                    <option key={day} value={DayEnum[day]}>{DayEnum[day]}</option>
                                ))}
                            </select>

                            <label htmlFor="bloque">Bloque:</label>
                            <select
                                id="bloque"
                                value={block}
                                onChange={(e) => setBlock(e.target.value)}
                                required
                            >
                                <option value="">Seleccione un bloque</option>
                                {Object.keys(BlockEnum).map(block => (
                                    <option key={block} value={BlockEnum[block]}>{BlockEnum[block]}</option>
                                ))}
                            </select>

                            <label htmlFor="profesor">Profesor:</label>
                            <select
                                id="profesor"
                                value={selectedProfessorId}
                                onChange={(e) => setSelectedProfessorId(e.target.value)}
                                required
                            >
                                <option value="">Seleccione un profesor</option>
                                {professors.map(professor => (
                                    <option key={professor.id_professor} value={professor.id_professor}>
                                        {professor.name}
                                    </option>
                                ))}
                            </select>

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

export default Asignaturas;
