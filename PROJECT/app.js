const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// Session setup
app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true
}));

// Dummy user database (in-memory)
const users = [];

// Routes
app.get("/", (req, res) => {
    if (req.session.user) {
        res.render("index", { username: req.session.user.username });
    } else {
        res.redirect("/login");
    }
});

app.get("/login", (req, res) => {
    res.render("login", { error: null });
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (user && await bcrypt.compare(password, user.password)) {
        req.session.user = user;
        res.redirect("/");
    } else {
        res.render("login", { error: "Invalid username or password" });
    }
});

app.get("/register", (req, res) => {
    res.render("register", { error: null });
});

app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const existingUser = users.find(u => u.username === username);

    if (existingUser) {
        res.render("register", { error: "Username already exists!" });
    } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        users.push({ username, password: hashedPassword });
        res.redirect("/login");
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
