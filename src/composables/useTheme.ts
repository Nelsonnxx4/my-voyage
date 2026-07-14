import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";

export type Theme = "light" | "dark" | "system";

export const useTheme = () => {
  const route = useRoute();
  const theme = ref<Theme>("system");
  const systemTheme = ref<"light" | "dark">("light");

  // Dark mode is scoped to the /voyages section of the app; the landing
  // page and auth screens (login/signup) always render in light mode.
  const isThemeableRoute = computed(() =>
    route.path.startsWith("/voyages")
  );

  const actualTheme = computed(() => {
    if (!isThemeableRoute.value) {
      return "light";
    }
    if (theme.value === "system") {
      return systemTheme.value;
    }
    return theme.value;
  });

  const isDark = computed(() => actualTheme.value === "dark");

  const isLight = computed(() => actualTheme.value === "light");

  const isSystem = computed(() => theme.value === "system");

  let mediaQuery: MediaQueryList | null = null;

  const initializeTheme = () => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
      theme.value = savedTheme;
    } else {
      theme.value = "system";
    }
  };

  // Set up system theme detection
  const setupSystemThemeDetection = () => {
    if (typeof window !== "undefined" && window.matchMedia) {
      mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      systemTheme.value = mediaQuery.matches ? "dark" : "light";

      const handleChange = (e: MediaQueryListEvent) => {
        systemTheme.value = e.matches ? "dark" : "light";
      };

      mediaQuery.addEventListener("change", handleChange);

      return () => {
        if (mediaQuery) {
          mediaQuery.removeEventListener("change", handleChange);
        }
      };
    }
    return () => {};
  };

  // Apply theme to document
  const applyTheme = () => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const currentTheme = actualTheme.value;

    root.classList.remove("light", "dark");

    root.classList.add(currentTheme);

    root.setAttribute("data-theme", currentTheme);

    updateMetaThemeColor(currentTheme);
  };

  const updateMetaThemeColor = (currentTheme: "light" | "dark") => {
    if (typeof document === "undefined") return;

    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.setAttribute("name", "theme-color");
      document.head.appendChild(metaThemeColor);
    }

    // Set theme color based on current theme
    const colors = {
      light: "#fcfcfc",
      dark: "#121212",
    };

    metaThemeColor.setAttribute("content", colors[currentTheme]);
  };

  // Set theme
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme;
    localStorage.setItem("theme", newTheme);
    applyTheme();
  };

  // Toggle between light and dark (useful for quick toggle)
  const toggleTheme = () => {
    if (theme.value === "system") {
      setTheme(systemTheme.value === "light" ? "dark" : "light");
    } else {
      setTheme(theme.value === "light" ? "dark" : "light");
    }
  };

  // Get theme display name
  const getThemeDisplayName = (themeValue: Theme) => {
    const names = {
      light: "Light",
      dark: "Dark",
      system: "System",
    };
    return names[themeValue];
  };

  // Get all available themes
  const availableThemes = computed(() => [
    { value: "light" as Theme, label: "Light" },
    { value: "dark" as Theme, label: "Dark" },
    { value: "system" as Theme, label: "System" },
  ]);

  // Watch for theme changes and apply them
  watch(
    [theme, systemTheme, isThemeableRoute],
    () => {
      applyTheme();
    },
    { immediate: true }
  );

  // Cleanup function
  let cleanup: (() => void) | undefined;

  // Initialize on mount
  onMounted(() => {
    initializeTheme();
    cleanup = setupSystemThemeDetection();
    applyTheme();
  });

  onUnmounted(() => {
    if (cleanup) {
      cleanup();
    }
  });

  return {
    theme: computed(() => theme.value),
    actualTheme,
    systemTheme: computed(() => systemTheme.value),
    isDark,
    isLight,
    isSystem,

    setTheme,
    toggleTheme,
    getThemeDisplayName,
    availableThemes,

    applyTheme,
  };
};
