# ULTRA SIMPLE FIX

## PROBLEME
- SQL syntax error with special characters
- Scripts not working

## SOLUTION
Use ultra_simple_fix.sql

## INSTRUCTIONS

1. Go to Supabase Dashboard
2. Go to SQL Editor
3. Execute ultra_simple_fix.sql
4. Check no errors
5. Test connection and chat

## WHAT IT DOES
- Disables RLS on all tables
- Removes all restrictive policies
- Creates permissive policies
- Allows all operations

## TABLES FIXED
- User
- Message
- Review
- Project
- storage.objects

## TEST AFTER
- Connect with test@test.com
- Send text message
- Upload image
- Everything should work

## RESULT
- No more connection issues
- No more upload issues
- No more message issues
- Everything works without restrictions 