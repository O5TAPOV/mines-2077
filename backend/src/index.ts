import express, { Request, Response } from 'express';
import cors from 'cors';
import { error } from 'node:console';

const app = express();
app.use(cors());
app.use(express.json());

const users: any[] = [];
const PORT = process.env.PORT || 3000;

function createGrid(bombsCount: number) {
    const grid = new Array(25).fill(0);

    let planted = 0;
    while(planted < bombsCount)
    {
        const randomIndex = Math.floor(Math.random() * 25);
        
        if(!grid[randomIndex]) {
            grid[randomIndex] = 1;
            planted++;
        }
    }

    return grid;
}

app.post('/register', (req: Request, res: Response) => {
    const { username } = req.body;

    const newPlayer = {
        id: users.length + 1,
        username: username,
        balance: 1000
    };

    users.push(newPlayer);

    console.log(`\n🎉 New Player: ${newPlayer.username}. Balance: ${newPlayer.balance} 💰\n`)

    res.json(newPlayer);
});


app.post('/start-game', (req: Request, res: Response) => {
    const {username, bet} = req.body;

    const player = users.find(u => u.username === username);

    if (!player)
        return res.status(404).json({error: "Гравця не знайдено! Спочатку пройдіть реєстрацію."});

    if (player.balance < bet)
        return res.status(400).json({error: "Недостатньо грошей на балансі!"});

    if(player.currentGame)
        return res.status(400).json({error: "Ви вже у грі! Зробіть хід або заберіть куш."})

    const grid = createGrid(3);
    player.currentGame = grid;
    player.currentWinnings = 0;

    player.balance -= bet;

    console.log(`\n🎲 Гравець ${player.username} зробив ставку ${bet}. Залишок: ${player.balance}\n`);

    res.json({
        message: "Ставка прийнята! Гра почалась.",
        bet: bet,
        currentBalance: player.balance
    });
});

app.post('/click', (req: Request, res: Response) => {
    const {username, cellIndex} = req.body;
    
    const player = users.find(u => u.username === username);

    if(!player.currentGame)
        return res.status(400).json({error: "Ви ще не зробили ставку та не розпочали гру!"});

    const state = player.currentGame[cellIndex];

    if(state === 1)
    {
        player.currentGame = null;
        player.currentWinnings = 0;
        return res.json({
            message: "БУУУМ! Ви підірвалися.",
            currentBalance: player.balance
        })
    };

    if(state === 0)
    {
        player.currentWinnings += 50;
        player.currentGame[cellIndex] = -1;
        return res.json({
            message: "СЕЙВ. +50 ПОТУЖНИХ",
            currentWinnings: player.currentWinnings,
            cellIndex: cellIndex
        });
    }
    
    return res.json({
        message: "Ви вже відкрили цю комірку",
        currentBalance: player.balance,
        cellIndex: cellIndex
    });
});

app.post('/cashout', (req: Request, res: Response) => {
    const {username} = req.body;
    const player = users.find(u => u.username === username);

    if(!player.currentGame)
        return res.status(400).json({error: "Гру не розпочато!"});

    player.balance += player.currentWinnings;

    player.currentGame = null;
    player.currentWinnings = 0;

    res.json({
        message: "Виграш забрано!",
        currentBalance: player.balance
    })
});

app.post('/promo', (req: Request, res: Response) => {
    const {username, code} = req.body;

    const player = users.find(u => u.username === username);

    if (!player)
        return res.status(404).json({error: "Гравця не знайдено! Спочатку пройдіть реєстрацію."});

    if(code == "BOOST2026")
        player.balance += 500;
    else
        return res.status(400).json({error: "Невірний промокод"});

    console.log(`🎁 Гравець ${player.username} успішно використав промокод BOOST! Поточний баланс: ${player.balance}`);

    res.json({
        message: "Промокод активований. Кошти нараховані",
        currentBalance: player.balance
    });
});

app.listen(PORT, () => {
    console.log(`Бекенд Сапера крутиться на порту ${PORT}`);
});