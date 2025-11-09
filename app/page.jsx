// app/page.jsx
import Image from 'next/image';
import TripItineraryGrid from './components/TripItineraryGrid';
import MoneyConverter from './components/MoneyConverter';
import AccommodationsTailored from './components/Accommodations';
import CityExplorer from './components/CityExplorer';
import HakoneOnsenSection from './components/HakoneOnsenSection';
import HakoneOnsenServer from "./components/HakoneOnsenServer";
import cityGuideData from './data/cityGuideData';
import SupabaseProbe from './components/SupabaseProbe';
import DBDoctor from './components/DBDoctor';


// app/page.jsx
export const dynamic = 'force-dynamic'; // no SSG; render at request time
export const revalidate = 0;            // disable ISR too

// (rest of your file)


export default function Home() {
  // Use a real UUID; the component will insert a trip row if missing (per our earlier code)
  const tripId = '00000000-0000-0000-0000-000000000001';

  return (
    <div>
      <main className="w-screen">
        <section className="grid grid-cols-1">
          <div className="h-screen items-center justify-center bg-cover bg-top-left lg:bg-fixed bg-[url('https://wallpapercave.com/wp/wp9092061.jpg')]">
            <div className="h-full relative text-white flex flex-col justify-center items-center">
              <h1 className="text-3xl md:text-7xl xl:text-9xl font-extrabold">Japan</h1>
              <h2 className="text-xl lg:text-3xl">Tokyo | Kyoto | Osaka | Hakone</h2>
            </div>
          </div>
          <div className="bg-red-600 text-white flex flex-col  w-full p-10">
            <h2 className=" text-5xl flex font-bold py-5 ">Helpful Reminders</h2>
            <ul className=" text-xl gap-2 font-light grid grid-cols-1 lg:grid-cols-2">
              <li className="">Tourism registry/ customs</li>
              <li className="">7/11 best money exchange</li>
              <li className="">Buy Food at Bullet Train station</li>
              <li className="">Luggage Hold locations</li>
              <li className="">Osaka city pass good deal</li>
              <li className="">Hakone pass</li>
              <li className="">E sim (Phone Data)</li>
              <li className="">For an emergency in Japan, dial 110 for police, 119 for fire or ambulance, or 118 for the Coast Guard. For non-emergency medical advice, you can call #7119. For tourist assistance during an emergency, the Japan Visitor Hotline is available at 050-3816-2787. </li>
            </ul>
          </div>

          <div className="p-4 md:p-10">
            <div id='Itinerary' className="py-20 h-full ">
              <h1 className=" text-3xl lg:text-8xl font-bold uppercase">Itinerary</h1>
              <div>
                <TripItineraryGrid tripId={tripId} days={14} />
              </div>
            </div>
          </div>
        </section>
        <section className=" h-[600px] bg-center bg-cover lg:bg-fixed bg-[url('https://wallpapercave.com/wp/wp9417657.jpg')]">
          
        </section>
        <section id='accommodations' className="h-full py-20">
          <div className=" p-4 md:p-10">
          <AccommodationsTailored tripId={tripId} />
          </div>
        </section>
        <section className=" grid grid-cols-2 lg:grid-cols-4  h-[600px] ">
          <div className=" bg-cover bg-[url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRarWQBKGQ6N-_Iw8T7cW3_4MK40xGtEI46PmZa5zG0z1oTk9f-rMkWExdykNZv6s_4j3w&usqp=CAU')]"></div>
          <div className=" bg-cover bg-[url('https://www.japanrailpassnow.com/wp-content/uploads/2016/09/Tokyo-Tower-Twilight.jpg')]"></div>
          <div className=" bg-cover bg-[url('https://www.neverendingvoyage.com/wp-content/uploads/2019/09/kyoto-japan-26.jpg')]"></div>
          <div className=" bg-cover bg-[url('https://cdn.cheapoguides.com/wp-content/uploads/sites/3/2024/05/kobe-port_Sean_Pavone_GettyImages-920466394.jpg')]"></div>
          <div className=" bg-cover bg-[url('https://i0.wp.com/www.touristjapan.com/wp-content/uploads/2017/04/shutterstock_1303030627.jpg?resize=1024%2C683&ssl=1')]"></div>
          <div className=" bg-cover bg-[url('https://digjapan.travel/files/topics/11262_ext_80_en_0.jpg')]"></div>
          <div className=" bg-cover bg-[url('https://chrisandwrensworld.com/wp-content/uploads/2024/11/osaka-castle-park.jpg')]"></div>
          <div className=" bg-cover bg-[url('https://boutiquejapan.com/wp-content/uploads/2020/09/Shinsekai-Osaka-Japan-scaled.jpg')]"></div>
        </section>
        <section id='events' className="h-full p-4 md:p-10 py-40">
          <div className="">
            <h1 className=" text-3xl py-10 lg:text-8xl font-bold">Event List</h1>
            <SupabaseProbe className='hidden' tripId={tripId} />
            <DBDoctor className='hidden'  tripId={tripId} />
          <CityExplorer
        tripId={tripId}
        initialData={cityGuideData}
        autoApplyInitialData={true} // set true to overwrite DB once on load
        requireDB={false}
      />
          </div>
        </section>
        <section className="">
        <HakoneOnsenSection />
        </section>
      </main>
    </div>
  );
}
