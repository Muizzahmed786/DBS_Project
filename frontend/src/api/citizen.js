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

export const addVehicle = (data) => {
    return API.post('/citizens/insert-vehicle', data);
}
export const getMyChallanCount = () => {
    return API.get('/citizens/get-my-total-challan-count');
}

export const getMyChallanByStatusCount = (status) => {
    return API.get(`/citizens/get-my-total-challan-count/${status}`);
}

export const getMyVehicleCount = () => {
    return API.get('/citizens/get-my-vehicle-count');
}

export const getMyPaymentCount = () => {
    return API.get('/citizens/get-my-payment-count');
}