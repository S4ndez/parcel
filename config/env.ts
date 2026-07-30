export const env = {
  MONGODB_URI:
    process.env.MONGODB_URI ||
    'mongodb+srv://sandeshgirish_db_user:sn2wERG3TNKXrCaI@cluster0.rtepagl.mongodb.net/parcelflow?retryWrites=true&w=majority',
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-jwt-key-parcelflow-2026-production',
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN || '',
  WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN || 'parcelflow_whatsapp_verify_token',
};
