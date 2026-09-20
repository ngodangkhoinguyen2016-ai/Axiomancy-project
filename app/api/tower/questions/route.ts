import { NextRequest, NextResponse } from "next/server";
import { GRADE_LEVELS, generateTowerMathQuestion, questionEpoch } from "../../../learning-engine";
import type { EducationLevel, LanguagePreference } from "../../../game-data";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const grade = Number(request.nextUrl.searchParams.get("grade"));
  const floor = Math.max(1, Number(request.nextUrl.searchParams.get("floor")) || 1);
  const seen = (request.nextUrl.searchParams.get("seen") ?? "").split(",").filter(Boolean).slice(-120);
  const language: LanguagePreference = request.nextUrl.searchParams.get("language") === "en" ? "en" : "vi";
  if (!GRADE_LEVELS.includes(grade as EducationLevel)) {
    return NextResponse.json({ error: "A valid Grade 1–12 is required." }, { status: 400 });
  }
  const epoch = questionEpoch();
  const questions = [];
  const ids = [...seen];
  for (let index = 0; index < 5; index += 1) {
    const question = generateTowerMathQuestion(grade as EducationLevel, floor, ids, epoch, index * 211, language);
    questions.push(question);
    ids.push(question.id);
  }
  return NextResponse.json({ questions, epoch, refreshAt: (epoch + 1) * 2 * 60 * 60 * 1000 }, { headers: { "cache-control": "no-store" } });
}
