export * from '@/lib/utils'
// supabase и telegram не реэкспортируются — серверный код не должен попадать в клиентские бандлы.
// Импортируйте напрямую: import { supabase } from '@/lib/supabase'