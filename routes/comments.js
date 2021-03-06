//==========================
//comments routes
//==========================
//New       campgrounds/:id/comments
//Create    campgrounds/:id/comments/new

var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//comments new
router.get('/new', middleware.isLoggedIn, function(req, res) {
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        }else{
            res.render('comments/new', {campground: campground});
        }
    });
    
});

//comments create
router.post('/', middleware.isLoggedIn, function(req, res){
    //lookup campground using ID
    Campground.findById(req.params.id, function(err, campground) {
        if(err){
            console.log(err);
            res.redirect('/campgrounds');
        }else{
        //console.log(req.body.comment);
        //creating new comment
        Comment.create(req.body.comment, function(err, comment){
            if(err){
                console.log(err);
            }else{
                //add user name and id to comment
                comment.author.id = req.user._id;
                comment.author.username = req.user.username;
                console.log(comment);
                //save comment
                comment.save();
                campground.comments.push(comment);
                campground.save();
                req.flash('success', 'Successfully added comment!')
                res.redirect('/campgrounds/'+campground._id);
            }
            
        });
        //connect new comment to campground
        //redirect campground new page
        }
    });

});

//一个重要的收获 :id -> req.params.id  comment_id -> req.comment_id
router.get('/:comment_id/edit', middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if(err){
            res.redirect('back');
        }else{
            //console.log(req.params);
            res.render('comments/edit', {campground_id: req.params.id, comment:foundComment});
        }
    });
    
});

router.put('/:comment_id', middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect('back');
        }else{
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});

//comment destroy route
router.delete('/:comment_id', middleware.checkCommentOwnership, function(req, res){
   //findByIdAndRemove
   Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           res.redirect('back');
       }else{
           req.flash('success', 'Successfully deleted the comment!')
           res.redirect('/campgrounds/' + req.params.id)
       }
   });
});

//middleware

function checkCommentOwnership(req, res, next){
   if(req.isAuthenticated()){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect('back');
        }else{
            if(foundComment.author.id.equals(req.user._id)){
                next();
                //res.render('campgrounds/edit', {campground: foundCampground});
            }else{
                res.redirect('back');
            }
        }
    });
    }else{
        res.redirect('back');
        //res.send('you need login');
    }
        //dose user own the campground
    //if not redirect
}

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}


module.exports = router;