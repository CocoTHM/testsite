// api/list.js - Récupérer toutes les données stockées
let kv = null;
try {
    const kvModule = await import('@vercel/kv');
    kv = kvModule.kv;
} catch (e) {
    console.log('KV not available');
}

// Stockage en mémoire si KV non disponible
let memoryStore = {
    data: []
};

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
        let allData = [];
        
        if (kv) {
            try {
                // Récupérer la liste des clés
                const keys = await kv.lrange('data:list', 0, 99); // 100 dernières entrées
                
                // Récupérer les données pour chaque clé
                const dataPromises = keys.map(key => kv.get(key));
                allData = await Promise.all(dataPromises);
                allData = allData.filter(d => d !== null);
            } catch (kvError) {
                console.error('KV Error:', kvError.message);
                allData = memoryStore.data;
            }
        } else {
            allData = memoryStore.data;
        }
        
        res.status(200).json({
            count: allData.length,
            data: allData,
            storage: kv ? 'kv' : 'memory'
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
}
