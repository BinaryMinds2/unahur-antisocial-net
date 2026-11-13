const express = require('express')
const router = express.Router()
const { Comment, Post, PostImage, PostTag } = require('../models')

router.delete('/:id', async (req, res) => {
  const postId = Number(req.params.id)
  const userId = Number(req.query.userId)

  if (!Number.isInteger(postId) || postId <= 0 || !Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: 'Identificador de publicación o usuario inválido' })
  }

  try {
    const post = await Post.findByPk(postId)
    if (!post) return res.status(404).json({ error: 'Post no encontrado' })
    if (post.UserId !== userId) {
      return res.status(403).json({ error: 'No podés borrar una publicación ajena' })
    }

    await Post.sequelize.transaction(async (transaction) => {
      await Comment.destroy({ where: { PostId: postId }, transaction })
      await PostImage.destroy({ where: { PostId: postId }, transaction })
      await PostTag.destroy({ where: { PostId: postId }, transaction })
      await post.destroy({ transaction })
    })

    return res.json({ message: 'Publicación eliminada' })
  } catch (error) {
    return res.status(500).json({ error: 'Error al eliminar la publicación' })
  }
})

module.exports = router
