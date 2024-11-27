import React from "react";
import Fullcalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionGridPlugin from "@fullcalendar/interaction";
import axios from 'axios';
import "../Calendario/Calendario.css";
import { useState, useEffect } from 'react';
import { act } from "react";

const Calendario = () => {

    const [calendario, setCalendario] = useState([]);
    const [title, setTitle] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [description, setDescription] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [currentActividad, setCurrentActividad] = useState(null);
    const [showModal, setShowModal] = useState(false);

     //conexion back para traerme todos los datos de las actividades en el calendario
     useEffect(() => {
        const fetchCalendario = async () => {
            try {
                const response = await axios.get('http://localhost:3000/parent');
                setCalendario(response.data);
            } catch (error) {
                console.error('Error al cargar calendario:', error);
            }
        };
        fetchCalendario();
    }, []);


     // Crear nueva actividad en el calendario 
     const handleRegister = async () => {
        const newActividad = { title, start, end, description };

        // Validaciones  "fecha inicio y fecha fin con la hora"
        

        try {
            const response = await fetch('http://localhost:3000/parent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newActividad),
            });
            const data = await response.json();
            console.log('Actividad registrada:', data);
            setCalendario((prev) => [...prev, data]); // Actualiza la lista con el nuevo apoderado
            handleCloseModal(); // Cierra el modal después de guardar
        } catch (error) {
            console.log('Error de servidor', error.response ? error.response.data : error);
            if (error.response && error.response.status === 409) {
                console.log('Esta actividad ya existe');
            }
        }
    };

    //funcion para actualizar una actividad desde el back
    const handleUpdate = async () => {
        if (!currentActividad || !currentActividad.id_event) {
            console.error("ID de la actividad no proporcionado para la actualizacion");
            return;
        }

        const updatedActividad = { title, start, end, description };
        // Validaciones  "fecha inicio y fecha fin con la hora"

        try {
            const response = await fetch(`http://localhost:3000/parent/${currentActividad.id_event}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedActividad),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Apoderado actualizado:', data);
            setCalendario((prev) => 
                prev.map(calendario => calendario.id_event === currentActividad.id_event ? { ...calendario, ...data } : calendario)
            );
            handleCloseModal(); // Cierra el modal después de actualizar
        } catch (error) {
            console.log('Error de servidor', error.message);
        }
    };

    //funcion para eliminar una actividad desde el backend
    const handleDelete = async (calendario) => {
        if (!calendario || !calendario.id) {
            console.log(calendario.id);
            console.error("ID de la actividad no proporcionado para eliminar");
            return; // Salir si no hay apoderado seleccionado
        }

        const idToDelete = calendario.id; // Guarda el ID del apoderado a eliminar
        console.log("ID de la actividad a eliminar:", idToDelete);

        try {
            // Realiza la solicitud DELETE
            const response = await axios.delete(`http://localhost:3000/parent/${idToDelete}`);
            // Actualiza la lista de apoderados en el estado
            setCalendario((prevActividades) => prevActividades.filter((item) => item.id_event !== idToDelete));
            console.log("Actividad eliminada:", response.data);
        } catch (error) {
            console.error("Error eliminando actividad:", error.response ? error.response.data : error.message);
        }
    };
    // Manejar la apertura del modal para nuevo apoderado
    const handleNew = () => {
        setShowModal(true);
        setEditMode(false);
        setTitle('');
        setStart('');
        setEnd('');
        setDescription('');
    };
    

    const handleEdit = (calendario) => {
        setCurrentActividad(calendario);
        setTitle(calendario.title); // Cargar el nombre actual
        setStart(calendario.start); // Cargar el email actual
        setEnd(calendario.end);
        setDescription(calendario.description);
        setEditMode(true);
        setShowModal(true);
       
    };

    // Cerrar el modal
    const handleCloseModal = () => {
        setShowModal(false);
        setEditMode(false);
        setCurrentActividad(null);
        setTitle('');
        setStart('');
        setEnd('');
        setDescription('');
    };

    // Lista de eventos (ejemplo)
  const events = [
    {
      id: 1,
      title: "Reunión de trabajo",
      start: "2024-11-28T10:00:00",
      end: "2024-11-28T12:00:00",
      description: "Reunión con el equipo para revisar el proyecto.",
    },
    {
      id: 2,
      title: "Conferencia sobre React",
      start: "2024-11-30T14:00:00",
      end: "2024-11-30T16:00:00",
      description: "Charla sobre las mejores prácticas en React.",
    },
    {
      id: 3,
      title: "Almuerzo con cliente",
      start: "2024-12-01T13:00:00",
      end: "2024-12-01T14:30:00",
      description: "Reunión con cliente potencial para discutir nuevo proyecto.",
    },
    {
      id: 4,
      title: "Revisión de código",
      start: "2024-12-05T09:00:00",
      end: "2024-12-05T11:00:00",
      description: "Revisión del código con el equipo de desarrollo.",
    },
  ];
    
    return (
    <main>
        
        <Fullcalendar class="contenedor-calendario"
        plugins = {[ dayGridPlugin, timeGridPlugin , interactionGridPlugin]}
       
        initialView = {"dayGridMonth"}
        headerToolbar= {{
            start: "dayGridMonth, timeGridWeek, timeGridDay",
            center: "title",
            end: "today prev,next",
            
        }}
        height={"90vh"}
        events={events}  // Pasamos los eventos al calendario
        eventClick={(info) => handleEdit(info.event)} // Abrir el modal para editar
        
        />
        
        <div className="modal-container">
      {/* Botón para abrir el modal */}
      <button className="new-actividad" onClick={handleNew}>
        <i className="fas fa-plus"></i> {/* Ícono de más */}
      </button>

      {/* Modal para agregar o editar actividad */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editMode ? "Editando Actividad" : "Creando Nueva Actividad"}</h3>
            <form
              className="form-modal"
              onSubmit={(e) => {
                e.preventDefault();
                if (editMode) {
                  handleUpdate(); // Llama a la función de actualización
                } else {
                  handleRegister(); // Llama a la función de registro
                }
              }}
            >
              <label htmlFor="title">Titulo Actividad:</label>
              <input
                type="text"
                id="title"
                placeholder="Ingrese el titulo de la actividad"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <label htmlFor="start">Inicio de actividad:</label>
              <input
                type="datetime-local"
                id="start"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                required
              />

              <label htmlFor="end">Fin de la actividad:</label>
              <input
                type="datetime-local"
                id="end"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                required
              />

              <label htmlFor="description">Descripcion de la actividad:</label>
              <input
                type="text"
                id="description"
                placeholder="Ingrese una descripcion para la actividad"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />

              <div className="modal-buttons">
                <button type="submit">{editMode ? "Actualizar" : "Guardar"}</button>
                <button type="button" onClick={handleCloseModal}>Cerrar</button>
                {editMode && (
                        <button 
                            type="button" 
                            className="delete-button" 
                            onClick={() => handleDelete(currentActividad)} // Llama a la función de eliminar
                        >
                            Eliminar Actividad
                        </button>
                  )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
        
    </main>
    );
};

export default Calendario;


