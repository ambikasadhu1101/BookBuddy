const express= require('express');
const router = express.Router();
const Author = require('../models/authors')
const Book = require('../models/books');
// all authors
router.get('/', async (req,res)=>{
    let searchOptions= {};
    if( req.query.name != null && req.query.name !== '' ){
        searchOptions.name = new RegExp(req.query.name ,'i');
    }
    try{
        const authors = await Author.find(searchOptions);
        res.render('authors/index',{
            authors : authors,
            searchOptions: req.query
        });
    }catch{
        res.redirect('/');
    }
})

router.get('/new', (req,res)=>{
    res.render('authors/new', {author : new Author()});
})

router.post('/', async (req,res)=>{
    const author = new Author({
        name: req.body.name
    })
    try{
        //saves the author to the database
        const newAuthor = await author.save();
        res.redirect(`/authors/${newAuthor.id}`);
        //res.redirect('authors');
    }catch{
        res.render('authors/new',{
            author: author,
            errorMessage: 'Error Creating author'
        })
    }
})
router.get('/:id', async (req,res) =>{
    try{
        const author= await Author.findById(req.params.id);
        const books = await Book.find({ author : req.params.id}).limit(10).exec();
        res.render('authors/show', {
            author: author,
            booksByAuthor: books
        });
    }catch{
        res.redirect('/');
    }
    //res.send('Show the author' + req.params.id);
})
router.get('/:id/edit', async (req,res) =>{
    try{
        const author = await Author.findById(req.params.id);
        res.render('authors/edit', {author : author});
    }catch{
        res.redirect('/authors');
    }
    //res.send('Edit author' + req.params.id);
})
router.put('/:id',async (req,res) =>{
    let author
    try{
        author = await Author.findById(req.params.id);
        author.name = req.body.name;
        await author.save();
        res.redirect(`/authors/${author.id}`);
    }catch{
        if(author == null){
            res.redirect('/');
        }else{
            res.render('authors/edit',{
                author: author,
                errorMessage: 'Error Updating author'
            })
        }
    }
})
router.delete('/:id',async (req,res) =>{
    let author
    try{
        author = await Author.findById(req.params.id);
        await author.remove();
        res.redirect('/authors');
    }catch{
        if(author == null){
            res.redirect('/');
        }else{
            res.redirect(`/authors/${author.id}`)
        }
    }
})
module.exports = router;
