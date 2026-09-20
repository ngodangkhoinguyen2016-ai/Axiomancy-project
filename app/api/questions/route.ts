import { NextRequest, NextResponse } from "next/server";
import { GRADE_LEVELS, generateOneQuestion, questionEpoch } from "../../learning-engine";
import { STUDY_SUBJECTS, type StudySubject } from "../../question-bank";
import type { EducationLevel, LanguagePreference } from "../../game-data";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const subject = request.nextUrl.searchParams.get("subject") as StudySubject | null;
  const grade = Number(request.nextUrl.searchParams.get("grade"));
  const seen = (request.nextUrl.searchParams.get("seen") ?? "").split(",").filter(Boolean).slice(-120);
  const language: LanguagePreference = request.nextUrl.searchParams.get("language") === "en" ? "en" : "vi";

  if (!subject || !STUDY_SUBJECTS.includes(subject) || !GRADE_LEVELS.includes(grade as EducationLevel)) {
    return NextResponse.json({ error: "A valid subject and Grade 1–12 are required." }, { status: 400 });
  }

  const epoch = questionEpoch();
  const question = generateOneQuestion(subject, grade as EducationLevel, seen, epoch, language);
  const refreshAt = (epoch + 1) * 2 * 60 * 60 * 1000;
  return NextResponse.json({ question, epoch, refreshAt }, { headers: { "cache-control": "no-store" } });
}
