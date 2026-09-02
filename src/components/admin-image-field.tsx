"use client";

type Props = {
  label: string;
  previewUrl?: string;
  uploading?: boolean;
  onFile: (file: File) => void;
};

export function AdminImageField({ label, previewUrl, uploading, onFile }: Props) {
  return (
    <div className="sm:col-span-2 space-y-2">
      <label className="block rounded-2xl border border-dashed border-crimson/30 bg-ivory/60 px-4 py-4 cursor-pointer">
        <span className="block text-sm font-medium text-wine">{label}</span>
        <span className="block text-xs text-zinc-500 mt-1">Choose a photo from this computer or phone. Camera and gallery both work.</span>
        <input
          type="file"
          accept="image/*"
          className="mt-3 block w-full text-sm"
          autoComplete="off"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            e.target.value = "";
          }}
        />
      </label>
      {uploading ? <p className="text-xs text-zinc-500">Uploading…</p> : null}
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="Uploaded preview" className="h-28 w-28 rounded-2xl object-cover border" />
      ) : null}
    </div>
  );
}
