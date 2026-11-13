const express = require('express');
const auth = require('../controllers/auth.controller');
const users = require('../controllers/users.controller');
const inventory = require('../controllers/inventory.controller');
const donations = require('../controllers/donations.controller');
const distributions = require('../controllers/distributions.controller');
const requests = require('../controllers/requests.controller');
const notifications = require('../controllers/notifications.controller');
const reports = require('../controllers/reports.controller');
const crud = require('../controllers/crud.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const ADMIN = 'Administrator';
const MANAGER = 'Manager';
const CAMP_MANAGER = 'Camp Manager';
const VOLUNTEER = 'Volunteer';
const DONOR = 'Donor';
const REFUGEE = 'Refugee';
const WAREHOUSE = 'Warehouse Officer';

router.post('/auth/login', auth.login);
router.use(authenticate);
router.get('/auth/me', auth.me);
router.patch('/auth/password', auth.changePassword);

router.get('/users', authorize(ADMIN), users.list);
router.get('/users/:id', authorize(ADMIN), users.get);
router.post('/users', authorize(ADMIN), users.create);
router.patch('/users/:id', authorize(ADMIN), users.update);

function resource(path, controller, writeRoles, options = {}) {
  router.get(path, controller.list);
  router.get(`${path}/:id`, controller.get);
  router.post(path, authorize(...writeRoles), controller.create);
  router.patch(`${path}/:id`, authorize(...writeRoles), controller.update);
  if (options.remove !== false) router.delete(`${path}/:id`, authorize(...writeRoles), controller.remove);
}

const roles = crud({ table: 'roles', id: 'role_id', fields: ['role_name'], required: ['role_name'], search: ['role_name'] });
router.get('/roles', roles.list);
router.get('/roles/:id', roles.get);

resource('/zones', crud({
  table: 'camp_zones', id: 'zone_id', fields: ['zone_name', 'description'], required: ['zone_name'], search: ['zone_name'],
}), [ADMIN, MANAGER]);
resource('/shelters', crud({
  table: 'shelters', id: 'shelter_id', fields: ['zone_id', 'shelter_number', 'capacity', 'status'],
  required: ['zone_id', 'shelter_number', 'capacity'], search: ['shelter_number'], filters: ['zone_id', 'status'],
}), [ADMIN, MANAGER]);
resource('/families', crud({
  table: 'families', id: 'family_id', fields: ['family_code', 'head_name', 'family_size', 'zone_id', 'shelter_id'],
  required: ['family_code', 'head_name'], search: ['family_code', 'head_name'], filters: ['zone_id', 'shelter_id'],
}), [ADMIN, MANAGER, CAMP_MANAGER, VOLUNTEER]);
resource('/refugees', crud({
  table: 'refugees', id: 'refugee_id',
  fields: ['refugee_code', 'family_id', 'first_name', 'last_name', 'gender', 'date_of_birth', 'nationality', 'country_of_origin', 'arrival_date', 'phone', 'special_needs', 'status'],
  required: ['refugee_code', 'family_id', 'first_name', 'last_name', 'arrival_date'],
  search: ['refugee_code', 'first_name', 'last_name', 'nationality'], filters: ['family_id', 'status'],
}), [ADMIN, MANAGER, VOLUNTEER]);

resource('/resource-categories', crud({
  table: 'resource_categories', id: 'category_id', fields: ['category_name', 'description'], required: ['category_name'], search: ['category_name'],
}), [ADMIN, MANAGER, CAMP_MANAGER, VOLUNTEER]);
resource('/resources', crud({
  table: 'resources', id: 'resource_id', fields: ['category_id', 'resource_name', 'unit', 'minimum_stock', 'description', 'is_active'],
  required: ['category_id', 'resource_name', 'unit'], search: ['resource_name'], filters: ['category_id', 'is_active'],
}), [ADMIN, MANAGER, VOLUNTEER]);
resource('/donors', crud({
  table: 'donors', id: 'donor_id', fields: ['donor_name', 'donor_type', 'contact_person', 'phone', 'email', 'address'],
  required: ['donor_name', 'donor_type'], search: ['donor_name', 'contact_person', 'email'], filters: ['donor_type'],
}), [ADMIN, MANAGER]);

router.get('/inventory', inventory.list);
router.patch('/inventory/:resourceId/adjust', authorize(ADMIN, VOLUNTEER, WAREHOUSE), inventory.adjust);
router.get('/stock-movements', authorize(ADMIN, MANAGER, VOLUNTEER, WAREHOUSE), inventory.movements);

router.get('/donations', authorize(ADMIN, MANAGER, DONOR), donations.list);
router.get('/donations/:id', authorize(ADMIN, MANAGER, DONOR), donations.get);
router.post('/donations', authorize(ADMIN, MANAGER, DONOR, WAREHOUSE), donations.create);

router.get('/resource-requests', authorize(ADMIN, CAMP_MANAGER, MANAGER, VOLUNTEER, DONOR), requests.list);
router.get('/resource-requests/:id', authorize(ADMIN, CAMP_MANAGER, MANAGER, VOLUNTEER, DONOR), requests.get);
router.post('/resource-requests', authorize(ADMIN, CAMP_MANAGER, MANAGER, VOLUNTEER), requests.create);
router.patch('/resource-requests/:id/review', authorize(ADMIN, CAMP_MANAGER, MANAGER), requests.review);

router.get('/distributions', authorize(ADMIN, CAMP_MANAGER, MANAGER, VOLUNTEER), distributions.list);
router.get('/distributions/:id', authorize(ADMIN, CAMP_MANAGER, MANAGER, VOLUNTEER), distributions.get);
router.post('/distributions', authorize(ADMIN, CAMP_MANAGER, MANAGER, VOLUNTEER, WAREHOUSE), distributions.create);

router.get('/notifications', notifications.list);
router.post('/notifications', authorize(ADMIN, MANAGER), notifications.create);
router.patch('/notifications/read-all', notifications.markAllRead);
router.patch('/notifications/:id/read', notifications.markRead);

router.get('/reports/dashboard', authorize(ADMIN, MANAGER), reports.dashboard);
router.get('/reports/inventory', authorize(ADMIN, MANAGER, WAREHOUSE), reports.inventory);
router.get('/reports/distributions', authorize(ADMIN, MANAGER), reports.distributions);
router.get('/reports/donations', authorize(ADMIN, MANAGER), reports.donations);

const audits = crud({
  table: 'audit_logs', id: 'log_id', fields: [], search: ['action', 'table_name'], filters: ['user_id', 'table_name'],
});
router.get('/audit-logs', authorize(ADMIN), audits.list);
router.get('/audit-logs/:id', authorize(ADMIN), audits.get);

module.exports = router;
