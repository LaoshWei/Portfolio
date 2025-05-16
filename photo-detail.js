document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const API_URL = `https://08e65860-4676-41d2-9995-6f546fd0df3f-00-b0003azewloq.sisko.replit.dev/photos/${id}`;
  
    const img = document.getElementById("photo-image");
    const desc = document.getElementById("photo-description");
  
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("找不到這張照片");
      const photo = await res.json();
  
      img.src = photo.title;
      img.alt = photo.content;
      desc.textContent = photo.content;
    } catch (err) {
      console.error(err);
      desc.textContent = "無法載入照片";
    }
  });
  