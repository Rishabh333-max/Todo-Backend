//import expree
const express = require("express");

//import mongodb
const mongodb = require("mongodb");

//import cors
const cors = require("cors");

//import body-parser
const bodyParser = require("body-parser");

//create server in express
const app = express();
//use middlewares
app.use(cors());
app.use(bodyParser.json());

//data base url
const dbUrl = " mongodb+srv://rishabh:rishabh1919ps@cluster0.964ns.mongodb.net/TodoDatabase?retryWrites=true&w=majority";

//connect to database url or mongo db

mongodb.MongoClient.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
}, (err, client) => {
    if (err) {
        return console.log(err);
    }
    console.log("connected to mongoDb");
    const newDb = client.db("todoDataBasedProject")
    //api create here

    //signup api create here
    app.post("/signup", (req, res) => {
        console.log(req.body);
        const { name, phoneNumber, email, password } = req.body;

        //check if user already exists or not
        let existingUser = newDb.collection("User").find({ email: email }).toArray();
        existingUser.then((User) => {
            //if user already exist
            if (User.length > 0) {
                return res.status(201).json("User already exist");
            }
            //if user does not exist
            else if (User.length < 1) {
                let createUser = newDb.collection("User").insertOne({ name: name, phoneNumber: phoneNumber, email: email, password: password });
                //or insertOne(req.body)
                createUser.then((User) => {
                    res.status(200).json(User.ops);
                });
            }
        });

    });
    //login api
    app.post("/login", (req, res) => {
        console.log(req.body);
        const { email, password } = req.body;
        //check user exist or not
        let existingUser = newDb.collection("User").find({ email: email }).toArray();
        existingUser.then((User) => {
            //if user not exist
            if (User.length < 1) {
                return res.status(201).json("User does not exist,Please sign up instead");
            }
            //if user exist
            else if (User.length > 0) {
                //if password match
                if (password === User[0].password) {
                    return res.status(200).json(User);
                }
                //if password not match
                else {
                    res.status(201).json("password not matched");
                }
            }

        }); 
    });
    //api for create todo
    app.post("/createTodo",(req, res) =>{
        console.log(req.body);
        const{title,description,deadline,UserId}=req.body;

        let createdTodo=newDb.collection("todo").insertOne({title:title,description:description,deadline:deadline,UserId:UserId,});
        createdTodo.then((Todo)=>{
            console.log(Todo);
            return res.status(200).json(Todo.ops[0]);
        })
        .catch((err)=>{
            return res.status(500).json("Error in Saving Todo");
        })
        title.value="";
        description.value="";
        deadline.value="";
    
    });
    //get todo
    app.get("/getTodo/:UserId",(req,res)=>{
        console.log(req.params.UserId);
        //get all todo for user which logged in
        let allTodo=newDb.collection("todo").find({UserId:req.params.UserId}).toArray();
        allTodo.then((Todo) => {
            console.log(Todo);
            return res.status(200).json(Todo);
          })
          .catch((err) => {
            return res.status(500).json("Error in getting todo");
          });
      });
        //delete todo
    app.delete("/deleteTodo/:UserId/:todoId", (req, res) => {
        console.log(req.params.todoId);
  
        let deleteTodo = newDb.collection("todo").deleteOne({ _id: new mongodb.ObjectId(req.params.todoId) });
        deleteTodo.then((Todo) => {
          console.log(Todo);
          //get all todo for user which loggedIn
          let allTodo = newDb.collection("todo").find({ UserId: req.params.UserId }).toArray();
          allTodo.then((Todo) => {
              console.log(Todo);
              return res.status(200).json(Todo);
            })
            .catch((err) => {
              return res.status(500).json("Error in getting todo");
            });
        });
      });
  
      //api for updation of todo
      app.patch("/updateTodo",(req,res)=>{
        console.log(req.body);
        let updateTodo=newDb.collection('todo').findOneAndUpdate({_id: new mongodb.ObjectID(req.body.todoId)},
        {
          $set:{
            title:req.body.title,
            description:req.body.description,
            deadline:req.body.deadline
          }
        },{new: true,runValidators:true,returnOriginal:false})
        updateTodo.then(Todo=>{
          console.log(Todo);
          let allTodo = newDb.collection("todo").find({ UserId:req.body.UserId }).toArray();
          allTodo.then((Todo) => {
              console.log(Todo);
              return res.status(200).json(Todo);
            })
            .catch((err) => {
              return res.status(500).json("Error in getting todo");
            });
        })
      })
    });
    //run server

    app.listen(process.env.PORT || 8081, () => {
        console.log("server started");

    });
