import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { db } from '../database/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

//To be shown in User Management page
const getAllCitizens = asyncHandler(async (req, res) => {
  if (req.user[0]?.role !== 'admin') {
    throw new ApiError(404, "Unauthorized access");
  }
  const [citizens] = await db.execute(`select user_id,full_name,mobile_number,email,aadhaar_number,created_at from users where role=?`, ['citizen']);
  return res.status(200).json(new ApiResponse(200, citizens, "Citizens fetched successfully"));
})

const getAllOfficers = asyncHandler(async (req, res) => {
  if (req.user[0]?.role !== 'admin') {
    throw new ApiError(404, "Unauthorized access");
  }
  const [officers] = await db.execute(`select user_id,full_name,mobile_number,email,aadhaar_number,created_at from users where role=?`, ['officer']);
  return res.status(200).json(new ApiResponse(200, officers, "Officers fetched successfully"));
})

const getAllAdmins = asyncHandler(async (req, res) => {
  if (req.user[0]?.role !== 'admin') {
    throw new ApiError(404, "Unauthorized access");
  }
  const [admins] = await db.execute(`select user_id,full_name,mobile_number,email,aadhaar_number,created_at from users where role=?`, ['admin']);
  return res.status(200).json(new ApiResponse(200, admins, "Admins fetched successfully"));
})


//To be shown in vehicle management page
const getAllRegisteredVehicles = asyncHandler(async (req, res) => {
  if (req.user[0]?.role !== 'admin') {
    throw new ApiError(404, "Unauthorized access");
  }
  const [vehicles] = await db.execute(`select * from vehicles`);
  return res.status(200).json(new ApiResponse(200, vehicles, "All vehicles fetched successfully"));
})

const getAllVehicleOwnershipDetails = asyncHandler(async (req, res) => {
  if (req.user[0]?.role !== 'admin') {
    throw new ApiError(404, "Unauthorized access");
  }
  const [ownershipDetails] = await db.execute(`select 
    ownership_id,ownership_start_date,ownership_end_date,user_id,vehicle_id,registration_number,chassis_number,engine_number,vehicle_class,fuel_type,manufacturer,model,registration_date,registration_valid_till,insurance_valid_till,full_name,mobile_number,email,aadhaar_number from vehicle_ownership natural join users natural join vehicles`)

  return res.status(200).json(new ApiResponse(200, ownershipDetails, "All vehicle ownership details fetched successfully"));
})

const getRtoRegisteredVehicles = asyncHandler(async (req, res) => {
  if (req.user[0]?.role !== 'admin') {
    throw new ApiError(404, "Unauthorized access");
  }
  
  const { rtoVehicleCode } = req.body;
  const [rtoVehicles] = await db.execute(`select * from vehicles v join rto r on v.rto_id=r.rto_id where rto_code=?`, [rtoVehicleCode]);
  if(rtoVehicles.length===0){
    throw new ApiError(400,"No vehicles exist for the rto code");
  }
  return res.status(200).json(new ApiResponse(200, rtoVehicles, "All vehicles belonging to rto code fetched successfully"));
})

const getRtoVehicleOwnershipDetails = asyncHandler(async (req, res) => {
  if (req.user[0]?.role !== 'admin') {
    throw new ApiError(404, "Unauthorized access");
  }
  const { rtoOwnershipCode } = req.body;
  console.log(req.body);
  const [rtoOwnershipDetails] = await db.execute(`select 
    ownership_id,ownership_start_date,ownership_end_date,user_id,vehicle_id,registration_number,chassis_number,engine_number,vehicle_class,fuel_type,manufacturer,model,registration_date,registration_valid_till,insurance_valid_till,full_name,mobile_number,email,aadhaar_number from vehicle_ownership natural join users natural join vehicles natural join rto where rto_code=?`, [rtoOwnershipCode])

  return res.status(200).json(new ApiResponse(200, rtoOwnershipDetails, "All vehicle ownership details fetched successfully"));
})

