import React, { useState } from "react";
import { supabase } from "@/api/supabaseClient";

export const ImageUploader = ({ onUpload }) => {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e) {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileName = ${Date.now()}-${file.name};
      const { data, error } = await supabase.storage
        .from("posts")
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("posts")
        .getPublicUrl(fileName);

      onUpload(urlData.publicUrl);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="cursor-pointer">
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
        <div className="px-4 py-2 bg-blue-600 text-white rounded-md">
          {uploading ? "Enviando..." : "Enviar imagem"}
        </div>
      </label>
    </div>
  );
};

