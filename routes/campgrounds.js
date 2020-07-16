var express = require("express");
var router = express.Router(); 
var campground = require("../models/campgrounds");
var Comment = require("../models/comments");
var middleware = require("../middleware");  // the name index.js is automatically taken


//INDEX- Show all campgrounds
router.get("/campgrounds",function(req,res){
    campground.find({}, function(err, campgrounds){
        if(err){
            console.log(err);
        }
        else{
            res.render("campgrounds/index",{camps: campgrounds});
        }
    })
    
});


//NEW- Show form to enter new entry
router.get("/campgrounds/new",middleware.isLoggedIn, function(req,res){
    res.render("campgrounds/new");
})


//CREATE- Add new entry
router.post("/campgrounds",middleware.isLoggedIn ,function(req,res){

    var name = req.body.name;
    var url = req.body.url;
    var desc = req.body.desc;
    var price = req.body.price;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newcamp = {name : name,price: price, image: url, desc: desc, author: author};
    campground.create(newcamp, function(err, newcamp){
        if(err){
            console.log(err);
        }
        else{
            console.log(newcamp);
            res.redirect("/campgrounds");
        }
    })
    
})

router.get("/campgrounds/:id" ,function(req,res){
    campground.findById(req.params.id).populate("comments").exec(function(err, foundcamp){
        if(err){
            console.log(err);
        }
        else{
          //  console.log(foundcamp);
            res.render("campgrounds/show", {campground: foundcamp});          
        }
    });
    
});

//Edit
router.get("/campgrounds/:id/edit",middleware.checkCampgroundOwnership, function(req,res){

        campground.findById(req.params.id, function(err, foundCampground){           
                    res.render("campgrounds/edit", { campground: foundCampground});
        });    
});


//Update
router.put("/campgrounds/:id",middleware.checkCampgroundOwnership, function(req,res){

    campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            console.log(err)
            
        }
        else{
            res.redirect("/campgrounds/"+ req.params.id);
        }
    })
});

//Delete route
router.delete("/campgrounds/:id",middleware.checkCampgroundOwnership, function(req,res){
    campground.findByIdAndRemove(req.params.id, function(err, campgroundRemoved){
        if(err){
            console.log(err);
        }
        //console.log(campgroundRemoved);
        Comment.deleteMany( {_id: { $in: campgroundRemoved.comments } }, function(err){
            if (err) {
                console.log(err);
            }
            res.redirect("/campgrounds");
        });
    });
});




module.exports = router;