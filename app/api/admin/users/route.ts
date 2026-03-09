import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET - Fetch all users
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usersRaw = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Map DB enum roles to frontend-friendly strings
    const roleMapFromDb: Record<string, string> = {
      ADMIN: 'admin',
      TEACHER: 'editor',
      STUDENT: 'student',
    }

    const users = usersRaw.map((u) => ({
      ...u,
      role: (roleMapFromDb[u.role as string] || String(u.role).toLowerCase()),
    }))

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, password, name, role } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Normalize role from frontend to DB enum
    const roleMapToDb: Record<string, string> = {
      admin: 'ADMIN',
      editor: 'TEACHER',
      student: 'STUDENT',
    }

    const normalizedRoleKey = role ? String(role).toLowerCase() : undefined
    const dbRole = normalizedRoleKey && roleMapToDb[normalizedRoleKey] ? roleMapToDb[normalizedRoleKey] : undefined

    // Build create data
    const createData: any = {
      email,
      password: passwordHash,
      name: name || null,
    }

    if (dbRole) createData.role = dbRole

    // Create user
    const newUser = await prisma.user.create({
      data: createData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }
    });

    // Map role back for response
    const roleMapFromDb: Record<string, string> = {
      ADMIN: 'admin',
      TEACHER: 'editor',
      STUDENT: 'student',
    }

    const userForResponse = {
      ...newUser,
      role: roleMapFromDb[newUser.role as string] || String(newUser.role).toLowerCase(),
    }

    return NextResponse.json({ user: userForResponse }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}