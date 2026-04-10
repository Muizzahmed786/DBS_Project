import API from './axios.js'

// Citizens
export const getAllCitizens = () => {
    return API.get('/admin/get-all-citizens');
}

export const getAllAdmins = () => {
    return API.get('/admin/get-all-admins');
}

export const getAllOfficers = () => {
    return API.get('/admin/get-all-officers');
}

// Vehicles
export const getAllVehicles = () => {
    return API.get('/admin/get-all-vehicles');
}

export const getRtoVehicles = (data) => {
    return API.post('/admin/get-rto-vehicles',data);
}

export const getAllVehicleOwnershipDetails = () => {
    return API.get('/admin/get-all-vehicle-ownership-details');
}

export const getRtoVehicleOwnershipDetails = (data) => {
    return API.post('/admin/get-rto-vehicle-ownership-details',data);
}

// Challans
export const getAllChallans = () => {
    return API.get('/admin/get-all-challans');
}

export const getChallansByStatus = (status) => {
    return API.get(`/admin/get-challans-status/${status}`);
}

// Payments
export const getAllPayments = () => {
    return API.get('/admin/get-all-payments');
}

export const getPaymentsByStatus = (status) => {
    return API.get(`/admin/get-payments-status/${status}`);
}

// Stats
export const getTotalChallansCount = () => {
    return API.get('/admin/get-total-challans-count');
}

export const getTotalRevenue = () => {
    return API.get('/admin/get-total-revenue');
}

export const getChallanCountByStatus = (status) => {
    return API.get(`/admin/get-total-challan-count/${status}`);
}

// Violations
export const getAllViolationTypes = () => {
    return API.get('/admin/get-all-violation-types');
}
export const getAllRtoOffices = () => {
    return API.get('/admin/get-all-rto-offices');
}
export const addRtoOffice = (form) => {
  return API.post('/admin/add-rto-office', form);
};
export const addViolationType = (form) => {
  return API.post('/admin/add-violation-type', form);
};


// Audit Logs

export const getAllAuditLogs = () => {
  return API.get('/admin/audit-logs');
};
export const filterAuditLogs = (table = "*", operation = "*") => {
  return API.get(`/admin/audit-logs/filter/${table}/${operation}`);
};
export const deleteFilteredLogs = (data) => {
  return API.delete('/admin/audit-logs/filter', { data });
};
export const deleteOldestLogs = (data) => {
  return API.delete('/admin/audit-logs/oldest', { data });
};
export const deleteLogsBetweenDates = (data) => {
  return API.delete('/admin/audit-logs/date-range', { data });
};
export const countLogsBetweenDates = (startDate, endDate) => {
  return API.get(`/admin/audit-logs/date-range/${startDate}/${endDate}`);
};

export const addAdminOrOfficer = (form) => {
  return API.post('/admin/add-users', form);
};