//Challan Management
const getAllChallans = asyncHandler(async (req, res) => {
  if (req.user[0]?.role !== 'admin') {
    throw new ApiError(404, "Unauthorized access");
  }
  const [allChallans] = await db.execute(`
  SELECT 
    c.challan_id,
    c.challan_number,
    c.violation_date,
    c.location,
    c.total_amount,
    c.status,

    v.registration_number AS vehicle_number,
    v.vehicle_class,
    v.model,

    dl.licence_number,

    u.full_name AS offender_name,
    u.mobile_number,

    vt.description AS violation,
    vt.penalty_amount,
    vt.offence_section

  FROM challan c
  JOIN vehicles v ON c.vehicle_id = v.vehicle_id
  JOIN driving_licence dl ON c.dl_id = dl.dl_id
  JOIN users u ON dl.user_id = u.user_id
  JOIN violation_types vt ON c.violation_type_id = vt.violation_type_id
  LEFT JOIN users officer ON c.issued_by = officer.user_id
  
  ORDER BY c.violation_date DESC
  
`);

  res.status(200).json(
    new ApiResponse(200, allChallans, "All Challans with corresponding driver and vehicle fetched successfully")
  );
});


const getChallansByStatus = asyncHandler(async (req, res) => {
  if (req.user[0]?.role !== 'admin') {
    throw new ApiError(404, "Unauthorized access");
  }
  const { status } = req.params;

  if (!["pending", "paid"].includes(status)) {
    throw new ApiError(400, "Invalid status");
  }
  const [allChallans] = await db.execute(`
  SELECT 
    c.challan_id,
    c.challan_number,
    c.violation_date,
    c.location,
    c.total_amount,
    c.status,

    v.registration_number AS vehicle_number,
    v.vehicle_class,
    v.model,

    dl.licence_number,

    u.full_name AS offender_name,
    u.mobile_number,

    vt.description AS violation,
    vt.penalty_amount,
    vt.offence_section

  FROM challan c
  JOIN vehicles v ON c.vehicle_id = v.vehicle_id
  JOIN driving_licence dl ON c.dl_id = dl.dl_id
  JOIN users u ON dl.user_id = u.user_id
  JOIN violation_types vt ON c.violation_type_id = vt.violation_type_id
  LEFT JOIN users officer ON c.issued_by = officer.user_id

  where c.status=?

  ORDER BY c.violation_date DESC
`, [status]);

  res.status(200).json(
    new ApiResponse(200, allChallans, `All Challans with ${status} status fetched successfully`)
  );
});

//Payment management
const getAllPayments = asyncHandler(async (req, res) => {
  if (req.user[0]?.role !== 'admin') {
    throw new ApiError(404, "Unauthorized access");
  }
  const [allPayments] = await db.execute(`SELECT 
    p.payment_id,
    p.amount,
    p.transaction_reference,
    p.payment_date,
    p.status AS payment_status,
    p.payment_mode,

    c.challan_id,
    c.challan_number,
    c.total_amount,
    c.status AS challan_status,

    u.user_id,
    u.full_name,
    u.mobile_number,
    u.email

    FROM payment p
    LEFT JOIN users u ON p.user_id = u.user_id
    LEFT JOIN challan c ON c.challan_id = p.related_challan_id
    ORDER BY p.payment_date DESC ;`)
  res.status(200).json(
    new ApiResponse(200, allPayments, `All payments fetched successfully`)
  );
});

