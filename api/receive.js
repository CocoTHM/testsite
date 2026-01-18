// api/receive.js - Fonction serverless pour Vercel avec KV Storage
import { kv } from '@vercel/kv';

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
        
        // Sauvegarder dans Vercel KV (Redis)
        await kv.set(key, data);
        
        // Ajouter à une liste pour pouvoir récupérer toutes les données
        await kv.lpush('data:list', key);
        
        // Garder seulement les 1000 dernières entrées
        await kv.ltrim('data:list', 0, 999);
        
        console.log(`📥 ${data.type}: ${data.lat || data.image ? 'OK' : 'data'} - Saved to KV`);
        
        res.status(200).json({ status: 'OK', key });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
