const express = require("express");
const { AuthorizeUser } = require("../controllers/login");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Check if Authorization header is present
    const authHeader = req.headers.authorization;
    
    // Validate Authorization header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).send("Authorization header missing or incorrect");
    }

    // Extract the token (remove the "Bearer " prefix)
    const auth_token = authHeader.split(" ")[1];
    console.log("Received token: ", auth_token); // Debugging purpose

    // Pass the token to AuthorizeUser function
    const loginCredentials = await AuthorizeUser(auth_token);

    if (!loginCredentials) {
      return res.status(401).send("Invalid Token");
    } else {
      res.json(loginCredentials);
    }
  } catch (e) {
    console.log(e);
    res.status(500).send("Server Busy");
  }
});


module.exports = router