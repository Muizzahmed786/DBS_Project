import API from './axios.js'

export const getRegisteredVehicles = () => {
    return API.get('/citizens/get-registered-vehicles');
}

export const getAllChallans = () => {
    return API.get('/citizens/get-all-challans');
}

export const getChallansByStatus = (status) => {
    return API.get(`/citizens/get-all-challans/${status}`);
}

export const getMyProfile = () => {
    return API.get('/citizens/get-my-profile');
}

export const getMyDocuments = () => {
    return API.get('/citizens/get-my-documents');
}

export const uploadDocuments = (formData) => {
    return API.post('/citizens/upload-documents', formData, {
        withCredentials: true,
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
};

export const uploadVehicleDocuments = (data, vehicleId) => {
    return API.post(`/citizens/upload-documents/${vehicleId}`, data);
}