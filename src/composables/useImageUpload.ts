import { computed, nextTick, ref, type ComputedRef, type Ref } from "vue";
import { type FormDataType } from "@/types/formData";
import { supabase } from "@/config/supabase";
import { storageApi } from "@/config/axios";
import { usePremium } from "@/composables/usePremium";

interface ImageActions {
  handleDrop: (e: DragEvent) => void;
  handleDragOver: (e: DragEvent) => void;
  handleDragLeave: (e: DragEvent) => void;
  openFileInput: () => void;
  handleImageUpload: (e: Event) => void;
  dragOver: Ref<boolean>;
  fileInput: Ref<HTMLInputElement | null>;
  cropBox: Ref<HTMLElement | null>;
  isImgLoading: Ref<boolean>;
  isUploading: Ref<boolean>;
  rotate: (degrees: number) => void;
  cropImage: () => void;
  croppedImage: Ref<string>;
  handles: string[];
  imageStyle: import("vue").ComputedRef<{ transform: string }>;
  cropBoxStyle: import("vue").ComputedRef<{
    left: string;
    top: string;
    width: string;
    height: string;
  }>;
  initCropper: () => void;
  startDrag: (e: MouseEvent) => void;
  startResize: (e: MouseEvent, handle: string) => void;
  deleteSelectedImage: () => void;
  uploadImagesToSupabase: () => Promise<string[]>;
  isPremium: boolean;
  maxImagesPerEntry: ComputedRef<number>;
  hasImage: ComputedRef<boolean>;
  showActionButtons: ComputedRef<boolean | string>;
  showOriginalImage: ComputedRef<boolean | string>;
  showCropBox: ComputedRef<boolean | string>;
  showCroppedImage: ComputedRef<boolean>;
  showEmptyState: ComputedRef<boolean>;
  modules: {
    toolbar: (string[] | { list: string }[])[];
  };
  // multi-image additions
  activeIndex: Ref<number>;
  canAddMoreImages: ComputedRef<boolean>;
  selectImage: (index: number) => void;
  removeImageAt: (index: number) => void;
  tempImages: Ref<{ base64: string; file: File | null }[]>;
}

