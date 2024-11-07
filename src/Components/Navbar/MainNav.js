// Components/Navbar/MainNav.js
import React from 'react';
import NavbarAdmin from './Admin/Navbar';
import NavbarApoderado from './Apoderado/NavbarApoderados';
import NavbarProfesor from './Profesor/NavbarProfesor';

const MainNav = ({ userType, onNavigate, onLogout, currentScreen }) => {
    return (
        <>
            {userType === 'admin' && (
                <NavbarAdmin 
                    currentScreen={currentScreen}
                    onNavigate={onNavigate}
                    onLogout={onLogout} 
                />
            )}
            {userType === 'parent' && (
                <NavbarApoderado 
                    currentScreen={currentScreen}
                    onNavigate={onNavigate}
                    onLogout={onLogout} 
                />
            )}
             {userType === 'professor' && (
                <NavbarProfesor
                    currentScreen={currentScreen}
                    onNavigate={onNavigate}
                    onLogout={onLogout} 
                />
            )}
        </>
    );
};

export default MainNav;
