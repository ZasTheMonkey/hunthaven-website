import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
test('migration enforces participant reads, no client writes, claim bounds and exclusive locks',async()=>{
 const db=new PGlite();
 try{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
 create schema auth;create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;
 create table public.listings(id uuid primary key);create table public.bookings(id uuid primary key);
 insert into auth.users values ('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002'),('00000000-0000-0000-0000-000000000003');
 insert into listings values ('00000000-0000-0000-0000-000000000010');insert into bookings values ('00000000-0000-0000-0000-000000000020');`);
 await db.exec(readFileSync(new URL('../supabase/migrations/20261109033849_lease_payment_cleaning_deposits.sql',import.meta.url),'utf8'));
 await db.exec(`insert into lease_payments(id,booking_id,listing_id,guest_id,owner_id,guest_email,destination,lease_cents,owner_cents,platform_cents,total_cents,deposit_cents,checkin_at,time_zone,hunting_methods,checkout_at,hold_at,claim_deadline,policy_version,consent_at)
 values ('00000000-0000-0000-0000-000000000030','00000000-0000-0000-0000-000000000020','00000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','test@example.test','acct_test',10000,8000,2320,10320,5000,'2026-11-09T05:00:00Z','America/New_York',array['bow'],'2026-11-10T05:00:00Z','2026-11-09T05:00:00Z','2026-11-12T05:00:00Z','test',now());`);
 await db.exec("set role authenticated;set request.jwt.claim.sub='00000000-0000-0000-0000-000000000001';");
 assert.equal((await db.query('select * from lease_payments')).rows.length,1);
 await assert.rejects(db.exec("update lease_payments set deposit_cents=1"),/permission denied/);
 await assert.rejects(db.exec("select * from lock_lease_payment('00000000-0000-0000-0000-000000000030','00000000-0000-0000-0000-000000000040')"),/permission denied/);
 await db.exec("set request.jwt.claim.sub='00000000-0000-0000-0000-000000000002';");assert.equal((await db.query('select * from lease_payments')).rows.length,1);
 await db.exec("set request.jwt.claim.sub='00000000-0000-0000-0000-000000000003';");assert.equal((await db.query('select * from lease_payments')).rows.length,0);
 await db.exec('reset role;set role anon;');await assert.rejects(db.exec('select * from lease_payments'),/permission denied/);
 await db.exec('reset role;');await assert.rejects(db.exec('update lease_payments set claim_cents=5001'),/check constraint/);
 await assert.rejects(db.exec("update listings set hunting_methods=array['invalid']"),/check constraint/);
 await db.exec('set role service_role;');
 assert.equal((await db.query("select * from lock_lease_payment('00000000-0000-0000-0000-000000000030','00000000-0000-0000-0000-000000000040')")).rows.length,1);
 assert.equal((await db.query("select * from lock_lease_payment('00000000-0000-0000-0000-000000000030','00000000-0000-0000-0000-000000000041')")).rows.length,0);
 }finally{await db.close();}
});
