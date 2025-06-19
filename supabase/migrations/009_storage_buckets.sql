-- =============================================
-- STORAGE BUCKETS
-- =============================================
-- Create storage buckets for documents and other files

-- Create the user-documents bucket for document uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-documents',
  'user-documents',
  false,
  10485760, -- 10MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Create the profile-images bucket for avatar uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true, -- Public for avatars
  5242880, -- 5MB
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for user-documents bucket
CREATE POLICY "Users can upload own documents" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'user-documents' AND 
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

CREATE POLICY "Users can view own documents" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'user-documents' AND 
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

CREATE POLICY "Users can update own documents" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'user-documents' AND 
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

CREATE POLICY "Users can delete own documents" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'user-documents' AND 
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Storage policies for profile-images bucket
CREATE POLICY "Users can upload own profile image" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-images' AND 
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

CREATE POLICY "Anyone can view profile images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profile-images');

CREATE POLICY "Users can update own profile image" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'profile-images' AND 
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

CREATE POLICY "Users can delete own profile image" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'profile-images' AND 
  auth.uid()::text = (string_to_array(name, '/'))[1]
);