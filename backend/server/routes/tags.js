const express = require('express');
const router = express.Router();
const { Tag } = require('../models');

router.get('/', async (req, res) => {
  const tags = await Tag.findAll();
  res.json(tags);
});

module.exports = router;