const sharp = require("sharp"); //
const fs = require("fs");

//MIDDLEWARE POUR CONVERTIR ET REDIMENSIONNER LES IMAGES
const resizeImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  try {
    await sharp(req.file.path)
      .resize(null, 500)
      .webp({ quality: 80 })
      .toFile(`${req.file.path.split(".")[0]}_resize.webp`);
    //On supprime le fichier d'origine (en utilisant la fonction unlink du module fs)
    fs.unlink(req.file.path, (err) => {
      req.file.path = `${req.file.path.split(".")[0]}_resize.webp`;
      if (err) {
        console.log(err);
      }
      next();
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};

module.exports = resizeImage;