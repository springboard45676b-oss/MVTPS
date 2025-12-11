# User Roles
USER_ROLES = (
    ('operator', 'Operator'),
    ('analyst', 'Analyst'),
    ('admin', 'Admin'),
)

# Vessel Types
VESSEL_TYPES = (
    ('cargo', 'Cargo Ship'),
    ('container', 'Container Ship'),
    ('tanker', 'Tanker'),
    ('bulk', 'Bulk Carrier'),
    ('passenger', 'Passenger Ship'),
    ('fishing', 'Fishing Vessel'),
    ('other', 'Other'),
)

# Voyage Status
VOYAGE_STATUS = (
    ('planned', 'Planned'),
    ('in_progress', 'In Progress'),
    ('completed', 'Completed'),
    ('cancelled', 'Cancelled'),
)

# Event Types
EVENT_TYPES = (
    ('departure', 'Departure'),
    ('arrival', 'Arrival'),
    ('port_call', 'Port Call'),
    ('delay', 'Delay'),
    ('weather', 'Weather Event'),
    ('maintenance', 'Maintenance'),
    ('other', 'Other'),
)

# Notification Types
NOTIFICATION_TYPES = (
    ('voyage_update', 'Voyage Update'),
    ('vessel_alert', 'Vessel Alert'),
    ('weather_warning', 'Weather Warning'),
    ('port_congestion', 'Port Congestion'),
    ('system', 'System Notification'),
)

# Priority Levels
PRIORITY_LEVELS = (
    ('low', 'Low'),
    ('medium', 'Medium'),
    ('high', 'High'),
    ('critical', 'Critical'),
)