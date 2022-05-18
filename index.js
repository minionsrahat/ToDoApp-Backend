const express = require('express')
const cors = require('cors')
var jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId=require('mongodb').ObjectId
const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())


//db user :dbuser
//password: W3IRlcbKKXjWjIxZ


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.PASSWORD}@cluster0.2g5dn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const  verifyRequest= (req,res,next)=>{
       const tokenInfo=req.headers.accesstoken;
       if(tokenInfo)
       {
        const [email,token]=tokenInfo.split(" ")
        if(email && token)
        {
         jwt.verify(token, process.env.ACCESS_TOKEN , function(err, decoded) {
             if(err)
             {
                 res.send({error:'Error Occured'})
             }
             else{
              if(decoded===email)
              {
                 next()
              }
              else{
                 res.send({error:'Unathurozied access'})
              }
             }
           });
        }
       }
       else{
            res.send({error:'Unathurozied access'})
       }
      
      
}

async function run() {
    try {
        await client.connect();
        const database = client.db("budgetApp");
        const expencess = database.collection("expencess");
        console.log('Db connected')


        // auth
        app.post('/login',async (req,res)=>{
            const email=req.body.email
            const token = jwt.sign(email, process.env.ACCESS_TOKEN);
            res.send({token})
        })


        app.post('/addExpense',verifyRequest, async (req, res) => {
            const expense = req.body;
            const result = await expencess.insertOne(expense)
            // console.log("add user :" + user);
            res.send(result)
        })

        app.get('/readExpense', async (req, res) => {
            const result = await expencess.find({})
            res.send(await result.toArray())
        })

        app.delete('/deleteExpense/:id',verifyRequest, async (req, res) => {
           const id=req.params.id
           const query={_id:ObjectId(id)}
           const result=await expencess.deleteOne(query)
           res.send(result)
        })


        app.put('/updateExpense/:id',verifyRequest, async (req, res) => {
            const id=req.params.id
            const filter={_id:ObjectId(id)}
            const options = { upsert: true };
            const updateDoc = {
                $set: req.body,
              };
            const result = await expencess.updateOne(filter, updateDoc, options);
            res.send(result)
         })
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hey i am from server');
})

app.listen(port, () => {
    console.log('Server running')

})
