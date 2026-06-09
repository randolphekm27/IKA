import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qgsunlfioprtkfttjire.supabase.co';
const supabaseKey = 'sb_publishable_6zcpiSwYoncZaBFkNW6-OQ_LuSPp0c3';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const { data, error } = await supabase
    .from('users')
    .insert({
      name: 'Test User',
      email: 'test' + Date.now() + '@ika.fr',
      role: 'invite'
    });
    
  console.log('Result:', { data, error });
}

testInsert();
