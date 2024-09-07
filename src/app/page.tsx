"use client";

import Wheel from "./components/Wheel";
import GamesSidebar from "@/app/components/GamesSidebar";
import UsersSidebar from "@/app/components/UsersSidebar";
import {IGame} from "@/app/models/Game";
import {useEffect, useState} from "react";
import {IUser} from "@/app/models/User";

export default function Home() {
    const [selectedGame, setSelectedGame] = useState<IGame>({
            id: 1,
            turn: 1,
            numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11],
        },
    );
    const [games, setGames] = useState<IGame[]>([
        {
            id: 1,
            turn: 1,
            numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11],
        },
    ]);
    const [users, setUsers] = useState<IUser[]>([
        {
            id: 1,
            name: "Loading users",
            createdAt: ""
        },
    ]);

    const [nextNumber, setNextNumber] = useState<number>(1);
    const [currentPlayer, setCurrentPlayer] = useState<number | null>(null);
    const [winner, setWinner] = useState<boolean>(false);

    // TODO: This function could be in another package
    async function fetchGames(): Promise<void> {
        const url = `http://localhost:4567/game`;

        try {
            const response = await fetch(url, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            // TODO: We should have here a responsive 'loading' state to show a message
            const data = await response.json();

            // set games
            setGames(data.data);
            setSelectedGame(data.data[0]);
            setCurrentPlayer(data.data[0].turn)

            console.log('Data received:', data);
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    // Fetch games on load
    useEffect(() => {
        fetchGames();
    }, [])


    // TODO: This function could be in another package
    async function fetchUsers(): Promise<void> {
        const url = `http://localhost:4567/user`;

        try {
            const response = await fetch(url, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            // TODO: We should have here a responsive 'loading' state to show a message
            const data = await response.json();

            // set users
            setUsers(data.data);

            console.log('Data received:', data);
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    // Fetch users on load
    useEffect(() => {
        fetchUsers();
    }, [])

    // Create new game
    // TODO: This function could be in another package
    async function createGame(): Promise<void> {
        const url = `http://localhost:4567/game`;

        // Generate a random client seed
        const clientSeed = Math.floor(Math.random() * 1000).toString(); // Random number between 0 and 999

        const requestData = {
            client_seed: clientSeed,
            users: users.map(u => u.id)
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Game created successfully:', data);

            // TODO: This is not the right approach, just simplicity
            fetchGames();
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    // Add user
    // TODO: This function could be in another package
    async function addUser(): Promise<void> {
        // Use prompt to ask the user for the name
        const name = prompt("Enter the user's name:");

        // If the user cancels the prompt or enters nothing, return early
        if (!name) {
            console.log("No name provided.");
            return;
        }

        const url = `http://localhost:4567/user`;

        const requestData = {
            name: name
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('User created successfully:', data);

            // TODO: This is not the right approach, just simplicity
            fetchUsers();
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    async function play(gameId: number): Promise<{winner: boolean, number: number} | null> {
        const url = `http://localhost:4567/game/${gameId}/play`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            setWinner(data.data.winner);
            setNextNumber(data.data.number);
            setCurrentPlayer(data.data.turn);

            console.log(`Game ${gameId} played successfully:`, data.data);
            return { winner: data.data.winner, number: data.data.number };
        } catch (error) {
            console.error('Fetch error:', error);
            return null
        }
    }

    return (
        <div className="grid grid-cols-[250px_1fr_250px] min-h-screen">
            <GamesSidebar games={games} selectedGame={selectedGame} onGameSelect={setSelectedGame} onCreateGame={createGame} />
            <main className="flex flex-col gap-8 items-center ">
                <h1 className="text-4xl pt-4 font-bold text-center w-full">Primo!</h1>

                <div className="">
                    <Wheel game={selectedGame} winner={winner} currentPlayer={currentPlayer} nextNumber={nextNumber} play={play} />
                </div>
            </main>
            <UsersSidebar users={users} gameId={selectedGame.id} onCreateUser={addUser} currentUserId={currentPlayer} />
        </div>
    );
}
