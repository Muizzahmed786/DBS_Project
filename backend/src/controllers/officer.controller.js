import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { db } from '../database/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import generateChallanNo from '../utils/challanNo.js';
import generateLicenceNumber from '../utils/licenceNo.js';

const getMyIssuedChallans = asyncHandler(async (req, res) => {
  if (req.user[0].role != 'officer') {
    throw new ApiError(400, "Unauthorized request");
  }
  const [challans] = await db.execute(`SELECT 
    c.challan_id,
    c.violation_date,
    c.status,
    c.total_amount,
    c.location,

    vt.description,
    
    v.registration_number,
    v.vehicle_class,
    
    dl.licence_number,
    
    u.user_id,
    u.full_name,
    u.mobile_number

    FROM challan c
    JOIN violation_types vt 
    ON c.violation_type_id = vt.violation_type_id
    JOIN vehicles v 
    ON c.vehicle_id = v.vehicle_id
    JOIN driving_licence dl 
    ON dl.dl_id = c.dl_id
    JOIN users u 
    ON dl.user_id = u.user_id

    WHERE c.issued_by = ?
    ORDER BY issue_date desc;`, [req.user[0].user_id]);
    console.log(challans)
  return res.status(200).json(new ApiResponse(200, challans, "All challans issued by me fetched"));
})
const issueChallan = asyncHandler(async (req, res) => {
  if (req.user[0].role != 'officer') {
    throw new ApiError(400, "Unauthorized request");
  }
  const { registrationNo, licenceNo, violationDesc, offenceSection, location } = req.body;
  if (!licenceNo && !registrationNo) {
    throw new ApiError(400, "Insufficient details to issue an challan");
  }
  if (licenceNo && !registrationNo) {
    throw new ApiError(400, "Licence not sufficient to issue an challan");
  }
  if (!(violationDesc || offenceSection)) {
    throw new ApiError(400, "Insufficient violation details");
  }
  let amount, violationId = -1;
  if (offenceSection) {
    const [rows] = await db.execute('select violation_type_id,penalty_amount as amt from violation_types where offence_section=?', [offenceSection]);
    if (rows.length === 0) {
      throw new ApiError(400, "Violation details could not be fetched");
    }
    violationId = rows[0].violation_type_id;
    amount = rows[0].amt;
  }
  else {
    const [rows] = await db.execute('select violation_type_id,penalty_amount as amt from violation_types where description=?', [violationDesc]);
    if (rows.length === 0) {
      throw new ApiError(400, "Violation details could not be fetched");
    }
    violationId = rows[0].violation_type_id;
    amount = rows[0].amt;
  }

  let offenderDetails, flag = 0;
  if (licenceNo) { // if this executes i also have reg no
    const [citizenDetails] = await db.execute(`select user_id,dl_id from driving_licence dl where licence_number=? and user_id in (select user_id from vehicle_ownership vo join vehicles v on vo.vehicle_id=v.vehicle_id and registration_number=?);`, [licenceNo, registrationNo]);

    if (citizenDetails.length === 0) {
      //driver might be using vehicle not owned by him so  we issue challan to vehicle owner
      flag = 1;
    }
    if (flag !== 1) {
      const [rows] = await db.execute('select vehicle_id from vehicles where registration_number=?', [registrationNo]);

      if (rows.length == 0) {
        throw new ApiError(400, "Vehicle could not be fetched");
      }
      const vehicleId = rows[0].vehicle_id;

      const [insertedOffender] = await db.execute(`insert into challan (challan_number,vehicle_id,dl_id,violation_type_id,location,issued_by,total_amount,status) values (?,?,?,?,?,?,?,?);`, [generateChallanNo(), vehicleId, citizenDetails[0].dl_id, violationId, location, req.user[0].user_id, amount, 'pending']);

      offenderDetails = await db.execute(`select * from challan where challan_id=?`, [insertedOffender.insertId]);
    }
  }
  else if (flag === 1 || (!licenceNo)) { // i dont have lic but can still find using reg no
    const [citizenDetails] = await db.execute(`select vo.user_id,v.vehicle_id,dl.dl_id from vehicles v 
      join vehicle_ownership vo on v.vehicle_id=vo.vehicle_id
      join driving_licence dl on dl.user_id=vo.user_id where registration_number=?;`, [registrationNo]);

    const vehicleId = citizenDetails[0].vehicle_id;

    const [insertedOffender] = await db.execute(`insert into challan (challan_number,vehicle_id,dl_id,violation_type_id,location,issued_by,total_amount,status) values (?,?,?,?,?,?,?,?);`, [generateChallanNo(), vehicleId, citizenDetails[0].dl_id, violationId, location, req.user[0].user_id, amount, 'pending']);

    offenderDetails = await db.execute(`select * from challan where challan_id=?`, [insertedOffender.insertId]);
  }
  return res.status(200).json(new ApiResponse(200, offenderDetails[0], "Challan issued successfully"));
})

