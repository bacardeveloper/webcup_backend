const express = require("express");
const { signupUser, signIn } = require("../controllers/user.controller");
const Authentification = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/signup", signupUser);
router.post("/signin", signIn);
router.get("/auth/user/:token", Authentification.authVerify);

module.exports = router;
