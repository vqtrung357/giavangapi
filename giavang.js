import axios from "axios";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const response = await axios.get(
      "https://sjc.com.vn/giavang/textcontent.php",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const $ = cheerio.load(response.data);
    // Lấy dòng giá đầu tiên (trừ header) theo cấu trúc bảng site SJC
    const firstRow = $("tr").eq(1).find("td");
    const result = {
      brand: $(firstRow[0]).text().trim(),
      type: $(firstRow[1]).text().trim(),
      buy: Number($(firstRow[2]).text().replace(/[^\d.]/g, "")),
      sell: Number($(firstRow[3]).text().replace(/[^\d.]/g, ""))
    };
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: "Scrape error", detail: String(e) });
  }
}
