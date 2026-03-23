export const upsertDocument = async ({
  userId,
  vehicleId = null,
  type,
  number,
  url
}) => {
  const [existing] = await db.execute(
    `SELECT document_id FROM documents 
     WHERE user_id = ? AND document_type = ? 
     ${vehicleId ? "AND vehicle_id = ?" : "AND vehicle_id IS NULL"}`,
    vehicleId ? [userId, type, vehicleId] : [userId, type]
  );

  if (existing.length > 0) {
    await db.execute(
      `UPDATE documents 
       SET document_number = ?, file_url = ?
       WHERE document_id = ?`,
      [number, url, existing[0].document_id]
    );
  } else {
    await db.execute(
      `INSERT INTO documents (user_id, vehicle_id, document_type, document_number, file_url)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, vehicleId, type, number, url]
    );
  }
};