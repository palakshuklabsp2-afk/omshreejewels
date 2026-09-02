import { STORE } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="font-display text-4xl text-wine">Page not found</h1>
      <p className="mt-3">This page is not available in the {STORE.name} store.</p>
    </div>
  );
}