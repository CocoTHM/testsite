// api/command.js - Gérer les commandes du panneau admin
let kv = null;
try {
    const kvModule = await import('@vercel/kv');
    kv = kvModule.kv;
} catch (e) {
    console.log('KV not available');
}

// Stockage en mémoire si KV non disponible
let memoryStore = {
    latestCommand: null,
    commands: []
};

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method === 'POST') {
        try {
            const { module, action, params = {} } = req.body;
            
            const command = {
                id: Date.now().toString(),
                module,
                action,
                params,
                executed: false,
                timestamp: Date.now()
            };
            
            if (kv) {
                try {
                    await kv.set(`command:${command.id}`, command);
                    await kv.set('command:latest', command);
                    await kv.lpush('command:list', command.id);
                    await kv.ltrim('command:list', 0, 99);
                } catch (kvError) {
                    console.error('KV Error:', kvError.message);
                    memoryStore.latestCommand = command;
                    memoryStore.commands.unshift(command);
                }
            } else {
                memoryStore.latestCommand = command;
                memoryStore.commands.unshift(command);
            }
            
            console.log(`📤 Commande créée: ${module} - ${action}`);
            
            res.status(200).json({ status: 'OK', command, storage: kv ? 'kv' : 'memory' });
        } catch (error) {
            console.error('Error:', error.message);
            res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    } else if (req.method === 'GET') {
        // Récupérer la dernière commande (pour le client)
        try {
            let command = null;
            
            if (kv) {
                try {
                    command = await kv.get('command:latest');
                } catch (kvError) {
                    command = memoryStore.latestCommand;
                }
            } else {
                command = memoryStore.latestCommand;
            }
            
            if (command && !command.executed) {
                // Marquer comme exécutée
                command.executed = true;
                
                if (kv) {
                    try {
                        await kv.set(`command:${command.id}`, command);
                        await kv.set('command:latest', command);
                    } catch (kvError) {
                        memoryStore.latestCommand = command;
                    }
                } else {
                    memoryStore.latestCommand = command;
                }
                
                res.status(200).json(command);
            } else {
                res.status(200).json({ status: 'no-command' });
            }
        } catch (error) {
            console.error('Error:', error.message);
            res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
    }
}
