const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app = express();
const port = 8080;

//   console.log(getRandomUser());

  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta_app',
    password: 'Prem@1911'
  });


  let getRandomUser = ()=> {
    return [
        faker.string.uuid(),
        faker.internet.userName(),
        faker.internet.email(),
        faker.internet.password()
    ];
  }

  // insert using placeholder
//   let q = 'INSERT INTO user (id,name,email,password) VALUES ?';
//   let data = [];
//   for (let i = 1; i <= 100; i++) {
//     data.push(getRandomUser());
//   }
//   try {
//     // Execute the query with the data array
//     connection.query(q, [data], (err, result) => {
//       if (err) throw err;
//       console.log(result);
//     });
//   } catch (err) {
//     console.log(err);
//   }
//   connection.end();

//   -----------------------------------------------------------------------------
const path = require("path");
const methodOverride = require("method-override");
const exp = require('constants');

app.set('view engine', 'ejs');        // for ejs
app.set('views',path.join(__dirname,"/views")); // for ejs
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}))

app.listen(port,()=>{
    console.log(`app is listening to port: ${port} `);
}); 

// -------------------------home route-------------------------
app.get('/',(req,res)=>{
    let q = "select count(*) from user";
    try {
            // Execute the query with the data array
            connection.query(q, (err, result) => {
              if (err) throw err;
              let count  = result[0]["count(*)"];
              res.render("home.ejs",{count});
            });
          } catch (err) {
            console.log(err);
          }
});

// -------------------------------show users route--------------------------------
app.get('/users',(req,res)=>{
    let q = "SELECT * FROM user";
    let q1 = "SELECT count(*) FROM user";
    try {
        // Execute the first query to get all users
        connection.query(q, (err, users) => {
          if (err) throw err;
    
          // Execute the second query to get the count
          connection.query(q1, (err, countResult) => {
            if (err) throw err;
            
            let count = countResult[0]["count(*)"];
            console.log(users, count);
            
            // Render the `user.ejs` template with both users and count
            res.render("user.ejs", { users, count });
          });
        });
      } catch (err) {
        console.log(err);
      }
});


// --------------------------edit user route----------------------------------
app.get('/user/:id/edit', (req,res)=>{
    let {id} = req.params;
    let q = `SELECT * FROM user WHERE id='${id}'`;
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            let user = result[0];
            console.log(user);
            res.render("edit.ejs",{user});
        });
    }catch(err){
        console.log(err);
        console.log("some error occur");
    }
});

// ----------------------update in DB-----------------------------
app.patch('/user/:id',(req,res)=>{
    let {id} = req.params;
    let {password: formPass, name:newName} = req.body;
    let q = `SELECT * FROM user WHERE id='${id}'`;
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            let user = result[0];
            if(formPass != user.password){
                res.send("Wrong password");
            }else{
                let q1 = `UPDATE user SET name = '${newName}' WHERE id = '${id}' `;
                connection.query(q1,(err,result)=>{
                    if(err)throw err
                    res.redirect("/users");
                })
            }
            
        });
    }catch(err){
        console.log(err);
        console.log("some error occur");
    }
})

//---------------------------------Add user ----------------------------
app.get('/user/new',(req,res)=>{
  res.render("add_user.ejs");
})

app.post('/users',(req,res)=>{
  let q = `INSERT INTO user (id,name,email,password) VALUES (?,?,?,?)`;
  let {name,email,password} = req.body;
  let userID = faker.string.uuid();
  try{
    connection.query(q,[userID,name,email,password],(err,result)=>{
      if(err) throw err;
      console.log("User Added Successfully ");
      res.redirect("/users");
    });
  }catch(err){
    console.log("Some error occur");
  }
});

//-----------------------Delete User--------------------
app.get('/user/:id/delete',(req,res)=>{
  let {id} = req.params;
  res.render("delete.ejs", {id});
})

// app.delete('/user/:id', (req, res) => {
//   const { id } = req.params;
//   const { password: formPass } = req.body;  // Ensure req.body is parsed
//   let q = `SELECT * FROM user WHERE id='${id}'`;

//   try {
//       connection.query(q, (err, result) => {
//           if (err) throw err;
//           let user = result[0];
          
//           if (formPass !== user.password) {
//               res.send("Wrong password");
//           } else {
//               let q1 = `DELETE FROM user WHERE id = '${id}'`;
//               connection.query(q1, (err, result) => {
//                   if (err) throw err;
//                   res.redirect("/users");
//               });
//           }
//       });
//   } catch (err) {
//       console.log(err);
//       res.send("An error occurred while deleting the user.");
//   }
// });


app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  const { password: formPass } = req.body;

  // Query to fetch the user
  let q = `SELECT * FROM user WHERE id = ?`;

  try {
      connection.query(q, [id], (err, result) => {
          if (err) throw err;
          
          let user = result[0];
          if (formPass !== user.password) {
              res.send("Wrong password. Deletion denied.");
          } else {
              // Delete the user if the password is correct
              let q1 = `DELETE FROM user WHERE id = ?`;
              connection.query(q1, [id], (err, result) => {
                  if (err) throw err;
                  console.log("User deleted successfully:", result);
                  res.redirect("/users");
              });
          }
      });
  } catch (err) {
      console.log(err);
      res.send("An error occurred while deleting the user.");
  }
});