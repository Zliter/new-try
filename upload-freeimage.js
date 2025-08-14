// js/upload-freeimage.js
const FREEIMAGE_API_KEY = "这里换成你的 FreeImage API Key";

// 上传按钮事件
document.getElementById("uploadBtn").addEventListener("click", async () => {
    const files = document.getElementById("picker").files;
    if (!files.length) {
        alert("请先选择图片");
        return;
    }

    for (let file of files) {
        let formData = new FormData();
        formData.append("source", file);
        formData.append("key", FREEIMAGE_API_KEY);
        formData.append("format", "json");

        try {
            const res = await fetch("https://freeimage.host/api/1/upload", {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (data.image && data.image.url) {
                alert("上传成功: " + data.image.url);
                // TODO: 把 data.image.url 加到 index.json 里
            } else {
                console.error(data);
                alert("上传失败");
            }
        } catch (err) {
            console.error(err);
            alert("网络错误");
        }
    }
});
