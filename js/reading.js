//document 是瀏覽器在網頁載入時自動產生的「文件物件（Document Object）」
document.addEventListener("DOMContentLoaded", function () {
  const newBtn = document.getElementById("new-entry-btn");
  const form = document.getElementById("entry-form");
  const submitBtn = document.getElementById("submit-entry");
  const titleInput = document.getElementById("entry-title");
  const contentInput = document.getElementById("entry-content");
  const articleList = document.querySelector("#article-list ul");
  const pageType = document.body.dataset.type;
  const PAGE_API_URL = `${API_URL}/${pageType}`; // ← 替換成你自己的網址！

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
    titleInput.value = "";
    contentInput.value = "";
  });

  // 表單送出
  submitBtn.addEventListener("click", async () => {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    if (!title || !content) {
      alert("請填寫完整標題與內容。");
      return;
    }
    // 這邊在決定按下送出按鈕後，是呼叫編輯功能還是新增
    try {
      let response; //宣告變數：用 let（安全、區域、現代）
      const token = localStorage.getItem("token");
      if (currentEditId) {
        // 編輯模式
        response = await fetch(PAGE_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ title, content }),
        });

      } else {
        // 新增模式
        response = await fetch(PAGE_API_URL, {
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
      titleInput.value = "";
      contentInput.value = "";
      form.style.display = "none";
      currentEditId = null;
    } catch (err) {
      alert("操作失敗，請稍後再試！");
      console.error(err);
    }
  });

  // 載入所有資料
  fetch(PAGE_API_URL)
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
    const li = document.createElement("li"); //創造list
    li.id = `entry-${entry._id}`;

    const title = document.createElement("strong");
    title.textContent = `${entry.title}（${new Date(entry.createdAt).toLocaleDateString()}）`;

    const content = document.createElement("div");
    content.className = "preview-markdown";
    content.innerHTML = marked.parse(entry.content.slice(0, 100)) + "...";

    const fullBtn = document.createElement("button");
    fullBtn.textContent = "📖 看全文";
    fullBtn.style.marginLeft = "0.5rem";
    fullBtn.onclick = (e) => {
      e.stopPropagation(); // 避免觸發 li.onclick 展開編輯按鈕
      window.location.href = `${pageType.slice(0, -1)}-detail.html?id=${entry._id}`;
    };

    const editBtn = document.createElement("button");
    editBtn.textContent = "📝 編輯";
    editBtn.style.marginRight = "0.5rem";
    editBtn.onclick = () => {
      form.style.display = "block";
      titleInput.value = entry.title;
      contentInput.value = entry.content;
      currentEditId = entry._id;
    };


    const buttonWrapper = document.createElement("div");
    buttonWrapper.style.display = "none";
    buttonWrapper.style.marginTop = "0.5rem";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️ 刪除";
    deleteBtn.onclick = async () => { // async宣告一個可以使用 await 的函式
      if (!confirm("確定要刪除這篇心得嗎？")) return;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${PAGE_API_URL}/${entry._id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("刪除失敗");
        li.remove();
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
    buttonWrapper.appendChild(fullBtn);

    li.appendChild(title);
    li.appendChild(content);
    li.appendChild(buttonWrapper);

    li.onclick = () => {
      buttonWrapper.style.display = buttonWrapper.style.display === "none" ? "block" : "none";
    };

    articleList.prepend(li);
  }

});


