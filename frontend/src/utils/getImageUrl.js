export const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;

  const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  return `${backend}${url}`; // e.g. /uploads/xxx.jpg -> http://localhost:5000/uploads/xxx.jpg
};