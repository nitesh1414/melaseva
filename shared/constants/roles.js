// User Roles
const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  EVENT_ADMIN: 'EVENT_ADMIN',
  CONTROL_ROOM_OPERATOR: 'CONTROL_ROOM_OPERATOR',
  DEPARTMENT_ADMIN: 'DEPARTMENT_ADMIN',
  DEPARTMENT_OFFICER: 'DEPARTMENT_OFFICER',
  FIELD_STAFF: 'FIELD_STAFF',
  SURVEYOR: 'SURVEYOR',
  MIS_EXECUTIVE: 'MIS_EXECUTIVE',
};

// Role permissions mapping
const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: ['*'],
  [ROLES.EVENT_ADMIN]: [
    'event:manage', 'asset:manage', 'complaint:manage', 'complaint:assign',
    'facility:manage', 'user:manage', 'report:view', 'dashboard:view',
    'department:manage', 'category:manage', 'slarule:manage'
  ],
  [ROLES.CONTROL_ROOM_OPERATOR]: [
    'complaint:view', 'complaint:assign', 'complaint:reassign',
    'complaint:escalate', 'complaint:close', 'complaint:reject',
    'dashboard:view', 'map:view', 'report:view'
  ],
  [ROLES.DEPARTMENT_ADMIN]: [
    'complaint:view_department', 'complaint:assign_department',
    'user:manage_department', 'report:view_department', 'dashboard:view'
  ],
  [ROLES.DEPARTMENT_OFFICER]: [
    'complaint:view_assigned', 'complaint:update', 'complaint:resolve',
    'complaint:escalate'
  ],
  [ROLES.FIELD_STAFF]: [
    'complaint:view_assigned', 'complaint:update', 'complaint:resolve'
  ],
  [ROLES.SURVEYOR]: [
    'asset:create', 'asset:update', 'asset:verify',
    'qr:assign', 'survey:manage'
  ],
  [ROLES.MIS_EXECUTIVE]: [
    'complaint:view', 'complaint:assign', 'dashboard:view',
    'report:view', 'map:view'
  ],
};

module.exports = { ROLES, ROLE_PERMISSIONS };
