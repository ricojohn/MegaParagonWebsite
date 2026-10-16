const heroVideoFile = document.querySelector(".hero-video-file");
const videoPlayPause = document.getElementById("videoPlayPause");
const videoSoundToggle = document.getElementById("videoSoundToggle");
const videoVolume = document.getElementById("videoVolume");
const videoFullscreen = document.getElementById("videoFullscreen");

if (heroVideoFile) {
  heroVideoFile.addEventListener("error", () => {
    heroVideoFile.closest(".hero-media").classList.add("video-unavailable");
  });
}

if (videoPlayPause && heroVideoFile) {
  videoPlayPause.addEventListener("click", () => {
    if (heroVideoFile.paused) {
      heroVideoFile.play();
      videoPlayPause.querySelector(".video-control-icon").innerHTML =
        "&#10074;&#10074;";
      videoPlayPause.setAttribute("aria-label", "Pause video");
    } else {
      heroVideoFile.pause();
      videoPlayPause.querySelector(".video-control-icon").innerHTML = "&#9654;";
      videoPlayPause.setAttribute("aria-label", "Play video");
    }
  });
}

if (videoSoundToggle && heroVideoFile) {
  videoSoundToggle.addEventListener("click", () => {
    heroVideoFile.muted = !heroVideoFile.muted;
    const icon = videoSoundToggle.querySelector(".video-control-icon");
    if (icon) {
      icon.innerHTML = heroVideoFile.muted ? "&#128264;" : "&#128266;";
    }
    videoSoundToggle.setAttribute(
      "aria-label",
      heroVideoFile.muted ? "Turn sound on" : "Mute video",
    );
  });
}

if (heroVideoFile) {
  heroVideoFile.volume = 1;
  heroVideoFile.muted = true;
  window.setTimeout(() => {
    heroVideoFile.play().catch(() => {
      // Browsers may block playback until the user interacts with the page.
    });
  }, 1500);
}

if (videoVolume && heroVideoFile) {
  videoVolume.addEventListener("input", () => {
    const volume = Number(videoVolume.value);
    heroVideoFile.volume = volume;
    heroVideoFile.muted = volume === 0;
    if (videoSoundToggle) {
      const icon = videoSoundToggle.querySelector(".video-control-icon");
      if (icon) {
        icon.innerHTML = heroVideoFile.muted ? "&#128264;" : "&#128266;";
      }
      videoSoundToggle.setAttribute(
        "aria-label",
        heroVideoFile.muted ? "Turn sound on" : "Mute video",
      );
    }
  });
}

if (videoFullscreen && heroVideoFile) {
  const heroMedia = heroVideoFile.closest(".hero-media");

  const updateFullscreenButton = () => {
    const isFullscreen = document.fullscreenElement === heroMedia;
    videoFullscreen.setAttribute(
      "aria-label",
      isFullscreen ? "Exit fullscreen" : "Enter fullscreen",
    );
    const icon = videoFullscreen.querySelector(".video-control-icon");
    if (icon) {
      icon.innerHTML = isFullscreen ? "&#x2715;" : "&#x26F6;";
    }
  };

  videoFullscreen.addEventListener("click", async () => {
    if (document.fullscreenElement === heroMedia) {
      await screen.orientation?.unlock?.();
      await document.exitFullscreen();
    } else {
      await heroMedia.requestFullscreen();
      if (window.matchMedia("(orientation: portrait)").matches) {
        const orientationLock = screen.orientation?.lock?.("landscape");
        await orientationLock?.catch(() => {
          // Orientation locking is unavailable in some browsers and contexts.
        });
      }
    }
  });
  document.addEventListener("fullscreenchange", updateFullscreenButton);
}
