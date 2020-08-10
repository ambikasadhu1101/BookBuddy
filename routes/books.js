
const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const Book = require('../models/books')
const Author = require('../models/authors')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']

// All Books Route
router.get('/', async (req, res) => {
  //res.send('all books');
  let query = Book.find();
   if (req.query.title != null && req.query.title != '') {
     query = query.regex('title', new RegExp(req.query.title, 'i'))
  }
   try {
    const books = await query.exec()
     res.render('books/index', {
        books: books,
        searchOptions: req.query
     })
  } catch {
     res.redirect('/')
   }
})

// New Book Route
router.get('/new', async (req, res) => {
  renderNewPage(res, new Book());
})

// Create Book Route
router.post('/', async (req, res) => {
  const fileName = req.file != null ? req.file.filename : null
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    coverImageName: fileName,
    description: req.body.description
  })
  saveCover(book, req.body.cover);
  try {
    const newBook = await book.save()
    res.redirect(`books/${newBook.id}`)
    //res.redirect(`books`)
  } catch {
    renderNewPage(res, book, true)
  }
})
router.get('/:id', async (req,res)=>{
  try{
    const book = await  Book.findById(req.params.id).populate('author').exec();
    res.render('books/show',{book: book});
  }catch{
    res.render('/');
  }
})
router.get('/:id/edit', async (req,res)=>{
  try{
    const book = await Book.findById(req.params.id);
    renderEditPage(res,book);
  }catch{
    res.redirect('/');
  }
})
//Update Book route
router.put('/:id', async (req, res) => {
  let book
  try {
    book = await Book.findById(req.params.id);
    book.title = req.body.title;
    book.author = req.body.author;
    book.publishDate = new Date(req.body.publishDate);
    book.pageCount = req.body.pageCount;
    book.description = req.body.description;
    if(req.body.cover != null && req.body.cover !== ''){
      saveCover(book,req.body.cover);
    }
    await book.save();
    res.redirect(`/books/${book.id}`);
  } catch(err){
    console.log(err);
    if(book != null){
      renderNewPage(res,book,true);
    }else{
        res.redirect('/');
    }
    
  }
})
router.delete('/:id', async (req,res)=>{
  let book
  try{
    book = await Book.findById(req.params.id);
    await book.remove();
    res.redirect('/books');
  }catch{
      if(book != null){
        res.render('books/show',{
          book: book,
          errorMessage: 'Could not remove book'
        })
      }else{
        res.redirect('/');
      }
  }
})
async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res,book,'new',hasError);
}
async function renderEditPage(res, book, hasError = false) {
  renderFormPage(res,book,'edit',hasError);
}
async function renderFormPage(res, book,form, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book
    }
    if (hasError) {
      if(form === 'edit'){
        params.errorMessage = 'Error Updating Book'
      }else{
        params.errorMessage = 'Error Creating Book'
      }
    }
    res.render(`books/${form}`, params)
  } catch {
    res.redirect('/books')
  }
}
function saveCover(book, encodedCover){
  if (encodedCover == null) return;
  const cover = JSON.parse(encodedCover);
  if( cover != null && imageMimeTypes.includes(cover.type)){
    book.coverImage = new Buffer.from(cover.data, 'base64');
    book.coverImageType = cover.type;
  }
}
module.exports = router;
