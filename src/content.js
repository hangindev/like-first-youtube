import { $, waitUntilElements, throttle, getOptions } from "./utils";

const selector = {
  app: "ytd-app",
  ad: ".ad-showing, .ad-interrupting",
  video: "video.video-stream",
  like: `button[aria-label^="like this"]`,
  dislike: `button[aria-label^="dislike this"]`,
  signIn: `a[href^="https://accounts.google.com/ServiceLogin"]`,
  channelLink: "ytd-channel-name a",
  subscribe: "paper-button.ytd-subscribe-button-renderer"
};

const buttonIsPressed = selector => {
  const button = $(selector);
  if (!button) {
    throw new Error(`Button not found: ${selector}`);
  }
  return button.getAttribute("aria-pressed") === "true";
};

const subscribed = () => {
  const button = $(selector.subscribe);
  if (!button) {
    throw new Error(`Subscibe button not found: ${selector}`);
  }
  return button.hasAttribute("subscribed");
};

const getChannelId = () =>
  $(selector.channelLink)
    .getAttribute("href")
    .replace("/channel/", "");

const getVideoId = () => new URLSearchParams(window.location.search).get("v");

async function main() {
  console.log("Init.");
  // if not in the watch page, do nothing
  if (!document.location.href.startsWith("https://www.youtube.com/watch")) {
    return console.log("Not watch page");
  }
  // if user logged out, do nothing
  if ($(selector.signIn)) {
    return console.log("Not sign in");
  }
  // save videoId before all async tasks
  const videoId = getVideoId();

  const {
    subscribedOnly = false,
    includeIds = [],
    excludeIds = [],
    minDuration = 10
  } = await getOptions();

  try {
    // don't do anything until the video, the like & dislike buttons are there yet
    await waitUntilElements([selector.video, selector.like, selector.dislike]);
    // if the user has already rated the video, ciao
    if (buttonIsPressed(selector.like) || buttonIsPressed(selector.dislike)) {
      return console.log("Rated!");
    }

    const channelId = getChannelId();

    if (subscribedOnly && !subscribed() && !includeIds.includes(channelId)) {
      return;
    }
    if (
      !subscribedOnly &&
      includeIds.length > 0 &&
      !includeIds.includes(channelId)
    ) {
      return;
    }
    console.log({excludeIds, channelId})
    if (excludeIds.length > 0 && excludeIds.includes(channelId)) {
      return;
    }

    const video = $(selector.video);
    const likeButton = $(selector.like);

    const handleVideoTimeUpdate = throttle(() => {
      if (video.currentTime < minDuration || $(selector.ad)) return;
      video.removeEventListener("timeupdate", handleVideoTimeUpdate);
      if (videoId === getVideoId()) {
        likeButton.click();
        console.log("Liked! 👍");
      }
    }, 500);

    video.addEventListener("timeupdate", handleVideoTimeUpdate);
  } catch (e) {
    if (e.message) console.log(e.message);
  }
}
$(selector.app).addEventListener("yt-page-data-updated", () => {
  console.log("yt-page-data-updated");
  main();
});
