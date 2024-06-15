const User = require('../models/user')

const userSignup = async(req,res)=>{
    try{
    let{name,email,number,pan,gst} = req.body;
    const pancard = await User.findOne({pan});
    if(pancard){
        return res.status(400).send({
            success:false,
            message:"Pancard already registerd"
        })
    }
    let newUser = new User({
        name:name,
        email:email,
        number:number,
        pan:pan,
        gst:gst
    })
    await newUser.save();
   }catch(error){
    res.status(400).send({
        success:false,
        message:"User didn't register"
    })
   }
}

module.exports={userSignup};