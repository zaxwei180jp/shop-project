<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>特價商品</title>

  <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="bg-gray-100">

  <!-- Header -->
  <header class="bg-white shadow sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">

      <a href="index.html" class="text-2xl font-bold tracking-wide">
        SHOP
      </a>

      <nav class="flex items-center gap-6 text-sm md:text-base font-medium">

        <a href="index.html" class="hover:text-red-500 transition">
          全部商品
        </a>

        <a href="hot.html" class="hover:text-red-500 transition">
          熱賣商品
        </a>

        <a href="sale.html" class="text-red-500 font-bold">
          特價商品
        </a>

        <a href="cart.html" class="hover:text-red-500 transition">
          購物車
        </a>
      </nav>
    </div>
  </header>

  <!-- Title -->
  <section class="max-w-7xl mx-auto px-4 pt-10">
    <h1 class="text-3xl font-bold mb-8">
      特價商品
    </h1>
  </section>

  <!-- Product Grid -->
  <section class="max-w-7xl mx-auto px-4 pb-16">

    <div
      id="products"
      class="grid grid-cols-2 md:grid-cols-4 gap-6"
    ></div>

  </section>

  <script type="module" src="./js/sale.js"></script>
</body>
</html>  }

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

loadHotProducts();    <a href="product.html?id=${p.id}" 
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
          ${
            p.isSale
              ? `
                <span class="text-red-500 font-bold text-xl">
                  NT$ ${p.salePrice}
                </span>

                <span class="text-gray-400 line-through text-sm">
                  NT$ ${p.price}
                </span>
              `
              : `
                <span class="font-bold text-xl">
                  NT$ ${p.price}
                </span>
              `
          }
        </div>
      </div>
    </a>
  `).join("");
}

loadHotProducts();
