const express = require('express');
const dotenv =  require('dotenv');

const app = express();
dotenv.config();
app.use(express.json());

const PORT = process.env.PORT;

app.get('/',(req,res)=>{
    res.send("hello");
})

const userApis = require("./route/user_route");
app.use(userApis);

app.listen(PORT,()=>{
    console.log(`Server is listening at ${PORT}`);
})