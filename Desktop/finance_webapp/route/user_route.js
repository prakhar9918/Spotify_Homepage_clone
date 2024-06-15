const express = require('express');
const {userSignup}  = require('../controllers/user_controllers');
const router = express.Router;

router.post("/registeruser",userSignup);

module.exports = router;