import axios from "axios";
import { parseStringPromise } from "xml2js";

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const resp = await axios.get(
      "http://giavang.doji.vn/api/giavang/?api_key=258fbd2a72ce8481089d88c678e9fe4f",
      { 
        responseType: "text",
        timeout: 10000 
      }
    );
    
    const parsed = await parseStringPromise(resp.data, { explicitArray: false });
    const rows = parsed.GoldList.DGPlist.Row;
    const arr = Array.isArray(rows) ? rows : [rows];
    
    // Lấy đúng 2 dòng HN lẻ, HCM lẻ
    const hn = arr.find((r) => r.$ && r.$.Name && r.$.Name.includes("DOJI HN lẻ"));
    const hcm = arr.find((r) => r.$ && r.$.Name && r.$.Name.includes("DOJI HCM lẻ"));
    
    if (!hn || !hcm) {
      throw new Error("Không tìm được giá vàng chi nhánh!");
    }

    const buy = (
      Number(hn.$.Buy.replace(/[^\d.]/g, "")) + 
      Number(hcm.$.Buy.replace(/[^\d.]/g, ""))
    ) / 2;
    
    const sell = (
      Number(hn.$.Sell.replace(/[^\d.]/g, "")) + 
      Number(hcm.$.Sell.replace(/[^\d.]/g, ""))
    ) / 2;

    return res.status(200).json({
      brand: 'DOJI Avg HN-HCM',
      buy,
      sell,
      details: [
        { 
          name: hn.$.Name, 
          buy: Number(hn.$.Buy.replace(/[^\d.]/g, "")), 
          sell: Number(hn.$.Sell.replace(/[^\d.]/g, "")) 
        },
        { 
          name: hcm.$.Name, 
          buy: Number(hcm.$.Buy.replace(/[^\d.]/g, "")), 
          sell: Number(hcm.$.Sell.replace(/[^\d.]/g, "")) 
        }
      ]
    });
  } catch (e) {
    console.error('Error fetching gold price:', e);
    return res.status(500).json({ 
      error: "Scrape error", 
      detail: e.message || String(e) 
    });
  }
}
