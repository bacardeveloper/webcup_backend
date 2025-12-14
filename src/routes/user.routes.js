const express = require("express");
const { signupUser, signIn } = require("../controllers/user.controller");
const Authentification = require("../middlewares/auth.middleware");
const { matchingCouple, getProfil } = require("../controllers/feature.controller");

const router = express.Router();

router.post("/signup", signupUser);
router.post("/signin", signIn);
router.get("/matching/:token", Authentification.authRoute, matchingCouple);
router.get("/get-profil/:token", Authentification.authRoute, getProfil);
router.get("/auth/user/:token", Authentification.authVerify);

module.exports = router;
