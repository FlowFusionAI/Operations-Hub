-- Fix: The membership INSERT policy (is_org_admin) blocks the first membership
-- because no admin exists yet for the newly created org.
--
-- This policy allows a user to insert themselves as owner when no memberships
-- exist for that org yet (i.e., they are the founder).

CREATE POLICY "Founders can create initial owner membership"
  ON memberships FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND role = 'owner'
    AND NOT EXISTS (
      SELECT 1 FROM memberships m WHERE m.org_id = memberships.org_id
    )
  );
