const API_URL = "/api/products";
}

function renderProducts(products) {

  if (!products.length) {
    productList.innerHTML = `
      <p class="text-gray-500 col-span-full">
        目前沒有商品
      </p>
    `;
    return;
  }

  productList.innerHTML = products.map((p) => `

    <a
      href="product.html?id=${p.id}"
      class="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition block"
    >

      <img
        src="${p.image}"
        alt="${p.name}"
        class="w-full aspect-square object-cover"
      >

      <div class="p-4">

        <h3 class="font-bold mb-2 line-clamp-2 min-h-[48px]">
          ${p.name}
        </h3>

        ${
          p.isSale
            ? `
              <div class="flex items-center gap-2">
                <span class="text-red-500 font-bold text-xl">
                  NT$ ${p.salePrice}
                </span>

                <span class="text-gray-400 line-through text-sm">
                  NT$ ${p.price}
                </span>
              </div>
            `
            : `
              <span class="font-bold text-xl">
                NT$ ${p.price}
              </span>
            `
        }
      </div>
    </a>
  `).join("");
}

loadProducts();