require('dotenv').config()
const express=require('express');
const mongoose=require('mongoose');
const bodyParser=require('body-parser')
const cors=require('cors');
const bcrypt=require('bcrypt')


const db=process.env.URL;
mongoose.connect(db,{

    useNewUrlParser: true, 
    useUnifiedTopology: true    
     
}).then(()=>{
        
    console.log("connected")
    
}).catch((err)=>console.log(err));
    
const Schema=new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    date:{
        type:String,
        require:true,
        trim:true
    },
    status:{
        type:String,
        default:"uncompleted",
        require:true
    }   
})
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true
    },
    password:{
        type:String,
        unique:true
    }
},{
    timestamps:true
})
const Todo=mongoose.model('Todos',Schema);
const User=mongoose.model('Users',userSchema)
const app=express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}))

app.get('/',async(req,res)=>{
   const user= await Todo.find();
   res.json({user});
})

app.post('/add',async(req,res)=>{
    try{
        const {name}=req.body;
        const date=new Date().toLocaleDateString();
        const newItem=new Todo({
            name,date
        });
        await newItem.save();
        res.json({msg:"saved sucessfully"});

    }
    catch(err){
        console.log(err);
    }
   
})
app.post('/delete',async(req,res)=>{
    const{id}=req.body
    Todo
    .findByIdAndDelete(id)
    .then(()=>{
        res.json("deleted successfully..")
    })
    .catch((err)=>{
        console.log(err)
    })
   
})
app.post('/update',async(req,res)=>{
    
        const {id,name}=req.body;
        Todo.findByIdAndUpdate(id,{name,status:"uncompleted"})
        .then(()=>{
            res.json("updated successfully..")
        })
        .catch((err)=>{
            console.log(err)
        })

    
})
app.post('/done',async(req,res)=>{
    
    const {id}=req.body;
    Todo.findByIdAndUpdate(id,{status:"completed"})
    .then(()=>{
        res.json("completed successfully..")
    })
    .catch((err)=>{
        console.log(err)
    })


})
app.post('/drag',async(req,res)=>{
    
    const {_id}=req.body;
    Todo.findByIdAndUpdate(_id,{status:"completed"})
    .then(()=>{
        res.json("completed successfully..")
    })
    .catch((err)=>{
        console.log(err);
    })


})
app.post('/login',async(req,res)=>{
    
    try{
        const{email,password}=req.body;
        console.log(req.body)
        const user=await User.findOne({email});
        if(!user)return res.status(400).json({msg:"user not exists."})
        const isMatch= await bcrypt.compare(password,user.password)
        if(!isMatch) return res.status(400).json({msg:"incorrect password"});

        res.json({msg:"login sucess"});
        
    }
    catch(err){
        console.log(err);
    }
    
}
)
app.post('/register',async(req,res)=>{
    try{
        const{name,email,password}=req.body;
        const user=await User.findOne({email});
        if(user) return res.status(400).json({msg:"email already exists"})
        if(password.length<8) return res.status(400).json({msg:"password must be of eight character long"}) 

        //encryption
        const hashPassword=await bcrypt.hash(password,10)
        const newUser=new User({
            name,email,password:hashPassword
        })
        await newUser.save();

        res.json({msg:"sucessfully registered"})
        
    }
    catch(err){
        console.log(err);
    }
}

)




app.listen(5000,()=>{
    console.log("listening to port 5000");
})
