import { computed, onMounted, onUnmounted, ref, type Ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import type { VoyageTypeInfo } from "@/types/voyage";
import { usePremium } from "@/composables/usePremium";
import {
  createVoyage,
  deleteVoyage,
  fetchVoyageById,
  fetchVoyages,
  updateVoyage,
} from "@/services/supabase/voyage";
import type { FormDataType } from "@/types/formData";
import { showToast } from "@/utils/showToast";
// import type { LocationSuggestion } from "@/composables/useMap";

type ModalSize = "sm" | "md" | "lg" | "xl";

interface VoyageManager {
  // State
  voyages: Ref<VoyageTypeInfo[]>;
  voyage: Ref<VoyageTypeInfo | null>;
  voyageId: Ref<string | null>;
  favorites: Ref<string[]>;
  scrolled: Ref<boolean>;
  isMenuOpen: Ref<boolean>;
  isProfileModal: Ref<boolean>;
  isSmallModalOpen: Ref<boolean>;
  currentVoyageId: Ref<string | null>;
  isLoading: Ref<boolean>;
  size: Ref<ModalSize>;
  error: Ref<string | null>;
  favoriteVoyages: Ref<VoyageTypeInfo[]>;
  formData: Ref<FormDataType>;

  // Navigation
  toggleMenu: () => void;
  navigateToCreate: () => void;
  navigateToFavorites: () => void;
  navigateToVoyage: (voyageId: string) => void;
  navigateToVoyages: () => void;

  // Modals
  openProfileModal: () => void;
  closeProfileModal: () => void;
  openModal: (voyageId: string, modalSize?: ModalSize) => void;
  closeModal: () => void;
  openOptionsModal: (voyageId: string) => void;

  // Actions
  editVoyage: (voyageId: string) => void;
  confirmDeleteVoyage: (voyageId: string) => void;
  // handleEdit: () => void;
  handleFetchVoyages: () => Promise<void>;
  handleFetchSingleVoyage: (voyageId: string) => Promise<VoyageTypeInfo | null>;
  handleCreateVoyage: (
    newVoyageData: FormDataType
  ) => Promise<VoyageTypeInfo | null>;
  handleDeleteVoyage: (voyageId: string) => Promise<void>;
  handleUpdateVoyage: (
    voyageId: string,
    data: FormDataType
  ) => Promise<VoyageTypeInfo | null>;
  toggleFavorite: (voyageId: string) => void;
}

export const useVoyageManager = (): VoyageManager => {
  const route = useRoute();
  const router = useRouter();
  const { limits } = usePremium();

  // State
  const scrolled = ref(false);
  const isProfileModal = ref(false);
  const isMenuOpen = ref(false);
  const voyages = ref<VoyageTypeInfo[]>([]);
  const voyage = ref<VoyageTypeInfo | null>(null);
  const isSmallModalOpen = ref(false);
  const currentVoyageId = ref<string | null>(null);
  const isLoading = ref(true);
  const error = ref<string | null>(null);
  const size = ref<ModalSize>("md");
  const favorites = ref<string[]>(
    JSON.parse(localStorage.getItem("favorites") || "[]")
  );
  const formData = ref<FormDataType>({
    title: "",
    image_urls: [],
    notes: "",
    location: "",
    start_date: "",
    end_date: "",
    rating: 0,
    pins: [],
    latitude: null,
    longitude: null,
  });

  const voyageId = computed(() => {
    try {
      const idParam = route.params?.id;
      if (!idParam) return null;

      return idParam.toString();
    } catch (error) {
      console.error("Error getting voyage ID:", error);
      return null;
    }
  });

  // Event Handlers
  const handleScroll = () => {
    scrolled.value = window.scrollY > 10;
  };

  // Navigations
  const navigateToCreate = () => {
    if (voyages.value.length >= limits.maxVoyageEntries) {
      router.push("/pricing");
      isMenuOpen.value = false;
      return;
    } else {
      router.push("/voyages/create");
      isMenuOpen.value = false;
    }
  };

  const navigateToFavorites = () => {
    router.push("/voyages/favourites");
    isMenuOpen.value = false;
  };

  const navigateToVoyage = (voyageId: string) => {
    router.push(`/voyages/${voyageId}`);
    isMenuOpen.value = false;
  };

  const navigateToVoyages = () => {
    router.push("/voyages");
    isMenuOpen.value = false;
  };

  const navigateToEdit = (voyageId: string) => {
    router.push(`/voyages/${voyageId}/edit`);
  };

  // Modal fuunctions
  const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
  };

  const openProfileModal = () => {
    isProfileModal.value = true;
  };

  const closeProfileModal = () => {
    isProfileModal.value = false;
  };

  const openModal = (voyageId: string, modalSize?: ModalSize) => {
    size.value = modalSize ?? "md";
    currentVoyageId.value = voyageId;
    isSmallModalOpen.value = true;
  };

  const closeModal = () => {
    isSmallModalOpen.value = false;
    currentVoyageId.value = null;
  };

  const openOptionsModal = (voyageId: string) => {
    openModal(voyageId, "sm");
  };

  // Voyage Actions

  const handleFetchVoyages = async (): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;
      const data = await fetchVoyages();
      voyages.value = data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch voyages";
    } finally {
      isLoading.value = false;
    }
  };

  const handleFetchSingleVoyage = async (
    voyageId: string
  ): Promise<VoyageTypeInfo | null> => {
    isLoading.value = true;
    error.value = null;
    try {
      const foundVoyage = await fetchVoyageById(voyageId);

      if (!foundVoyage) {
        error.value = "Voyage not found";
        return null;
      }

      voyage.value = foundVoyage;
      return foundVoyage;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load voyage";
      console.error("Error fetching voyage:", err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const handleCreateVoyage = async (
    newVoyageData: FormDataType
  ): Promise<VoyageTypeInfo | null> => {
    try {
      isLoading.value = true;
      error.value = null;
      console.log("Creating voyage with data:", newVoyageData);

      if (!newVoyageData) {
        throw new Error("Voyage data is null or undefined");
      }

      if (!newVoyageData.title?.trim()) {
        throw new Error("Please enter a title for your voyage");
      }

      if (!newVoyageData.location?.trim()) {
        throw new Error("Please select a location for your voyage");
      }

      if (!newVoyageData.start_date || !newVoyageData.end_date) {
        throw new Error("Please select start and end dates for your voyage");
      }

      const created = await createVoyage(newVoyageData);

      if (created) {
        console.log("created", created);
        voyages.value.unshift(created);
        formData.value = {
          title: "",
          image_urls: [],
          notes: "",
          location: "",
          start_date: "",
          end_date: "",
          rating: 0,
          pins: [],
          latitude: null,
          longitude: null,
        };

        navigateToVoyage(created.id);

        try {
          showToast("Voyage created successfully", "success");
        } catch (err) {
          console.error("Error adding toast:", err);
        }

        return created;
      } else {
        throw new Error("Failed to create voyage");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create voyage";
      error.value = message;

      showToast(message, "error");

      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const handleUpdateVoyage = async (
    voyageId: string,
    data: FormDataType
  ): Promise<VoyageTypeInfo | null> => {
    try {
      isLoading.value = true;
      error.value = null;

      const updated = await updateVoyage(voyageId, data);

      if (updated && typeof updated === "object") {
        // Update local cache
        const idx = voyages.value.findIndex((v) => v.id === voyageId);
        if (idx !== -1) {
          voyages.value[idx] = updated;
        }

        if (voyage.value?.id === voyageId) {
          voyage.value = updated;
        }

        showToast("Voyage updated", "success");
        return updated as VoyageTypeInfo;
      }
      return null;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update voyage";
      error.value = message;

      showToast(message, "error");
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  // navigation to the current voyage
  const editVoyage = (voyageId: string) => {
    navigateToEdit(voyageId);
  };

  // const handleEdit = () => {
  //   if (currentVoyageId.value) {
  //     editVoyage(currentVoyageId.value);
  //     closeModal();
  //   }
  // };

  const handleDeleteVoyage = async (voyageId: string): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;

      await deleteVoyage(voyageId);
      voyages.value = voyages.value.filter((voyage) => voyage.id !== voyageId);

      showToast("Voyage deleted", "success");
      closeModal();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete voyage";

      error.value = message;

      showToast(message, "error");
    } finally {
      isLoading.value = false;
    }
  };

  const confirmDeleteVoyage = (voyageId: string) => {
    currentVoyageId.value = voyageId;
    openModal(voyageId, "sm");
  };

  // Filter favorite voyages
  const favoriteVoyages = computed(() => {
    return voyages.value.filter((voyage) =>
      favorites.value.includes(voyage.id)
    );
  });

  // Toggle favorite status
  const toggleFavorite = (voyageId: string) => {
    const index = favorites.value.indexOf(voyageId);
    if (index === -1) {
      favorites.value.push(voyageId);
    } else {
      favorites.value.splice(index, 1);
    }
    localStorage.setItem("favorites", JSON.stringify(favorites.value));
  };

  // Data Loading

  // Lifecycle Hooks
  onMounted(async () => {
    window.addEventListener("scroll", handleScroll);
    await handleFetchVoyages();
  });

  onUnmounted(() => {
    window.removeEventListener("scroll", handleScroll);
  });

  return {
    voyages,
    voyage,
    voyageId,
    scrolled,
    isMenuOpen,
    isProfileModal,
    isSmallModalOpen,
    currentVoyageId,
    favoriteVoyages,
    isLoading,
    size,
    error,
    formData,
    toggleMenu,
    toggleFavorite,
    navigateToCreate,
    navigateToFavorites,
    navigateToVoyage,
    navigateToVoyages,
    openProfileModal,
    closeProfileModal,
    openModal,
    closeModal,
    openOptionsModal,
    editVoyage,
    confirmDeleteVoyage,
    // handleEdit,
    handleFetchSingleVoyage,
    handleCreateVoyage,
    handleFetchVoyages,
    handleDeleteVoyage,
    handleUpdateVoyage,
    favorites,
  };
};
