let express = require("express");
let bodyParser = require("body-parser");

let app = express();
app.use(bodyParser.json());

const tax = {
  Medicine: 5,
  Food: 5,
  Imported: 18,
  Book: 0,
  Music: 3,
  Clothes: {
    min: 5,
    max: 12,
    value: 1000,
  },
};

const calculateItemTax = (category, quantity, price) => {
  return new Promise((resolve, reject) => {
    let percent = tax[category];
    if (typeof percent === "object") {
      percent =
        price < tax[category].value ? tax[category].min : tax[category].max;
    }
    // return (percent * price * quantity) / 100;
    resolve((percent * price * quantity) / 100);
  });
};

const calculateRebate = (price) => {
  if (price > 2000) {
    price = price - price * 0.05;
  }
  return price;
};

app.post("/getbill", (req, res) => {
  let key = Object.keys(req.body)[0];
  let products = req.body[key];
  let total = 0;
  console.log(products);
  products = products
    .sort((a, b) => a.item < b.item)
    .map((product) => {
      let { itemCategory, quantity, price } = product;
      return calculateItemTax(itemCategory, quantity, price).then((tax) => {
        // let temp = calculateItemTax(itemCategory, quantity, price).then((tax) => {
        let totalPrice = (price + tax) * quantity;
        total += totalPrice;
        let totalAfterRebate = calculateRebate(total);

        return {
          ...product,
          tax,
          totalPrice,
        };
      });
      // let totalPrice = (price + tax) * quantity;
      // total += totalPrice;

      // return {
      //   ...product,
      //   tax,
      //   totalPrice,
      // };
    });
  // let totalAfterRebate = calculateRebate(total);
  let bill = {
    ...products,
    // Total: totalAfterRebate,
    Date: new Date(),
    // Rebate: total - totalAfterRebate,
  };
  console.log(products);
  res.json({ message: "Bill Created", Bill: bill });
});

app.listen(3000, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`Server listening on port: 3000`);
  }
});
