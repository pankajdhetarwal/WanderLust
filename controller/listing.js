const Listing=require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index=async (req, res) => {
    const alllistings = await Listing.find({});
    res.render("listings/index", { alllistings });
}

module.exports.showListing=async (req, res, next) => {
    let { id } = req.params;
    console.log("Requested listing id:", id);
    let property = await Listing.findById(id).populate({path:"reviews",populate:{
        path:"author",
    }}).populate("owner");
    console.log("Found listing:", property);
    if(!property){
        req.flash("error","listing doesn't exist");
        return next(new ExpressError(404,"page not found"));
    }
   
    res.render("listings/show", { property, currUser: req.user });
}

module.exports.createListing=async (req,res,next)=>{
  let response = await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 1
  }).send();

  let url = req.file.path;
  let filename = req.file.filename;

  const newlisting=new Listing(req.body.listing);
  newlisting.owner = req.user._id;
  newlisting.image = { url, filename };

  if(response.body.features.length > 0){
    newlisting.geometry = response.body.features[0].geometry;
  } else {
    // Fallback coordinates if location not found
    newlisting.geometry = { type: "Point", coordinates: [77.1025, 28.7041] };
  }

  await newlisting.save();
  req.flash("success","New Listing Added"); 
  res.redirect("/listings");
}

module.exports.EditListing=async(req,res,next)=>{
    let {id}=req.params;
    let property=await Listing.findById(id);
    if(!property){
        return next(new ExpressError(404,"page not found"));
    }

    let originalImageUrl = property.image.url;
    if (originalImageUrl) {
        originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    }

    res.render("listings/edit",{property, originalImageUrl});
}

module.exports.UpdateListing=async(req,res)=>{
    let {id}=req.params;
    let updatedData = { ...req.body.listing };

    let response = await geocodingClient.forwardGeocode({
      query: req.body.listing.location,
      limit: 1
    }).send();
    
    if(response.body.features.length > 0){
        updatedData.geometry = response.body.features[0].geometry;
    }

    if (typeof req.file !== "undefined") {
        updatedData.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await Listing.findByIdAndUpdate(id, updatedData);

    req.flash("success","Listing updated successfully");
    res.redirect(`/listings/${id}`);
}

module.exports.DeleteListing=async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing deleted successfully"); 
    res.redirect("/listings");
}