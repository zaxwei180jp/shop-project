export default async function handler(req, res) {
  try {
    const { NOTION_TOKEN, DATABASE_ID } = process.env;

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

    const products = data.results.map((page) => {
      const props = page.properties;

      // ⭐ 安全圖片處理
      const cover =
        page.cover?.external?.url ||
        page.cover?.file?.url ||
        "";

      const images =
        props.images?.files?.map(f =>
          f.external?.url || f.file?.url
        ) || [];

      const finalImages =
        images.length > 0
          ? images
          : cover
            ? [cover]
            : ["https://via.placeholder.com/400"];

      return {
        id: page.id,

        name: props.tname?.title?.[0]?.plain_text || "無名稱",

        price: props.tprice?.number || 0,

        originalPrice: props.originalPrice?.number || 0,

        category: props.category?.select?.name || "",

        isNew: props.isNew?.checkbox || false,

        isSale: props.isSale?.checkbox || false,

        // ⭐🔥 熱賣（容錯）
        hot:
          props.hot?.checkbox ??
          props.Hot?.checkbox ??
          props.isHot?.checkbox ??
          false,

        image: finalImages[0],
        images: finalImages,

        description:
          props.description?.rich_text?.[0]?.plain_text || "",

        createdTime: page.created_time,
        update: props.update?.date?.start || page.created_time,
      };
    });

    res.status(200).json(products);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}