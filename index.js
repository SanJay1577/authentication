import express from 'express';
import bcrypt from 'bcrypt';
import dotenv from "dotenv";
import jwt from 'jsonwebtoken';
import {auth} from "./middleware/auth.js"
import cors from 'cors'
dotenv.config();
const app = express();
const PORT = process.env.PORT;
app.use(express.json());
app.use(cors());
import {MongoClient} from 'mongodb'



const MongoUrl = process.env.MongoUrl;


async function createConnection (){
    const client = new MongoClient(MongoUrl);
    await client.connect();
    console.log("Mongo is connected");
    return client;
}

const client = await createConnection(); 

async function generatePassword(password){
    const salt = await bcrypt.genSalt(10);// number of rounds :
    console.log(`The salt value is : ${salt}`)
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(`The hashed password is : ${hashedPassword}`);
    return hashedPassword;
}

async function getUserByName(name){
    return await client.db("users").collection("user").findOne({name:name})
}

async function getUserByEmail(email){
    return await client.db("users").collection("user").findOne({email:email})
}



app.get("/", async(req,res)=>{
    res.send('Welcome to the website')
})

app.get("/check",auth, async(req,res)=>{
    res.send('Welcome to the website')
})

app.get("/users", async (req,res)=>{
    const user = await client
    .db("users")
    .collection("user").find().toArray()
    res.send(user)
});

app.delete("/users", async(req,res)=>{
    const username = req.query
    const deleteUser = await client
    .db("users")
    .collection("user")
    .deleteMany({});
    deleteUser ? res.send(deleteUser) : res.status(404).send({message:"No Username found"})
})

app.post("/users/signup", async (req, res) => {
    const {name, password, email} = req.body;
    console.log(name, password, email);
    console.log(req.body);
    const isUserExist = await getUserByName(name);
    const isEmailExist = await getUserByEmail(email)
    console.log(isUserExist, isEmailExist);

    if(isUserExist||isEmailExist){
        res.status(400).send({message:"UserName or Email already exist"})
        return;
    }

    if(
        !/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@!#%&]).{8,}$/g.test(password)
    )
    {
        res.status(400).send({message:"Password doesnot match the requirement"})
        return;
    }

    const hashedPassword = await generatePassword(password)
    const AddUser = await client
      .db("users")
      .collection("user")
      .insertOne({name:name, password:hashedPassword, email:email});
      res.send(AddUser);
  });

  app.post("/users/login", async (req, res) => {
    const {name, password, email} = req.body;
    console.log(name, password, email);
    const userFromDb = await getUserByName(name);
    const userEmailFromDb = await getUserByEmail(email)
    console.log(userFromDb, userEmailFromDb);

    if(!userFromDb||
        !userEmailFromDb){
        res.status(400).send({message:"Invalid Credentials"})
        return;
    }

    const storedDbPassword = userFromDb.password;
    const isPasswordMatch = await bcrypt.compare(password,storedDbPassword);

    
    if(!isPasswordMatch){
        res.status(400).send({message:"Invalid Credentials"})
        return;
    }

    const token = jwt.sign({password: userFromDb.password, email:userFromDb.email}
        , process.env.SECRET_KEY);

    res.send({message:"Succesfull login", token:token});
  });

console.log("nodemon working")



app.listen(PORT, ()=>console.log(`Server started in localhost:${PORT}`));