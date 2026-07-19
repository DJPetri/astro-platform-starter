const EVENT_THEMES = {
  wedding: {
    heroImage: "/bilder/Weddingbackground.png",
    heroAlt: "Hochzeitslocation",
    shareText:
      "Vielen Dank, dass ihr eure schönsten Fotos und Videos mit dem Brautpaar teilt.",
    privacyText:
      "Die hochgeladenen Dateien werden ausschließlich dem Brautpaar und DJ Christian Petri zur Verfügung gestellt.",
    expiredText:
      "Der Uploadzeitraum dieser Hochzeitsgalerie ist leider abgelaufen.",
    footerText: "DJ • Hochzeiten • Eventtechnik"
  },
  neutral: {
    heroImage: "/bilder/event-templates/neutral/background.jpg",
    heroAlt: "Eventlocation",
    shareText:
      "Vielen Dank, dass ihr eure schönsten Fotos und Videos von diesem Event teilt.",
    privacyText:
      "Die hochgeladenen Dateien werden ausschließlich dem Veranstalter und DJ Christian Petri zur Verfügung gestellt.",
    expiredText:
      "Der Uploadzeitraum dieser Eventgalerie ist leider abgelaufen.",
    footerText: "DJ • Events • Eventtechnik"
  }
};

export function getEventTheme(eventData = {}) {
  return EVENT_THEMES[eventData.eventVariant] || EVENT_THEMES.wedding;
}
