//GESTION DES OPERATIONS CRUD (CREATE, READ, UPDATE, DELETE)

const Book = require("../models/book");
const fs = require("fs");

// AJOUT D'UN NOUVEAU LIVRE (CREATE)
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/${req.file.path.replace(/\\/g, '/')}`, // Remplace les anti-slashes par des slashes normaux
  });

  book
    .save()
    .then(() => res.status(201).json({ book: book }))
    .catch((error) => res.status(500).json({ error }));
};

// MODIFICATION D'UN LIVRE EXISTANT (UPDATE)
exports.modifyBook = (req, res, next) => {
  let bookObject;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: "403: unauthorized request" });
      } else {
        if (req.file) {
          const filename = book.imageUrl.split("/images/")[1];
          fs.unlink(`images/${filename}`, () => "");
          bookObject = {
            ...JSON.parse(req.body.book),
            imageUrl: `${req.protocol}://${req.get("host")}/${req.file.path}`,
          };
        } else {
          bookObject = { ...req.body };
        }
        delete bookObject._userId; // Suppression de _userId auquel on ne peut faire confiance
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Livre modifié" }))
          .catch((error) => res.status(500).json({ error }));
      }
    })
    .catch((error) => {
      res.status(404).json({ error });
    });
};

// SUPPRESSION D'UN LIVRE (DELETE)
exports.deleteBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: "403: unauthorized request" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];

        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Livre supprimé !" });
            })
            .catch((error) => res.status(500).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(404).json({ error });
    });
};

//RECCUPERATION D'UN LIVRE PAR SON ID (READ)
exports.getOneBook = (req, res) => {
  Book.findOne({ _id: req.params.id })

    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

//RECCUPERATION DE TOUS LES LIVRES (READ)
exports.getAllBooks = (req, res) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(404).json({ error }));
};

//ATTRIBUE UNE NOTE A UN LIVRE
exports.ratingBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      const ratingObject = {
        userId: req.auth.userId,
        grade: req.body.rating,
      };

      const newRatings = [...book.ratings];

      const hasRated = newRatings.some(
        (rating) => rating.userId === req.auth.userId
      );
      if (req.body.rating >= 0 && req.body.rating <= 5) {
        if (hasRated) {
          return res
            .status(400)
            .json({ message: "Vous avez déjà noté ce livre" });
        } else {
          newRatings.push(ratingObject);
          const totalRatings = newRatings.length;
          const sumRatings = newRatings.reduce(
            (acc, rating) => acc + rating.grade,
            0
          );
          const newAverageRating = sumRatings / totalRatings;
          Book.updateOne(
            { _id: req.params.id },
            {
              ratings: newRatings,
              averageRating: newAverageRating,
              _id: req.params.id,
            }
          )
            .then(() => {
              res.status(200).json(book);
            })
            .catch((error) => {
              res.status(500).json({ error });
            });
        }
      } else {
        res.status(400);
      }
    })

    .catch((error) => res.status(404).json({ error }));
};

//RECCUPERER LES 3 LIVRES LES MIEUX NOTÉS
exports.bestRating = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(500).json({ error }));
};