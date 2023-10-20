const passwordValidator = require("password-validator");

const passwordSchema = new passwordValidator();

passwordSchema
  .is()
  .min(5)
  .is()
  .max(15)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits(2)
  .has()
  .not()
  .spaces()
  .is()
  .not()
  .oneOf(["Passw0rd", "Password123"]);

//MIDDLEWARE POUR SECURISER LES MOTS DE PASSE
module.exports = (req, res, next) => {
  if (passwordSchema.validate(req.body.password)) {
    next();
  } else {
    res
      .status(400)
      .json({
        error: `le mot de passe n'est pas assez sécurisé : ${passwordSchema.validate(
          "req.body.password",
          { list: true }
        )}`,
      });
  }
};