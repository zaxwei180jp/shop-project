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

      // ⭐ 圖片來源（全部兼容）
      let image = "";

      // 1️⃣ cover
      if (page.cover) {
        image =
          page.cover.external?.url ||
          page.cover.file?.url ||
          "";
      }

      // 2️⃣ files
      const files =
        props.images?.files?.map(f =>
          f.external?.url || f.file?.url
        ) || [];

      // 3️⃣ rich_text（貼網址）
      const textImg =
        props.image?.rich_text?.[0]?.plain_text || "";

      // 4️⃣ url 欄位
      const urlImg =
        props.image?.url || "";

      // ⭐ 最終圖片
      const finalImage =
        files[0] ||
        image ||
        textImg ||
        urlImg ||
        "https://via.placeholder.com/400";

      const finalImages =
        files.length > 0
          ? files
          : [finalImage];

      return {
        id: page.id,

        name: props.tname?.title?.[0]?.plain_text || "無名稱",

        price: props.tprice?.number || 0,

        originalPrice: props.originalPrice?.number || 0,

        category: props.category?.select?.name || "",

        isNew: props.isNew?.checkbox || false,

        isSale: props.isSale?.checkbox || false,

        hot:
          props.hot?.checkbox ??
          props.Hot?.checkbox ??
          props.isHot?.checkbox ??
          false,

        image: finalImage,
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