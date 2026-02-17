"use client";

import { QuestionPaperFull } from "./api";

export type CreateCustomPaperDto = {
  title: string;
  subject: string;
  questionCount: number;
  duration: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
};

export type CustomPaper = {
  _id: string;
  userId: string;
  title: string;
  subject: string;
  questionCount: number;
  duration: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  generatedPaper: QuestionPaperFull;
  createdAt: string;
  updatedAt: string;
};

export type CustomPaperListItem = Omit<CustomPaper, "generatedPaper">;

const STORAGE_KEY = "qp_custom_papers";

function readStore(): Record<string, CustomPaper> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStore(papers: Record<string, CustomPaper>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(papers));
}

export async function saveCustomPaper(paper: CustomPaper) {
  const papers = readStore();
  papers[paper._id] = paper;
  writeStore(papers);
}

export async function getCustomPapers(): Promise<Record<string, CustomPaper>> {
  return readStore();
}

export async function getCustomPaperList(): Promise<CustomPaperListItem[]> {
  const papers = readStore();
  return Object.values(papers)
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .map(({ generatedPaper, ...rest }) => rest);
}

export async function getCustomPaperById(
  id: string
): Promise<CustomPaper | null> {
  const papers = readStore();
  return papers[id] ?? null;
}

export async function deleteCustomPaper(id: string) {
  const papers = readStore();
  if (papers[id]) {
    delete papers[id];
    writeStore(papers);
  }
}

export async function getPapersCreatedToday(): Promise<number> {
  const papers = readStore();
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  return Object.values(papers).filter(paper => {
    const createdAt = new Date(paper.createdAt).getTime();
    return createdAt >= startOfToday;
  }).length;
}
