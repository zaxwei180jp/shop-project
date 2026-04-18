const SUPABASE_URL = "https://khbtzvdzdyahstlaszbe.supabase.co";
const SUPABASE_KEY = "sb_publishable_AmwMoCJ-OQUShoPQoEH1Fw_Y-6qmQpQ";

fetch(`${SUPABASE_URL}/rest/v1/products`, {
  headers: {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`
  }
})
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById("product-list");
    list.innerHTML = "";

    data.forEach(p => {
      list.innerHTML += `
        <div class="bg-white p-4 rounded-2xl shadow">
          <img src="${p.image}" class="rounded-xl mb-3">
          <h3 class="font-bold">${p.name}</h3>
          <p class="text-gray-500">NT$${p.price}</p>
          <button onclick="addToCart('${p.id}')"
            class="mt-3 bg-black text-white px-4 py-2 rounded-xl">
            加入購物車
          </button>
        </div>
      `;
    });
  });