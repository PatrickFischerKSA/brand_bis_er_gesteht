(() => {
  const storageKey = "heidi_background_video_paused";
  const video = document.querySelector("[data-background-video]");
  const toggle = document.querySelector("[data-background-video-toggle]");

  if (!video || !toggle) {
    return;
  }

  function storage() {
    try {
      return window.localStorage;
    } catch {
      return null;
    }
  }

  function isPausedByUser() {
    return storage()?.getItem(storageKey) === "1";
  }

  function updateButton() {
    toggle.textContent = video.paused ? "Video starten" : "Video stoppen";
    toggle.setAttribute("aria-pressed", String(video.paused));
  }

  async function playVideo() {
    try {
      await video.play();
    } catch {
      video.pause();
    }
    updateButton();
  }

  if (isPausedByUser()) {
    video.pause();
  } else {
    playVideo();
  }

  toggle.addEventListener("click", () => {
    if (video.paused) {
      storage()?.removeItem(storageKey);
      playVideo();
      return;
    }

    video.pause();
    storage()?.setItem(storageKey, "1");
    updateButton();
  });

  video.addEventListener("play", updateButton);
  video.addEventListener("pause", updateButton);
  updateButton();
})();
