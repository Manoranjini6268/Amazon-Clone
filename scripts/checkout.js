import { renderOrderSummary } from "./checkout/orderSummary.js";
import { renderPaymentSummary } from "./checkout/paymentSummary.js";
import { loadproducts } from "../data/products.js";
import { loadcart } from "../data/cart.js";
//import "../data/backend.js";

Promise.all([
  new Promise((resolve) => {
    loadproducts(() => {
      resolve("value1");
    });
  }),
  new Promise((resolve) => {
    loadcart(() => {
      resolve();
    });
  }),
])
  .then(() => {
    console.log();
    renderOrderSummary();
    renderPaymentSummary();
  })
  .catch(() => {
    console.log("Unexpected error.Please try again");
  });
/* new Promise((resolve) => {
     loadproducts(() => {
       resolve("value1");
     });
   })
     .then((value) => {
       console.log(value);
       return new Promise((resolve) => {
         loadcart(() => {
           resolve();
         });
       });
     })
     .then(() => {
       renderOrderSummary();
       renderPaymentSummary();
     });
*/
// loadproducts(() => {
//   renderOrderSummary();
//   renderPaymentSummary();
// });
