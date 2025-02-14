'use client'
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { useSession } from "next-auth/react";
import { handleErrorToast, handleSuccesToast } from "@/src/toastFunctions";


export default function Squads() {
  interface SquadPlayers {
    squadId: number,
    players: string[]
  }
  const urlParams = useSearchParams()
  const router = useRouter()
  const pageParam = urlParams.get('page') ?? 1
  const limitParam = urlParams.get('limit') ?? 5
  let searchParam = urlParams.get('search') ?? ''
  const {data: session, status} = useSession();
  const [squads, setSquads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [maxPages, setMaxPages] = useState(0);
  const [onlyMySquads, setOnlyMySquads] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [allPlayers, setAllPlayers] = useState<SquadPlayers[]>([])
  if(!searchParam){
    router.push(`/squads?page=${pageParam}&limit=${limitParam}`)
  }

  const handleOnlyMySquadsFilter = () => {
    if(loggedIn){
      const mySquadsCheckbox = document.getElementById('onlyMySquads') as HTMLInputElement;
      const isChecked: boolean = mySquadsCheckbox.checked;
      if(isChecked){
        handleSuccesToast("Checking only for your squads!")
        setOnlyMySquads(true)
      } else {
        handleSuccesToast("Checking for all squads!")
        setOnlyMySquads(false)
      }
    } else {
      handleErrorToast("You have to be logged in to use this feature!")
    }
    console.log("Par Squad", onlyMySquads)
  }


  const fetchSquads = async () => {
    setLoading(true)
    try{
      const userId = session?.user.userId
      console.log("UserId in fetchSquds", userId)
      const response = await fetch('/api/squads', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json', // Specify the content type
        },
        body: JSON.stringify({
          pageParam,
          limitParam,
          searchParam,
          onlyMySquads: onlyMySquads,
          userId: session?.user.userId
        })
      })
  
      if (response.ok){
        const {squads, maxPages, allPlayers} = await response.json()
        setMaxPages(maxPages)
        setSquads(squads);
        setAllPlayers(allPlayers);
    } else {
      console.error('Error fetching squads:', response.statusText);
    }
    } catch (error) {
      console.log("Error", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSquads()
  }, [limitParam, pageParam, searchParam, onlyMySquads])

  useEffect(() => {

    if (!searchParam){
      if (Number(pageParam) > maxPages){
        console.log("HERE 1")
        router.push(`/squads?page=${maxPages}&limit=${limitParam}`)
      } else if (Number(pageParam) < 1){
        console.log("HERE 2")
        router.push(`/squads?page=1&limit=${limitParam}`);
      }
    }
  }, [maxPages])


  useEffect(() => {
    if(status === "loading"){
      return;
    }

    if(session){
      setLoggedIn(true)
    }
  }, [status])

  const handlePreviousPageAction = () => {
    if (Number(pageParam) > 1){
      router.push(`/squads?page=${Number(pageParam) - 1}&limit=${limitParam}`)
    }
  }

  const handleNextPageAction = () => {
    if (Number(pageParam) < maxPages){
      router.push(`/squads?page=${Number(pageParam) + 1}&limit=${limitParam}`)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userSearch = (document.getElementById('search') as HTMLInputElement).value;
    if (userSearch === ''){
      router.push(`/squads?page=${pageParam}&limit${limitParam}`)
    }
    router.push(`/squads?page=${pageParam}&limit${limitParam}&search=${userSearch}`)
  }
  
  return(
<div className="flex justify-center items-center mt-10">
  <div className="bg-white w-[70rem] h-[40rem] rounded-xl shadow-xl">
    <div className="p-4 flex justify-evenly items-center">
        {/* Title */}
        <h1 className="text-5xl text-[#3795BD] font-bold">Squads Available</h1>
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            name="search"
            id="search"
            placeholder="Name Or Game..."
            className="border-2 rounded-xl p-2 pr-12 focus:outline-none focus:border-[#3795BD] transform duration-300 w-full"
          />
          <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent mr-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-[#3795BD]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15z" />
            </svg>
          </button>
        </form>
        <button onClick={() => fetchSquads()}><Image alt="loop button" className="hover:-translate-y-1 duration-300 transform" src={'/logo/icons8-restart.svg'} width={25} height={25}></Image></button>
        <div className="flex flex-col items-center mt-4">
          <label htmlFor="onlyMySquads" className="cursor-pointer text-lg text-gray-700">Show only my squads</label>
          <input id="onlyMySquads" className="cursor-pointer" type="checkbox" onChange={handleOnlyMySquadsFilter}/>
        </div>
        <button onClick={() => {session ? router.push('/create-squad') : handleErrorToast("You have to be logged in to use this feature!")}} className="bg-[#3795BD] text-white py-2 px-4 rounded-md hover:-translate-y-1 transform hover:shadow-md duration-300">
          Create Squad
        </button>
      </div>
    <div className="flex flex-col w-full justify-evenly">

      <div className="flex border-b bg-gray-200">
        <h3 className="text-lg font-semibold flex-1 text-center p-4">Squad Name</h3>
        <h3 className="text-lg font-semibold flex-1 text-center p-4">Game</h3>
        <h3 className="text-lg font-semibold flex-1 text-center p-4">Players</h3>
        <h3 className="text-lg font-semibold flex-1 text-center p-4">Date</h3>
      </div>
      
      {squads.length > 0 && squads.map((squad) => {
        const allPlayersOfSquad = allPlayers.filter((item) => item.squadId === squad.id)
        console.log("allPlayersOfSquad ", allPlayers )
        return(
          <ul className="space-y-2" key={squad.id}>
            <li className="p-4 border-b hover:bg-[#3795BD] transition-colors duration-300 flex hover:cursor-pointer" onClick={() => {session ? router.push(`/squads/${squad.id}`) : handleErrorToast("You have to be logged in to use this feature!")}}>
              <h3 className="text-lg font-semibold flex-1 text-center">{squad.name}</h3>
              <h3 className="text-lg font-semibold flex-1 text-center">{squad.game}</h3>
              <h3 className="text-lg font-semibold flex-1 text-center">{allPlayersOfSquad[0].players.length}/{squad.maxPlayers}</h3>
              <h3 className="text-lg font-semibold flex-1 text-center">{squad.date}</h3>
            </li>
          </ul>
        )
      })}
    </div>
    <div className="text-center mt-2 space-x-3">
      <button className="border-2 rounded-full p-2 transform duration-300 hover:border-[#3795BD]" onClick={handlePreviousPageAction}><Image alt="GG" src={'/logo/left-arrow.svg'} width={8} height={8}/></button>
      <button className="hover:cursor-default">{pageParam}</button>
      <button className="border-2 rounded-full p-2 transform duration-300 hover:border-[#3795BD]" onClick={handleNextPageAction}><Image alt="GG" src={'/logo/right-arrow.svg'} width={8} height={8}/></button>
      <h3 className="relative right-1 mt-2">Last Page : {maxPages}</h3>
    </div>
    <div className="text-3xl text-center text-[#3795BD] flex flex-col">
        {loading ? <h1 className="transform duration-300">Loading...</h1> : ''} 
    </div>
    <div>
    </div>
  </div>
</div>

  );
}
