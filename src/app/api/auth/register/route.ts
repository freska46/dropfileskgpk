import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { DEFAULT_STORAGE_LIMIT } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, emailVerified } = body;

    // Валидация
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email и пароль обязательны" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Пароль минимум 8 символов" },
        { status: 400 }
      );
    }

    // Пароль должен содержать буквы И цифры
    if (!/[a-zA-Zа-яА-ЯёЁ]/.test(password)) {
      return NextResponse.json(
        { error: "Пароль должен содержать хотя бы одну букву" },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: "Пароль должен содержать хотя бы одну цифру" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Некорректный email" },
        { status: 400 }
      );
    }

    // Проверка что email подтверждён
    if (!emailVerified) {
      return NextResponse.json(
        { error: "Подтвердите email кодом" },
        { status: 403 }
      );
    }

    // Проверка существующего пользователя
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 409 }
      );
    }

    // Хеширование пароля
    const passwordHash = await bcrypt.hash(password, 12);

    // Проверка на админа
    const isAdmin = email === process.env.ADMIN_EMAIL;

    // Создание пользователя
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || email.split("@")[0],
        role: isAdmin ? "ADMIN" : "USER",
        storageLimit: DEFAULT_STORAGE_LIMIT,
        emailVerified: true,
        settings: {
          create: {
            theme: "DARK",
            emailNotifs: true,
            language: "ru",
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
