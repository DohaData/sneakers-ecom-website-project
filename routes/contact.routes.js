const express = require("express");

const {
  updateSignInStatus,
  getNumberOfCartElements,
  createMailTransporter,
} = require("../utils");
const router = express.Router();

// GET route for the contact page
router.get("/", async (req, res) => {
  const [isSignedOut, firstName, userId, isAdmin] = await updateSignInStatus(
    req
  );
  let nbCartElements = await getNumberOfCartElements(req);
  res.render("contact/contact", {
    isSignedOut,
    firstName,
    userId,
    isAdmin,
    nbCartElements,
  });
});

// Send Email
router.post("/", (req, res) => {
  const { name, email, phone, message } = req.body;
  const output = `
      <p>You have a new contact request</p>
      <h3>Contact Details</h3>
      <ul>
        <li>Name: ${name}</li>
        <li>Email: ${email}</li>
        <li>Phone: ${phone}</li>
      </ul>
      <h3>Message</h3>
      <p>${message}</p>
    `;

  // Create a transporter object using the default SMTP transport
  let transporter = createMailTransporter();

  // Set up email data with unicode symbols
  let mailOptions = {
    from: `<${email}>`, // sender address
    to: "dohajoaquinironhack@gmail.com", // list of receivers
    subject: "New Contact Request", // Subject line
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`, // plain text body
    html: output, // html body
  };

  // Send mail with defined transport object
  transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
      return console.log(error);
    }
    const [isSignedOut, firstName, userId, isAdmin] = await updateSignInStatus(
      req
    );
    let nbCartElements = await getNumberOfCartElements(req);
    res.render("contact/contact", {
      msg: "Email has been sent",
      isSignedOut,
      firstName,
      userId,
      isAdmin,
      nbCartElements,
    });
  });
});

module.exports = router;
