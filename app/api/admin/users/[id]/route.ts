import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    if (session.user?.email) {
      const me = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (me?.id === id) {
        return NextResponse.json(
          { error: 'You cannot delete your own account' },
          { status: 400 }
        );
      }
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}


// PATCH - Update user
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const body = await request.json();
    const { name, email, role, password } = body;

    const roleMapToDb: Record<string, string> = {
      admin: 'ADMIN',
      editor: 'TEACHER',
      student: 'STUDENT',
    };

    const updateData: any = {};

    if (name !== undefined) updateData.name = name || null;
    if (email !== undefined) updateData.email = email;

    if (role !== undefined) {
      const normalizedRole = String(role).toLowerCase();
      if (roleMapToDb[normalizedRole]) {
        updateData.role = roleMapToDb[normalizedRole];
      }
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });

    const roleMapFromDb: Record<string, string> = {
      ADMIN: 'admin',
      TEACHER: 'editor',
      STUDENT: 'student',
    };

    return NextResponse.json({
      user: {
        ...updated,
        role: roleMapFromDb[updated.role] ?? updated.role.toLowerCase(),
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

