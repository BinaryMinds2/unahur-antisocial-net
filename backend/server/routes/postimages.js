const express = require('express');
const router = express.Router();
const { PostImage } = require('../models');

router.get('/post/:postId', async (req, res) => {
  const images = await PostImage.findAll({ where: { PostId: req.params.postId } });
  res.json(images);
});

router.post('/', async (req, res) => {
  const { url, postId } = req.body;
  if (!url || !postId) return res.status(400).json({ error: 'Faltan datos' });
  try {
    const nueva = await PostImage.create({ url, PostId: postId });
    res.status(201).json(nueva);
  } catch (e) {
    res.status(500).json({ error: 'Error al crear imagen', details: e.message });
  }
});

module.exports = router;