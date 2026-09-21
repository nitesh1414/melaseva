const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadDir = config.UPLOAD_DIR;
    
    // Determine subdirectory based on field name
    if (file.fieldname === 'complaintPhoto') {
      uploadDir = path.join(uploadDir, 'complaints');
    } else if (file.fieldname === 'assetPhoto') {
      uploadDir = path.join(uploadDir, 'assets');
    } else if (file.fieldname === 'resolutionPhoto') {
      uploadDir = path.join(uploadDir, 'complaints');
    } else if (file.fieldname === 'profileImage') {
      uploadDir = path.join(uploadDir, 'profiles');
    } else if (file.fieldname === 'qrCode') {
      uploadDir = path.join(uploadDir, 'qr-codes');
    } else if (file.fieldname === 'importFile') {
      uploadDir = path.join(uploadDir, 'imports');
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed. Allowed types: JPEG, PNG, GIF, WebP, PDF, Excel, CSV`), false);
  }
};

// Create multer upload instances
const uploadComplaintPhoto = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.MAX_FILE_SIZE, // 10MB
    files: 3, // max 3 files
  },
}).array('complaintPhotos', 3);

const uploadAssetPhoto = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.MAX_FILE_SIZE,
  },
}).single('assetPhoto');

const uploadResolutionPhoto = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.MAX_FILE_SIZE,
  },
}).single('resolutionPhoto');

const uploadProfileImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
}).single('profileImage');

const uploadImportFile = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel and CSV files are allowed for import'), false);
    }
  },
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
  },
}).single('importFile');

const uploadGeneric = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.MAX_FILE_SIZE,
  },
}).single('file');

module.exports = {
  uploadComplaintPhoto,
  uploadAssetPhoto,
  uploadResolutionPhoto,
  uploadProfileImage,
  uploadImportFile,
  uploadGeneric,
};
