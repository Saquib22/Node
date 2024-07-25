const express = require('express');
const mongoose = require('mongoose')
// const users = require('./MOCK_DATA.json'); 
const fs = require("fs");
const { type } = require('os');
const app = express();
const PORT = 8000;
//connection
mongoose.connect('mongodb://127.0.0.1:27017/demo-data')
.then(()=>console.log("mongoDb connected"))
.catch((err)=>console.log("Mongo Error",err))
//Schema
const userSchema = new mongoose.Schema({
    firstName :{
        type : String,
        required : true
    }, 
    lastName:{
        type : String,
    },
    email:{
        type:String,
        required :true,
        unique : true,
    },
    jobTitle : {
        type :String
    },
    gender : { 
        type : String  
    },
    
},{timestamps:true})

// Model 
const User = mongoose.model('user',userSchema);

app.use(express.urlencoded({extended:false}))
app.use((req,res,next) => {
    fs.appendFile('log.txt',`\n${Date.now()} : ${req.method} : ${req.path}`,(err,data)=>{
        next();
    }) 
})
app.get("/users" , async(req,res)=>{
    const allDbUseres = await User.find({});
    const html =  `
    <ul> 
       ${allDbUseres.map((user) => `<li>${user.firstName} - ${user.email}</li>`).join("")}
    </ul>
    `
    res.send(html)
})
app.get("/api/users",async (req,res)=>{
    const allDbUseres = await User.find({});

    //fetch the data
    return res.json(allDbUseres);
})
app.get("/api/users/:id",async (req,res)=>{
    // const id = Number(req.params.id);
    
    // const user = users.find((user)=>user.id === id);
    const user = await User.findById(req.params.id);
    return res.json(user)
})
app.patch("/api/users/:id",async(req,res)=>{
   await User.findByIdAndUpdate(req.params.id),{lastName : 'Changed'}
    return res.json({staus: "success"});
})
app.delete("/api/users/:id",async(req,res)=>{
    //Delete the user
    await User.findByIdAndDelete(req.params.id )
    return res.json({staus : "Success"});
})
app.post("/api/users",async(req,res)=>{
    // save the data with some values
    const body = req.body;
    // users.push({...body,id: users.length+1})
    // fs.writeFile("./MOCK_DATA.json",JSON.stringify(users),(err,result)=>{
    //     return res.json({staus : "success"});
    // })

    if(!body || !body.first_name || !body.last_name || !body.email || !body.gender || !body.job_title)
    {
        return res.status(404).json({msg:"All field required..."})
    }
    const result = await User.create({
        firstName : body.first_name,
        lastName : body.last_name,
        email : body.email,
        gender : body.gender,
        jobTitle: body.job_title  
    })
    // console.log(result);
    return res.status(201).json({msg:'success'})
    
})
app.listen(PORT, ()=>`serve is live on ${PORT}`);