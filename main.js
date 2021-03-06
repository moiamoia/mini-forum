const Koa = require('koa');
const path = require('path');
const app = new Koa();
const bodyParser = require('koa-bodyparser');
app.use(bodyParser());

const convert = require('koa-convert')
const static = require('koa-static')

//跨域
const cors = require('koa2-cors');
app.use(cors({credentials: true}));

const session = require('koa-session-minimal')
app.use(session())

session({
    cookie: ctx => ({
        maxAge: 1
    })
})

const {route, allowedMethods} = require('./route');

app.use(route);
app.use(allowedMethods);

app.use(convert(static(path.join(__dirname, './dist'))));

// const webpackMiddleware = require("koa-webpack-dev-middleware");
app.listen(9003);
