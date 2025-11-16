import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => {
      const exist = prev.find((i) => i.id === product.id);
      
      if (exist) {
        const newQuantity = exist.quantity + product.quantity;
        return prev.map((i) =>
          i.id === product.id 
            ? { 
                ...i, 
                // Cập nhật số lượng, không vượt quá tồn kho (stock)
                quantity: Math.min(newQuantity, i.stock) 
              } 
            : i
        );
      }
      return [...prev, product]; 
    });
  };

  const updateQty = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }
    
    setCart((prev) => 
      prev.map((i) => {
        if (i.id === id) {
          // Không cho phép cập nhật vượt quá tồn kho (stock)
          if (newQuantity > i.stock) {
            console.warn(`Đã đạt giới hạn tồn kho cho ${i.name}`);
            return i; // Giữ nguyên
          }
          return { ...i, quantity: newQuantity };
        }
        return i;
      })
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const getTotal = () => {
    return cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQty, removeFromCart, getTotal, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};