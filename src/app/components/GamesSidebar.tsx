import React from 'react';
import { IGame } from '../models/Game';

interface GamesSidebarProps {
    games: IGame[];
    selectedGame: IGame | null;
    onGameSelect: (game: IGame) => void;
    onCreateGame: () => Promise<void>;
}

const GamesSidebar: React.FC<GamesSidebarProps> = ({ games , selectedGame, onGameSelect, onCreateGame}) => {
    // Fetch history
    async function fetchGameHistory(gameId: number): Promise<void> {
        const url = `http://localhost:4567/game/${gameId}/history`;

        try {
            const response = await fetch(url, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            // TODO: We should have here a responsive 'loading' state to show a message
            const data = await response.json();
            alert(`History: ${JSON.stringify(data.data, null, 2)}`)
            console.log('Data received:', data);
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    return (
        <div className="w-64 h-full text-white py-5 flex flex-col" style={{backgroundColor: '#212121'}}>
            <h2 className="text-2xl font-bold mb-8 text-center">Games</h2>
            <ul className="flex-grow">
                {games ?
                    games.map((game) => (
                        <li key={game.id}>
                            <a
                                className={`block text-lg hover:text-blue-400 transition-colors duration-200 p-3 cursor-pointer ${
                                    game.id === selectedGame?.id ? 'bg-blue-500' : ''
                                }`}
                                onClick={() => onGameSelect(game)}
                            >
                                Game {game.id}
                            </a>
                        </li>
                    )) : (
                        <div className="italic text-center text-gray-500 p-3">
                            No games played :(
                        </div>
                    )
                }
            </ul>
            <a
                href="#"
                className="mb-2 mx-2 text-center inline-block bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-300"
                onClick={() => selectedGame ? fetchGameHistory(selectedGame?.id) : alert('No game selected')}
            >
                See History
            </a>
            <a
                href="#"
                className="mx-2 text-center inline-block bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 transition-colors duration-300"
                onClick={() => onCreateGame()}
            >
                Create Game
            </a>
        </div>
    );
};

export default GamesSidebar;
