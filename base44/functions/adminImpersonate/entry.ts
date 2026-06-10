import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const admin = await base44.auth.me();

    if (!admin || admin.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { action, userId, securityCode } = body;

    // Generate or retrieve security code for a user
    if (action === 'getSecurityCode') {
      const users = await base44.asServiceRole.entities.User.filter({ id: userId });
      const user = users[0];
      if (!user) return Response.json({ error: 'User not found' }, { status: 404 });

      let code = user.security_code;
      if (!code) {
        code = Math.random().toString(36).substring(2, 6).toUpperCase() +
               Math.random().toString(36).substring(2, 6).toUpperCase();
        await base44.asServiceRole.entities.User.update(userId, { security_code: code });
      }
      return Response.json({ security_code: code });
    }

    // List all users with their security codes
    if (action === 'listUsersWithCodes') {
      const users = await base44.asServiceRole.entities.User.list();
      const usersWithCodes = await Promise.all(users.map(async (u) => {
        let code = u.security_code;
        if (!code && u.role !== 'admin') {
          code = Math.random().toString(36).substring(2, 6).toUpperCase() +
                 Math.random().toString(36).substring(2, 6).toUpperCase();
          await base44.asServiceRole.entities.User.update(u.id, { security_code: code });
        }
        return { ...u, security_code: code };
      }));
      return Response.json({ users: usersWithCodes });
    }

    // Verify a security code and return the user's data for impersonation
    if (action === 'verifyCode') {
      const users = await base44.asServiceRole.entities.User.filter({ security_code: securityCode });
      if (!users || users.length === 0) {
        return Response.json({ success: false, error: 'Invalid security code' });
      }
      const targetUser = users[0];
      return Response.json({ 
        success: true,
        user: { 
          id: targetUser.id,
          email: targetUser.email,
          full_name: targetUser.full_name,
          role: targetUser.role,
          security_code: targetUser.security_code
        }
      });
    }

    // Get full user details for impersonation by userId
    if (action === 'getUserForImpersonation') {
      const users = await base44.asServiceRole.entities.User.filter({ id: userId });
      if (!users || users.length === 0) {
        return Response.json({ error: 'User not found' }, { status: 404 });
      }
      const targetUser = users[0];
      if (targetUser.role === 'admin') {
        return Response.json({ error: 'Cannot impersonate admin users' }, { status: 403 });
      }
      return Response.json({ 
        success: true,
        user: { 
          id: targetUser.id,
          email: targetUser.email,
          full_name: targetUser.full_name,
          role: targetUser.role,
          security_code: targetUser.security_code
        }
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});