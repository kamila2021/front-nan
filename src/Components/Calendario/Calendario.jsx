import React from "react";
import Fullcalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionGridPlugin from "@fullcalendar/interaction";
import axios from 'axios';
import "../Calendario/Calendario.css";
import { useState, useEffect } from 'react';
import { act } from "react";
import { current } from "@reduxjs/toolkit";

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
                const response = await axios.get('http://localhost:3000/calendar');
                setCalendario(response.data);
            } catch (error) {
                console.error('Error al cargar calendario:', error);
            }
        };
        fetchCalendario();
    }, []);


    const handleRegister = async () => {
      // Validación de datos
      if (!title || !start || !end || !description) {
          console.error('Todos los campos son obligatorios');
          return;
      }
  
      // Crear instancias de Date directamente en el frontend
      const newActividad = {
          title,
          start: new Date(start), // Convertir a instancia de Date
          end: new Date(end),     // Convertir a instancia de Date
          description,
      };
      console.log(newActividad)
      try {
          const response = await fetch('http://localhost:3000/calendar', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(newActividad), // Serializar el objeto con instancias de Date
          });
  
          if (!response.ok) {
              const errorData = await response.json();
              console.error('Error en la solicitud:', errorData);
              if (response.status === 409) {
                  console.log('Esta actividad ya existe');
              }
              return;
          }
  
          const data = await response.json();
          console.log('Actividad registrada:', data);
          setCalendario((prev) => [...prev, data]); // Actualiza la lista
          handleCloseModal(); // Cierra el modal
      } catch (error) {
          console.error('Error de servidor', error.message);
      }
  };
  
    //funcion para actualizar una actividad desde el back
    const handleUpdate = async () => {
        if (!currentActividad || !currentActividad.id) {
            console.error("ID de la actividad no proporcionado para la actualizacion");
            return;
        }

        const updatedActividad = { title, start, end, description };
        try {
            const response = await fetch(`http://localhost:3000/calendar/${currentActividad.id}`, {
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
            console.log('Evento actualizado:', data);
            setCalendario((prev) => 
                prev.map(calendario => calendario.id === currentActividad.id ? { ...calendario, ...data } : calendario)
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
            const response = await axios.delete(`http://localhost:3000/calendar/${idToDelete}`);
            // Actualiza la lista de apoderados en el estado
            setCalendario((prevActividades) => prevActividades.filter((item) => item._id !== idToDelete));
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
      console.log(calendario)
        setCurrentActividad(calendario);
        setTitle(calendario.title); // Cargar el nombre actual
        setStart(calendario.startStr); // Cargar el email actual
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
    
    const filteredEvents = calendario.filter(evento =>
      evento.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const processedEvents = filteredEvents.map(evento => ({
    id: evento._id, // Asegúrate de que cada evento tiene un `id`
    title: evento.title,
    start: evento.start,
    end: evento.end,
    description: evento.description,
    extendedProps: {
        _id: evento._id,
        description: evento.description,
    },
  })
);


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
        events={processedEvents}  // Pasamos los eventos al calendario
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
                  console.log("entr aa edit")
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


