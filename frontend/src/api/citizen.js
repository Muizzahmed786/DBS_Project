import API from './axios.js'

export const getRegisteredVehicles = () => {
    return API.get('/citizen/get-registered-vehicles');
}

export const getAllChallans = () => {
    return API.get('/citizen/get-all-challans');
}

export const getChallansByStatus = (status) => {
    return API.get(`/citizen/get-all-challans/${status}`);
}

export const getMyProfile = () => {
    return API.get('/citizen/get-my-profile');
}

export const getMyDocuments = () => {
    return API.get('/citizen/get-my-documents');
}

export const uploadDocuments = (data) => {
    return API.post('/citizen/upload-documents', data);
}

export const uploadVehicleDocuments = (data, vehicleId) => {
    return API.post(`/citizen/upload-documents/${vehicleId}`, data);
}