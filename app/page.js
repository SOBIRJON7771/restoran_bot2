"use client";

import { useState, useEffect } from "react";

// Premium SVG Ikonkalar
const Icons = {
  foods: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 20h18L12 4z"/><path d="M20 11H4"/></svg>,
  snack: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 10V2h14v8"/><path d="M5 10c0 2.2 1.8 4 4 4h6c2.2 0 4-1.8 4-4"/><path d="M19 10H5"/><path d="M12 14v8"/><path d="M7 22h10"/></svg>,
  drinks: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2a2 2 0 0 0-2 2v5H7V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v11a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v5h-2V4a2 2 0 0 0-2-2Z"/><path d="M15 14H5"/></svg>,
  sweets: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"/><path d="M5 19h14v-7a7 7 0 0 0-14 0v7Z"/><path d="M12 12v7"/><path d="M8 14v5"/><path d="M16 14v5"/></svg>
};

export default function Home() {
  const [data, setData] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("foods");
  const [searchTerm, setSearchTerm] = useState(""); 
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // CHECKOUT UCHUN STATE-LAR
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customer, setCustomer] = useState({ name: "", phone: "", address: "" });

  const fetchData = async (category) => {
    try {
      const res = await fetch(`http://localhost:5000/${category}`);
      const result = await res.json();
      setData(result);
    } catch (error) { 
      console.error("Ma'lumot yuklashda xatolik:", error); 
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

  // BUYURTMANI YUBORISH (ASOSIY QISM)
  const handleFinalOrder = async (e) => {
    e.preventDefault();
    
    if (!customer.name || !customer.phone) {
      return alert("Iltimos, ism va telefon raqamingizni kiriting!");
    }

    const orderData = {
      customer,
      items: cart,
      totalPrice,
      date: new Date().toLocaleString()
    };

    try {
      const res = await fetch("http://localhost:5000/orders/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        alert("Buyurtmangiz muvaffaqiyatli qabul qilindi va Telegramga yuborildi! ✨");
        setCart([]); // Savatni tozalash
        setCustomer({ name: "", phone: "", address: "" }); // Formani tozalash
        setIsCheckoutOpen(false);
        setIsDrawerOpen(false);
      } else {
        alert("Serverda xatolik yuz berdi. Backend kodingizni tekshiring.");
      }
    } catch (error) { 
      console.error("Ulanish xatosi:", error);
      alert("Backend serverga ulanib bo'lmadi! Server yoniqligini tekshiring.");
    }
  };

  // QIDIRUV FILTRI
  const filteredData = data.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen p-8 bg-[#fdfdfd] text-gray-900">
      
      {/* SAVAT TUGMASI */}
      <button onClick={() => setIsDrawerOpen(true)} className="fixed bottom-10 right-10 z-40 bg-gray-900 text-white px-8 py-5 rounded-[2rem] shadow-2xl hover:scale-105 transition-all flex items-center gap-4">
        <div className="relative">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          <span className="absolute -top-3 -right-3 bg-orange-500 text-white text-[10px] font-black h-6 w-6 rounded-full flex items-center justify-center border-4 border-gray-900">{cart.length}</span>
        </div>
        <span className="font-bold text-xs tracking-widest uppercase">Savat</span>
      </button>

      {/* SAVAT DRAWER */}
      <div className={`fixed inset-0 z-50 transition-all duration-500 ${isDrawerOpen ? "visible" : "invisible"}`}>
        <div onClick={() => setIsDrawerOpen(false)} className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isDrawerOpen ? "opacity-100" : "opacity-0"}`} />
        <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-white p-10 transition-transform duration-500 transform ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-black uppercase italic">Buyurtmalar</h2>
            <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 hover:text-black text-2xl">✕</button>
          </div>
          <div className="overflow-y-auto h-[60vh] space-y-6">
            {cart.map((item) => (
              <div key={item._id} className="flex items-center gap-4 border-b border-gray-50 pb-6">
                <img src={item.img} className="w-20 h-20 rounded-2xl object-cover" />
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{item.name}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center bg-gray-100 rounded-lg px-2">
                      <button onClick={() => updateQuantity(item._id, -1)} className="p-1 font-bold">-</button>
                      <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, 1)} className="p-1 font-bold">+</button>
                    </div>
                    <span className="text-sm font-black text-orange-500 italic">{(item.price * item.quantity).toLocaleString()} so'm</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {cart.length > 0 && (
            <div className="mt-10">
              <div className="flex justify-between items-center mb-6 font-black italic text-2xl">
                <span className="text-gray-400 text-xs not-italic uppercase tracking-widest">Jami:</span>
                <span>{totalPrice.toLocaleString()} so'm</span>
              </div>
              <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-orange-500 text-white font-black py-6 rounded-2xl hover:bg-gray-900 transition-all uppercase tracking-widest text-sm">
                To'lovga o'tish ➔
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      <div className={`fixed inset-0 z-[70] flex items-center justify-center transition-all duration-300 ${isCheckoutOpen ? "visible opacity-100" : "invisible opacity-0"}`}>
        <div onClick={() => setIsCheckoutOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
        <form onSubmit={handleFinalOrder} className="relative bg-white w-full max-w-lg rounded-[3rem] p-12 shadow-2xl">
          <h2 className="text-3xl font-black mb-2 italic text-center">YAKUNIY BOSQICH</h2>
          <p className="text-gray-400 text-sm mb-10 text-center">Ma'lumotlaringizni kiriting.</p>
          
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Ismingiz</label>
              <input required type="text" placeholder="Ismingiz..." className="w-full p-5 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-orange-500 transition-all"
                value={customer.name} onChange={(e) => setCustomer({...customer, name: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Telefon raqam</label>
              <input required type="tel" placeholder="+998..." className="w-full p-5 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-orange-500 transition-all"
                value={customer.phone} onChange={(e) => setCustomer({...customer, phone: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Manzil</label>
              <input type="text" placeholder="Manzil..." className="w-full p-5 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-orange-500 transition-all"
                value={customer.address} onChange={(e) => setCustomer({...customer, address: e.target.value})} />
            </div>
          </div>

          <div className="mt-12">
             <button type="submit" className="w-full bg-orange-500 text-white font-black py-6 rounded-2xl hover:bg-gray-900 transition-all uppercase tracking-widest shadow-xl">
               BUYURTMANI TASDIQLASH 🚀
             </button>
             <button type="button" onClick={() => setIsCheckoutOpen(false)} className="w-full text-center mt-4 text-gray-400 text-sm font-bold">Orqaga qaytish</button>
          </div>
        </form>
      </div>

      {/* MAHSULOTLAR GRIDI */}
      <div className="text-center mb-16">
        <h1 className="text-6xl font-black tracking-tighter mb-10 uppercase">Premium <span className="text-orange-500 italic">Food</span></h1>
        <nav className="flex flex-wrap justify-center gap-4 mb-12">
          {['foods', 'snack', 'drinks', 'sweets'].map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black transition-all border-2 ${selectedCategory === cat ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-400 border-gray-100'}`}>
              <span>{Icons[cat]}</span>
              <span className="text-[10px] uppercase tracking-widest">{cat}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="max-w-xl mx-auto mb-20">
        <input type="text" placeholder="Bugun nima yeymiz?.." className="w-full p-6 rounded-[2rem] bg-white shadow-sm border-2 border-gray-50 focus:border-orange-500 outline-none px-10 italic" onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {filteredData.map((item) => (
          <div key={item._id} className="group bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-50">
            <div className="h-72 overflow-hidden relative">
              <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition-all" />
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-xl font-bold italic text-sm">{item.price?.toLocaleString()} so'm</div>
            </div>
            <div className="p-8 text-center">
              <h3 className="text-2xl font-black mb-6">{item.name}</h3>
              <button onClick={() => addToCart(item)} className="w-full bg-gray-900 hover:bg-orange-500 text-white font-black py-4 rounded-xl transition-all uppercase text-xs tracking-widest">Savatga qo'shish</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}