const { sequelize, User, Post, Comment, Tag, PostImage } = require('./models');

// Devuelve una URL de imagen estable (la misma palabra siempre da la misma foto).
const foto = (palabra, ancho = 800, alto = 500) =>
  `https://picsum.photos/seed/${palabra}/${ancho}/${alto}`;

// Fecha de hace N meses (para probar el filtro de comentarios visibles).
const hace = (meses) => {
  const fecha = new Date();
  fecha.setMonth(fecha.getMonth() - meses);
  return fecha;
};

async function seed() {
  // OJO: borra y vuelve a crear todas las tablas.
  await sequelize.sync({ force: true });

  // Usuarios
  const [luna, sol, nova, kai] = await User.bulkCreate(
    [
      { nickName: 'luna', email: 'luna@example.com' },
      { nickName: 'sol', email: 'sol@example.com' },
      { nickName: 'nova', email: 'nova@example.com' },
      { nickName: 'kai', email: 'kai@example.com' },
    ],
    { returning: true },
  );

  // Etiquetas
  const [arte, unahur, tecnologia, musica, viajes] = await Tag.bulkCreate(
    [
      { name: 'arte' },
      { name: 'unahur' },
      { name: 'tecnologia' },
      { name: 'musica' },
      { name: 'viajes' },
    ],
    { returning: true },
  );

  // Publicaciones
  const post1 = await Post.create({ description: 'Mi primer post en la red anti-social', UserId: luna.id });
  const post2 = await Post.create({ description: 'Reflexiones nocturnas frente a la compu', UserId: sol.id });
  const post3 = await Post.create({ description: 'Hoy rendí el final de programación y salió bien', UserId: nova.id });
  const post4 = await Post.create({ description: 'La playlist que me acompaña mientras estudio', UserId: kai.id });
  const post5 = await Post.create({ description: 'Escapada al río: sin señal, sin notificaciones', UserId: luna.id });
  const post6 = await Post.create({ description: 'Post sin imágenes ni etiquetas, para probar ese caso', UserId: sol.id });

  await post1.setTags([arte, unahur]);
  await post2.setTags([arte]);
  await post3.setTags([unahur, tecnologia]);
  await post4.setTags([musica]);
  await post5.setTags([viajes, arte]);

  // Comentarios (el último es viejo: no se muestra porque tiene más de 6 meses)
  await Comment.bulkCreate([
    { content: 'Muy bueno!', UserId: sol.id, PostId: post1.id },
    { content: 'Bienvenida a la red', UserId: nova.id, PostId: post1.id },
    { content: 'Gracias por compartir', UserId: luna.id, PostId: post2.id },
    { content: 'Felicitaciones!! Te lo merecías', UserId: luna.id, PostId: post3.id },
    { content: 'Pasá la lista de temas, por favor', UserId: nova.id, PostId: post4.id },
    { content: 'Qué lugar hermoso', UserId: kai.id, PostId: post5.id },
    { content: 'Me encantaría ir', UserId: sol.id, PostId: post5.id },
    { content: 'Comentario viejo (no debería verse)', UserId: kai.id, PostId: post1.id, createdAt: hace(8) },
  ]);

  // Imágenes
  await PostImage.bulkCreate([
    { url: foto('luna-1'), PostId: post1.id },
    { url: foto('luna-2'), PostId: post1.id },
    { url: foto('sol-1'), PostId: post2.id },
    { url: foto('nova-1'), PostId: post3.id },
    { url: foto('kai-1'), PostId: post4.id },
    { url: foto('rio-1'), PostId: post5.id },
    { url: foto('rio-2'), PostId: post5.id },
    { url: foto('rio-3'), PostId: post5.id },
  ]);

  console.log('Base de datos poblada!');
  process.exit();
}

seed();