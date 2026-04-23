import { useState } from 'react';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [playerData, setPlayerData] = useState<any>();
  const [grid, setGrid] = useState<any>({});
  const [inGame, setInGame] = useState(false);
  const API_URL = "https://mines-backend-2077.onrender.com";

  const handleRegister = async () => {
    if (!username) return alert('Йой, введіть ім\'я!');

    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: username }),
    });

    const data = await response.json();
    console.log("Привіт від сервера:", data);

    setPlayerData(data);
  }

  const handleStartGame = async () => {
    const response = await fetch(`${API_URL}/start-game`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: username, bet: 100 }),
    });

    const data = await response.json();
    setPlayerData({ ...playerData, balance: data.currentBalance });
    setGrid({});
    setInGame(true);
  }

  const handleCellClick = async (index: number) => {
    const response = await fetch(`${API_URL}/click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: username, cellIndex: index }),
    });

    const data = await response.json();
    if (data.error) {
      return alert(data.error)
    }

    if (data.message === "СЕЙВ. +50 ПОТУЖНИХ") {
      setGrid({ ...grid, [index]: 'safe' });
      setPlayerData({ ...playerData, balance: data.currentBalance });
    }

    if (data.message === "БУУУМ! Ви підірвалися.") {
      setGrid({ ...grid, [index]: 'bomb' });
      setPlayerData({ ...playerData, balance: data.currentBalance });
      setInGame(false);
    }
  }

  const handleCashout = async () => {
    const response = await fetch(`${API_URL}/cashout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: username }),
    });

    const data = await response.json();
    setPlayerData({ ...playerData, balance: data.currentBalance });
    setGrid({});
    setInGame(false);
  }

  return (
    <div className="casino-wrapper">
      <div className="glass-dashboard">
        <h1 className="cyber-title">💣 Сапер 2077</h1>

        {!playerData ? (
          <div>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Вхід до Клубу</h2>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <input type="text" className="cyber-input" placeholder="Кодова кличка..." value={username} onChange={(e) => setUsername(e.target.value)} />
              <button onClick={handleRegister} className="cyber-btn">Лудоманіяленд</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2>Welcome back, <span style={{ color: '#00ffff' }}>{playerData.username}</span></h2>
            <p className="balance-text">Баланс: <span className="gold">{playerData.balance} 💰</span></p>

            {!inGame && (<button className="cyber-btn" onClick={handleStartGame}>Депнуть хату</button>)}

            <div className="mine-grid">
              {Array.from({ length: 25 }).map((_, index) => {
                // Визначаємо стиль для кожної клітинки
                let extraClass = "";
                if (grid[index] === 'safe') extraClass = "cell-safe";
                if (grid[index] === 'bomb') extraClass = "cell-bomb";

                return (
                  <button
                    key={index}
                    className={`mine-cell ${extraClass}`}
                    onClick={() => handleCellClick(index)}
                  >
                    {grid[index] === 'safe' ? '💎' : ''}
                    {grid[index] === 'bomb' ? '💣' : ''}
                  </button>
                );
              })}
            </div>

            {inGame && (<button className="cyber-btn cashout" onClick={handleCashout}>Забрати куш на жигулі</button>)}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;