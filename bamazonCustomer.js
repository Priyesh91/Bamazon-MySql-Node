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
      db.end();
    }
  })
};
let cart = {
  id: 0,
  product: "",
  total: 0,
  quantity: 0,
  unitprice: 0,
  stockquantity: 0,
  updatedquantity: 0,
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

      // console.log(itemId);
      //updating cart object with customer selection
      cart.product = itemId.product_name;
      cart.unitprice = itemId.price;
      cart.stockquantity = itemId.stock_quantity;
      cart.id = itemId.item_id;
      // console.log("itemId.item_id" + itemId.item_id);
      // console.log("cart.id:" + cart.id);

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
          console.log("Have a Great Day!")
          db.end();
          // process.exit(0);
        }
      });
      // //function asking for quantity of item.

      function quantityQuestion() {
        inquirer.prompt({
          name: "quantityPrompt",
          message: "What quantity?",
          type: "input",
          default: "please type in item_Id of product",
          validate: function (input) {
            return !isNaN(input);
          },
          filter: function (input) {
            return parseInt(input);
          }
        }).then(function (response) {
          if (response.quantityPrompt > itemId.stock_quantity) {
            console.log("Looks like we do not have enough quantity to fufil your order");
            //inquirer prompt to loop through quantity again or exit
            inquirer.prompt({
              name: "confirmPrompt",
              type: "list",
              message: `Would you like to modify your quantity for ${itemId.product_name} to be less then ${itemId.stock_quantity}?`,
              choices: ["Yes", "Purchase Another Item", "Exit"]
            }).then(function (response) {
              if (response.confirmPrompt === "Yes") {
                quantityQuestion();
              } else if (response.confirmPrompt === "Purchase Another Item") {
                console.log("Okay try lets try again! What would you like to buy select from the list");
                displayProductTable();
              } else if (response.confirmPrompt === "Exit") {
                console.log("Have a Great Day!")
                db.end();
                // process.exit(0);
              }
            });
          }
          // console.log(cart);
          cart.quantity = (response.quantityPrompt);
          cart.total = response.quantityPrompt * itemId.price;
          // console.log(cart);

          priceFunction();
        });
      }
      //function to calculate price and confirm
      function priceFunction() {
        // console.log(cart);
        // console.log("We have made it to the final price function?");
        inquirer.prompt({
          name: "confirmPurchasePrompt",
          type: "list",
          message: `
          ------------------
          Product: ${cart.product}
          UnitPrice: $${cart.unitprice}
          Quantity: ${cart.quantity}
          Total: $${cart.total}
          ------------------`,
          choices: ["Confirm Purchase", "Exit"]
        }).then(function (response) {
          if (response.confirmPurchasePrompt === "Confirm Purchase") {
            updateSQL();
          } else if (response.confirmPrompt === "Exit") {
            console.log("Have a Great Day!")
            db.end();
            // process.exit(0);
          }
        });
      }

      function updateSQL() {
        // console.log("cart before update: " + cart.updatedquantity);
        cart.updatedquantity = cart.stockquantity - cart.quantity;
        // console.log("cart after update: " +cart.updatedquantity);
        // console.log("mysql updating");
        // console.log(cart);
        // console.log(cart.id);
        const query = db.query(
          "UPDATE products SET ? WHERE ?", [{
            stock_quantity: cart.updatedquantity
          }, {
            item_id: cart.id
          }],
          function(err, res) {
            if (err) throw err;
            // console.log(res);
            db.end();
          }
        )
        // console.log(query.sql);
      }
    });
  })
}