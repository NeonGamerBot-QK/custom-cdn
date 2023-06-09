require('dotenv').config();
const express = require('express');
const app = express();
// const port = 3000;
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const ejs = require('ejs');
const fs = require('fs');
const  cookieSession = require('cookie-session')
const JSONdb = require('simple-json-db');
const useConfig = require('./util/useConfig');
const config = useConfig();
const db = new JSONdb(config.FILESTORE_PATH);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan('combined'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieSession({
    name: 'login',
    keys: [config.KEY],
  
    // Cookie Options
    maxAge: config.MAX_COOKIE_AGE || 24 * 60 * 60 * 1000 // 24 hours
  }))
app.use('/api', require('./api'));
// use ejs
// app.set('view engine', 'ejs');

app.set("trust proxy", ["loopback", "linklocal", "uniquelocal"]); // Trust the proxy // OR ELSE
app.disable("x-powered-by"); // Disabled powered by so people don't know i am using express


const renderPage = (page, ops) => {
    return ejs.render(fs.readFileSync(path.join(__dirname, 'views', `${page}.ejs`), 'utf8'), ops)
}
function Authenticated(req,res,next) {
    if(!req.session.loggedin) return res.redirect("/login");
    else if(req.headers.authorization !== config.KEY && !req.session.loggedin) return res.status(401).json({ success: false, error: 1 });
    else next()
}
const renderTemplate = (page, res, ops) => {
const data = renderPage("layout", { content: renderPage(page, ops), renderPage, ...ops })
res.send(data)
}
app.get('/', (req, res) => {
    renderTemplate('index', res, { title: config.TITLE, description: config.DESCRIPTION, url: config.URL  });
})
app.get("/license", (req, res) => {
    renderTemplate('license', res, { title: config.TITLE, license: fs.readFileSync(path.join(__dirname, '..', 'LICENSE'), 'utf8') });
})
app.get("/login", (req, res) => {
        renderTemplate('login', res, { title: config.TITLE  });
        
})
app.get("/logout", Authenticated, (req,res) => {
    req.session.destroy();
    res.redirect("/login")
})
app.get("/dash", Authenticated, (req, res) => {
    renderTemplate('dash', res, { title: config.TITLE, url: config.URL, description: config.DESCRIPTION, url: config.URL, items: db.get("posts") || []  });
})
app.get("/dash/config", Authenticated, (req, res) => {
    renderTemplate('dash/config', res, { title: config.TITLE, url: config.URL, description: config.DESCRIPTION, url: config.URL, items: db.get("posts") || []  });
})
app.get("/create", Authenticated, (req, res) => {
    renderTemplate('create', res, { title: config.TITLE, url: config.URL, description: config.DESCRIPTION, url: config.URL  });
})
app.get("/delete", Authenticated, (req, res) => {
    renderTemplate('delete', res, { title: config.TITLE, url: config.URL, description: config.DESCRIPTION, url: config.URL, items: db.get("posts") || []   });
})

app.use("/files/", (req,res,next) => {
    let entry = (db.get("posts") || []).find(f => f.id === req.path.split("/")[1].split(".")[0]);
    if(!entry) return res.status(403).json({ success: false, error: 2 });
if(entry.private && !req.session.loggedin) return res.status(401).json({ success: false, error: 3 });
next();
})
app.get("/files/:id", (req,res) => {
    const id = req.params.id;
    const file = (db.get("posts") || []).find(f => f.id === id);

    if(!file) return res.status(404).json({ success: false, error: 2 });
    const file_data = fs.readFileSync(file.path).toString();
    renderTemplate('file', res, { title: config.TITLE, url: config.URL, description: config.DESCRIPTION, url: config.URL, file, isBinaryFile: /\ufffd/.test(file_data) === true, data: file_data  });
})
app.use("/raw", (req,res,next) => {
    const exists = fs.existsSync(path.join(__dirname, 'files', req.path));
    if(!exists) return res.status(404).json({ success: false, error: 1 });
    let entry = (db.get("posts") || []).find(f => f.id === req.path.split("/")[1].split(".")[0]);
    if(!entry) return res.status(403).json({ success: false, error: 2 });
if(entry.private && !req.session.loggedin) return res.status(401).json({ success: false, error: 3 });
next();
})

app.use("/raw", express.static(path.join(__dirname, 'files')));
    // app.post()
app.listen(env.port, () => console.log(`Example app listening on port ${env.port}!`));