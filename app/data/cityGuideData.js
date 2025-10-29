// app/data/cityGuideData.js
// Data for CityExplorer: { [city]: { eat, shop, drink, visit, onsen } }
// Each array item: { title, embed_url, address, price_estimate, notes, order? }

const cityGuideData = {
    Tokyo: {
      drink: [
        { title: "Golden Gai", embed_url: "", address: "1 Chome-1 Kabukicho, Shinjuku City, Tokyo", price_estimate: "", notes: "Famous tiny-bar alley; cover charges vary; go early", order: 1 },
      ],
      shop: [
        { title: "Shimokitazawa (Desert Snow thrifting)", embed_url: "", address: "Shimokitazawa, Setagaya City, Tokyo", price_estimate: "", notes: "⭐️ Thrifting paradise; Desert Snow", order: 1 },
        { title: "Don Quijote", embed_url: "", address: "Multiple locations; try Shibuya MEGA Donki", price_estimate: "", notes: "Huge discount store", order: 2 },
        { title: "Whistler (vintage)", embed_url: "", address: "Shibuya, Tokyo", price_estimate: "", notes: "Vintage shop", order: 3 },
        { title: "Stüssy (Shibuya)", embed_url: "", address: "Stüssy Shibuya Chapter, 4-27-2 Jingumae, Shibuya City, Tokyo", price_estimate: "", notes: "⭐️ Streetwear", order: 4 },
        { title: "A Bathing Ape (Shibuya)", embed_url: "", address: "BAPE STORE SHIBUYA, 4-21-5 Jingumae, Shibuya City, Tokyo", price_estimate: "", notes: "", order: 5 },
        { title: "Koenji (high-quality thrifting)", embed_url: "", address: "Koenji, Suginami City, Tokyo", price_estimate: "", notes: "⭐️ Vintage hotspot", order: 6 },
        { title: "2nd STREET", embed_url: "", address: "Multiple locations", price_estimate: "", notes: "Second-hand chain", order: 7 },
        { title: "Akihabara (anime, games)", embed_url: "", address: "Akihabara, Chiyoda City, Tokyo", price_estimate: "", notes: "", order: 8 },
        { title: "Ameyoko (shopping alley)", embed_url: "", address: "Ameya-Yokocho, 6-10-7 Ueno, Taito City, Tokyo", price_estimate: "", notes: "Clothing, snacks", order: 9 },
        { title: "LOFT", embed_url: "", address: "Shibuya LOFT, 21-1 Udagawacho, Shibuya City, Tokyo", price_estimate: "", notes: "Stationery, home goods", order: 10 },
        { title: "Hinoya (Japanese denim)", embed_url: "", address: "Ueno, Taito City, Tokyo", price_estimate: "", notes: "Denim specialist", order: 11 },
        { title: "BEAMS (Shinjuku)", embed_url: "", address: "3-32-6 Shinjuku, Shinjuku City, Tokyo", price_estimate: "", notes: "Popular gifts; best store in Shinjuku", order: 12 },
        { title: "GU (Shibuya)", embed_url: "", address: "Shibuya, Tokyo", price_estimate: "", notes: "Fast-fashion sister of Uniqlo", order: 13 },
        { title: "Skwate (book & vinyl)", embed_url: "", address: "Tokyo", price_estimate: "", notes: "Book & vinyl store", order: 14 },
      ],
      visit: [
        { title: "Shibuya Sky (sunset/night)", embed_url: "", address: "Shibuya Scramble Square, 2-24-12 Shibuya, Tokyo", price_estimate: "¥", notes: "⭐️ Timed tickets recommended", order: 1 },
        { title: "Tsukiji Outer Market", embed_url: "", address: "4-16-2 Tsukiji, Chuo City, Tokyo", price_estimate: "¥", notes: "⭐️ Street food paradise", order: 2 },
        { title: "Kabukicho (Godzilla, bars)", embed_url: "", address: "Kabukicho, Shinjuku City, Tokyo", price_estimate: "", notes: "Neon district", order: 3 },
        { title: "Shibuya Crossing", embed_url: "", address: "Shibuya Station area, Tokyo", price_estimate: "", notes: "Iconic scramble", order: 4 },
        { title: "Omoide Yokocho", embed_url: "", address: "Nishishinjuku, Shinjuku City, Tokyo", price_estimate: "¥", notes: "Alleyway eateries", order: 5 },
        { title: "Golden Gai", embed_url: "", address: "1 Chome-1 Kabukicho, Shinjuku City, Tokyo", price_estimate: "", notes: "⭐️ Legendary micro-bars", order: 6 },
        { title: "Tokyo Skytree", embed_url: "", address: "1-1-2 Oshiage, Sumida City, Tokyo", price_estimate: "¥", notes: "⭐️ Some say better than Tokyo Tower", order: 7 },
        { title: "Tokyo Tower", embed_url: "", address: "4-2-8 Shibakoen, Minato City, Tokyo", price_estimate: "¥", notes: "Classic view", order: 8 },
        { title: "Don Quijote (mega store)", embed_url: "", address: "See Shopping / Shibuya MEGA Donki", price_estimate: "", notes: "Fun to browse", order: 9 },
      ],
      eat: [
        // Ramen
        { title: "Ramen Matsui (Yotsuya) ⭐️", embed_url: "", address: "4-25-10 Yotsuya, Shinjuku City, Tokyo", price_estimate: "¥", notes: "Ramen", order: 1 },
        { title: "Missokko Fukku", embed_url: "", address: "2-40-11 Kamiogi, Suginami City, Tokyo", price_estimate: "¥", notes: "Ramen", order: 2 },
        { title: "Ramen Hayashi", embed_url: "", address: "Social Dogenzaka, 1-14-9 Dogenzaka, Shibuya, Tokyo 150-0043", price_estimate: "¥", notes: "Ramen", order: 3 },
        { title: "Dōgenzaka Mammoth ⭐️", embed_url: "", address: "2-10-1 Dogenzaka, Shibuya, Tokyo 150-0043", price_estimate: "¥", notes: "Ramen", order: 4 },
        { title: "Hakata Ramen Kazu", embed_url: "", address: "5-1-36 Akasaka, Minato City, Tokyo", price_estimate: "¥", notes: "Ramen", order: 5 },
        { title: "Ramen Yamate", embed_url: "", address: "2-21-13 Tomigaya, Shibuya, Tokyo 151-0063", price_estimate: "¥", notes: "Ramen", order: 6 },
        // Sushi
        { title: "Tsukiji Outer Market (sushi tastings) ⭐️", embed_url: "", address: "4-16-2 Tsukiji, Chuo City, Tokyo", price_estimate: "¥", notes: "Street food + tastings", order: 7 },
        { title: "Sushi Bar Nigirite", embed_url: "", address: "7-9-15 Nishishinjuku, Shinjuku City, Tokyo 160-0023", price_estimate: "¥¥", notes: "", order: 8 },
        { title: "Sushidan (Hiroo)", embed_url: "", address: "Eat Play Works, 5-4-16 Hiroo, Shibuya, Tokyo 150-0012", price_estimate: "¥¥¥", notes: "", order: 9 },
        { title: "Sushi Tokyo Ten (Shibuya)", embed_url: "", address: "Shibuya, Tokyo", price_estimate: "¥¥¥", notes: "", order: 10 },
        { title: "Numazuko (Shinjuku)", embed_url: "", address: "3-34-16 Shinjuku, Shinjuku City, Tokyo 160-0022", price_estimate: "¥", notes: "Conveyor belt", order: 11 },
        // All-food / other
        { title: "Chermside Sandwich (Harajuku) ⭐️", embed_url: "", address: "Harajuku, Shibuya City, Tokyo", price_estimate: "¥", notes: "Sandwiches", order: 12 },
        { title: "Udon Shin", embed_url: "", address: "Shinjuku, Tokyo", price_estimate: "¥", notes: "Udon", order: 13 },
        { title: "Kougai Ken", embed_url: "", address: "Tokyo", price_estimate: "¥", notes: "", order: 14 },
        { title: "Udon Mandajiro", embed_url: "", address: "Tokyo", price_estimate: "¥", notes: "", order: 15 },
        { title: "Honmaru", embed_url: "", address: "Tokyo", price_estimate: "¥", notes: "", order: 16 },
        { title: "Zuicho Katsudon (Shibuya)", embed_url: "", address: "Shibuya, Tokyo", price_estimate: "¥", notes: "Katsudon", order: 17 },
        { title: "Tempura Ono", embed_url: "", address: "Tokyo", price_estimate: "¥¥", notes: "Tempura", order: 18 },
        { title: "Wagyu Ichinoya", embed_url: "", address: "Tokyo", price_estimate: "¥¥¥", notes: "Wagyu", order: 19 },
        { title: "Coco Nemaru (Ginza) ⭐️", embed_url: "", address: "Ginza, Tokyo", price_estimate: "¥", notes: "Curry", order: 20 },
      ],
      onsen: [], // Onsen will live mostly under Hakone
    },
  
    Kyoto: {
      drink: [
        { title: "Momo (bar)", embed_url: "", address: "Kyoto", price_estimate: "", notes: "", order: 1 },
        { title: "Good Morning Record Bar", embed_url: "", address: "Kyoto", price_estimate: "", notes: "", order: 2 },
      ],
      shop: [
        { title: "Kawaramachi Shopping District", embed_url: "", address: "Kawaramachi, Kyoto", price_estimate: "", notes: "", order: 1 },
        { title: "Gion District", embed_url: "", address: "Gion, Higashiyama Ward, Kyoto", price_estimate: "", notes: "", order: 2 },
        { title: "Higashiyama District", embed_url: "", address: "Higashiyama Ward, Kyoto", price_estimate: "", notes: "", order: 3 },
        { title: "The Harvest (Homeware)", embed_url: "", address: "Kyoto", price_estimate: "", notes: "Homeware store", order: 4 },
        { title: "Dengama (Homeware)", embed_url: "", address: "Kyoto", price_estimate: "", notes: "Homeware store", order: 5 },
      ],
      visit: [
        { title: "Pontocho Alley ⭐️", embed_url: "", address: "Pontocho, Nakagyo Ward, Kyoto", price_estimate: "", notes: "Food & drink alley", order: 1 },
        { title: "Hozugawa River Boat Ride ⭐️", embed_url: "", address: "Kameoka ↔ Arashiyama, Kyoto", price_estimate: "¥", notes: "", order: 2 },
        { title: "Yasaka Pagoda", embed_url: "", address: "Pagoda Yasaka, Higashiyama Ward, Kyoto", price_estimate: "", notes: "", order: 3 },
        { title: "Arashiyama Bamboo Grove", embed_url: "", address: "Arashiyama, Kyoto", price_estimate: "", notes: "", order: 4 },
        { title: "Nishiki Market ⭐️", embed_url: "", address: "Nakagyo Ward, Kyoto", price_estimate: "¥", notes: "Food market", order: 5 },
        { title: "Good Morning Record Bar ⭐️", embed_url: "", address: "Kyoto", price_estimate: "", notes: "Also in Drinks", order: 6 },
        { title: "Arashiyama Bamboo Forest & Hidden Gems Bike Tour", embed_url: "https://www.tripadvisor.com/AttractionProductReview-g298564-d15600294-Arashiyama_Bamboo_Forest_Hidden_Gems_Bike_Tour_Early_Bird-Kyoto_Kyoto_Prefecture_K.html", address: "Arashiyama, Kyoto", price_estimate: "¥¥", notes: "Tour link", order: 7 },
      ],
      eat: [
        { title: "Nishiki Market ⭐️", embed_url: "", address: "Nakagyo Ward, Kyoto", price_estimate: "¥", notes: "", order: 1 },
        { title: "Kosius (Japanese curry)", embed_url: "", address: "Kyoto", price_estimate: "¥", notes: "Curry", order: 2 },
        { title: "Shinpuku Saikan (Kyoto-style ramen)", embed_url: "", address: "Kyoto", price_estimate: "¥", notes: "Ramen", order: 3 },
        { title: "Menya Inoichi ⭐️", embed_url: "", address: "Kyoto", price_estimate: "¥", notes: "Highly rated ramen", order: 4 },
        { title: "Tempura Endo Yasaka (reservation)", embed_url: "", address: "Kyoto", price_estimate: "¥¥¥", notes: "Tempura; book ahead", order: 5 },
        { title: "Unagi Hirokawa ⭐️", embed_url: "", address: "Arashiyama, Kyoto", price_estimate: "¥¥¥", notes: "Unagi over rice", order: 6 },
        { title: "Men-ya Sanda (Chicken Tsukemen)", embed_url: "", address: "Kyoto", price_estimate: "¥", notes: "Dipping ramen", order: 7 },
        { title: "Nikuju Hokusai (Wagyu bowl)", embed_url: "", address: "Kyoto", price_estimate: "¥¥", notes: "Beef bowl", order: 8 },
        { title: "Gion Yuki Izakaya", embed_url: "", address: "Gion, Kyoto", price_estimate: "¥", notes: "Mixed Japanese dishes", order: 9 },
        { title: "Otachidokoro Sushi", embed_url: "", address: "Kyoto", price_estimate: "¥¥", notes: "Sushi", order: 10 },
      ],
      onsen: [],
    },
  
    Osaka: {
      drink: [
        { title: "Tenma District (drinking district)", embed_url: "", address: "Kita Ward, Osaka", price_estimate: "", notes: "", order: 1 },
      ],
      shop: [],
      visit: [
        { title: "Dotonbori ⭐️", embed_url: "", address: "Dotonbori, Chuo Ward, Osaka", price_estimate: "¥", notes: "Street food area", order: 1 },
        { title: "Umeda Sky Building", embed_url: "", address: "1-1-88 Oyodonaka, Kita Ward, Osaka", price_estimate: "¥", notes: "", order: 2 },
        { title: "Kuromon Market", embed_url: "", address: "2-4-1 Nipponbashi, Chuo Ward, Osaka", price_estimate: "¥", notes: "", order: 3 },
      ],
      eat: [
        { title: "Dotonbori ⭐️", embed_url: "", address: "Dotonbori, Chuo Ward, Osaka", price_estimate: "¥", notes: "Street food", order: 1 },
        { title: "Kuromon Market", embed_url: "", address: "2-4-1 Nipponbashi, Chuo Ward, Osaka", price_estimate: "¥", notes: "Food market", order: 2 },
        { title: "Wagyu Idaten ⭐️", embed_url: "", address: "Osaka", price_estimate: "¥¥", notes: "Wagyu", order: 3 },
        { title: "Aka To Shiro (omakase sushi)", embed_url: "", address: "Osaka", price_estimate: "¥¥¥", notes: "Omakase", order: 4 },
      ],
      onsen: [],
    },
  
    Hakone: {
      drink: [],
      shop: [],
      visit: [],
      eat: [
        { title: "Ramen (general)", embed_url: "", address: "Hakone", price_estimate: "¥", notes: "", order: 1 },
      ],
      onsen: [
        {
          title: "Hakone Yuryo",
          embed_url: "",
          address: "Hakone Yuryo, 230 Yumotochaya, Hakone, Kanagawa",
          price_estimate: "Day-use ~¥1,700 wkday / ~¥2,000 wknd",
          notes: "Outdoor baths + private rooms; free shuttle from Hakone-Yumoto; 10:00–20:00 (check site).",
          order: 1
        },
        {
          title: "Yunosato Okada (湯の里おかだ)",
          embed_url: "",
          address: "191 Yumotochaya, Hakone, Kanagawa",
          price_estimate: "Adults ≈ ¥1,450 (early AM ≈ ¥1,000)",
          notes: "Many baths; 6:00–9:00 early session; main 11:00–23:00. ~20 min walk from Hakone-Yumoto or 5-min bus.",
          order: 2
        },
        {
          title: "Hotel Green Plaza Hakone",
          embed_url: "",
          address: "1244-2 Sengokuhara, Hakone (near Ubako Ropeway Station)",
          price_estimate: "Day-use ~¥1,600 (check schedule)",
          notes: "Open-air baths with Mt. Fuji view. Remote; plan transit (ropeway/bus).",
          order: 3
        },
      ],
    },
  
    Kobe: {
      drink: [],
      shop: [],
      visit: [],
      eat: [],
      onsen: [],
    },
  
    Wakayama: {
      drink: [],
      shop: [],
      visit: [
        { title: "Nachi Waterfall", embed_url: "", address: "Nachikatsuura, Wakayama", price_estimate: "", notes: "", order: 1 },
        { title: "Wakayama Castle", embed_url: "", address: "3 Ichibancho, Wakayama", price_estimate: "", notes: "", order: 2 },
        { title: "Nachikatsuura (nature & waterfalls)", embed_url: "", address: "Nachikatsuura, Wakayama", price_estimate: "", notes: "Might be far—plan transit", order: 3 },
        { title: "Ine no Funaya", embed_url: "", address: "Ine, Kyoto Prefecture", price_estimate: "", notes: "Coastal boat houses; fits Kyoto daytrip routing", order: 4 },
      ],
      eat: [],
      onsen: [],
    },
  };
  
  export default cityGuideData;
  