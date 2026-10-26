(function connectImageStudio() {
  const links = document.querySelectorAll("[data-image-studio-link]");

  const configuredUrl = window.STYLE_ATLAS_IMAGE_STUDIO_URL?.trim();
  const target = configuredUrl || "https://image.styleatlas.art/";

  function urlForPrompt(prompt, ratio) {
    if (!target || !String(prompt || "").trim()) return "";
    try {
      const url = new URL(target, window.location.href);
      if (!["http:", "https:"].includes(url.protocol)) return "";
      url.searchParams.set("prompt", String(prompt).trim());
      const ratioMap = {
        "纵向 2:3": "3:4",
        "横向 16:9": "16:9",
        "方形 1:1": "1:1",
        "2:3": "3:4",
        "16:9": "16:9",
        "1:1": "1:1"
      };
      if (ratioMap[ratio]) url.searchParams.set("ratio", ratioMap[ratio]);
      return url.href;
    } catch {
      return "";
    }
  }

  window.StyleAtlasStudio = Object.freeze({ urlForPrompt });

  if (target) {
    try {
      const url = new URL(target, window.location.href);
      if (!["http:", "https:"].includes(url.protocol)) throw new Error("Unsupported protocol");
      links.forEach((link) => {
        link.href = url.href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.title = "在新标签页打开 AI 生图工作台";
      });
      return;
    } catch (error) {
      console.error("Invalid image studio URL", error);
    }
  }

  links.forEach((link) => {
    link.title = "打开 Prompt 工坊进行生图";
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const promptView = document.querySelector('[data-view="prompt"]');
      if (promptView) promptView.click();
      else window.location.assign("index.html#prompt");
    });
  });
})();
