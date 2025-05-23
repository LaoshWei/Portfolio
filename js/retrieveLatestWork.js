document.addEventListener("DOMContentLoaded", function () {
    fetch(`${API_URL}/latest-works`)
      .then(res => {
        if (!res.ok) throw new Error("伺服器錯誤");
        return res.json();
      })
      .then(data => {
        console.log("🔥 最新資料內容：", data);
        renderSection("readings", data.readings);
        renderSection("learnings", data.learnings);
        renderSectionPhoto("photos", data.photos);
      })      
      .catch(err => console.error("讀取最新作品失敗：", err));
  
    function renderSection(type, entries) {
    const container = document.querySelector(`#section-${type} .latest-works-grid`);
      if (!container) return;
  
      entries.forEach(entry => {
        const card = document.createElement("div");
        card.className = "summary-card";
  
        const title = document.createElement("h4");
        title.textContent = entry.title.length > 40 ? entry.title.slice(0, 40) + "..." : entry.title;
  
        const summary = document.createElement("p");
        summary.textContent = entry.content?.slice(0, 60) + "...";
  
        const time = document.createElement("small");
        time.textContent = new Date(entry.createdAt).toLocaleDateString();
  
        const link = document.createElement("a");
        link.href = `${type.slice(0, -1)}-detail.html?id=${entry._id}`;
        link.textContent = "查看詳情 →";
        link.style.display = "inline-block";
        link.style.marginTop = "0.5rem";
  
        card.appendChild(title);
        card.appendChild(summary);
        card.appendChild(time);
        card.appendChild(link);
  
        container.appendChild(card);
      });
    }
    function renderSectionPhoto(type, entries) {
    const container = document.querySelector(`#section-${type} .latest-works-grid`);
      if (!container) return;
  
      entries.forEach(entry => {
        const card = document.createElement("div");
        card.className = "summary-card";
  
        const title = document.createElement("h4");
        title.textContent = entry.content?.slice(0, 60) + "...";
  
        // const summary = document.createElement("p");
        // summary.textContent = entry.content?.slice(0, 60) + "...";
  
        const time = document.createElement("small");
        time.textContent = new Date(entry.createdAt).toLocaleDateString();
  
        const link = document.createElement("a");
        link.href = `${type.slice(0, -1)}-detail.html?id=${entry._id}`;
        link.textContent = "查看詳情 →";
        link.style.display = "inline-block";
        link.style.marginTop = "0.5rem";
  
        card.appendChild(title);
        // card.appendChild(summary);
        card.appendChild(time);
        card.appendChild(link);
  
        container.appendChild(card);
      });
    }


  });
  