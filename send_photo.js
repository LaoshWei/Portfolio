//document 是瀏覽器在網頁載入時自動產生的「文件物件（Document Object）」
document.addEventListener("DOMContentLoaded", function () {
    const newBtn = document.getElementById("new-entry-btn");
    const form = document.getElementById("entry-form");
    const submitBtn = document.getElementById("submit-entry");
    const urlInput = document.getElementById("entry-url");
    const descriptionInput = document.getElementById("entry-description");
    const articleList = document.querySelector(".photo-grid");
    const pageType = document.body.dataset.type;
    const API_URL = `https://08e65860-4676-41d2-9995-6f546fd0df3f-00-b0003azewloq.sisko.replit.dev/${pageType}`; // ← 替換成你自己的網址！
  
    let currentEditId = null;
  
    // 切換表單顯示
    newBtn.addEventListener("click", () => {
      form.style.display = form.style.display === "none" ? "block" : "none";
      currentEditId = null;
      urlInput.value = "";
      descriptionInput.value = "";
    });
  
    // 表單送出
    submitBtn.addEventListener("click", async () => {
      const title = urlInput.value.trim();
      const content = descriptionInput.value.trim();
      if (!title || !content) {
        alert("請填寫完整網址與描述。");
        return;
      }
      // 這邊在決定按下送出按鈕後，是呼叫編輯功能還是新增
      try {
        let response; //宣告變數：用 let（安全、區域、現代）
        if (currentEditId) {
          // 編輯模式
          response = await fetch(`${API_URL}/${currentEditId}`, { // await就是後面function結束我再繼續運行
            method: "PUT", // 這個都是HTTP內置的function
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content }),
          });
        } else {
          // 新增模式
          response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, content }),
          });
        }
  
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "操作失敗");
  
        // 更新畫面
        if (currentEditId) {
          const old = document.getElementById(`entry-${currentEditId}`);
          if (old) old.remove();
        }
        addEntryToDOM(result);
        urlInput.value = "";
        descriptionInput.value = "";
        form.style.display = "none";
        currentEditId = null;
      } catch (err) {
        alert("操作失敗，請稍後再試！");
        console.error(err);
      }
    });
  
    // 載入所有資料
    fetch(API_URL)
      .then(res => {
        if (!res.ok) throw new Error("伺服器錯誤");
        return res.json();
      })
      .then((data) => {
        data.forEach((entry) => addEntryToDOM(entry)); //拿到資料後，針對裡面每一筆心得，把它加到畫面上
      })
      .catch((err) => console.error("讀取資料失敗：", err));
  
    // 顯示在畫面上
    function addEntryToDOM(entry) {
        const div = document.createElement("div");
        div.className = "photo-item";
        div.id = `entry-${entry._id}`;
    
        const img = document.createElement("img");
        img.src = entry.title;
        img.alt = entry.content;
    
        const caption = document.createElement("p");
        caption.textContent = entry.content;
        caption.style.padding = "0.5rem";
        caption.style.fontSize = "0.9rem";
        caption.style.textAlign = "center";
        caption.style.margin = 0;
        caption.style.display = "none"; // 初始隱藏 caption
    
        const buttonWrapper = document.createElement("div");
        buttonWrapper.style.display = "none";
        buttonWrapper.style.marginTop = "0.5rem";
        buttonWrapper.style.textAlign = "center";

        // 🆕 新增「看全圖」按鈕
        const viewFullBtn = document.createElement("button");
        viewFullBtn.textContent = "📷 看全圖";
        viewFullBtn.onclick = () => {
          window.location.href = `photo-detail.html?id=${entry._id}`;
        };


        const editBtn = document.createElement("button");
        editBtn.textContent = "📝 編輯";
        editBtn.style.marginRight = "0.5rem";
        editBtn.onclick = () => {
          form.style.display = "block";
          urlInput.value = entry.title;
          descriptionInput.value = entry.content;
          currentEditId = entry._id;
        };
    
        const deleteBtn = document.createElement("button");
        deleteBtn.style.marginRight = "0.5rem";
        deleteBtn.textContent = "🗑️ 刪除";
        deleteBtn.onclick = async () => {
          if (!confirm("確定要刪除這張照片嗎？")) return;
          try {
            const res = await fetch(`${API_URL}/${entry._id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("刪除失敗");
            div.remove();
          } catch (err) {
            alert("刪除失敗");
            console.error(err);
          }
        };
    
        buttonWrapper.appendChild(editBtn);
        buttonWrapper.appendChild(deleteBtn);
        buttonWrapper.appendChild(viewFullBtn);
    
        div.appendChild(img);
        div.appendChild(caption);
        div.appendChild(buttonWrapper);
    
        div.onclick = () => {
          caption.style.display = caption.style.display === "none" ? "block" : "none";
          buttonWrapper.style.display = buttonWrapper.style.display === "none" ? "block" : "none";
        };
    
        articleList.prepend(div);
      }
    });