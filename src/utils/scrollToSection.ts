export const scrollToSection = (href: string | undefined) => {
  const sectionId: string | undefined = href?.replace("#", "");
  if (!sectionId) return;
  const section = document.getElementById(sectionId);

  if (section) {
    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};
