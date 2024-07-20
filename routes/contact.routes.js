const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();


// GET route for the contact page
router.get('/', (req, res) => {
    res.render('contact/contact');
});

// Send Email
router.post('/', (req, res) => {
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
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'dohajoaquinironhack@gmail.com', // your email
            pass: 'hjrt aret ccqs jdua',    // your email password
        },
    });

    // Set up email data with unicode symbols
    let mailOptions = {
        from: `<${email}>`, // sender address
        to: 'dohajoaquinironhack@gmail.com', // list of receivers
        subject: 'New Contact Request', // Subject line
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`, // plain text body
        html: output, // html body
    };

    // Send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        res.render('contact/contact', { msg: 'Email has been sent' });
    });
});

module.exports = router;