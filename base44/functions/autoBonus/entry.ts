import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Called when a new user registers — auto-adds $500 welcome bonus
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return Response.json({ error: 'userId required' }, { status: 400 });
    }

    // Check if wallet already exists for user
    const existing = await base44.asServiceRole.entities.Wallet.filter({ user_id: userId });
    
    if (existing && existing.length > 0) {
      // Wallet already exists — skip
      return Response.json({ success: true, message: 'Wallet already exists', alreadyExists: true });
    }

    // Create wallet with $100 bonus
    const wallet = await base44.asServiceRole.entities.Wallet.create({
      user_id: userId,
      balance: 100,
      total_invested: 0,
      total_earnings: 0,
      total_withdrawn: 0
    });

    // Log bonus transaction
    await base44.asServiceRole.entities.Transaction.create({
      user_id: userId,
      type: 'bonus',
      amount: 100,
      currency: 'USD',
      status: 'completed',
      description: 'Welcome bonus — $100 credited to your account'
    });

    // Auto-generate security code for user
    const users = await base44.asServiceRole.entities.User.filter({ id: userId });
    const user = users[0];
    if (user && !user.security_code) {
      const code = Math.random().toString(36).substring(2, 6).toUpperCase() +
                   Math.random().toString(36).substring(2, 6).toUpperCase();
      await base44.asServiceRole.entities.User.update(userId, { security_code: code });
    }

    return Response.json({ success: true, wallet, bonusAmount: 100 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});