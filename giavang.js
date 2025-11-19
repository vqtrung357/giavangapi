import axios from "axios";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    // Lấy trang bảng giá vàng HTML mới
    const response = await axios.get("https://sjc.com.vn/giavang");
    const $ = cheerio.load(response.data);
    // Tìm dòng đầu tiên có chữ 'SJC' (thường là loại vàng SJC 1L)
    const sjcRow = $("table").first().find("tr").filter(function () {
      return $(this).find("td").first().text().trim().includes("SJC");
    }).first();
    const tds = sjcRow.find("td");
    if (tds.length < 4) {
      res.status(500).json({ error: "Không tìm thấy/cấu trúc bảng thay đổi!" });
      return;
    }
    const result = {
      brand: $(tds[0]).text().trim(),
      type: $(tds[1]).text().trim(),
      buy: Number($(tds[2]).text().replace(/[^\d.]/g, "")),
      sell: Number($(tds[3]).text().replace(/[^\d.]/g, ""))
    };
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: "Scrape error", detail: String(e) });
  }
}
