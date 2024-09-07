import React, {useState} from 'react';
import { IGame } from '../models/Game';
import {IUser} from "@/app/models/User";

interface UserSidebarProps {
    users: IUser[];
    gameId: number;
    onCreateUser: () => Promise<void>;
    currentUserId: number | null;
}


const UsersSidebar: React.FC<UserSidebarProps> = ({ users, gameId, onCreateUser, currentUserId }) => {
    // Fetch user stats
    async function fetchGameUserData(gameId: number, userId: number, name: string): Promise<void> {
        const url = `http://localhost:4567/game/${gameId}/user/${userId}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            // TODO: We should have here a responsive 'loading' state to show a message
            const data = await response.json();
            alert(`${name}: wins: ${data.data.wins}, losses: ${data.data.losses}`)
            console.log('Data received:', data);
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    return (
        <div className="w-64 h-full text-white py-5 flex flex-col" style={{backgroundColor: '#212121'}}>
            <h2 className="text-2xl font-bold mb-8 text-center">Users</h2>
            <ul className="flex-grow">
                {users ?
                    users.map((user) => (
                        <li key={user.id}>
                            <a
                                className={`block text-lg hover:bg-gray-600 transition-colors duration-200 p-3 cursor-pointer ${
                                    user.id === currentUserId ? 'bg-amber-300' : ''
                                }`}
                                onClick={() => fetchGameUserData(gameId, user.id, user.name)}
                            >
                                {user.name}
                            </a>
                        </li>
                    )) : (
                        <div className="italic text-center text-gray-500 pt-4">
                            No users found :(
                        </div>
                    )
                }
            </ul>
            <a
                href="#"
                className="mb-2 mx-2 text-center inline-block bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 transition-colors duration-300"
                onClick={() => onCreateUser()}
            >
                Add User
            </a>
        </div>
    );
};

export default UsersSidebar;
