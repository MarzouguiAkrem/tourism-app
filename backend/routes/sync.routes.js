const express = require('express');
const router = express.Router();

const { validate } = require('../middleware/validate.middleware');
const { deltaQuerySchema, bundleQuerySchema } = require('../validators/sync.validator');
const { bundle, bundleVersion, delta } = require('../controllers/sync.controller');

router.get('/bundle', validate(bundleQuerySchema, 'query'), bundle);
router.get('/bundle/version', validate(bundleQuerySchema, 'query'), bundleVersion);
router.get('/delta', validate(deltaQuerySchema, 'query'), delta);

module.exports = router;
