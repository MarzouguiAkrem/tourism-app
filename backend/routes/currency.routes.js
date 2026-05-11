const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { convertQuerySchema, ratesQuerySchema } = require('../validators/currency.validator');
const { getRates, convert, refresh } = require('../controllers/currency.controller');

router.get('/rates', validate(ratesQuerySchema, 'query'), getRates);
router.get('/convert', validate(convertQuerySchema, 'query'), convert);
router.post('/refresh', protect, authorize('admin'), refresh);

module.exports = router;
