CREATE TABLE audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(50),
    operation_type VARCHAR(10), -- INSERT / UPDATE / DELETE
    record_id INT,
    old_data JSON,
    new_data JSON,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
DELIMITER $$

CREATE TRIGGER users_after_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs(table_name, operation_type, record_id, new_data)
    VALUES (
        'users',
        'INSERT',
        NEW.user_id,
        JSON_OBJECT(
            'full_name', NEW.full_name,
            'email', NEW.email,
            'role', NEW.role
        )
    );
END $$
DELIMITER ;


DELIMITER $$

CREATE TRIGGER users_after_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs(table_name, operation_type, record_id, old_data, new_data)
    VALUES (
        'users',
        'UPDATE',
        NEW.user_id,
        JSON_OBJECT(
            'full_name', OLD.full_name,
            'email', OLD.email,
            'role', OLD.role
        ),
        JSON_OBJECT(
            'full_name', NEW.full_name,
            'email', NEW.email,
            'role', NEW.role
        )
    );
END $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER payment_after_update
AFTER UPDATE ON payment
FOR EACH ROW
BEGIN
    IF NEW.status = 'success' THEN
        UPDATE challan
        SET status = 'paid'
        WHERE challan_id = NEW.related_challan_id;
    END IF;
END $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER dl_before_update
BEFORE UPDATE ON driving_licence
FOR EACH ROW
BEGIN
    IF NEW.expiry_date < CURDATE() THEN
        SET NEW.status = 'EXPIRED';
    ELSE
        SET NEW.status = 'ACTIVE';
    END IF;
END $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER users_audit_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs(table_name, operation_type, record_id, new_data)
    VALUES (
        'users',
        'INSERT',
        NEW.user_id,
        JSON_OBJECT(
            'full_name', NEW.full_name,
            'email', NEW.email,
            'role', NEW.role
        )
    );
END $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER users_audit_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs(table_name, operation_type, record_id, old_data, new_data)
    VALUES (
        'users',
        'UPDATE',
        NEW.user_id,
        JSON_OBJECT(
            'full_name', OLD.full_name,
            'email', OLD.email,
            'role', OLD.role
        ),
        JSON_OBJECT(
            'full_name', NEW.full_name,
            'email', NEW.email,
            'role', NEW.role
        )
    );
END $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER users_audit_delete
AFTER DELETE ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs(table_name, operation_type, record_id, old_data)
    VALUES (
        'users',
        'DELETE',
        OLD.user_id,
        JSON_OBJECT(
            'full_name', OLD.full_name,
            'email', OLD.email,
            'role', OLD.role
        )
    );
END $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER vehicles_audit_insert
AFTER INSERT ON vehicles
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs(table_name, operation_type, record_id, new_data)
    VALUES (
        'vehicles',
        'INSERT',
        NEW.vehicle_id,
        JSON_OBJECT(
            'registration_number', NEW.registration_number,
            'model', NEW.model,
            'fuel_type', NEW.fuel_type
        )
    );
END $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER vehicles_audit_update
AFTER UPDATE ON vehicles
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs(table_name, operation_type, record_id, old_data, new_data)
    VALUES (
        'vehicles',
        'UPDATE',
        NEW.vehicle_id,
        JSON_OBJECT(
            'model', OLD.model,
            'fuel_type', OLD.fuel_type
        ),
        JSON_OBJECT(
            'model', NEW.model,
            'fuel_type', NEW.fuel_type
        )
    );
END $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER payment_audit_insert
AFTER INSERT ON payment
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs(table_name, operation_type, record_id, new_data)
    VALUES (
        'payment',
        'INSERT',
        NEW.payment_id,
        JSON_OBJECT(
            'amount', NEW.amount,
            'status', NEW.status,
            'mode', NEW.payment_mode
        )
    );
END $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER ownership_audit_insert
AFTER INSERT ON vehicle_ownership
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs(table_name, operation_type, record_id, new_data)
    VALUES (
        'vehicle_ownership',
        'INSERT',
        NEW.ownership_id,
        JSON_OBJECT(
            'vehicle_id', NEW.vehicle_id,
            'user_id', NEW.user_id
        )
    );
END $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER dl_audit_update
AFTER UPDATE ON driving_licence
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs(table_name, operation_type, record_id, old_data, new_data)
    VALUES (
        'driving_licence',
        'UPDATE',
        NEW.dl_id,
        JSON_OBJECT('status', OLD.status),
        JSON_OBJECT('status', NEW.status)
    );
