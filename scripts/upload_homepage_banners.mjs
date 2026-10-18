import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY must be set in your .env file.');
  process.exit(1);
}

const client = createClient(supabaseUrl, supabaseAnonKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  console.log('================================================================');
  console.log('   MJ School — Upload Existing Homepage Banners to Supabase     ');
  console.log('================================================================\n');

  const desktopPath = path.resolve(process.cwd(), 'public/hero-desktop.png');
  const mobilePath = path.resolve(process.cwd(), 'public/hero-mobile.png');

  if (!fs.existsSync(desktopPath) || !fs.existsSync(mobilePath)) {
    console.error('❌ Error: Could not find public/hero-desktop.png or public/hero-mobile.png in repository.');
    process.exit(1);
  }

  console.log('✔ Found local assets:');
  console.log(`  - Desktop: ${desktopPath} (${(fs.statSync(desktopPath).size / 1024).toFixed(1)} KB)`);
  console.log(`  - Mobile:  ${mobilePath} (${(fs.statSync(mobilePath).size / 1024).toFixed(1)} KB)\n`);

  // Obtain staff credentials
  let email = process.argv[2];
  let password = process.argv[3];

  if (!email) {
    email = await ask('Enter Administrator Email: ');
  }
  if (!password) {
    password = await ask('Enter Administrator Password: ');
  }
  rl.close();

  console.log(`\n🔑 Authenticating as ${email}...`);
  const { data: authData, error: authError } = await client.auth.signInWithPassword({
    email: email.trim(),
    password: password.trim(),
  });

  if (authError || !authData.user) {
    console.error(`❌ Authentication failed: ${authError?.message || 'Invalid credentials'}`);
    process.exit(1);
  }
  console.log('✔ Supabase Authentication successful.');

  // Verify staff authorization in admin_users
  console.log('🔒 Verifying administrative authorization in admin_users table...');
  const { data: adminRecord, error: adminError } = await client
    .from('admin_users')
    .select('role, is_active')
    .eq('id', authData.user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (adminError || !adminRecord) {
    console.error('❌ Authorization failed: This user account is authenticated, but is NOT registered as an active administrator in public.admin_users.');
    console.error('   Please run the bootstrap SQL query in your Supabase SQL Editor:');
    console.error(`   INSERT INTO public.admin_users (id, email, role, is_active) VALUES ('${authData.user.id}', '${email}', 'super_admin', true) ON CONFLICT (id) DO UPDATE SET is_active = true;\n`);
    process.exit(1);
  }

  console.log(`✔ Verified authorized administrator role: [${adminRecord.role}].\n`);

  // Upload Desktop Banner
  console.log('⬆ Uploading desktop banner to "site-banners" bucket...');
  const desktopBuffer = fs.readFileSync(desktopPath);
  const { error: desktopUploadError } = await client.storage
    .from('site-banners')
    .upload('homepage-desktop.png', desktopBuffer, {
      contentType: 'image/png',
      upsert: true,
      cacheControl: '3600',
    });

  if (desktopUploadError) {
    console.error(`❌ Desktop banner upload failed: ${desktopUploadError.message}`);
    process.exit(1);
  }

  const { data: desktopUrlData } = client.storage
    .from('site-banners')
    .getPublicUrl('homepage-desktop.png');

  const desktopPublicUrl = desktopUrlData.publicUrl;
  console.log(`✔ Desktop banner uploaded successfully:\n  ${desktopPublicUrl}\n`);

  // Upload Mobile Banner
  console.log('⬆ Uploading mobile banner to "site-banners" bucket...');
  const mobileBuffer = fs.readFileSync(mobilePath);
  const { error: mobileUploadError } = await client.storage
    .from('site-banners')
    .upload('homepage-mobile.png', mobileBuffer, {
      contentType: 'image/png',
      upsert: true,
      cacheControl: '3600',
    });

  if (mobileUploadError) {
    console.error(`❌ Mobile banner upload failed: ${mobileUploadError.message}`);
    process.exit(1);
  }

  const { data: mobileUrlData } = client.storage
    .from('site-banners')
    .getPublicUrl('homepage-mobile.png');

  const mobilePublicUrl = mobileUrlData.publicUrl;
  console.log(`✔ Mobile banner uploaded successfully:\n  ${mobilePublicUrl}\n`);

  // Update site_banners table
  console.log('📝 Updating public.site_banners record in database...');
  const { data: updatedRecord, error: dbError } = await client
    .from('site_banners')
    .upsert(
      {
        page_key: 'homepage',
        page_path: '/',
        desktop_image_path: desktopPublicUrl,
        mobile_image_path: mobilePublicUrl,
        is_published: true,
        updated_at: new Date().toISOString(),
        updated_by: email,
      },
      { onConflict: 'page_key' }
    )
    .select()
    .single();

  if (dbError) {
    console.error(`❌ Database update failed: ${dbError.message}`);
    process.exit(1);
  }

  console.log('✔ Database record successfully updated:');
  console.log(`  - Page Key: ${updatedRecord.page_key}`);
  console.log(`  - Desktop URL: ${updatedRecord.desktop_image_path}`);
  console.log(`  - Mobile URL:  ${updatedRecord.mobile_image_path}`);
  console.log(`  - Published:   ${updatedRecord.is_published}`);
  console.log('\n🎉 Homepage banner storage setup is complete!');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
