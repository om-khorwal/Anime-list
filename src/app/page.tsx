'use client';
import React from "react";
import axios from "axios";

export default function Home() {
  const [anime, setanime] = React.useState<any>(Object);
  const getQuote = () => {
    axios.get("https://api.jikan.moe/v4/seasons/2011/spring?sfw")
      .then((Response) => {
        const data = Response.data;
        console.log(data);
        setanime(data)
      })
      .catch((error) => {
        console.log(error);
      })

  }
  return (
    <>
      <div className="   min-h-screen w-full flex flex-col">
        <div className=" fixed top-0 left-0 w-full h-full bg-cover bg-center -z-10" >
          <img
            className="w-full"
            src="https://images.pexels.com/photos/8137085/pexels-photo-8137085.png?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            alt="Background"
          />
        </div>

        <div className="w-full h-auto flex flex-col items-center justify-start pt-10 z-10 bg-black/70">
          
          <div className="text-white flex flex-col items-center justify-center p-10 w-full">
            <h1 className="text-3xl">Welcome to the world of anime.</h1>
          </div>
          <div className="w-full p-2 flex flex-col items-center justify-center">
            <button onClick={getQuote} className="px-5 py-3 bg-white rounded-2xl active:scale-95">Get Anime data</button>
          </div>
          <div className="w-full p-0 flex">
            <div className="w-full p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 overflow-y-auto">
              {
                anime.data?.map((items: any, index: any) => (
                  <div key={index} className="bg-white/20 rounded-2xl p-5 m-2 w-full flex flex-col items-center justify-center">
                    <img src={items.images?.jpg?.image_url} alt={items.images} className="w-full min-h-fit object-cover rounded-lg" />
                    <h4 className="text-white">{items.title}</h4>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