END $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER documents_audit_insert
AFTER INSERT ON documents
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs(table_name, operation_type, record_id, new_data)
    VALUES (
        'documents',
        'INSERT',
        NEW.document_id,
        JSON_OBJECT(
            'type', NEW.document_type,
            'expiry_date', NEW.expiry_date
        )
    );
END $$

DELIMITER ;


DELIMITER $$

CREATE TRIGGER violation_types_audit_insert
AFTER INSERT ON violation_types
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs(table_name, operation_type, record_id, new_data)
    VALUES (
        'violation_types',
        'INSERT',
        NEW.violation_type_id,
        JSON_OBJECT(
            'description', NEW.description,
            'penalty_amount', NEW.penalty_amount,
            'offence_section', NEW.offence_section
        )
    );
END $$

DELIMITER ;
DELIMITER $$

CREATE TRIGGER violation_types_audit_update
AFTER UPDATE ON violation_types
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs(table_name, operation_type, record_id, old_data, new_data)
    VALUES (
        'violation_types',
        'UPDATE',
        NEW.violation_type_id,
        JSON_OBJECT(
            'description', OLD.description,
            'penalty_amount', OLD.penalty_amount,
            'offence_section', OLD.offence_section
        ),
        JSON_OBJECT(
            'description', NEW.description,
            'penalty_amount', NEW.penalty_amount,
            'offence_section', NEW.offence_section
        )
    );
END $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER violation_types_audit_delete
AFTER DELETE ON violation_types
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs(table_name, operation_type, record_id, old_data)
    VALUES (
        'violation_types',
        'DELETE',
        OLD.violation_type_id,
        JSON_OBJECT(
            'description', OLD.description,
            'penalty_amount', OLD.penalty_amount,
            'offence_section', OLD.offence_section
        )
    );
END $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER rto_audit_insert
AFTER INSERT ON rto
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs(table_name, operation_type, record_id, new_data)
    VALUES (
        'rto',
        'INSERT',
        NEW.rto_id,
        JSON_OBJECT(
            'rto_code', NEW.rto_code,
            'rto_name', NEW.rto_name,
            'state', NEW.state,
            'district', NEW.district
        )
    );
END $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER rto_audit_update
AFTER UPDATE ON rto
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs(table_name, operation_type, record_id, old_data, new_data)
    VALUES (
        'rto',
        'UPDATE',
        NEW.rto_id,
        JSON_OBJECT(
            'rto_code', OLD.rto_code,
            'rto_name', OLD.rto_name,
            'state', OLD.state,
            'district', OLD.district
        ),
        JSON_OBJECT(
            'rto_code', NEW.rto_code,
            'rto_name', NEW.rto_name,
            'state', NEW.state,
            'district', NEW.district
        )
    );
END $$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER rto_audit_delete
AFTER DELETE ON rto
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs(table_name, operation_type, record_id, old_data)
    VALUES (
        'rto',
        'DELETE',
        OLD.rto_id,
        JSON_OBJECT(
            'rto_code', OLD.rto_code,
            'rto_name', OLD.rto_name,
            'state', OLD.state,
            'district', OLD.district
        )
    );
END $$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE delete_n_oldest_logs(IN n INT)
BEGIN
    DELETE FROM audit_logs
    ORDER BY changed_at ASC
    LIMIT n;
END $$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE delete_logs_between_dates(
    IN start_date DATETIME,
    IN end_date DATETIME
)
BEGIN
    DELETE FROM audit_logs
    WHERE changed_at BETWEEN start_date AND end_date;
END $$

DELIMITER ;

DELIMITER $$

CREATE FUNCTION count_logs_between_dates(
    start_date DATETIME,
    end_date DATETIME
)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE total INT;

    SELECT COUNT(*) INTO total
    FROM audit_logs
    WHERE changed_at BETWEEN start_date AND end_date;

    RETURN total;
END $$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE filter_audit_logs(
    IN p_table VARCHAR(50),
    IN p_operation VARCHAR(10)
)
BEGIN
    SELECT *
    FROM audit_logs
    WHERE 
        (p_table = '*' OR table_name = p_table)
    AND 
        (p_operation = '*' OR operation_type = p_operation)
    ORDER BY changed_at DESC;
END $$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE delete_filtered_logs(
    IN p_table VARCHAR(50),
    IN p_operation VARCHAR(10)
)
BEGIN
    DELETE FROM audit_logs
    WHERE 
        (p_table = '*' OR table_name = p_table)
    AND 
        (p_operation = '*' OR operation_type = p_operation);
END $$

DELIMITER ;

-- View for RTO Offices
CREATE VIEW view_rto_offices AS
SELECT * FROM rto;

-- View for Violation Types
CREATE VIEW view_violation_types AS
SELECT * FROM violation_types;