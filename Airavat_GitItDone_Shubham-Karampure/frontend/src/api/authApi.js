"use client";
import API_ROUTES from '@/config/route.js';

export async function registerUser(userData) {
    try {
        setLoading(true);

        const response = await fetch(API_ROUTES.AUTH.REGISTER, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData), 
        });

        const data = await response.json();
        console.log(data);
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        saveUserToLocalStorage(data.user, data.token);
        return data;
    } catch (error) {
        setError(error.message);
        throw error;
    } finally {
        setLoading(false);
    }
}

export async function loginUser(credentials) {
    try {
        setLoading(true);

        const response = await fetch(API_ROUTES.AUTH.LOGIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();
        console.log(data);
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        saveUserToLocalStorage(data.user, data.token);
        return data;
    } catch (error) {
        setError(error.message);
        throw error;
    } finally {
        setLoading(false);
    }
}

export async function logoutUser() {
    try {
        setLoading(true);
        clearUserFromLocalStorage();
        return { success: true };
    } catch (error) {
        setError(error.message);
        throw error;
    } finally {
        setLoading(false);
    }
}

// ----------------------------
// Utility functions
// ----------------------------

function saveUserToLocalStorage(user, token) {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
}

function clearUserFromLocalStorage() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
}

function setLoading(isLoading) {
    // Implement UI loading state if needed
    console.log("Loading:", isLoading);
}

function setError(error) {
    // Handle error display logic if needed
    console.error("Error:", error);
}

export function getUserFromLocalStorage() {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    return {
        user: user ? JSON.parse(user) : null,
        token: token || null,
    };
}
