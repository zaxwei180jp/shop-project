export default async function handler(req, res) {

  const NOTION_API_KEY = "你的key";
  const DATABASE_ID = "你的id";

  const response = await fetch(
    `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      }
    }
  );

  const data = await response.json();

  const products = data.results.map(item => ({
    id: item.id,
    name: item.properties.name.title[0]?.plain_text || "",
    price: item.properties.price.number || 0,
    image: item.properties.image.url || "",
    category: item.properties.category.select?.name || "",
    description: item.properties.description.rich_text[0]?.plain_text || ""
  }));

  res.status(200).json(products);
}