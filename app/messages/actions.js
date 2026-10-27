'use server';

import { messages } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteMessageAction(id) {
  // Mencari index pesan berdasarkan id
  const index = messages.findIndex((msg) => msg.id === id);
  
  if (index !== -1) {
    // Menghapus 1 pesan dari array db.js
    messages.splice(index, 1);
    
    // Memicu re-render pada halaman /messages secara otomatis tanpa reload browser
    revalidatePath("/messages");
  }
}