export function optimizedImage(url?: string | null) {
  if (!url) return "/placeholder-jewellery.svg";
  if (url.includes("res.cloudinary.com") && !url.includes("f_auto")) {
    return url.replace("/upload/", "/upload/f_auto,q_auto,c_limit,w_1200/");
  }
  return url;
}
