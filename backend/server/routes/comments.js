const express = require('express');
const router = express.Router();
const { Comment, User } = require('../models');
const { Op } = require('sequelize');

router.get('/post/:postId', async (req, res) => {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 6);
  const comments = await Comment.findAll({
    where: {
      PostId: req.params.postId,
      createdAt: { [Op.gt]: cutoff }
    },
    include: [User]
  });
  res.json(comments);
});

router.post('/', async (req, res) => {
  const { content, userId, postId } = req.body;
  if (!content || !userId || !postId) return res.status(400).json({ error: 'Faltan datos' });
  try {
    const nuevo = await Comment.create({ content, UserId: userId, PostId: postId });
    res.status(201).json(nuevo);
  } catch (e) {
    res.status(500).json({ error: 'Error al crear comentario', details: e.message });
  }
});

module.exports = router;