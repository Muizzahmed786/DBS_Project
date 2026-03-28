import API from './axios.js'

// Register user
export const registerUser = (data) => {
    return API.post("/users/register", data);
}

// Login user
export const loginUser = (data) => {
    return API.post("/users/login", data);
};

// Logout user
export const logoutUser = () => {
    return API.post("/users/logout");
};

// Refresh Token
export const refreshToken = () => {
    return API.post("/users/refresh-token");
};