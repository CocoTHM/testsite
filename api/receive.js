// api/receive.js - Fonction serverless pour Vercel
let kv = null;
try {
    const kvModule = await import('@vercel/kv');
    kv = kvModule.kv;
} catch (e) {
    console.log('KV not available, running without storage');
}

export default async function handler(req, res) {
    // Activer CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const data = req.body;
        const timestamp = Date.now();
        const key = `data:${timestamp}:${data.type}`;
        
        // Sauvegarder dans Vercel KV si disponible
        if (kv) {
            try {
                await kv.set(key, data);
                await kv.lpush('data:list', key);
                await kv.ltrim('data:list', 0, 999);
                console.log(`📥 ${data.type}: Saved to KV`);
            } catch (kvError) {
                console.error('KV Error:', kvError.message);
                console.log(`📥 ${data.type}: Logged only (KV unavailable)`);
            }
        } else {
            console.log(`📥 ${data.type}: ${JSON.stringify(data).substring(0, 100)}`);
        }
        
        res.status(200).json({ status: 'OK', key, kv: !!kv });
    } catch (error) {
        console.error('Error:', error.message, error.stack);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
