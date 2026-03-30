import API from './axios.js'

export const getMyIssuedChallans = () => {
    return API.get('/officer/get-my-challan-issued');
}

export const getAllViolationTypes = () => {
    return API.get('/officer/get-all-violation-types');
}

export const getMyIssuedChallanCount = () => {
    return API.get('/officer/get-my-issued-challan-count');
}

export const getIssuedDlCountByRto = (rtoId) => {
    return API.get(`/officer/get-my-issued-dl-count/${rtoId}`);
}

export const issueChallan = (data) => {
    return API.post('/officer/issue-challan', data);
}

export const issueDrivingLicence = (data) => {
    return API.post('/officer/issue-licence', data);
}

export const getTotalFineCollected = () => {
    return API.get('/officers/get-total-fine-collected');
}

export const getChallanStatusStats = () => {
    return API.get('/officers/get-challan-status-stats');
}

export const getTopViolations = () => {
    return API.get('/officers/get-top-violations');
}