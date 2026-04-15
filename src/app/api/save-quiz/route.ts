import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { title, content, questions } = await req.json();

    const quiz = await prisma.quiz.create({
      data: {
        title,
        content,
        questions: {
          create: questions.map((q: any) => ({
            question: q.question,
            options: q.options,
            answer: q.answer,
          })),
        },
      },
    });

    return NextResponse.json({ success: true, quiz });
  } catch (e) {
    console.error("DB error:", e);
    return NextResponse.json(
      { success: false, error: String(e) },
      { status: 500 },
    );
  }
}
