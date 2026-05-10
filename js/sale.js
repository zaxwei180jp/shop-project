const API_URL = "/api/products";

    console.log("HOT PRODUCTS:", data);

    const hotProducts = data.filter((p) => p.isHot === true);

    renderProducts(hotProducts);

  } catch (error) {
    console.error(error);

    productList.innerHTML = `
      <p class="text-red-500">
        無法載入熱賣商品
      </p>
    `;
  }
}

function renderProducts(products) {

  if (!products.length) {
    productList.innerHTML = `
      <p class="text-gray-500 col-span-full">
        目前沒有熱賣商品
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

loadHotProducts();  }

  productList.innerHTML = products.map((p) => `
    <a
      href="product.html?id=${p.id}"
      class="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden block"
    >
      <img
        src="${p.image}"
        alt="${p.name}"
        class="w-full aspect-square object-cover"
      />

      <div class="p-4">
        <h3 class="font-bold mb-2">
          ${p.name}
        </h3>

        <div class="flex items-center gap-2">
          <span class="text-red-500 font-bold text-xl">
            NT$ ${p.salePrice}
          </span>

          <span class="text-gray-400 line-through text-sm">
            NT$ ${p.price}
          </span>
        </div>
      </div>
    </a>
  `).join("");
}

loadSaleProducts();    <a href="product.html?id=${p.id}" 
       class="block bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">

      <img
        src="${p.image || 'https://placehold.co/600x600?text=No+Image'}"
        alt="${p.name}"
        class="w-full aspect-square object-cover"
      >

      <div class="p-4">
        <h3 class="font-bold text-lg mb-2">
          ${p.name}
        </h3>

        <div class="flex items-center gap-2">
          <span class="text-red-500 font-bold text-xl">
            NT$ ${p.salePrice}
          </span>

          <span class="text-gray-400 line-through text-sm">
            NT$ ${p.price}
          </span>
        </div>
      </div>
    </a>
  `).join("");
}

loadSaleProducts();    <a href="product.html?id=${p.id}" 
       class="block bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">

      <img
        src="${p.image || 'https://placehold.co/600x600?text=No+Image'}"
        alt="${p.name}"
        class="w-full aspect-square object-cover"
      >

      <div class="p-4">
        <h3 class="font-bold text-lg mb-2">
          ${p.name}
        </h3>

        <div class="flex items-center gap-2">
          <span class="text-red-500 font-bold text-xl">
            NT$ ${p.salePrice}
          </span>

          <span class="text-gray-400 line-through text-sm">
            NT$ ${p.price}
          </span>
        </div>
      </div>
    </a>
  `).join("");
}

loadSaleProducts();
