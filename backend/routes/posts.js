const express = require('express');
const router =  express.Router();
const multer = require('multer');


//! Image storage
const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpg': 'jpg',
    'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const isValid = MIME_TYPE_MAP[file.mimetype];
      let error = new Error("Invalid mime type");
      if (isValid) {
        error = null;
      }
      cb(error, "backend/images");
    },
    filename: (req, file, cb) => {
      const name = file.originalname
        .toLowerCase()
        .split(" ")
        .join("-");
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, name + "-" + Date.now() + "." + ext);
    }
  });


//!ANCHOR Models
const PostModel = require('../models/post');
// const bodyParser = require('body-parser')

router.post("/api/posts", multer({storage: storage}).single('image'),(req, res, next)=> {
    const url = req.protocol + '://' + req.get("host");
    const post = new PostModel({
        title: req.body.title,
        content: req.body.content,
        imagePath : url + "/images/" + req.file.filename
    });
    post.save().then(createdPost => {
        // console.log(result);
        // console.log(post);
        res.status(201).json({
            message:'Post added succesfully',
            postId: result._id,
            post: {
                ...createdPost,
                id: createPost.id,
            }
        });
    });
    
   
})
router.get('/api/posts',(req, res, next)=> {
    let  posts;
    const pageSize = +req.query.pageSize;
    const currentPage = +req.query.currentPage;
    const postQuery = PostModel.find();
    let fetchedPosts;
    if(pageSize && currentPage){
        postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
    }
    
    postQuery.then((documents)=> {
        fetchedPosts = documents;
       return PostModel.count(); // the number of posts
    }).then((count) => 
    res.status(200).json({
        message: 'Posts fetched succesfully!',
        posts: fetchedPosts,
        postCount: count
    })
    ).catch(err=> {
        console.log(err);
    }); 
    
});

router.get('/api/posts/:id', (req, res, next)=> {
    PostModel.findById(req.params.id).then(data=> {
        if (data) {
            res.status(200).json({
                message: "post retrieved",
                post: data
            })
        } else {
            res.status(404).json({
                message: 'Post not found'
            })
        }
      
    })
})



router.put('/api/posts/:id', multer({storage: storage}).single('image'), (req, res, next)=> {
    let imagepath = req.body.imagePath;
    if(req.file){
        const url = req.protocol + '://' + req.get("host");
        imagepath = url + "/images/" + req.file.filename;
    }
    const post = new PostModel({
        _id: req.body.id,
        title: req.body.title,
        content: req.body.content,
        imagePath: imagepath
    });
    console.log(post)
    PostModel.updateOne({_id: req.params.id}, post)
    .then(result=>{
        console.log(result);
        res.status(200).json({
            message: "update succesful",

        })
    })
})


router.delete('/api/posts/:id', (req, res, next)=> {
    // console.log(req.params.id);
    PostModel.deleteOne({_id: req.params.id}).then(result=>{
        console.log(result);
        res.status(200).json({
            message: 'Content deleted',
        }
        )
    }).catch(err=>{
        console.log(err);
    });
    
})

module.exports = router;