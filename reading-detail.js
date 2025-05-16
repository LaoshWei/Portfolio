document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const pageType = document.body.dataset.type;
  const id = params.get("id");
  
    if (!id) {
      document.getElementById("reading-title").textContent = "找不到文章 ID";
      return;
    }
  
    try {
      console.log(pageType)
      const res = await fetch(`${API_URL}/${pageType}/${id}`);
      const data = await res.json();
      const content = marked.parse(data.content);
  
      if (!res.ok) throw new Error(data.error || "讀取失敗");
  
      document.getElementById("reading-title").textContent = data.title;
      document.getElementById("reading-text").innerHTML = content;
  
    } catch (err) {
      document.getElementById("reading-title").textContent = "讀取失敗";
      document.getElementById("reading-text").textContent = err.message;
      console.error(err);
    }
  });
  