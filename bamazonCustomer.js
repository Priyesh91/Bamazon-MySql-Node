const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

//connection parameters for mysql database with mysql npm package
const db = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "admin",
  database: "bamazon_db"
});

//connect to the mysql server
db.connect(function (err) {
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

//Displaying product table from mySQL using consttable and es6 attempt
const displayProductTable = () => {
  db.query("SELECT * FROM products", function (err, dbProducts) {
    if (err) throw err;

    //display table of current items with inventory from mySQL
    console.table(dbProducts);

    //inquirer prompt after displaying list of products to ask which item they would want to bid on.
    inquirer.prompt([{
      name: "purchaseQuestion",
      message: "What item would you like to purchase?",
      type: "input",
      default: "(please type in item_id of product)",
      validate: function (input) {
        return !isNaN(input);
      },
      filter: function (input) {
        return parseInt(input);
      }
    }, ]).then(({
      purchaseQuestion,
      quantityQuestion
    }) => {
      //linking item id to product in database
      const itemId = dbProducts.find(item => item.item_id === purchaseQuestion);

      console.log(itemId);
      //prompt confriming product selection, if not loop back, if yes move to quantityquesiton
      inquirer.prompt({
        name: "confirmPrompt",
        type: "list",
        message: `You want to purchase ${itemId.product_name}?`,
        choices: ["Yes", "No", "Exit"]
      }).then(function (response) {
        if (response.confirmPrompt === "Yes") {
          quantityQuestion();
        } else if (response.confirmPrompt === "No") {
          console.log("Okay try lets try again! What would you like to buy select from the list");
          displayProductTable();
        } else if (response.confirmPrompt === "Exit") {
          connection.end();
        }
      });

      function quantityQuestion() {
        
      }

    })
  })
}



// {
//   name: "quantityQuestion",
//   message: "What quantity?",
//   type: "input",
//   default: "please type in item_Id of product",
//   validate: function (input) {
//     return !isNaN(input);
//   },
//   filter: function (input) {
//     return parseInt(input);
//   }
// }