const issueDrivingLicence = asyncHandler(async (req, res) => {
  if (req.user[0].role !== "officer") {
    throw new ApiError(403, "Unauthorized request");
  }

  const { rtoId, email, mobile, vehicle_categories, validity_years } = req.body;

  if (!rtoId || (!email && !mobile) || !vehicle_categories) {
    throw new ApiError(400, "Missing required fields");
  }

  let userQuery = "";
  let value = "";

  if (email) {
    userQuery = "SELECT user_id FROM users WHERE email = ?";
    value = email;
  } else {
    userQuery = "SELECT user_id FROM users WHERE mobile_number = ?";
    value = mobile;
  }

  const [userResult] = await db.execute(userQuery, [value]);

  if (userResult.length === 0) {
    throw new ApiError(404, "User not found");
  }

  const user_id = userResult[0].user_id;

  const licence_number = generateLicenceNumber(rtoId);


  const issue_date = new Date();

  const expiry_date = new Date(issue_date);

  // ✅ FIX: force number
  const years = Number(validity_years) || 20;

  expiry_date.setFullYear(issue_date.getFullYear() + years);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const [existing] = await db.execute(
    "SELECT dl_id FROM driving_licence WHERE user_id = ? AND status = 'valid'", [user_id]
  );
  if (existing.length > 0) throw new ApiError(400, "Active licence already exists for this user");
  const formatted_issue = formatDate(issue_date);
  const formatted_expiry = formatDate(expiry_date);
  const [result] = await db.execute(
    `INSERT INTO driving_licence 
    (licence_number, user_id, issue_date, expiry_date, issuing_rto_id, vehicle_categories, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      licence_number,
      user_id,
      formatted_issue,
      formatted_expiry,
      rtoId,
      vehicle_categories,
      "valid",
    ]
  );

  const response = {
    dl_id: result.insertId,
    licence_number,
    user_id,
    issue_date: formatted_issue,
    expiry_date: formatted_expiry,
    issuing_rto_id: rtoId,
    vehicle_categories,
    status: "valid",
  };

  return res
    .status(201)
    .json(new ApiResponse(201, response, "DL issued successfully"));
});

const getMyIssuedChallanCount = asyncHandler(async (req, res) => {
  if (req.user[0].role != 'officer') {
    throw new ApiError(400, "Unauthorized request");
  }
  const [rows] = await db.execute('select count(distinct challan_id) as count from challan where issued_by=?', [req.user[0].user_id])
  const count = rows[0]?.count || 0;
  res.status(200).json(new ApiResponse(200, count, "Count fetched successfully"))
})
const getIssuedDlCountByRto = asyncHandler(async (req, res) => {
  if (req.user[0].role != 'officer') {
    throw new ApiError(400, "Unauthorized request");
  }
  const { rtoId } = req.params;
  const [rows] = await db.execute('select count(distinct dl_id) as count from driving_licence where issuing_rto_id=?', [rtoId])
  const count = rows[0]?.count || 0;
  res.status(200).json(new ApiResponse(200, count, "Count fetched successfully"))
})
const getTotalFineCollected = asyncHandler(async (req, res) => {
  if (req.user[0].role !== "officer") {
    throw new ApiError(403, "Unauthorized request");
  }

  const [rows] = await db.execute(
    `SELECT SUM(total_amount) AS total 
     FROM challan 
     WHERE issued_by = ? AND status = 'paid'`,
    [req.user[0].user_id]
  );

  const total = rows[0]?.total || 0;

  res.status(200).json(new ApiResponse(200, total, "Total fine collected"));
});
const getChallanStatusStats = asyncHandler(async (req, res) => {
  if (req.user[0].role !== "officer") {
    throw new ApiError(403, "Unauthorized request");
  }

  const [rows] = await db.execute(
    `SELECT status, COUNT(*) as count
     FROM challan
     WHERE issued_by = ?
     GROUP BY status`,
    [req.user[0].user_id]
  );

  res.status(200).json(new ApiResponse(200, rows, "Challan status stats"));
});
const getTopViolations = asyncHandler(async (req, res) => {
  if (req.user[0].role !== "officer") {
    throw new ApiError(403, "Unauthorized request");
  }

  const [rows] = await db.execute(
    `SELECT vt.description, COUNT(*) as count
     FROM challan c
     JOIN violation_types vt 
     ON c.violation_type_id = vt.violation_type_id
     WHERE c.issued_by = ?
     GROUP BY vt.description
     ORDER BY count DESC
     LIMIT 5`,
    [req.user[0].user_id]
  );

  res.status(200).json(new ApiResponse(200, rows, "Top violations"));
});
export { getMyIssuedChallans, getMyIssuedChallanCount, getIssuedDlCountByRto, issueChallan, issueDrivingLicence,getTotalFineCollected,getChallanStatusStats,getTopViolations}
