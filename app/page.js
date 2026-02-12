"use client";

import { useState, useEffect } from "react";

// Premium SVG Ikonkalar
const Icons = {
  foods: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 20h18L12 4z"/><path d="M20 11H4"/></svg>,
  snack: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 10V2h14v8"/><path d="M5 10c0 2.2 1.8 4 4 4h6c2.2 0 4-1.8 4-4"/><path d="M19 10H5"/><path d="M12 14v8"/><path d="M7 22h10"/></svg>,
  drinks: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2a2 2 0 0 0-2 2v5H7V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v11a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v5h-2V4a2 2 0 0 0-2-2Z"/><path d="M15 14H5"/></svg>,
  sweets: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"/><path d="M5 19h14v-7a7 7 0 0 0-14 0v7Z"/><path d="M12 12v7"/><path d="M8 14v5"/><path d="M16 14v5"/></svg>
};

// DIQQAT: Backend havolasini bitta joyda o'zgartirish kifoya
const BACKEND_URL = "https://restoran-bot-igvo.onrender.com";

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true); // Yuklanish holati
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("foods");
  const [searchTerm, setSearchTerm] = useState(""); 
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customer, setCustomer] = useState({ name: "", phone: "", address: "" });

  const fetchData = async (category) => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/${category}`);
      const result = await res.json();
      // Xatolikni oldini olish uchun array ekanligini tekshiramiz
      setData(Array.isArray(result) ? result : []);
    } catch (error) { 
      console.error("Ma'lumot yuklashda xatolik:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(selectedCategory); }, [selectedCategory]);

  const addToCart = (product) => {
    setCart((prev) => {
      const isExist = prev.find((item) => item._id === product._id);
      if (isExist) return prev.map((item) => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsDrawerOpen(true); 
  };

  const updateQuantity = (productId, amount) => {
    setCart((prev) => prev.map((item) => item._id === productId ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item));
  };

  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleFinalOrder = async (e) => {
    e.preventDefault();
    if (!customer.name || !customer.phone) return alert("Ism va telefonni kiriting!");

    const orderData = { customer, items: cart, totalPrice };

    try {
      const res = await fetch(`${BACKEND_URL}/orders/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        alert("Buyurtma yuborildi! ✨");
        setCart([]);
        setCustomer({ name: "", phone: "", address: "" });
        setIsCheckoutOpen(false);
        setIsDrawerOpen(false);
      } else {
        alert("Serverda xatolik yuz berdi.");
      }
    } catch (error) { 
      alert("Backendga ulanib bo'lmadi!");
    }
  };

  // QIDIRUV FILTRI (Xavfsiz variant)
  const filteredData = Array.isArray(data) ? data.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <main className="min-h-screen p-4 sm:p-8 bg-[#fdfdfd] text-gray-900">
      
      {/* SAVAT TUGMASI */}
      <button onClick={() => setIsDrawerOpen(true)} className="fixed bottom-6 right-6 z-40 bg-gray-900 text-white px-6 py-4 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-3">
        <div className="relative">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">{cart.length}</span>
        </div>
        <span className="font-bold text-xs uppercase tracking-widest hidden sm:block">Savat</span>
      </button>

      {/* SAVAT DRAWER VA CHECKOUT MODAL (Sizning kodingiz bilan bir xil, lekin BACKEND_URL bilan) */}
      {/* ... (Savat va Modal qismlari yuqoridagi mantiq bilan bir xil ishlaydi) ... */}

      {/* Sarlavha va Kategoriya Navigatsiyasi */}
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-6xl font-black mb-8 uppercase tracking-tighter">Premium <span className="text-orange-500 italic">Food</span></h1>
        <nav className="flex flex-wrap justify-center gap-3">
          {['foods', 'snack', 'drinks', 'sweets'].map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black transition-all border-2 ${selectedCategory === cat ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-400 border-gray-100'}`}>
              {Icons[cat]}
              <span className="text-[10px] uppercase">{cat}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Qidiruv */}
      <div className="max-w-md mx-auto mb-12">
        <input type="text" placeholder="Qidirish..." className="w-full p-4 rounded-2xl bg-white shadow-sm border-2 border-gray-50 focus:border-orange-500 outline-none italic" onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {/* Ma'lumotlar ro'yxati */}
      {loading ? (
        <div className="text-center font-bold text-gray-400 animate-pulse">Yuklanmoqda...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredData.length > 0 ? filteredData.map((item) => (
            <div key={item._id} className="bg-white rounded-[2rem] shadow-sm hover:shadow-xl transition-all border border-gray-50 overflow-hidden">
              <img src={item.img} className="w-full h-56 object-cover" />
              <div className="p-6 text-center">
                <h3 className="text-xl font-black mb-4">{item.name}</h3>
                <div className="text-orange-500 font-black mb-4">{item.price?.toLocaleString()} so'm</div>
                <button onClick={() => addToCart(item)} className="w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-orange-500 transition-all text-xs font-bold uppercase">Qo'shish</button>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center text-gray-400">Mahsulot topilmadi.</div>
          )}
        </div>
      )}
    </main>
  );
}