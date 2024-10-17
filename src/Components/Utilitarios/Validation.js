// src/utils/validation.js

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
