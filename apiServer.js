const express = require('express');
var cors = require('cors');
const app = express();
const port = 3000;

// These lines will be explained in detail later in the unit
app.use(express.json());// process json
app.use(express.urlencoded({ extended: true })); 
app.use(cors());
// These lines will be explained in detail later in the unit

const MongoClient = require('mongodb').MongoClient;
//const uri ="mongodb+srv://neeleshchandra1998:WjxCoqLH2sqWsxCm@cluster0.njhupwh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const uri = "mongodb+srv://gxvdon4601:M78gxd0406028@cluster0.q30zjox.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// change Mangodb uri in here
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// Global for general use
var userCollection;
var orderCollection;

client.connect(err => {
   userCollection = client.db("giftdelivery").collection("users");
   orderCollection = client.db("giftdelivery").collection("orders");
   

  // perform actions on the collection object
  console.log ('Database up!\n')
 
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})


 
app.get('/getUserDataTest', (req, res) => {

	userCollection.find({}, {projection:{_id:0}}).toArray( function(err,docs) {
		if(err) {
		  console.log("Some error.. " + err + "\n");
		} else {
		   console.log( JSON.stringify(docs) + " have been retrieved.\n");
		   var str = "<h1>" + JSON.stringify(docs) + "</h1>"
		   str+= "<h1> Error: " +  err +  "</h1>"
		   res.send(str); 
		}

	});

});

app.get('/getOrderDataTest', (req, res) => {

	orderCollection.find({},{projection:{_id:0}}).toArray( function(err,docs) {
		if(err) {
		  console.log("Some error.. " + err + "\n");
		} else {
		   console.log( JSON.stringify(docs) + " have been retrieved.\n");
		   var str = "<h1>" + JSON.stringify(docs) + "</h1>"
		   str+= "<h1> Error: " +  err +  "</h1>"
		   res.send(str); 
		}

	});

});



app.post('/verifyUser', (req, res) => {

	loginData = req.body;

	console.log(loginData);

	userCollection.find({email:loginData.email, password:loginData.password}, {projection:{_id:0}}).toArray( function(err, docs) {
		if(err) {
		  console.log("Some error.. " + err + "\n");
		} else {
		    console.log(JSON.stringify(docs) + " have been retrieved.\n");
		   	res.status(200).send(docs);
		}	   
		
	  });

});

app.get('/getOrderData', (req, res) => {
    const customerfName = req.query.customerfName;
	orderCollection.find({customerfName: customerfName},{projection:{_id:0}}).toArray( function(err,docs) {
            if (err) {
                console.log("Some error.. " + err + "\n");
                res.status(500).send('An error occurred while retrieving orders.');
            } else {
				console.log("Fetching past orders of "+customerfName+"\n");
				console.log("Number of past orders: ", docs.length);
                console.log(JSON.stringify(docs) + " \n\n have been retrieved.\n");
                res.json(docs);
            }
        });
});




app.post('/postOrderData', function (req, res) {
    
    console.log("POST request received : " + JSON.stringify(req.body)); 
    
    orderCollection.insertOne(req.body, function(err, result) {
	       if (err) {
				console.log("Some error.. " + err + "\n");
	       }else {
			    console.log(JSON.stringify(req.body) + " have been uploaded\n"); 
		    	res.send(JSON.stringify(req.body));
		 }
		
	});
       

});

app.post('/registerUser', (req, res) => {
    // Extract user data from the request body
    const userData = req.body;
	userCollection.findOne({ email: userData.email }, (err, existingUser) => {
        if (err) {
            console.error('Error checking for existing user:', err);
            res.status(500).send('An error occurred while registering the user.');
        } else if (existingUser) {
            // If the email already exists, send a response indicating the email is already in use
            console.log('Email already exists:', userData.email);
            res.status(400).send('Email is already in use. Please choose another email.');
        }
		else{
   			 	// Insert the user data into the MongoDB user collection
    			userCollection.insertOne(userData, (err, result) => {
       			 if (err) 
				 {
            		console.error('Error registering user:', err);
           			res.status(500).send('An error occurred while registering the user.');
        		} 
			else 
			{
            	console.log('User registered successfully:', userData);
            	res.status(200).send('User registered successfully!');
        	}
    	});
	}
});
});



app.post('/deleteUserOrders', (req, res) => {
	//const firstName = req.body.firstName;
	const customerfName = req.body.customerfName;
    orderCollection.deleteMany({ customerfName: customerfName }, (err, result) => {
        if (err) {
            console.error("Error deleting user orders:", err);
            res.status(500).send({ error: "An error occurred while deleting user orders." });
        } else {
			console.log("Deleting orders of User: "+customerfName);
            console.log("Number of deleted orders:", result.deletedCount);
            res.status(200).send({ deletedCount: result.deletedCount });
        }
    });
});


  
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`) 
});
