var express = require("express");
var router = express.Router(); 
var campground = require("../models/campgrounds");
var comments= require("../models/comments");
var middleware = require("../middleware");

//===============================
//COMMENTS
router.get("/campgrounds/:id/comments/new", middleware.isLoggedIn , function(req,res){
    campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);

        }
        else{
            res.render("comments/new",{campground: campground});
        }
    });
});

router.post("/campgrounds/:id/comments",middleware.isLoggedIn, function(req,res){
    campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        }
        else{
            comments.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                }else{
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success","Successfully added your comment");
                    res.redirect("/campgrounds/"+campground._id);
                }
               
            });
        }
    });
});

router.get("/campgrounds/:id/comments/:comment_id/edit",middleware.checkCommentOwnership, function(req,res){
    comments.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            console.log(err);
        }
        else{
            res.render("comments/edit", {campground_id: req.params.id,  comment: foundComment});
        }
    })
    
})

router.put("/campgrounds/:id/comments/:comment_id",middleware.checkCommentOwnership, function(req,res){
    comments.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        }
        else{
            
            res.redirect("/campgrounds/"+req.params.id);
        }
    })
});

router.delete("/campgrounds/:id/comments/:comment_id",middleware.checkCommentOwnership, function(req,res){
    comments.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            console.log(err);
            res.redirect("back");
        }
        else{
            res.redirect("/campgrounds/"+req.params.id);
        }
    });
});



module.exports = router;