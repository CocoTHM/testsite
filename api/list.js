// api/list.js - Récupérer toutes les données stockées
import { kv } from '@vercel/kv';

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
        // Récupérer la liste des clés
        const keys = await kv.lrange('data:list', 0, 99); // 100 dernières entrées
        
        // Récupérer les données pour chaque clé
        const dataPromises = keys.map(key => kv.get(key));
        const allData = await Promise.all(dataPromises);
        
        res.status(200).json({
            count: keys.length,
            data: allData.filter(d => d !== null)
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
