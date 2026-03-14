const express = require('express');
const dhive = require('@hiveio/dhive');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const rateLimit = require('express-rate-limit');

// ---------------------
// Rate limiting – ilość prób na odcinek czasu na IP (ochronna przed botami)
const createAccountLimiter = rateLimit({
  windowMs: 48 * 60 * 60 * 1000,         // 48h
  max: 1,                       // max 5 requestów w oknie
  message: { success: false, error: 'Powoli, powoli! tylko jeden formularz na 48h.' },
  standardHeaders: true,        // zwraca RateLimit-* nagłówki
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip;              // lub req.headers['x-forwarded-for'] jeśli za proxy
  }
});

  cooldownMap.set(ip, now);
  next();
};

// ---------------------
// Zastosuj middleware'y do endpointu
app.post('/hive/sarmatia/create-account', 
  createAccountLimiter, 
  dailyLimiter, 
  cooldownMiddleware, 
  async (req, res) => {

const client = new dhive.Client([
  'https://api.syncad.com',
  'https://rpc.mahdiyari.info',
  'https://api.openhive.network',         // mainnet – tylko do testów dostępności nazwy!
  'https://anyx.io'                       // kolejny stabilny
]); // Zmień na testnet jeśli testujesz
const creator = process.env.CREATOR_USERNAME // Twój username creator'a, np. 'twojlogin'
const privateKey = dhive.PrivateKey.fromString(process.env.CREATOR_ACTIVE_KEY); // Prywatny active key (NIE COMMITUJ DO GIT!)

app.post('/hive/sarmatia/create-account', async (req, res) => {
    const { new_account_name, owner, active, posting, memo_key } = req.body;

    try {
        // Sprawdź dostępność (dodatkowa walidacja)
        const accounts = await client.database.getAccounts([new_account_name]);
        if (accounts.length > 0) {
            return res.json({ success: false, error: 'Nazwa zajęta' });
        }

        // Sprawdź i claim ACT jeśli potrzeba
        let operations = [];
        const [creatorAccount] = await client.database.getAccounts([creator]);
        if (creatorAccount.pending_claimed_accounts === 0) {
            operations.push(['claim_account', { creator, fee: '0.000 HIVE', extensions: [] }]);
        }

        // Operacja tworzenia
        operations.push(['create_claimed_account', {
            creator,
            new_account_name,
            owner,
            active,
            posting,
            memo_key,
            json_metadata: '',
            extensions: []
        }]);

        // Broadcast
        const result = await client.broadcast.sendOperations(operations, [privateKey]);
        res.json({ success: true, tx_id: result.id });
    } catch (err) {
        res.json({ success: false, error: err.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Serwer na porcie ${port}`));