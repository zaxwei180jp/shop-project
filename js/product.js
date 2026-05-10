export default async function handler(req, res) {
  const { NOTION_TOKEN, DATABASE_ID } = process.env;

  try {
    const notionRes = await fetch(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
      }
    );

    const data = await notionRes.json();

    const getText = (prop) =>
      (prop?.title && prop.title[0]?.plain_text) ||
      (prop?.rich_text && prop.rich_text[0]?.plain_text) ||
      "";

    const getNumber = (prop) => prop?.number || 0;

    const products = data.results.map((page) => {
      const props = page.properties;

      const images =
        (props.images &&
          props.images.files.map((f) =>
            f.type === "external" ? f.external.url : f.file.url
          )) ||
        [];

      const image =
        (props.image &&
          props.image.files[0] &&
          (props.image.files[0].external?.url ||
            props.image.files[0].file?.url)) ||
        images[0] ||
        "/no-image.png";

      return {
        id: page.id,
        name: getText(props.tname),
        price: getNumber(props.tprice),
        image,
        images,
        category: getText(props.category),
        isSale: props.isSale?.checkbox || false,
        isNew: props.isNew?.checkbox || false,
        hot: props.hot?.checkbox || false,
        createdTime: page.created_time,
      };
    });

    res.status(200).json(products);
  } catch (e) {
    res.status(500).json({ error: "API error" });
  }
}