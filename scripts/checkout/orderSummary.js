import {
  cart,
  removeFromCart,
  saveToStorage,
  updateDeliveryOption,
  calculateCartQuantity,
  updateQuantity,
} from "../../data/cart.js";
import { products, getProduct } from "../../data/products.js";
import { formatCurrency } from "../utils/money.js";
import dayjs from "https://unpkg.com/dayjs@1.11.10/esm/index.js";
import {
  deliveryOptions,
  getDeliveryOption,
} from "../../data/deliveryOptions.js";
import { renderPaymentSummary } from "./paymentSummary.js";

export function renderOrderSummary() {
  let cartSummaryHTML = "";
  if (cart) {
    cart.forEach((cartItem) => {
      const productId = cartItem.productId;

      const matchingProduct = getProduct(productId);
      const deliveryOptionId = cartItem.deliveryOptionId;

      const deliveryOption = getDeliveryOption(deliveryOptionId);

      const today = dayjs();
      const deliveryDate = today.add(deliveryOption.deliveryDays, "days");
      const dateString = deliveryDate.format("dddd ,MMMM D");

      cartSummaryHTML += `
        <div class="cart-item-container js-cart-item-container-${
          matchingProduct.id
        }">
          <div class="delivery-date">Delivery date: ${dateString}</div>

          <div class="cart-item-details-grid">
            <img
              class="product-image"
              src="${matchingProduct.image}"
            />

            <div class="cart-item-details">
              <div class="product-name">
                ${matchingProduct.name}
              </div>
              <div class="product-price">$${formatCurrency(
                matchingProduct.priceCents
              )}</div>
              <div class="product-quantity">
                <span> Quantity: <span class="quantity-label js-quantity-label-${
                  matchingProduct.id
                }">${cartItem.quantity}</span> </span>
                <span class="update-quantity-link link-primary js-update-quantity-link link-primary" data-product-id="${
                  matchingProduct.id
                }">
                  Update
                </span>
                <input class="quantity-input js-quantity-input" data-product-id="${
                  matchingProduct.id
                }">
                <span class="save-quantity-link link-primary js-save-quantity-link" data-product-id="${
                  matchingProduct.id
                }">Save</span>

                <span class="delete-quantity-link link-primary js-delete-quantity-link" data-product-id="${
                  matchingProduct.id
                }" >
                  Delete
                </span>
              </div>
            </div>

            <div class="delivery-options">
              <div class="delivery-options-title">
                Choose a delivery option:
              </div>${deliveryOptionsHTML(matchingProduct, cartItem)}
            </div>
          </div>
        </div>`;
    });

    function deliveryOptionsHTML(matchingProduct, cartItem) {
      let html = "";

      deliveryOptions.forEach((deliveryOption) => {
        const today = dayjs();
        const deliveryDate = today.add(deliveryOption.deliveryDays, "days");
        const dateString = deliveryDate.format("dddd ,MMMM D");

        const priceString =
          deliveryOption.priceCents === 0
            ? "FREE"
            : `$${formatCurrency(deliveryOption.priceCents)} -`;

        const isChecked = deliveryOption.id === cartItem.deliveryOptionId;
        html += `<div class="delivery-option js-delivery-option" data-product-id="${
          matchingProduct.id
        }" data-delivery-option-id="${deliveryOption.id}">
                <input
                  type="radio" ${isChecked ? "checked" : ""}
                  class="delivery-option-input"
                  name="delivery-option-${matchingProduct.id}"
                />
                <div>
                  <div class="delivery-option-date">${dateString}</div>
                  <div class="delivery-option-price">${priceString} - Shipping</div>
                </div>
              </div>`;
      });
      return html;
    }
  }

  document.querySelector(".js-order-summary").innerHTML = cartSummaryHTML;

  document.querySelectorAll(".js-delete-quantity-link").forEach((link) => {
    link.addEventListener("click", () => {
      const productId = link.dataset.productId;
      removeFromCart(productId);
      //console.log(cart);
      const container = document.querySelector(
        `.js-cart-item-container-${productId}`
      );
      //console.log(container);
      container.remove();
      renderPaymentSummary();

      const cartQuantity = calculateCartQuantity();
      document.querySelector(
        ".js-return-to-home-link"
      ).innerHTML = `${cartQuantity} items`;

      document.querySelector(`.js-cart-item-container-${productId}`);
    });
  });

  document.querySelectorAll(".js-delivery-option").forEach((element) => {
    element.addEventListener("click", () => {
      const { productId, deliveryOptionId } = element.dataset;
      updateDeliveryOption(productId, deliveryOptionId);
      renderOrderSummary();
      renderPaymentSummary();
    });
  });

  function updateCartQuantity() {
    const cartQuantity = calculateCartQuantity();
    document.querySelector(
      ".js-return-to-home-link"
    ).innerHTML = `${cartQuantity} items`;
  }

  updateCartQuantity();

  document.querySelectorAll(".js-update-quantity-link").forEach((link) => {
    link.addEventListener("click", () => {
      const productId = link.dataset.productId;

      const container = document.querySelector(
        `.js-cart-item-container-${productId}`
      );
      container.classList.add("is-editing-quantity");
    });
  });

  function saveQuantity(productId) {
    const container = document.querySelector(
      `.js-cart-item-container-${productId}`
    );
    container.classList.remove("is-editing-quantity");

    const quantityInput = document.querySelector(
      `.js-quantity-input[data-product-id="${productId}"]`
    );
    const newQuantity = Number(quantityInput.value);
    if (newQuantity >= 0 && newQuantity <= 1000) {
      updateQuantity(productId, newQuantity);
      const quantityLabel = document.querySelector(
        `.js-quantity-label-${productId}`
      );
      quantityLabel.innerHTML = newQuantity;
      updateCartQuantity();
      saveToStorage();
      const cartQuantity = calculateCartQuantity();
      document.querySelector(".js-cart-quantity").innerHTML = cartQuantity;
    }
  }

  document.querySelectorAll(".js-save-quantity-link").forEach((link) => {
    link.addEventListener("click", () => {
      const productId = link.dataset.productId;
      saveQuantity(productId);
    });
  });

  document.querySelectorAll(".js-quantity-input").forEach((input) => {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        const productId = input.dataset.productId;
        saveQuantity(productId);
      }
    });
  });
}
