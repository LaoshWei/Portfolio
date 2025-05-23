document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const authLink = document.getElementById("auth-link");

  if (token) {
    // 如果有登入，就顯示「登出」按鈕
    authLink.innerHTML = `<a href="#">登出</a>`;
    authLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("token");
      alert("已登出");
      window.location.reload(); // 或跳轉到 login.html
    });
  } else {
    // 沒有登入就顯示「登入」
    authLink.innerHTML = `<a href="login.html">登入</a>`;
  }
});
