const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name:{
    type:"string",
    require:true
  },
  number:{
    type:"number",
    // require:true
  },
  email:{
    type:"String",
    // require:true
  },
  pancard:{
    type:"String",
    require:true,
  },
  gst:{
    type:"String",
    require:true
  }
})

const User = mongoose.model('User',userSchema);
module.exports = User;