export const useImageUpload = (formData: Ref<FormDataType>): ImageActions => {
  const { limits, isPremium, loadUserPlan } = usePremium();

  loadUserPlan();

  const isImgLoading = ref<boolean>(false);
  const isUploading = ref<boolean>(false);
  const dragOver = ref<boolean>(false);
  const fileInput = ref<HTMLInputElement | null>(null);
  const wrapper = ref<HTMLElement | null>(null);
  const image = ref<HTMLImageElement | null>(null);
  const cropBox = ref<HTMLElement | null>(null);
  const croppedImage = ref<string>("");

  // Multi-image state
  const activeIndex = ref(0);

  // Crop state
  const cropPosition = ref({ x: 0, y: 0 });
  const cropSize = ref({ width: 200, height: 200 });
  const isDragging = ref(false);
  const isResizing = ref(false);
  const resizeHandle = ref("");
  const rotation = ref(0);
  const handles = ["n", "e", "s", "w", "ne", "nw", "se", "sw"];

  const tempImages = ref<{ base64: string; file: File | null }[]>([]);

  // premium features
  const maxImagesPerEntry = computed(() => limits.maxImagesPerEntry);

  const canAddMoreImages = computed(() => {
    return formData.value.image_urls.length < maxImagesPerEntry.value;
  });

  const openFileInput = () => {
    if (!isImgLoading.value && !isUploading.value) {
      fileInput.value?.click();
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!isImgLoading.value && !isUploading.value) {
      dragOver.value = true;
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    dragOver.value = false;
  };

  const handleDrop = (e: DragEvent) => {
    dragOver.value = false;
    if (isImgLoading.value || isUploading.value) return;

    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) return;

    // Apply premium limits
    const filesToProcess = isPremium ? imageFiles : [imageFiles[0]];
    const totalAfterAdd =
      formData.value.image_urls.length + filesToProcess.length;

    if (totalAfterAdd > maxImagesPerEntry.value) {
      const allowedNewFiles =
        maxImagesPerEntry.value - formData.value.image_urls.length;
      if (allowedNewFiles <= 0) return;
      filesToProcess.splice(allowedNewFiles);
    }

    filesToProcess.forEach((file) => {
      processImage(file);
    });
  };

  const handleImageUpload = (e: Event) => {
    const input = (e.target as HTMLInputElement).files;
    if (!input || input.length === 0) return;

    if (isImgLoading.value || isUploading.value) return;
    const files = Array.from(input);
    const filesToProcess = isPremium ? files : [files[0]];

    const totalAfterAdd =
      formData.value.image_urls.length + filesToProcess.length;
    if (totalAfterAdd > maxImagesPerEntry.value) {
      const allowedNewFiles =
        maxImagesPerEntry.value - formData.value.image_urls.length;
      if (allowedNewFiles <= 0) return;

      // Only process the allowed number of files
      filesToProcess.splice(allowedNewFiles);
    }

    filesToProcess.forEach((file) => {
      processImage(file);
    });

    (e.target as HTMLInputElement).value = "";
  };

  const processImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      console.error("Selected file is not an image");
      return;
    }

    if (!canAddMoreImages.value) {
      console.warn("Cannot add more images - limit reached");
      return;
    }

    isImgLoading.value = true;
    croppedImage.value = "";

    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target?.result) {
        if (!Array.isArray(formData.value.image_urls)) {
          formData.value.image_urls = [];
        }

        const base64Data = e.target.result as string;

        tempImages.value.push({
          base64: base64Data,
          file: file,
        });

        formData.value = {
          ...formData.value,
          image_urls: [...formData.value.image_urls, base64Data],
        };

        activeIndex.value = formData.value.image_urls.length - 1;
        isImgLoading.value = false;

        nextTick(() => {
          if (image.value) {
            initCropper();
          }
        });
      }
    };

    reader.onerror = () => {
      isImgLoading.value = false;
      console.error("Error reading file");
    };

    reader.readAsDataURL(file);
  };

  // Upload images to Supabase Storage
  const uploadImagesToSupabase = async (): Promise<string[]> => {
    const existingUrls = formData.value.image_urls.filter(
      (url) => url.startsWith("http") && url.includes("supabase.co")
    );

    if (tempImages.value.length === 0) {
      return existingUrls;
    }

    isUploading.value = true;
    const uploadedUrls: string[] = [...existingUrls];

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("User must be authenticated to upload images");

      const userFolder = `voyages/${user.id}`;

      const uploadPromises = tempImages.value.map(async (tempImage, index) => {
        if (!tempImage.file) return null;

        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const fileExtension = tempImage.file.name.split(".").pop() || "jpg";
        const fileName = `voyage-${timestamp}-${randomString}-${index}.${fileExtension}`;
        const filePath = `${userFolder}/${fileName}`;

        console.log(
          `Uploading image ${index + 1}/${tempImages.value.length}:`,
          {
            filePath,
            size: tempImage.file.size,
            type: tempImage.file.type,
          }
        );

        try {
          // Convert base64 to blob
          const response = await fetch(tempImage.base64);
          const blob = await response.blob();

          const { error } = await supabase.storage
            .from("voyage-images")
            .upload(filePath, blob, {
              cacheControl: "3600",
              upsert: false,
            });

          if (error) {
            console.warn(`Supabase client upload failed, trying Axios:`, error);

            // Fallback to Axios
            const formData = new FormData();
            formData.append("file", blob, fileName);

            const uploadResponse = await storageApi.post(
              `/object/voyage-images/${filePath}`,
              formData
            );

            if (
              uploadResponse.status !== 200 &&
              uploadResponse.status !== 201
            ) {
              throw new Error(
                `Upload failed with status: ${uploadResponse.status}`
              );
            }
          }

          // Construct public URL
          const publicUrl = `${
            import.meta.env.VITE_SUPABASE_URL
          }/storage/v1/object/public/voyage-images/${filePath}`;
          console.log(
            `✅ Image ${index + 1} uploaded successfully:`,
            publicUrl
          );
          return publicUrl;
        } catch (error) {
          console.error(`❌ Failed to upload image ${index + 1}:`, error);
          return null;
        }
      });

      // Wait for all uploads to complete
      const results = await Promise.all(uploadPromises);

      const successfulUploads = results.filter(
        (url) => url !== null
      ) as string[];
      uploadedUrls.push(...successfulUploads);

      tempImages.value = [];

      console.log(
        ` Upload completed: ${successfulUploads.length}/${tempImages.value.length} images uploaded`
      );
      return uploadedUrls;
    } catch (error: any) {
      console.error("Error uploading images to Supabase:", error);

      if (
        error.message.includes("bucket") ||
        error.message.includes("not found")
      ) {
        throw new Error(
          'Storage bucket not found. Please check if the "voyage-images" bucket exists in your Supabase project.'
        );
      } else if (error.message.includes("JWT")) {
        throw new Error(
          "Authentication error. Please make sure you are logged in."
        );
      } else if (error.message.includes("storage")) {
        throw new Error("Storage service error. Please try again later.");
      } else {
        throw new Error(`Failed to upload images: ${error.message}`);
      }
    } finally {
      isUploading.value = false;
    }
  };

  const deleteSelectedImage = () => {
    if (
      !Array.isArray(formData.value.image_urls) ||
      formData.value.image_urls.length === 0
    ) {
      formData.value.image_urls = [];
      croppedImage.value = "";
      return;
    }

    // Also remove from temp images
    if (tempImages.value[activeIndex.value]) {
      tempImages.value.splice(activeIndex.value, 1);
    }

    formData.value.image_urls.splice(activeIndex.value, 1);

    // Adjust active index if needed
    if (activeIndex.value >= formData.value.image_urls.length) {
      activeIndex.value = Math.max(0, formData.value.image_urls.length - 1);
    }

    croppedImage.value = "";
  };

  const removeImageAt = (index: number) => {
    if (!Array.isArray(formData.value.image_urls)) return;
    if (index < 0 || index >= formData.value.image_urls.length) return;

    // Remove from temp images as well
    if (tempImages.value[index]) {
      tempImages.value.splice(index, 1);
    }

    formData.value.image_urls.splice(index, 1);

    // Adjust active index if needed
    if (activeIndex.value >= formData.value.image_urls.length) {
      activeIndex.value = Math.max(0, formData.value.image_urls.length - 1);
    }
  };

  // Add a function to handle multiple file drops

  const imageStyle = computed(() => ({
    transform: `rotate(${rotation.value}deg)`,
  }));

  const cropBoxStyle = computed(() => ({
    left: `${cropPosition.value.x}px`,
    top: `${cropPosition.value.y}px`,
    width: `${cropSize.value.width}px`,
    height: `${cropSize.value.height}px`,
  }));

  const initCropper = () => {
    if (!wrapper.value || !image.value) return;

    cropPosition.value = {
      x: (wrapper.value.offsetWidth - cropSize.value.width) / 2,
      y: (wrapper.value.offsetHeight - cropSize.value.height) / 2,
    };
  };

  const startDrag = (e: MouseEvent) => {
    if (isResizing.value) return;
    isDragging.value = true;
    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = cropPosition.value.x;
    const startTop = cropPosition.value.y;

    const doDrag = (moveEvent: MouseEvent) => {
      if (!isDragging.value) return;
      cropPosition.value = {
        x: startLeft + (moveEvent.clientX - startX),
        y: startTop + (moveEvent.clientY - startY),
      };
    };

    const stopDrag = () => {
      isDragging.value = false;
      window.removeEventListener("mousemove", doDrag);
      window.removeEventListener("mouseup", stopDrag);
    };

    window.addEventListener("mousemove", doDrag);
    window.addEventListener("mouseup", stopDrag);
  };

  const startResize = (e: MouseEvent, handle: string) => {
    isResizing.value = true;
    resizeHandle.value = handle;
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = cropSize.value.width;
    const startHeight = cropSize.value.height;
    const startLeft = cropPosition.value.x;
    const startTop = cropPosition.value.y;

    const doResize = (moveEvent: MouseEvent) => {
      if (!isResizing.value) return;

      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const newSize = { ...cropSize.value };
      const newPos = { ...cropPosition.value };

      if (handle.includes("e")) {
        newSize.width = startWidth + deltaX;
      }
      if (handle.includes("w")) {
        newSize.width = startWidth - deltaX;
        newPos.x = startLeft + deltaX;
      }
      if (handle.includes("s")) {
        newSize.height = startHeight + deltaY;
      }
      if (handle.includes("n")) {
        newSize.height = startHeight - deltaY;
        newPos.y = startTop + deltaY;
      }

      if (newSize.width > 20 && newSize.height > 20) {
        cropSize.value = newSize;
        cropPosition.value = newPos;
      }
    };

    const stopResize = () => {
      isResizing.value = false;
      window.removeEventListener("mousemove", doResize);
      window.removeEventListener("mouseup", stopResize);
    };

    window.addEventListener("mousemove", doResize);
    window.addEventListener("mouseup", stopResize);
  };

  const cropImage = () => {
    if (!image.value || !wrapper.value) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = cropSize.value.width;
    canvas.height = cropSize.value.height;

    const img = image.value;
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    ctx.drawImage(
      img,
      cropPosition.value.x * scaleX,
      cropPosition.value.y * scaleY,
      cropSize.value.width * scaleX,
      cropSize.value.height * scaleY,
      0,
      0,
      cropSize.value.width,
      cropSize.value.height
    );

    const dataUrl = canvas.toDataURL("image/jpeg");
    croppedImage.value = dataUrl;

    // Update both the preview and temp storage
    if (
      Array.isArray(formData.value.image_urls) &&
      formData.value.image_urls.length > 0
    ) {
      formData.value.image_urls[activeIndex.value] = dataUrl;

      // Update temp image with cropped version
      if (tempImages.value[activeIndex.value]) {
        tempImages.value[activeIndex.value].base64 = dataUrl;
      }
    }
  };

  const rotate = (degrees: number = 90) => {
    rotation.value = (rotation.value + degrees) % 360;
  };

  const hasImage = computed(() => (formData.value.image_urls?.length || 0) > 0);
  const showActionButtons = computed(
    () => hasImage.value && !isImgLoading.value && !isUploading.value
  );
  const showOriginalImage = computed(
    () => hasImage.value && !croppedImage.value && !isImgLoading.value
  );
  const showCropBox = computed(
    () => hasImage.value && !croppedImage.value && !isImgLoading.value
  );
  const showCroppedImage = computed(
    () => !!croppedImage.value && !isImgLoading.value
  );
  const showEmptyState = computed(
    () => !hasImage.value && !isImgLoading.value && !dragOver.value
  );

  const modules = {
    toolbar: [
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["clean"],
    ],
  };

  // Function to select an image by index
  const selectImage = (index: number) => {
    if (
      Array.isArray(formData.value.image_urls) &&
      index >= 0 &&
      index < formData.value.image_urls.length
    ) {
      activeIndex.value = index;
      croppedImage.value = "";
    }
  };

  return {
    rotate,
    initCropper,
    startDrag,
    startResize,
    cropImage,
    handleDrop,
    openFileInput,
    handleImageUpload,
    handleDragOver,
    handleDragLeave,
    deleteSelectedImage,
    uploadImagesToSupabase,
    isPremium: isPremium,
    maxImagesPerEntry: maxImagesPerEntry,
    handles,
    imageStyle,
    cropBoxStyle,
    cropBox,
    croppedImage,
    dragOver,
    fileInput,
    isImgLoading,
    isUploading,
    hasImage,
    showActionButtons,
    showOriginalImage,
    showCropBox,
    showCroppedImage,
    showEmptyState,
    modules,
    activeIndex,
    canAddMoreImages,
    selectImage,
    removeImageAt,
    tempImages,
  };
};
