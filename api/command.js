// api/command.js - Gérer les commandes du panneau admin
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method === 'POST') {
        try {
            const { module, action, params } = req.body;
            const command = {
                id: Date.now(),
                module,
                action,
                params: params || {},
                timestamp: new Date().toISOString(),
                executed: false
            };
            
            // Stocker la commande
            await kv.set(`command:${command.id}`, command);
            await kv.set('command:latest', command);
            await kv.lpush('command:list', command.id);
            await kv.ltrim('command:list', 0, 99);
            
            console.log(`📤 Commande créée: ${module} - ${action}`);
            
            res.status(200).json({ status: 'OK', command });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else if (req.method === 'GET') {
        // Récupérer la dernière commande (pour le client)
        try {
            const command = await kv.get('command:latest');
            
            if (command && !command.executed) {
                // Marquer comme exécutée
                command.executed = true;
                await kv.set(`command:${command.id}`, command);
                await kv.set('command:latest', command);
                
                res.status(200).json(command);
            } else {
                res.status(200).json({ status: 'no-command' });
            }
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
