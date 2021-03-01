const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

router.get("/", (req, res) => {
  res.render("inicio");
});

router.post("/", (req, rsp) => {
  let creador = req.body.creador;
  console.log(creador);
  if (creador) {
    rsp.redirect(`/${uuidv4()}`);
  } else {
    router.get("/", (req, res) => {
      res.send("hola");
    });
  }
  exports.creador;
});
router.get("/inicio", (req, rsp) => {
  rsp.redirect(`/${uuidv4()}`);
});

router.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

router.get("/sesionTerminada", (req, res) => {
  res.render("fin");
}); /* 
router.post("/users", (req, res) => {
    const { name, email } = req.body;
    const response = await pool.query('INSERT INTO users (name, email) VALUES ($1, $2)', [name, email]);
    res.json({
        message: 'User Added successfully',
        body: {
            user: {name, email}
        }
    })
} ); */

module.exports = router;
