const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Event = require('../models/Event');
const Department = require('../models/Department');
const Asset = require('../models/Asset');
const Facility = require('../models/Facility');
const { Zone, Sector, Road } = require('../models/ZoneSectorRoad');
const { ComplaintCategory, SLARule, SMSTemplate } = require('../models/Masters');
const { ROLES } = require('../../../shared/constants/roles');
const { COMPLAINT_PRIORITY, FACILITY_TYPES } = require('../../../shared/constants');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/melaseva';

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      Department.deleteMany({}),
      Asset.deleteMany({}),
      Facility.deleteMany({}),
      Zone.deleteMany({}),
      Sector.deleteMany({}),
      Road.deleteMany({}),
      ComplaintCategory.deleteMany({}),
      SLARule.deleteMany({}),
      SMSTemplate.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create Super Admin
    const superAdmin = new User({
      name: 'Super Admin',
      email: 'admin@melaseva.com',
      mobile: '9999999999',
      password: 'Admin@123',
      role: ROLES.SUPER_ADMIN,
      status: 'ACTIVE',
    });
    await superAdmin.save();
    console.log('Created Super Admin');

    // Create Sample Event - Mela 2026
    const event = new Event({
      name: 'Mela Seva 2026',
      code: 'MELA2026',
      description: 'Annual religious fair and public event',
      startDate: new Date('2026-01-15'),
      endDate: new Date('2026-02-15'),
      state: 'Madhya Pradesh',
      district: 'Indore',
      location: {
        address: 'Mela Ground, Indore',
        latitude: 22.7196,
        longitude: 75.8577,
      },
      boundary: {
        type: 'Polygon',
        coordinates: [[
          [75.850, 22.715],
          [75.865, 22.715],
          [75.865, 22.725],
          [75.850, 22.725],
          [75.850, 22.715],
        ]],
      },
      contactInfo: {
        phone: '0731-1234567',
        email: 'info@melaseva2026.gov.in',
        emergencyNumbers: ['100', '101', '102'],
      },
      status: 'ACTIVE',
      settings: {
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'hi'],
        enableSMS: true,
        enablePushNotifications: true,
      },
      createdBy: superAdmin._id,
    });
    await event.save();
    console.log('Created Event: Mela Seva 2026');

    // Create Zones
    const zone1 = await Zone.create({
      name: 'Zone A - Main Area',
      code: 'ZA',
      event: event._id,
      center: { type: 'Point', coordinates: [75.8577, 22.7196] },
      createdBy: superAdmin._id,
    });
    const zone2 = await Zone.create({
      name: 'Zone B - North Extension',
      code: 'ZB',
      event: event._id,
      center: { type: 'Point', coordinates: [75.860, 22.722] },
      createdBy: superAdmin._id,
    });
    console.log('Created Zones');

    // Create Sectors
    const sectors = [];
    for (let i = 1; i <= 5; i++) {
      const sector = await Sector.create({
        name: `Sector ${String(i).padStart(2, '0')}`,
        code: `S${String(i).padStart(2, '0')}`,
        event: event._id,
        zone: i <= 3 ? zone1._id : zone2._id,
        createdBy: superAdmin._id,
      });
      sectors.push(sector);
    }
    console.log('Created Sectors');

    // Create Roads
    const roadNames = ['Main Road', 'Temple Road', 'Market Road', 'Parking Road', 'Ghat Road', 'North Road', 'South Road'];
    const roads = [];
    for (const name of roadNames) {
      const road = await Road.create({
        name,
        code: name.substring(0, 3).toUpperCase(),
        event: event._id,
        sector: sectors[Math.floor(Math.random() * sectors.length)]._id,
        createdBy: superAdmin._id,
      });
      roads.push(road);
    }
    console.log('Created Roads');

    // Create Departments
    const deptData = [
      { name: 'Electricity', code: 'ELEC' },
      { name: 'Water', code: 'WATER' },
      { name: 'Police', code: 'POLICE' },
      { name: 'Medical', code: 'MEDICAL' },
      { name: 'Sanitation', code: 'SANIT' },
      { name: 'Fire', code: 'FIRE' },
      { name: 'Transport', code: 'TRANS' },
      { name: 'Municipal Services', code: 'MUNICIPAL' },
    ];
    const departments = [];
    for (const d of deptData) {
      const dept = await Department.create({
        name: d.name,
        code: d.code,
        event: event._id,
        defaultSLA: { CRITICAL: 0.5, HIGH: 1, MEDIUM: 4, LOW: 24 },
        createdBy: superAdmin._id,
      });
      departments.push(dept);
    }
    console.log('Created Departments');

    // Create Users
    const users = [
      { name: 'Rajesh Kumar', role: ROLES.EVENT_ADMIN, dept: departments[0] },
      { name: 'Priya Sharma', role: ROLES.CONTROL_ROOM_OPERATOR, dept: departments[0] },
      { name: 'Amit Singh', role: ROLES.CONTROL_ROOM_OPERATOR, dept: null },
      { name: 'Sunita Devi', role: ROLES.DEPARTMENT_ADMIN, dept: departments[1] },
      { name: 'Vikram Patel', role: ROLES.DEPARTMENT_OFFICER, dept: departments[0] },
      { name: 'Neha Gupta', role: ROLES.DEPARTMENT_OFFICER, dept: departments[1] },
      { name: 'Rahul Verma', role: ROLES.FIELD_STAFF, dept: departments[2] },
      { name: 'Kavita Joshi', role: ROLES.SURVEYOR, dept: departments[7] },
      { name: 'Manoj Tiwari', role: ROLES.MIS_EXECUTIVE, dept: null },
      { name: 'Anita Dubey', role: ROLES.DEPARTMENT_OFFICER, dept: departments[4] },
    ];
    const createdUsers = [];
    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      const user = new User({
        name: u.name,
        email: `${u.name.toLowerCase().replace(' ', '.')}@melaseva.com`,
        mobile: `9876543${String(200 + i).padStart(3, '0')}`,
        password: 'User@123',
        role: u.role,
        department: u.dept ? u.dept._id : null,
        event: event._id,
        employeeId: `EMP${String(1000 + i)}`,
        status: 'ACTIVE',
        createdBy: superAdmin._id,
      });
      await user.save();
      createdUsers.push(user);
    }
    console.log('Created Users');

    // Create Complaint Categories
    const categories = {
      ELECTRICITY: ['Pole damaged', 'Pole leaning', 'Wire broken', 'Wire hanging', 'No electricity', 'Spark/fire', 'Transformer issue', 'Street light not working'],
      WATER: ['Water leakage', 'No water supply', 'Water contamination'],
      SANITATION: ['Toilet unclean', 'Garbage not collected', 'Drainage blocked'],
      POLICE: ['Theft', 'Harassment', 'Crowd control'],
      MEDICAL: ['Medical emergency', 'First aid needed'],
      FIRE: ['Fire hazard', 'Active fire'],
      TRANSPORT: ['Parking issue', 'Traffic problem'],
    };
    for (const [deptCode, cats] of Object.entries(categories)) {
      const dept = departments.find(d => d.code === deptCode);
      if (!dept) continue;
      for (const catName of cats) {
        await ComplaintCategory.create({
          name: catName,
          department: dept._id,
          event: event._id,
          defaultPriority: COMPLAINT_PRIORITY.MEDIUM,
          createdBy: superAdmin._id,
        });
      }
    }
    console.log('Created Complaint Categories');

    // Create SLA Rules
    for (const dept of departments) {
      for (const [priority, hours] of Object.entries({ CRITICAL: 0.5, HIGH: 1, MEDIUM: 4, LOW: 24 })) {
        await SLARule.create({
          event: event._id,
          department: dept._id,
          priority,
          slaHours: hours,
          warningThreshold: 75,
          autoEscalate: true,
          createdBy: superAdmin._id,
        });
      }
    }
    console.log('Created SLA Rules');

    // Create Assets (50 demo assets)
    const assetTypes = ['ELECTRICAL_POLE', 'STREET_LIGHT', 'DISTRIBUTION_BOX', 'WATER_POINT', 'TRANSFORMER'];
    const assets = [];
    for (let i = 0; i < 50; i++) {
      const type = assetTypes[i % assetTypes.length];
      const lat = 22.715 + Math.random() * 0.01;
      const lng = 75.850 + Math.random() * 0.015;
      const sector = sectors[Math.floor(Math.random() * sectors.length)];
      const road = roads[Math.floor(Math.random() * roads.length)];
      const dept = departments.find(d => d.code === 'ELEC') || departments[0];

      const asset = new Asset({
        assetId: `MELA2026-${type.substring(0, 3)}-${String(i + 1).padStart(4, '0')}`,
        assetType: type,
        assetNumber: `${type.substring(0, 2)}-${String(i + 1).padStart(4, '0')}`,
        poleNumber: `P-${String(i + 1).padStart(5, '0')}`,
        road: road._id,
        sector: sector._id,
        zone: sector.zone,
        department: dept._id,
        event: event._id,
        location: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        gpsAccuracy: 5 + Math.random() * 10,
        address: { text: `${road.name}, ${sector.name}` },
        status: 'ACTIVE',
        createdBy: superAdmin._id,
      });
      await asset.save();
      assets.push(asset);
    }
    console.log('Created 50 Assets');

    // Create Facilities (20 demo facilities)
    const facilityTypes = [
      { name: 'Main Hospital', type: 'HOSPITAL' },
      { name: 'First Aid Center A', type: 'MEDICAL_CENTRE' },
      { name: 'First Aid Center B', type: 'MEDICAL_CENTRE' },
      { name: 'Police Control Room', type: 'POLICE_STATION' },
      { name: 'Police Post - North', type: 'POLICE_POST' },
      { name: 'Police Post - South', type: 'POLICE_POST' },
      { name: 'Public Toilet Block A', type: 'TOILET' },
      { name: 'Public Toilet Block B', type: 'TOILET' },
      { name: 'Public Toilet Block C', type: 'TOILET' },
      { name: 'Parking Area A', type: 'PARKING' },
      { name: 'Parking Area B', type: 'PARKING' },
      { name: 'Main Ghat', type: 'GHAT' },
      { name: 'Shelter A', type: 'SHELTER' },
      { name: 'Shelter B', type: 'SHELTER' },
      { name: 'Fire Station', type: 'FIRE_STATION' },
      { name: 'Water Point 1', type: 'DRINKING_WATER' },
      { name: 'Water Point 2', type: 'DRINKING_WATER' },
      { name: 'Help Centre', type: 'HELP_CENTRE' },
      { name: 'Control Room', type: 'CONTROL_ROOM' },
      { name: 'Parking Area C', type: 'PARKING' },
    ];
    for (const f of facilityTypes) {
      const lat = 22.715 + Math.random() * 0.01;
      const lng = 75.850 + Math.random() * 0.015;
      await Facility.create({
        name: f.name,
        type: f.type,
        event: event._id,
        location: { type: 'Point', coordinates: [lng, lat] },
        address: { text: `${f.name}, Mela Ground` },
        contactNumber: '0731-1234567',
        operatingHours: { twentyFourSeven: ['HOSPITAL', 'POLICE_STATION', 'FIRE_STATION', 'CONTROL_ROOM'].includes(f.type) },
        status: 'ACTIVE',
        createdBy: superAdmin._id,
      });
    }
    console.log('Created 20 Facilities');

    // Create SMS Templates
    const smsTemplates = [
      {
        type: 'COMPLAINT_REGISTERED',
        language: 'en',
        template: 'Your complaint {{complaintNumber}} has been registered. We will resolve it soon. - Mela Seva',
        variables: ['complaintNumber'],
      },
      {
        type: 'COMPLAINT_RESOLVED',
        language: 'en',
        template: 'Your complaint {{complaintNumber}} has been resolved. Thank you. - Mela Seva',
        variables: ['complaintNumber'],
      },
      {
        type: 'COMPLAINT_CLOSED',
        language: 'en',
        template: 'Your complaint {{complaintNumber}} has been closed. Thank you for your feedback. - Mela Seva',
        variables: ['complaintNumber'],
      },
      {
        type: 'COMPLAINT_REGISTERED',
        language: 'hi',
        template: 'आपकी शिकायत {{complaintNumber}} दर्ज की गई है। हम जल्द ही इसे हल करेंगे। - मेला सेवा',
        variables: ['complaintNumber'],
      },
      {
        type: 'COMPLAINT_RESOLVED',
        language: 'hi',
        template: 'आपकी शिकायत {{complaintNumber}} का समाधान हो गया है। धन्यवाद। - मेला सेवा',
        variables: ['complaintNumber'],
      },
    ];
    for (const t of smsTemplates) {
      await SMSTemplate.create({
        event: event._id,
        name: `${t.type} - ${t.language}`,
        type: t.type,
        language: t.language,
        template: t.template,
        variables: t.variables,
        createdBy: superAdmin._id,
      });
    }
    console.log('Created SMS Templates');

    console.log('\n========================================');
    console.log('SEED DATA CREATED SUCCESSFULLY');
    console.log('========================================');
    console.log('Super Admin Login:');
    console.log('  Email: admin@melaseva.com');
    console.log('  Mobile: 9999999999');
    console.log('  Password: Admin@123');
    console.log('');
    console.log('User Login:');
    console.log('  Mobile: 9876543200');
    console.log('  Password: User@123');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
