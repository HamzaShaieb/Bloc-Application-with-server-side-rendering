const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const Article = require('./models/article')
const methodOverride = require('method-override')
const path = require('path')

/*Configuration */

dotenv.config()
const app = express()

app.use(express.static(path.join(__dirname + '/public')));
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))

/*Mongodb database conection */

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true
},()=>{console.log('Contected To Database')})

/*Routes */
app.get('/new', (req, res) => {
  res.render('articles/new', { article: new Article() })
})

app.get('/edit/:id', async (req, res) => {
  const article = await Article.findById(req.params.id)
  res.render('articles/edit', { article: article })
})

app.get('/:slug', async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug })
  if (article == null) res.redirect('/')
  res.render('articles/show', { article: article })
})

app.post('/', async (req, res, next) => {
  req.article = new Article()
  next()
}, saveArticleAndRedirect('new'))

app.put('/:id', async (req, res, next) => {
  req.article = await Article.findById(req.params.id)
  next()
}, saveArticleAndRedirect('edit'))

app.delete('/:id', async (req, res) => {
  await Article.findByIdAndDelete(req.params.id)
  res.redirect('/')
})

function saveArticleAndRedirect(path) {
  return async (req, res) => {
    let article = req.article
    article.title = req.body.title
    article.description = req.body.description
    article.markdown = req.body.markdown
    try {
      article = await article.save()
      res.redirect(`/${article.slug}`)
    } catch (e) {
      res.render(`/${path}`, { article: article })
    }
  }
}
/*Deploymant To Localhost */
app.get('/', async (req, res) => {
  const articles = await Article.find().sort({ createdAt: 'desc' })
  res.render('articles/index', { articles: articles })
})



app.listen(5000,()=>{console.log('Server Work Succesifuly')})