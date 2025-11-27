import { supabase } from './supabaseClient'

// Supabase Storage for file operations
export const uploadFile = async (file, bucket = 'public', path = '') => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = path ? `${path}${fileName}` : fileName;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);
  
  if (error) throw error;
  
  // Get public URL
  const { data: { publicUrl } } = await supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
  
  return { url: publicUrl, path: filePath };
}
