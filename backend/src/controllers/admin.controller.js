import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import {db }from '../database/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

//To be shown in User Management page
const getAllCitizens =asyncHandler(async (req,res)=>{
  if(req.user[0]?.role!=='admin'){
    throw new ApiError(404,"Unauthorized access");
  }
  const [citizens]=await db.execute(`select user_id,full_name,mobile_number,email,aadhaar_number,created_at from users where role=?`,['citizen']);
  return res.status(200).json(new ApiResponse (200,citizens,"Citizens fetched successfully"));
})

const getAllOfficers =asyncHandler(async (req,res)=>{
  if(req.user[0]?.role!=='admin'){
    throw new ApiError(404,"Unauthorized access");
  }
  const [officers]=await db.execute(`select user_id,full_name,mobile_number,email,aadhaar_number,created_at from users where role=?`,['officer']);
  return res.status(200).json(new ApiResponse (200,officers,"Officers fetched successfully"));
})

const getAllAdmins =asyncHandler(async (req,res)=>{
  if(req.user[0]?.role!=='admin'){
    throw new ApiError(404,"Unauthorized access");
  }
  const [admins]=await db.execute(`select user_id,full_name,mobile_number,email,aadhaar_number,created_at from users where role=?`,['admin']);
  return res.status(200).json(new ApiResponse (200,admins,"Admins fetched successfully"));
})


//To be shown in vehicle management page
const getAllRegisteredVehicles =asyncHandler(async (req,res)=>{
  if(req.user[0]?.role!=='admin'){
    throw new ApiError(404,"Unauthorized access");
  }
  const [vehicles]=await db.execute(`select * from vehicles`);
  return res.status(200).json(new ApiResponse (200,vehicles,"All vehicles fetched successfully"));
})

const getAllVehicleOwnershipDetails=asyncHandler(async (req,res)=>{
  if(req.user[0]?.role!=='admin'){
    throw new ApiError(404,"Unauthorized access");
  }
  const [ownershipDetails]=await db.execute(`select 
    ownership_id,ownership_start_date,ownership_end_date,user_id,vehicle_id,registration_number,chassis_number,engine_number,vehicle_class,fuel_type,manufacturer,model,registration_date,registration_valid_till,insurance_valid_till,full_name,mobile_number,email,aadhaar_number from vehicle_ownership natural join users natural join vehicles`)
  
  return res.status(200).json(new ApiResponse (200,ownershipDetails,"All vehicle ownership details fetched successfully"));
})

const getRtoRegisteredVehicles =asyncHandler(async (req,res)=>{
  if(req.user[0]?.role!=='admin'){
    throw new ApiError(404,"Unauthorized access");
  }
  const {rtoCode}=req.body;
  const [rtoVehicles]=await db.execute(`select * from vehicles v join rto r on v.rto_id=r.rto_id where rto_code=?`,[rtoCode]);
  return res.status(200).json(new ApiResponse (200,rtoVehicles,"All vehicles belonging to rto code fetched successfully"));
})

const getRtoVehicleOwnershipDetails=asyncHandler(async (req,res)=>{
  if(req.user[0]?.role!=='admin'){
    throw new ApiError(404,"Unauthorized access");
  }
  const {rtoCode}=req.body;

  const [rtoOwnershipDetails]=await db.execute(`select 
    ownership_id,ownership_start_date,ownership_end_date,user_id,vehicle_id,registration_number,chassis_number,engine_number,vehicle_class,fuel_type,manufacturer,model,registration_date,registration_valid_till,insurance_valid_till,full_name,mobile_number,email,aadhaar_number from vehicle_ownership natural join users natural join vehicles natural join rto where rto_code=?`,[rtoCode])
  
  return res.status(200).json(new ApiResponse (200,rtoOwnershipDetails,"All vehicle ownership details fetched successfully"));
})

//Challan Management
const getAllChallans = asyncHandler(async (req, res) => {
  if(req.user[0]?.role!=='admin'){
    throw new ApiError(404,"Unauthorized access");
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
    new ApiResponse(200,allChallans,"All Challans with corresponding driver and vehicle fetched successfully")
  );
});


const getChallansByStatus = asyncHandler(async (req, res) => {
  if(req.user[0]?.role!=='admin'){
    throw new ApiError(404,"Unauthorized access");
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
`,[status]);

  res.status(200).json(
    new ApiResponse(200,allChallans,`All Challans with ${status} status fetched successfully`)
  );
});

//Payment management
const getAllPayments =asyncHandler(async (req,res)=>{
  if(req.user[0]?.role!=='admin'){
    throw new ApiError(404,"Unauthorized access");
  }
  const [allPayments]=await db.execute(`SELECT 
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
    new ApiResponse(200,allPayments,`All payments fetched successfully`)
  );
});

const getPaymentsByStatus =asyncHandler(async (req,res)=>{
  if(req.user[0]?.role!=='admin'){
    throw new ApiError(404,"Unauthorized access");
  }
  const {status}=req.params;
  if (!["success", "failed"].includes(status)) {
    throw new ApiError(400, "Invalid status");
  }
  const [statusPayments]=await db.execute(`SELECT 
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
    ORDER BY p.payment_date DESC ;`,[status]);
  res.status(200).json(
    new ApiResponse(200,statusPayments,`All payments with ${status} status fetched successfully`)
  );
});
export {getAllCitizens,getAllOfficers,getAllAdmins,getRtoVehicleOwnershipDetails,getRtoRegisteredVehicles,getAllRegisteredVehicles,getAllVehicleOwnershipDetails,getChallansByStatus,getAllChallans,getAllPayments,getPaymentsByStatus}
