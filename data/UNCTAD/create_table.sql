-- PostgreSQL table for UNCTAD port calls data
CREATE TABLE unctad_port_calls (
    id SERIAL PRIMARY KEY,
    port_name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    port_calls BIGINT NOT NULL,
    avg_time_spent_hours FLOAT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_unctad_port_calls_country ON unctad_port_calls(country);
CREATE INDEX idx_unctad_port_calls_year ON unctad_port_calls(year);
CREATE INDEX idx_unctad_port_calls_port_name ON unctad_port_calls(port_name);

-- Add comments for documentation
COMMENT ON TABLE unctad_port_calls IS 'UNCTAD maritime port calls and performance statistics';
COMMENT ON COLUMN unctad_port_calls.id IS 'Primary key, auto-increment';
COMMENT ON COLUMN unctad_port_calls.port_name IS 'Name of the port';
COMMENT ON COLUMN unctad_port_calls.country IS 'Country where the port is located';
COMMENT ON COLUMN unctad_port_calls.year IS 'Year of the data';
COMMENT ON COLUMN unctad_port_calls.port_calls IS 'Number of port calls (supports large numbers)';
COMMENT ON COLUMN unctad_port_calls.avg_time_spent_hours IS 'Average time spent in port in hours (nullable)';