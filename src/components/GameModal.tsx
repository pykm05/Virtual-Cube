"use client"
import { useEffect, useState } from "react";
import { getSocket, Socket } from "@/lib/socket";
import { Player } from "@/types/player";
import { RoomState } from "@/types/RoomState";
import Image from "next/image";
import { useRouter } from "next/navigation";


export default function GameModal() {

  const [socket, setSocket] = useState<Socket>();
  const [player, setplayer] = useState<Player>();
  const [cubeSolved, setCubeSolved] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [playerRanks, setPlayerRanks] = useState<Player[]>([]);

  const router = useRouter();

  function findNewGame() {
    if (!socket || !player) return;

    socket.emit("room:search", player.username);

    socket.on("room:found", (roomID) => {
      console.log("now joining room ", roomID);
      router.push(`../play/${roomID}`);

      socket.off("room:found");
    });
  }

  function displayResults() {
    if (!player) return;

    const tied = playerRanks[0].solveTime == playerRanks[1].solveTime;
    const opponent = player.id == playerRanks[0].id ? playerRanks[1] : playerRanks[0];
    const oppDNF = opponent.isDNF;
    const won = (oppDNF || opponent.id == playerRanks[1].id)

    return (
      <div className="flex flex-col w-full h-full">
        <div className="flex text-lg mb-[20px] justify-center items-center px-3 py-5 border-b-2">{tied ? "Tie" : won ? "You won!" : "You lost"}</div>
        {!tied && (
          <div className="flex">
            <div className="flex flex-1 justify-center">
              {!oppDNF && !won && 
                <Image src="/crown.svg" height={40} width={40} priority={true} alt="user icon" />
              }
            </div>
            <div className="flex flex-1 justify-center">
              {won &&
                <Image src="/crown.svg" height={40} width={40} priority={true} alt="user icon" />
              }
            </div>
          </div>
        )}
        <div className="flex mb-[40px] w-full h-full items-center">
          <div className="flex flex-1 flex-col items-center">
            <Image src="/account_circle.svg" height={75} width={75} priority={true} alt="user icon" />
            <div>{opponent.username}</div>
            <div>{oppDNF ? "DNF" : opponent.solveTime}</div>
          </div>
          <div className="flex flex-1 flex-col items-center">
            <Image src="/account_circle.svg" height={75} width={75} priority={true} alt="user icon" />
            <div>{player.username}</div>
            <div>{player.solveTime}</div>
          </div>
        </div>
        <div className="flex justify-center items-center gap-[20px] px-3 py-7">
          <button onClick={findNewGame} className="hover:bg-gray-200 px-9 py-4 border-2 rounded-[10px]">New Game</button>
          <button className="hover:bg-gray-200 px-9 py-4 border-2 rounded-[10px]">Rematch</button>
        </div>
      </div>
    )
  }

  useEffect(() => {
    const socket = getSocket();
    setSocket(socket);

    socket.on("player:completed_solve", (p: Player) => {
      setplayer(p);
      setCubeSolved(true);
    });

    socket.on("game:complete", (rankings: Player[]) => {
      setGameComplete(true);
      setPlayerRanks(rankings);
    })
  }, []);

  return (
    cubeSolved ? (
      <div className="fixed inset-0 z-50 bg-black/50 w-full h-full p-3 flex justify-center items-center">
        <div className="flex justify-center items-center rounded-[20px] w-[400px] bg-white">
          {gameComplete ? (
            displayResults()
          ) : <div>Awaiting players to finish...</div>
          }
        </div>
      </div>
    ) : null
  );
}