const getPaymentsByStatus = asyncHandler(async (req, res) => {
  if (req.user[0]?.role !== 'admin') {
    throw new ApiError(404, "Unauthorized access");
  }
  const { status } = req.params;
  if (!["success", "failed"].includes(status)) {
    throw new ApiError(400, "Invalid status");
  }
  const [statusPayments] = await db.execute(`SELECT 
    p.payment_id,
    p.amount,
    p.transaction_reference,
    p.payment_date,
    p.status AS payment_status,
    p.payment_mode,

    c.challan_id,
    c.challan_number,
    c.total_amount,
    c.status AS challan_status,

    u.user_id,
    u.full_name,
    u.mobile_number,
    u.email

    FROM payment p
    LEFT JOIN users u ON p.user_id = u.user_id
    LEFT JOIN challan c ON c.challan_id = p.related_challan_id
    where p.status=?
    ORDER BY p.payment_date DESC ;`, [status]);
  res.status(200).json(
    new ApiResponse(200, statusPayments, `All payments with ${status} status fetched successfully`)
  );
});

const getTotalChallansCount = asyncHandler(async (req, res) => {
  if (req.user[0]?.role !== 'admin') {
    throw new ApiError(404, "Unauthorized access");
  }
  const [rows] = await db.execute(`select count(distinct challan_id) as challan_count from challan;`)
  const totalChallans = rows[0]?.challan_count || 0;

  return res.status(200).json(new ApiResponse(200, totalChallans, "Total Challans fetched successfully"))
})

const getTotalRevenue = asyncHandler(async (req, res) => {
  if (req.user[0]?.role !== 'admin') {
    throw new ApiError(404, "Unauthorized access");
  }
  const [rows] = await db.execute(`select sum(amount) as total_amount from payment;`)

  const totalAmount = rows[0]?.total_amount || 0;

  return res.status(200).json(new ApiResponse(200, totalAmount, "Total Challans fetched successfully"))

})

const getChallanCountByStatus = asyncHandler(async (req, res) => {
  if (req.user[0]?.role !== 'admin') {
    throw new ApiError(404, "Unauthorized access");
  }
  const { status } = req.params;
  console.log(status)
  if (!['pending', 'paid'].includes(status)) {
    throw new ApiError(400, "Invalid challan status");
  }
  const [rows] = await db.execute(`select count(distinct challan_id) as total_challan_count from challan where status=?;`, [status])

  console.log(rows);
  const totalAmount = rows[0]?.total_challan_count || 0;

  return res.status(200).json(new ApiResponse(200, totalAmount, "Total Challans fetched successfully"))
})

