-- Buat procedure untuk hapus sessions yang expired dan buat event untuk run procedure ini sehari sekali
CREATE PROCEDURE CLEAR_EXPIRED_SESSIONS()
BEGIN
  DELETE FROM signup_sessions         WHERE expires_at < NOW();
  DELETE FROM auth_sessions           WHERE expires_at < NOW();
  DELETE FROM password_reset_sessions WHERE expires_at < NOW();
END;

CREATE EVENT IF NOT EXISTS OLD_SESSION_CLEANUP
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
  CALL CLEAR_EXPIRED_SESSIONS();