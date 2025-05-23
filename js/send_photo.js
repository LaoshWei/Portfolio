//document 是瀏覽器在網頁載入時自動產生的「文件物件（Document Object）」
document.addEventListener("DOMContentLoaded", function () {
    const newBtn = document.getElementById("new-entry-btn");
    const form = document.getElementById("entry-form");
    const submitBtn = document.getElementById("submit-entry");
    const urlInput = document.getElementById("entry-url");
    const descriptionInput = document.getElementById("entry-description");
    const articleList = document.querySelector(".photo-grid");
    const pageType = document.body.dataset.type;
    const PHOTO_API_URL = `${API_URL}/${pageType}`; // ← 替換成你自己的網址！
  
    let currentEditId = null;
    const token = localStorage.getItem("token");
    if (!token) {
      document.getElementById("new-entry-btn").style.display = "none";
    }

    if (token){
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // 轉成毫秒
      const now = Date.now();

      if (now > exp) {
        localStorage.removeItem("token");
        alert("登入已過期，請重新登入");
        window.location.href = "login.html";
      }
    }


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
          const token = localStorage.getItem("token");
          // 編輯模式
          response = await fetch(`${PHOTO_API_URL}/${currentEditId}`, { // await就是後面function結束我再繼續運行
            method: "PUT", // 這個都是HTTP內置的function
            headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ title, content }),
          });
        } else {
          // 新增模式
          response = await fetch(PHOTO_API_URL, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            },
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
    fetch(PHOTO_API_URL)
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
            const token = localStorage.getItem("token");
            const res = await fetch(`${PHOTO_API_URL}/${entry._id}`, {
              method: "DELETE",
              headers: {
                "Authorization": `Bearer ${token}`,
              },
            });
            if (!res.ok) throw new Error("刪除失敗");
            div.remove();
          } catch (err) {
            alert("刪除失敗");
            console.error(err);
          }
        };
        if (!token) {
          deleteBtn.style.display = "none";
          editBtn.style.display = "none";
        }
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