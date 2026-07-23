export const publicImageUrl = (image: string | null): string | null => {
  if (!image) return null;
  if (/^https?:\/\//i.test(image)) return image;
  return `/images/${image}`;
};
