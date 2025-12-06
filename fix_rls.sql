-- FIX RLS RECURSION BUG
-- Run this in Supabase SQL Editor to fix the 500 Error

-- 1. Fix Project Members Policy (The Root Cause)
-- The previous policy caused an infinite loop by querying itself.
drop policy if exists "Members can view project members" on project_members;

create policy "Users can view own memberships" 
on project_members for select 
using (user_id = auth.uid());

-- 2. Ensure Events Policy is Correct
-- This depends on the above fix to work without crashing.
drop policy if exists "Users can view relevant events" on events;

create policy "Users can view relevant events" 
on events for select 
using (
  auth.uid() = user_id or 
  project_id in (select project_id from project_members where user_id = auth.uid())
);
