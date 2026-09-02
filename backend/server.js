const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { Resend } = require('resend');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
const OTP_TTL_MINUTES = 10;
const OTP_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const OTP_RATE_LIMIT_MAX_REQUESTS = 3;
const OTP_VERIFY_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const OTP_VERIFY_LIMIT_MAX_ATTEMPTS = 5;
const otpRequestTracker = new Map();
const otpVerifyTracker = new Map();

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || null,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Resend.com initialization
const resend = new Resend(process.env.RESEND_API_KEY);

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

function hashOTP(otp) {
  return crypto.createHash('sha256').update(String(otp)).digest('hex');
}

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
}

async function resolveWorkspaceId() {
  const workspaceResult = await pool.query(
    'SELECT id FROM workspace WHERE company_name = $1 LIMIT 1',
    ['DRV Studios']
  );

  if (workspaceResult.rows[0]?.id) {
    return workspaceResult.rows[0].id;
  }

  if (process.env.DEFAULT_WORKSPACE_ID) {
    return process.env.DEFAULT_WORKSPACE_ID;
  }

  return null;
}

async function logUserActivity({ userId, action, description, req }) {
  if (!userId) return;

  try {
    await pool.query(
      'INSERT INTO user_activity_log (user_id, action, description, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)',
      [userId, action, description, getClientIp(req), req.headers['user-agent'] || null]
    );
  } catch (error) {
    console.error('Error writing activity log:', error);
  }
}

function getRateLimitWindow(key, tracker, maxRequests, ttlMs) {
  const now = Date.now();
  const items = tracker.get(key) || [];
  const validItems = items.filter((timestamp) => now - timestamp < ttlMs);

  if (validItems.length >= maxRequests) {
    return { blocked: true, validItems };
  }

  validItems.push(now);
  tracker.set(key, validItems);
  return { blocked: false, validItems };
}

function getVerifyAttemptState(email, tracker) {
  const key = normalizeEmail(email);
  const now = Date.now();
  const existing = tracker.get(key) || { count: 0, firstAttemptAt: now };

  if (now - existing.firstAttemptAt > OTP_VERIFY_LIMIT_WINDOW_MS) {
    tracker.set(key, { count: 0, firstAttemptAt: now });
    return { count: 0, firstAttemptAt: now, blocked: false };
  }

  const updatedCount = existing.count + 1;
  tracker.set(key, { count: updatedCount, firstAttemptAt: existing.firstAttemptAt });

  return {
    count: updatedCount,
    firstAttemptAt: existing.firstAttemptAt,
    blocked: updatedCount > OTP_VERIFY_LIMIT_MAX_ATTEMPTS,
  };
}

async function sendOTPEmail(email, otp) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'WedFlow CRM <onboarding@resend.dev>',
      to: [email],
      subject: 'Your WedFlow CRM Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #f5b719;">WedFlow CRM - Secure Access</h2>
          <p>Your verification code is:</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <p style="color: #666; font-size: 12px;">This is an automated message from WedFlow CRM</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

