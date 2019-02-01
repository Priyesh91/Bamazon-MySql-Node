function startFunction() {
  inquirer
    .prompt({
      name: "questionOne",
      type: "list",
      message: "Do you want to buy something?",
      choices: ["Yes", "No"]
    })
    .then(function (answer) {
      // based on their answer, either call the bid or the post functions
      if (answer.postOrBid === "Yes") {
        nextFunction();
      } else if (answer.postOrBid === "NO") {
        console.log("Okay Bye")
        connection.end();
      }
    });
}

nextFunction() {
  console.log("This works");
}



function updateSQL() {
  // console.log(cart);
  cart.updatedquantity = cart.stockquantity-cart.quantity;
  // console.log(cart);
  console.log("mysql updating");
  db.query(
    "UPDATE products SET ? WHERE ?", 
    [{
      stock_quantity: cart.updatedquantity
    },
    {
      item_id: cart.itemId
    }],
    function (err, results) {
      if (err) throw err;