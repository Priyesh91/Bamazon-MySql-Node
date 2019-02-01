const mysql = require("mysql");
const inquirer = require("inquirer");

//connection parameters for mysql database with mysql npm package
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "admin",
  database: "bamazon_db"
});

//connect to the mysql server
connection.connect(function (err) {
  if (err) throw err;
  console.log("Welcome to Bamazon!")
  connect();
});

//initial function to start inquirer prompt asking customer if they would like to make a purchase or not
function connect() {
  inquirer.prompt({
    name: "firstPrompt",
    type: "list",
    message: "Would you like to make a purchase?",
    choices: ["Yes", "No"]
  }).then(function (response) {
    if (response.firstPrompt === "Yes") {
      console.log("Great! Bellow is a table of what we have on sale today!");
      displayProductTable();
    } else if (response.firstPrompt === "No") {
      console.log("That's okay, See you again next time!");
      connection.end();
    }
  })
};

//Displaying product table from mySQL