function generateToken(userId, email, role, workspaceId) {
  return jwt.sign(
    { userId, email, role, workspace_id: workspaceId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function extractBearerToken(req) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    return null;
  }

  return authHeader.slice(7).trim();
}

async function requireAuth(req, res, next) {
  const token = extractBearerToken(req);

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userResult = await pool.query(
      `SELECT id, email, first_name, last_name, phone_number, role, staff_name, profile_image, workspace_id, is_active, is_verified
       FROM users WHERE id = $1 LIMIT 1`,
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User is not authorized' });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: 'User account is inactive' });
    }

    if (decoded.workspace_id && user.workspace_id && decoded.workspace_id !== user.workspace_id) {
      return res.status(403).json({ error: 'Workspace mismatch detected' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      role: user.role,
      staff_name: user.staff_name,
      profile_image: user.profile_image,
      workspace_id: user.workspace_id,
      is_active: user.is_active,
      is_verified: user.is_verified,
    };

    return next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

async function requireWorkspaceAccess(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!req.user.workspace_id) {
    return res.status(403).json({ error: 'No workspace access assigned' });
  }

  const userResult = await pool.query(
    'SELECT id, workspace_id, role FROM users WHERE id = $1 LIMIT 1',
    [req.user.id]
  );

  if (userResult.rows.length === 0) {
    return res.status(401).json({ error: 'User not found' });
  }

  const user = userResult.rows[0];
  if (!user.workspace_id) {
    return res.status(403).json({ error: 'Workspace access missing on user record' });
  }

  if (req.user.workspace_id !== user.workspace_id) {
    return res.status(403).json({ error: 'You do not have access to this workspace' });
  }

  req.user.role = user.role;
  req.user.workspace_id = user.workspace_id;
  return next();
}

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  return next();
}

async function verifyTurnstileToken(token) {
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${encodeURIComponent(process.env.TURNSTILE_SECRET_KEY)}&response=${encodeURIComponent(token)}`,
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error verifying Turnstile token:', error);
    return false;
  }
}

async function createUserFromOtp({ email, firstName, lastName, phoneNumber }) {
  const normalizedEmail = normalizeEmail(email);
  const workspaceId = await resolveWorkspaceId();

  if (!workspaceId) {
    throw new Error('No workspace_id resolved for user creation');
  }

  const result = await pool.query(
    `INSERT INTO users (email, first_name, last_name, phone_number, role, is_active, is_verified, workspace_id)
     VALUES ($1, $2, $3, $4, 'client', true, true, $5)
     RETURNING id, email, first_name, last_name, phone_number, role, staff_name, profile_image, workspace_id`,
    [
      normalizedEmail,
      firstName?.trim() || null,
      lastName?.trim() || null,
      phoneNumber?.trim() || null,
      workspaceId,
    ]
  );

  return result.rows[0];
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'WedFlow CRM Backend is running' });
});

app.post('/api/auth/send-otp', async (req, res) => {
  const { email, turnstileToken } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (!turnstileToken) {
    return res.status(400).json({ error: 'Turnstile verification is required' });
  }

  const requestWindow = getRateLimitWindow(normalizedEmail, otpRequestTracker, OTP_RATE_LIMIT_MAX_REQUESTS, OTP_RATE_LIMIT_WINDOW_MS);
  if (requestWindow.blocked) {
    return res.status(429).json({ error: 'Too many OTP requests. Please wait a moment and try again.' });
  }

  const isValidTurnstile = await verifyTurnstileToken(turnstileToken);
  if (!isValidTurnstile) {
    return res.status(400).json({ error: 'Human verification failed' });
  }

  try {
    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await pool.query('DELETE FROM otp_codes WHERE email = $1 AND is_used = false', [normalizedEmail]);
    await pool.query(
      'INSERT INTO otp_codes (email, otp_code, expires_at, is_used) VALUES ($1, $2, $3, false)',
      [normalizedEmail, otpHash, expiresAt]
    );

    await sendOTPEmail(normalizedEmail, otp);

    return res.json({
      success: true,
      message: 'OTP sent successfully',
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, otp, firstName, lastName, phoneNumber } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  if (String(otp).length !== 6 || !/^\d+$/.test(String(otp))) {
    return res.status(400).json({ error: 'Invalid OTP format' });
  }

  const attemptState = getVerifyAttemptState(normalizedEmail, otpVerifyTracker);
  if (attemptState.blocked) {
    return res.status(429).json({ error: 'Too many failed verification attempts. Please wait and request a new OTP.' });
  }

  try {
    const userResult = await pool.query(
      'SELECT id, email, first_name, last_name, phone_number, role, staff_name, profile_image, workspace_id FROM users WHERE email = $1 LIMIT 1',
      [normalizedEmail]
    );

    const otpResult = await pool.query(
      'SELECT id, email, otp_code, expires_at, is_used FROM otp_codes WHERE email = $1 ORDER BY created_at DESC LIMIT 1',
      [normalizedEmail]
    );

    const otpRecord = otpResult.rows[0];
    const isExpired = !otpRecord || new Date(otpRecord.expires_at).getTime() < Date.now();
    const isValidOtp = otpRecord && !otpRecord.is_used && !isExpired && otpRecord.otp_code === hashOTP(otp);

    if (!isValidOtp) {
      const userId = userResult.rows[0]?.id || null;
      if (userId) {
        await logUserActivity({
          userId,
          action: 'failed_otp_verification',
          description: 'OTP verification failed or expired',
          req,
        });
      }

      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    let user = userResult.rows[0];
    const isNewUser = !user;

    if (isNewUser) {
      user = await createUserFromOtp({ email: normalizedEmail, firstName, lastName, phoneNumber });
    }

    if (!user.workspace_id) {
      user.workspace_id = await resolveWorkspaceId();
      if (!user.workspace_id) {
        return res.status(500).json({ error: 'Workspace assignment is not available for this account' });
      }
      await pool.query('UPDATE users SET workspace_id = $1 WHERE id = $2', [user.workspace_id, user.id]);
    }

    await pool.query('UPDATE otp_codes SET is_used = true WHERE id = $1', [otpRecord.id]);

    const token = generateToken(user.id, user.email, user.role, user.workspace_id);

    await logUserActivity({
      userId: user.id,
      action: 'login',
      description: isNewUser ? 'New user signed in via OTP' : 'User signed in via OTP',
      req,
    });

    return res.json({
      success: true,
      message: isNewUser ? 'Account created successfully' : 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phoneNumber: user.phone_number,
        role: user.role,
        staffName: user.staff_name,
        profileImage: user.profile_image,
        workspace_id: user.workspace_id,
        isNewUser,
      },
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

app.use('/api', requireAuth);
app.use('/api', requireWorkspaceAccess);

app.post('/api/users', requireAdmin, async (req, res) => {
  const { email: rawEmail, firstName, lastName, phoneNumber, role, staffName, address } = req.body;

  if (!rawEmail || !firstName) {
    return res.status(400).json({ error: 'Email and first name are required' });
  }

  const email = normalizeEmail(rawEmail);
  const userRole = role || 'client';

  try {
    const result = await pool.query(
      `INSERT INTO users (email, first_name, last_name, phone_number, role, staff_name, is_active, is_verified, workspace_id)
       VALUES ($1, $2, $3, $4, $5, $6, true, false, $7)
       RETURNING id, email, first_name, last_name, phone_number, role, staff_name, is_active, is_verified, created_at, workspace_id`,
      [email, firstName.trim(), lastName?.trim() || null, phoneNumber?.trim() || null, userRole, staffName?.trim() || null, req.user.workspace_id]
    );

    await logUserActivity({
      userId: req.user.id,
      action: 'user_created',
      description: `Created user ${email} with role ${userRole}`,
      req,
    });

    return res.status(201).json({ success: true, user: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      // Check if it's email+role duplicate (which is expected and allowed for different roles)
      if (error.constraint === 'users_email_role_unique') {
        return res.status(409).json({ error: 'A user with this email and role already exists' });
      }
      // Fallback for other unique constraint violations
      return res.status(409).json({ error: 'A user with this email already exists' });
    }
    console.error('Error creating user:', error);
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

// GET /api/users - List all users in workspace
app.get('/api/users', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, phone_number, role, staff_name, is_active, is_verified, profile_image, created_at, updated_at
       FROM users
       WHERE workspace_id = $1
       ORDER BY role, created_at DESC`,
      [req.user.workspace_id]
    );

    return res.json({
      success: true,
      users: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PUT /api/users/:id - Update user
app.put('/api/users/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, phoneNumber, role, staffName, is_active } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users
       SET first_name = $1, last_name = $2, phone_number = $3, role = $4, staff_name = $5, is_active = $6, updated_at = NOW()
       WHERE id = $7 AND workspace_id = $8
       RETURNING id, email, first_name, last_name, phone_number, role, staff_name, is_active, is_verified, created_at, updated_at`,
      [
        firstName?.trim() || null,
        lastName?.trim() || null,
        phoneNumber?.trim() || null,
        role || 'client',
        staffName?.trim() || null,
        is_active !== undefined ? is_active : true,
        id,
        req.user.workspace_id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    await logUserActivity({
      userId: req.user.id,
      action: 'user_updated',
      description: `Updated user ${id}`,
      req,
    });

    return res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/users/:id - Delete user
app.delete('/api/users/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM users
       WHERE id = $1 AND workspace_id = $2
       RETURNING email, first_name, last_name`,
      [id, req.user.workspace_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const deletedUser = result.rows[0];
    await logUserActivity({
      userId: req.user.id,
      action: 'user_deleted',
      description: `Deleted user ${deletedUser.email}`,
      req,
    });

    return res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.get('/api/user/profile', async (req, res) => {
  const userResult = await pool.query(
    `SELECT id, email, first_name, last_name, phone_number, role, staff_name, profile_image, workspace_id
     FROM users WHERE id = $1 LIMIT 1`,
    [req.user.id]
  );

  if (userResult.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }

  const user = userResult.rows[0];
  return res.json({
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      role: user.role,
      staff_name: user.staff_name,
      profile_image: user.profile_image,
      workspace_id: user.workspace_id,
    },
  });
});

// ============================================
// CLIENT CRUD API - Workspace Isolated
// ============================================

// GET /api/clients - List all clients in user's workspace
app.get('/api/clients', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, phone, email, address, status, created_at, updated_at
       FROM client
       WHERE workspace_id = $1
       ORDER BY created_at DESC`,
      [req.user.workspace_id]
    );

    return res.json({
      success: true,
      clients: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// POST /api/clients - Create new client in user's workspace
app.post('/api/clients', async (req, res) => {
  const { name, phone, email, address, status } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  // Check for duplicate phone number in workspace
  if (phone && phone.trim()) {
    const existingPhone = await pool.query(
      'SELECT id FROM client WHERE phone = $1 AND workspace_id = $2 LIMIT 1',
      [phone.trim(), req.user.workspace_id]
    );
    if (existingPhone.rows.length > 0) {
      return res.status(409).json({ error: 'A client with this phone number already exists' });
    }
  }

  // Check for duplicate email in workspace
  if (email && email.trim()) {
    const existingEmail = await pool.query(
      'SELECT id FROM client WHERE email = $1 AND workspace_id = $2 LIMIT 1',
      [email.trim(), req.user.workspace_id]
    );
    if (existingEmail.rows.length > 0) {
      return res.status(409).json({ error: 'A client with this email already exists' });
    }
  }

  try {
    const result = await pool.query(
      `INSERT INTO client (name, phone, email, address, status, workspace_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, phone, email, address, status, created_at, updated_at`,
      [
        name.trim(),
        phone?.trim() || null,
        email?.trim() || null,
        address?.trim() || null,
        status || 'active',
        req.user.workspace_id
      ]
    );

    await logUserActivity({
      userId: req.user.id,
      action: 'client_created',
      description: `Created client: ${name}`,
      req,
    });

    return res.status(201).json({
      success: true,
      client: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'A client with this email or phone number already exists' });
    }
    console.error('Error creating client:', error);
    return res.status(500).json({ error: 'Failed to create client' });
  }
});

// GET /api/clients/:id - Get specific client in user's workspace
app.get('/api/clients/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, name, phone, email, address, status, created_at, updated_at
       FROM client
       WHERE id = $1 AND workspace_id = $2`,
      [id, req.user.workspace_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    return res.json({
      success: true,
      client: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    return res.status(500).json({ error: 'Failed to fetch client' });
  }
});

// PUT /api/clients/:id - Update client in user's workspace
app.put('/api/clients/:id', async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, address, status } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  // Check for duplicate phone number in workspace (excluding current client)
  if (phone && phone.trim()) {
    const existingPhone = await pool.query(
      'SELECT id FROM client WHERE phone = $1 AND workspace_id = $2 AND id != $3 LIMIT 1',
      [phone.trim(), req.user.workspace_id, id]
    );
    if (existingPhone.rows.length > 0) {
      return res.status(409).json({ error: 'A client with this phone number already exists' });
    }
  }

  // Check for duplicate email in workspace (excluding current client)
  if (email && email.trim()) {
    const existingEmail = await pool.query(
      'SELECT id FROM client WHERE email = $1 AND workspace_id = $2 AND id != $3 LIMIT 1',
      [email.trim(), req.user.workspace_id, id]
    );
    if (existingEmail.rows.length > 0) {
      return res.status(409).json({ error: 'A client with this email already exists' });
    }
  }

  try {
    const result = await pool.query(
      `UPDATE client
       SET name = $1, phone = $2, email = $3, address = $4, status = $5, updated_at = NOW()
       WHERE id = $6 AND workspace_id = $7
       RETURNING id, name, phone, email, address, status, created_at, updated_at`,
      [
        name.trim(),
        phone?.trim() || null,
        email?.trim() || null,
        address?.trim() || null,
        status || 'active',
        id,
        req.user.workspace_id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await logUserActivity({
      userId: req.user.id,
      action: 'client_updated',
      description: `Updated client: ${name}`,
      req,
    });

    return res.json({
      success: true,
      client: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'A client with this email or phone number already exists' });
    }
    console.error('Error updating client:', error);
    return res.status(500).json({ error: 'Failed to update client' });
  }
});

// DELETE /api/clients/:id - Delete client in user's workspace
app.delete('/api/clients/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM client
       WHERE id = $1 AND workspace_id = $2
       RETURNING name`,
      [id, req.user.workspace_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await logUserActivity({
      userId: req.user.id,
      action: 'client_deleted',
      description: `Deleted client: ${result.rows[0].name}`,
      req,
    });

    return res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    return res.status(500).json({ error: 'Failed to delete client' });
  }
});

// GET /api/packages - List packages in the authenticated user's workspace
app.get('/api/packages', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, duration_days, status, price, description,
              reminder_day, reminder_email_days, created_at, updated_at
       FROM packages
       WHERE workspace_id = $1
       ORDER BY created_at DESC`,
      [req.user.workspace_id]
    );
    return res.json({ success: true, packages: result.rows, count: result.rows.length });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

// POST /api/packages - Create a package for the authenticated user's workspace
app.post('/api/packages', requireAdmin, async (req, res) => {
  const { name, durationDays, price, description, status, reminderDay, reminderEmailDays } = req.body;

  if (!name || !durationDays || price === undefined) {
    return res.status(400).json({ error: 'Name, duration days, and price are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO packages (workspace_id, name, duration_days, status, price, description, reminder_day, reminder_email_days)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, duration_days, status, price, description, reminder_day, reminder_email_days, created_at, updated_at`,
      [req.user.workspace_id, name.trim(), Number(durationDays), status || 'active', Number(price),
        description?.trim() || null, reminderDay || null, reminderEmailDays || 7]
    );
    return res.status(201).json({ success: true, package: result.rows[0] });
  } catch (error) {
    console.error('Error creating package:', error);
    if (error.code === '23505') return res.status(409).json({ error: 'A package with this name already exists' });
    return res.status(500).json({ error: 'Failed to create package' });
  }
});

// GET /api/bookings - List bookings with workspace-scoped client and package names
app.get('/api/bookings', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.id, b.booking_number, b.booking_date, b.total_amount, b.status,
              b.current_workflow_stage, b.notes, b.created_at, b.updated_at,
              c.id AS client_id, c.name AS client_name,
              p.id AS package_id, p.name AS package_name,
              be.event_date, be.venue
       FROM bookings b
       JOIN client c ON c.id = b.client_id AND c.workspace_id = b.workspace_id
       JOIN packages p ON p.id = b.package_id AND p.workspace_id = b.workspace_id
       LEFT JOIN LATERAL (
         SELECT event_date, venue FROM booking_events
         WHERE booking_id = b.id ORDER BY event_date ASC LIMIT 1
       ) be ON true
       WHERE b.workspace_id = $1
       ORDER BY b.booking_date DESC, b.created_at DESC`,
      [req.user.workspace_id]
    );
    return res.json({ success: true, bookings: result.rows, count: result.rows.length });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// POST /api/bookings - Create a booking linked to an existing client and package
app.post('/api/bookings', requireAdmin, async (req, res) => {
  const { clientId, packageId, bookingDate, eventDate, totalAmount, venue, eventType, status, currentWorkflowStage, notes } = req.body;

  if (!clientId || !packageId || !bookingDate || !eventDate || !venue || totalAmount === undefined) {
    return res.status(400).json({ error: 'Client, package, booking date, event date, venue, and amount are required' });
  }

  try {
    const ownership = await pool.query(
      `SELECT c.id AS client_id, p.id AS package_id
       FROM client c CROSS JOIN packages p
       WHERE c.id = $1 AND p.id = $2 AND c.workspace_id = $3 AND p.workspace_id = $3`,
      [clientId, packageId, req.user.workspace_id]
    );
    if (ownership.rows.length === 0) {
      return res.status(400).json({ error: 'Client or package is not available in this workspace' });
    }

    const numberResult = await pool.query(
      `SELECT 'DRVSTU-BKG-' || LPAD((COUNT(*) + 1)::text, 6, '0') AS booking_number
       FROM bookings WHERE workspace_id = $1`,
      [req.user.workspace_id]
    );
    const result = await pool.query(
      `INSERT INTO bookings (workspace_id, client_id, package_id, booking_number, booking_date,
                             total_amount, status, current_workflow_stage, notes)
       VALUES ($1, $2, $3, $4, $5::date, $6, $7, $8, $9)
       RETURNING id`,
      [req.user.workspace_id, clientId, packageId, numberResult.rows[0].booking_number, bookingDate,
        Number(totalAmount), status || 'draft', currentWorkflowStage || 'booking', notes || null]
    );

    let eventTypeId = (await pool.query(
      `SELECT id FROM event_type WHERE workspace_id = $1 AND is_active = true
       AND LOWER(name) = LOWER($2) LIMIT 1`,
      [req.user.workspace_id, eventType || 'Other']
    )).rows[0]?.id;
    if (!eventTypeId) {
      eventTypeId = (await pool.query(
        `INSERT INTO event_type (workspace_id, name) VALUES ($1, $2)
         ON CONFLICT (workspace_id, name) DO UPDATE SET is_active = true RETURNING id`,
        [req.user.workspace_id, eventType || 'Other']
      )).rows[0]?.id;
    }

    await pool.query(
      `INSERT INTO booking_events (workspace_id, booking_id, event_type_id, event_name, event_date, venue, notes)
       VALUES ($1, $2, $3, $4, $5::date, $6, $7)`,
      [req.user.workspace_id, result.rows[0].id, eventTypeId, eventType || 'Other', eventDate, venue.trim(), notes || null]
    );

    const booking = await pool.query(
      `SELECT b.*, c.name AS client_name, p.name AS package_name, be.event_date, be.venue
       FROM bookings b JOIN client c ON c.id = b.client_id JOIN packages p ON p.id = b.package_id
       LEFT JOIN LATERAL (SELECT event_date, venue FROM booking_events WHERE booking_id = b.id LIMIT 1) be ON true
       WHERE b.id = $1`,
      [result.rows[0].id]
    );
    return res.status(201).json({ success: true, booking: booking.rows[0] });
  } catch (error) {
    console.error('Error creating booking:', error);
    if (error.code === '23505') return res.status(409).json({ error: 'Booking number already exists' });
    return res.status(500).json({ error: 'Failed to create booking' });
  }
});

// GET /api/bookings/:id - Get one workspace-scoped booking
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const result = await pool.query(
            `SELECT b.*, c.name AS client_name, p.name AS package_name,
              be.event_date, be.venue,
              COALESCE((SELECT SUM(amount) FROM payments
            WHERE booking_id = b.id AND workspace_id = b.workspace_id AND status = 'completed'), 0) AS amount_paid,
              COALESCE((SELECT json_agg(json_build_object(
            'event_name', e.event_name, 'event_date', e.event_date, 'venue', e.venue)
            ORDER BY e.event_date)
            FROM booking_events e WHERE e.booking_id = b.id AND e.workspace_id = b.workspace_id), '[]') AS event_days,
              COALESCE((SELECT json_agg(json_build_object(
            'installment_name', ps.installment_name, 'percentage', ps.percentage, 'timing', ps.timing)
            ORDER BY ps.payment_order)
            FROM payment_schedules ps WHERE ps.package_id = p.id AND ps.workspace_id = p.workspace_id), '[]') AS payment_schedule,
              COALESCE((SELECT json_agg(json_build_object(
            'day_number', pd.day_number, 'event_type', pd.event_type,
            'roles', COALESCE((SELECT json_agg(json_build_object('role', ct.name, 'quantity', pdc.quantity))
                  FROM package_day_crew pdc JOIN crew_types ct ON ct.id = pdc.crew_type_id
                  WHERE pdc.package_day_id = pd.id), '[]'))
            ORDER BY pd.day_number)
            FROM package_days pd WHERE pd.package_id = p.id AND pd.workspace_id = p.workspace_id), '[]') AS package_crew_plan,
              COALESCE((SELECT json_agg(json_build_object(
            'staff_name', s.name, 'assigned_role', ca.assigned_role,
            'event_name', ev.event_name, 'event_date', ev.event_date,
            'venue', ev.venue, 'status', ca.status)
            ORDER BY ev.event_date, s.name)
            FROM crew_assignments ca
            JOIN staff s ON s.id = ca.staff_id
            JOIN booking_events ev ON ev.id = ca.booking_event_id
            WHERE ev.booking_id = b.id AND ev.workspace_id = b.workspace_id), '[]') AS crew_assignments
       FROM bookings b
       JOIN client c ON c.id = b.client_id AND c.workspace_id = b.workspace_id
       JOIN packages p ON p.id = b.package_id AND p.workspace_id = b.workspace_id
       LEFT JOIN LATERAL (
         SELECT event_date, venue FROM booking_events
         WHERE booking_id = b.id ORDER BY event_date ASC LIMIT 1
       ) be ON true
       WHERE b.id = $1 AND b.workspace_id = $2`,
      [req.params.id, req.user.workspace_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    return res.json({ success: true, booking: result.rows[0] });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

app.listen(port, () => {
  console.log(`WedFlow CRM Backend running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});
