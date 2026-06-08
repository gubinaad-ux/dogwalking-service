-- Триггер для автоматической установки статуса бронирования
CREATE OR REPLACE FUNCTION default_pending()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.book_status IS NULL OR TRIM(NEW.book_status) = '' THEN
        NEW.book_status := 'pending';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_default_status ON booking;

CREATE TRIGGER set_default_status
BEFORE INSERT ON booking
FOR EACH ROW
EXECUTE FUNCTION default_pending();

-- Триггер для имени собаки
CREATE OR REPLACE FUNCTION check_dog_name()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.dog_name IS NULL OR TRIM(NEW.dog_name) = '' THEN
        NEW.dog_name = 'Безымянный';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_dog_has_name
BEFORE INSERT ON dog
FOR EACH ROW
EXECUTE FUNCTION check_dog_name();

-- Хранимая процедура завершения выгула
CREATE OR REPLACE PROCEDURE finish_walk(IN p_booking_id INTEGER)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE booking
    SET book_status = 'Выполнено'
    WHERE booking_id = p_booking_id;
    
    UPDATE dogwalker
    SET d_walker_rating = d_walker_rating + 0.1
    WHERE d_walker_id = (
        SELECT d_walker_id 
        FROM booking 
        WHERE booking_id = p_booking_id
    )
    AND d_walker_rating < 5.0;
    
    COMMIT;
END;
$$;