const getAllRtoOffices = asyncHandler(async (req, res) => {
  if (req.user[0]?.role !== 'admin') {
    throw new ApiError(404, "Unauthorized access");
  }
  const [offices] = await db.execute(`SELECT * FROM view_rto_offices`);
  console.log(offices);
  return res.status(200).json(new ApiResponse(200, offices, "All Offices fetched"));
})
const addRtoOffice = asyncHandler(async (req, res) => {
  if (req.user[0]?.role !== "admin") {
    throw new ApiError(403, "Unauthorized access");
  }
  console.log(req.body)
  const {
    rto_code,
    rto_name,
    state,
    district,
    address,
    contact_number,
  } = req.body;
  if (
    !rto_code ||
    !rto_name ||
    !state ||
    !district ||
    !address ||
    !contact_number
  ) {
    throw new ApiError(400, "All fields are required");
  }

  if (!/^[0-9]{10}$/.test(String(contact_number))) {
    throw new ApiError(400, "Invalid contact number (must be 10 digits)");
  }

  const [result] = await db.execute(
    `INSERT INTO rto 
    (rto_code, rto_name, state, district, address, contact_number)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [rto_code, rto_name, state, district, address, contact_number]
  );

  return res.status(201).json(
    new ApiResponse(201, {
      rto_id: result.insertId,
    }, "RTO Office added successfully")
  );
});
const addViolationType = asyncHandler(async (req, res) => {
  if (req.user[0]?.role !== "admin") {
    throw new ApiError(403, "Unauthorized access");
  }

  const { description, penalty_amount, offence_section } = req.body;

  if (!description || !penalty_amount || !offence_section) {
    throw new ApiError(400, "All fields are required");
  }

  if (isNaN(penalty_amount) || Number(penalty_amount) <= 0) {
    throw new ApiError(400, "Penalty amount must be a valid number");
  }

  const [existing] = await db.execute(
    "SELECT violation_type_id FROM violation_types WHERE description = ?",
    [description]
  );

  if (existing.length > 0) {
    throw new ApiError(400, "Violation already exists");
  }

  const [result] = await db.execute(
    `INSERT INTO violation_types 
     (description, penalty_amount, offence_section)
     VALUES (?, ?, ?)`,
    [description, penalty_amount, offence_section]
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      { violation_type_id: result.insertId },
      "Violation type added successfully"
    )
  );
});

const getAllAuditLogs=asyncHandler(async (req,res)=>{
  if (req.user[0]?.role !== "admin") {
    throw new ApiError(403, "Unauthorized access");
  }
  const [logs]=await db.execute(`select * from audit_logs`);
  if(logs.length==0){
    throw new ApiError(400,"No logs at present");
  }
  res.status(200).json(new ApiResponse(200,logs,"All logs fetched successfully"));
})
const filterAuditLogs = asyncHandler(async (req, res) => {
  const { table = "*", operation = "*" } = req.body;
  if (req.user[0]?.role !== "admin") {
    throw new ApiError(403, "Unauthorized access");
  }
  const [rows] = await db.execute(
    `CALL filter_audit_logs(?, ?)`,
    [table, operation]
  );
  const logs = rows[0]; 
  if (!logs.length) {
    throw new ApiError(404, "No logs found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, logs, "Filtered logs fetched"));
});
const deleteFilteredLogs = asyncHandler(async (req, res) => {
  const { table = "*", operation = "*" } = req.body;

  if (req.user[0]?.role !== "admin") {
    throw new ApiError(403, "Unauthorized access");
  }

  await db.execute(
    `CALL delete_filtered_logs(?, ?)`,
    [table, operation]
  );

  res
    .status(200)
    .json(new ApiResponse(200, null, "Logs deleted successfully"));
});
const deleteOldestLogs = asyncHandler(async (req, res) => {
  const { count } = req.body;

  if (req.user[0]?.role !== "admin") {
    throw new ApiError(403, "Unauthorized access");
  }

  if (!count || count <= 0) {
    throw new ApiError(400, "Invalid count value");
  }

  await db.execute(`CALL delete_n_oldest_logs(?)`, [count]);

  res
    .status(200)
    .json(new ApiResponse(200, null, `${count} oldest logs deleted`));
});
const deleteLogsBetweenDates = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.body;

  if (req.user[0]?.role !== "admin") {
    throw new ApiError(403, "Unauthorized access");
  }

  if (!startDate || !endDate) {
    throw new ApiError(400, "Start and end dates are required");
  }

  await db.execute(
    `CALL delete_logs_between_dates(?, ?)`,
    [startDate, endDate]
  );

  res
    .status(200)
    .json(new ApiResponse(200, null, "Logs deleted for given range"));
});
const countLogsBetweenDates = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.body;

  if (req.user[0]?.role !== "admin") {
    throw new ApiError(403, "Unauthorized access");
  }

  const [rows] = await db.execute(
    `SELECT count_logs_between_dates(?, ?) AS total`,
    [startDate, endDate]
  );

  res
    .status(200)
    .json(new ApiResponse(200, rows[0], "Log count fetched"));
});
export { getAllCitizens, getAllOfficers, getAllAdmins, getRtoVehicleOwnershipDetails, getRtoRegisteredVehicles, getAllRegisteredVehicles, getAllVehicleOwnershipDetails, getChallansByStatus, getAllChallans, getAllPayments, getPaymentsByStatus, getTotalChallansCount, getTotalRevenue, getChallanCountByStatus, getAllRtoOffices,addRtoOffice,addViolationType,getAllAuditLogs,filterAuditLogs,deleteFilteredLogs,deleteOldestLogs,deleteLogsBetweenDates,countLogsBetweenDates }
