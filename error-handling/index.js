const { updateSignInStatus } = require("../utils");

module.exports = (app) => {
  app.use(async (req, res, next) => {
    // this middleware runs whenever requested page is not available
    const isSignedOut = await updateSignInStatus(req);
    res.status(404).render("not-found", {isSignedOut});
  });

  app.use(async (err, req, res, next) => {
    // whenever you call next(err), this middleware will handle the error
    // always logs the error
    console.error("ERROR: ", req.method, req.path, err);

    // only render if the error ocurred before sending the response
    if (!res.headersSent) {
      const isSignedOut = await updateSignInStatus(req);
      res.status(500).render("error", {isSignedOut});
    }
  });
};
