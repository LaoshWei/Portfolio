//document 是瀏覽器在網頁載入時自動產生的「文件物件（Document Object）」
document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("hashtag-input");
    const container = document.getElementById("hashtag-container");
    const hiddenInput = document.getElementById("hidden-hashtags");

    const tags = [];

    input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && input.value.trim() !== "") {
        e.preventDefault();
        const tag = input.value.trim();
        tags.push(tag);
        updateTags();
        input.value = "";
    }
    });

    function updateTags() {
        // 清除舊 tag 元素
        container.querySelectorAll(".tag").forEach((el) => el.remove());

        tags.forEach((tag, index) => {
            const span = document.createElement("span");
            span.textContent = `#${tag}`;
            span.className = "tag";
            span.onclick = () => {
                tags.splice(index, 1);
                updateTags();
            };
            container.insertBefore(span, input);
        });
        hiddenInput.value = JSON.stringify(tags);
    }
    window.tags = tags;
    window.updateTags = updateTags;
});