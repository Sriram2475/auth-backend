const User = require("../models/User");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const client = require("../redis");
var jwt = require("jsonwebtoken");
const { json } = require("express");
dotenv.config();
async function CheckUser(email) {
  try {
    const user = await User.findOne({ email: email });
    console.log(user);
    if (user) {
      return true;
    }
    return false;
  } catch (e) {
    return "Server Busy";
  }
}
async function AuthenticateUser(email, password) {
  try {
    const userCheck = await User.findOne({ email: email });
    console.log(userCheck);
    const validPassword = await bcrypt.compare(password, userCheck.password);
    console.log(validPassword);
    if (validPassword) {
      const token = jwt.sign({ email }, process.env.login_secret_Token);
      console.log("Generated token:", "Bearer "+token);
      const response = {
        id: userCheck._id,
        name: userCheck.name,
        email: userCheck.email,
        token: token,
        status: true,
      };
await client.set(`key-${email}`, JSON.stringify(response));
const auth = await client.get(`key-${email}`);
console.log("Data set in Redis: ", auth);

      await User.findOneAndUpdate(
        { email: userCheck.email },
        { $set: { token: token } },
        { new: true }
      );
      return response;
    }
    return "Invalid Username or Password";
  } catch (e) {
    console.log(e);
    return "Server Busy";
  }
}

async function AuthorizeUser(token) {
  try {
    console.log("Received token: ", token); 
    const decodedToken = jwt.verify(token, process.env.login_secret_Token);
    console.log("Decoded token: ", decodedToken);  
    if (decodedToken) {
      const email = decodedToken.email;
      console.log("Decoded email: ", email); 
      const auth = await client.get(`key-${email}`);
      console.log("Data retrieved from Redis: ", auth);
      if (auth) {
        const data = JSON.parse(auth);
        console.log("Data retrieved from Redis: ", auth);
        return data;
      } else {
        const data = await User.findOne({ email: email });

        return data;
      }
    }
    return false;
  } catch (e) {
    console.log("Token verification error:", e);
    return false;
  }
}

module.exports = { CheckUser, AuthenticateUser, AuthorizeUser };