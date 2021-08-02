const config = require('config')
const path = require('path')
const Koa = require('koa')
const Router = require('koa-router')
const loadRoutes = require("./app/routes")
const DataLoader = require('./app/dataLoader')
const serve = require('koa-static')
const koaTwig = require("koa-twig");
const util = require("util");
const fs = require("fs");

const app = new Koa()
const router = new Router()

// new stuff 


// Data loader for products (reads JSON files)
const productsLoader = new DataLoader(
  path.join(
    __dirname,
    config.get('data.path'),
    'products')
)

app.use(
  koaTwig({
    views: path.join(__dirname, config.get('views.path')),
    extension: "twig"
  })
);

// Server static files (scripts, css, images)
app.use(serve(config.get('static.path')))

// Hydrate ctx.state with global settings, to make them available in views
app.use(async (ctx, next) => {
  ctx.state.settings = config.get('settings')
  ctx.state.urlWithoutQuery = ctx.origin + ctx.path
  await next()
})

// Configure router
loadRoutes(router, productsLoader)
app.use(router.routes())

// Start the app
const port = process.env.PORT || config.get('server.port')
app.listen(port, () => { console.log(`Application started - listening on port ${port}`) })