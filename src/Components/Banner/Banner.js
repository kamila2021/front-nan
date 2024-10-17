// Components/ImageBanner.js
import React, { useState, useEffect } from 'react';
import './Banner.css'; // Asegúrate de que el nombre del archivo CSS sea correcto

const images = [
  'banner1.jpg', // Reemplaza con las rutas reales de tus imágenes
  'banner2.avif',
  'banner3.webp',
];

const ImageBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Cambia cada 15 segundos

    return () => clearInterval(interval); // Limpia el intervalo al desmontar
  }, []);

  return (
    <div className="banner">
      <img src={images[currentIndex]} alt="Banner" />
    </div>
  );
};

export default ImageBanner;
