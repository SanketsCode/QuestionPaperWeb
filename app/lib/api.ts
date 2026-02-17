import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(config => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("qp_access_token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export type ContentType = "TEXT" | "IMAGE" | "MIXED";

export type ContentData = {
  type: ContentType;
  text?: string;
  image_url?: string;
};

export type MultiLangContent = Record<string, ContentData>;

export type QuestionOptionData = {
  id: number;
  content: MultiLangContent;
};

export type QuestionData = {
  _id?: string;
  que_content: MultiLangContent;
  options: QuestionOptionData[];
  ans: number;
  exp_content?: MultiLangContent;
  has_image?: boolean;
};

export type SectionData = {
  title: string;
  instructions?: string;
  questions: QuestionData[];
  marks_per_question: number;
  negative_marks: number;
};

export type ExamCategory = {
  _id: string;
  category_name: string;
  description?: string;
};

export type ExamSubCategory = {
  _id: string;
  name: string;
  categoryId: string;
  is_active: boolean;
  description?: string;
  priority?: number;
};

export type Subject = {
  _id: string;
  name: string;
  description?: string;
};

export type QuestionPaper = {
  _id: string;
  title: string;
  exam_name?: string;
  duration?: number;
  exam_due_min?: number;
  total_marks?: number;
  total_questions?: number;
  total_que_count?: number;
};

export type QuestionPaperFull = {
  _id: string;
  exam_name: string;
  exam_category: string;
  total_que_count: number;
  exam_due_min: number;
  total_marks: number;
  passing_marks: number;
  has_negative_marking: boolean;
  instructions?: string;
  supported_languages: string[];
  sections: SectionData[];
  is_published: boolean;
  is_active: boolean;
  is_real_exam: boolean;
  exam_sub: string[];
  exam_date?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Reward = {
  type: "PREMIUM_MEMBERSHIP" | "POINTS" | "CASH";
  value: string;
  durationInDays?: number;
  eligibilityCount?: number;
};

export type Competition = {
  _id: string;
  title?: string;
  name?: string;
  subtitle?: string;
  description?: string;
  instructions?: string;
  totalQuestions?: number;
  totalMarks?: number;
  passingMarks?: number;
  durationInMinutes?: number;
  languagesAvailable?: string[];
  reward?: Reward;
  status?: "upcoming" | "live" | "completed" | "cancelled";
  startDateTime?: string;
  endDateTime?: string;
};

export type CompetitionSession = {
  serverNow: string;
  endDateTime: string;
  timeLeftSeconds: number;
  submissionId: string;
  startedAt: string;
  competition: {
    _id: string;
    title: string;
    totalQuestions: number;
    totalMarks: number;
    durationInMinutes: number;
    languagesAvailable: string[];
  };
  questions: any[];
};

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  name: string;
  profilePic?: string;
  score: number;
  duration: number;
  correctCount?: number;
  wrongCount?: number;
};

export type User = {
  _id: string;
  contact: string;
  name?: string;
  email?: string;
  profile_pic?: string;
  language?: string;
  accessToken?: string;
};

export type ExamResult = {
  totalQuestions: number;
  answered: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  score: number;
  totalMarks: number;
  percentage: number;
  accuracy: number;
  timeTaken: number;
};

export type PaperType = "REAL_EXAM" | "LATEST_PAPER" | "CUSTOM_PAPER";

export type PaperMeta = {
  title: string;
  category?: string;
  examDate?: string;
  durationInMinutes?: number;
  subject?: string;
};

export type PaperSubmissionItem = {
  _id: string;
  paperId: string;
  paperType: PaperType;
  score: number;
  totalMarks: number;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  timeTaken: number;
  createdAt: string;
  paper?: PaperMeta | null;
};

export type CompetitionMeta = {
  _id: string;
  title: string;
  subtitle?: string;
  startDateTime: string;
  endDateTime: string;
  totalQuestions: number;
  totalMarks: number;
  durationInMinutes: number;
  status?: string;
};

export type CompetitionSubmissionItem = {
  _id: string;
  competitionId: string;
  userId: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  timeTaken?: number;
  startedAt: string;
  submittedAt?: string;
  status: "started" | "submitted" | "abandoned";
  competition?: CompetitionMeta | null;
};
export async function getExamCategories(): Promise<ExamCategory[]> {
  const response = await apiClient.get<ExamCategory[]>("/exams/category");
  return response.data ?? [];
}

export async function getExamSubCategories(
  categoryId: string
): Promise<ExamSubCategory[]> {
  const response = await apiClient.get<ExamSubCategory[]>(
    "/exams/subcategory",
    {
      params: { categoryId },
    }
  );
  return response.data ?? [];
}

export async function getSubjects(): Promise<Subject[]> {
  const response = await apiClient.get<Subject[]>("/subjects/public");
  return response.data ?? [];
}

export async function getQuestionPapers(): Promise<QuestionPaper[]> {
  const response = await apiClient.get<any>("/question-papers", {
    params: { page: 1, limit: 6 },
  });
  const data = response.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export async function getQuestionPapersPaged(params: {
  categoryId?: string;
  subcategoryId?: string;
  is_real_exam?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<QuestionPaper[]> {
  const response = await apiClient.get<any>("/question-papers", { params });
  const data = response.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export async function getRealExamsByCategory(
  category: string,
  page = 1,
  limit = 10
): Promise<QuestionPaper[]> {
  const response = await apiClient.get<any>(
    `/question-papers/real-exams/base-details/${category}`,
    { params: { page, limit } }
  );
  return response.data?.data ?? [];
}

export async function searchRealExams(
  category: string,
  query: string,
  page = 1,
  limit = 10
): Promise<QuestionPaper[]> {
  const response = await apiClient.get<any>("/question-papers/real-exams-search", {
    params: { category, query, page, limit },
  });
  return response.data?.data ?? [];
}

export async function getPaperFullDetails(
  id: string
): Promise<QuestionPaperFull> {
  const response = await apiClient.get<QuestionPaperFull>(
    `/question-papers/full/${id}`
  );
  return response.data;
}

export async function getCompetitions(): Promise<Competition[]> {
  const response = await apiClient.get<any>("/competitions");
  const data = response.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.competitions)) return data.competitions;
  return [];
}

export async function getCompetitionById(id: string): Promise<Competition> {
  const response = await apiClient.get<Competition>(`/competitions/${id}`);
  return response.data;
}

export async function startCompetitionExam(
  id: string
): Promise<CompetitionSession> {
  const response = await apiClient.post<CompetitionSession>(
    `/competitions/${id}/start`
  );
  return response.data;
}

export async function submitCompetitionExam(
  id: string,
  data: { answers: { questionId: string; selectedOptionId: number }[] }
): Promise<any> {
  const response = await apiClient.post(`/competitions/${id}/submit`, data);
  return response.data;
}

export async function getCompetitionLeaderboard(
  id: string,
  page = 1,
  limit = 10
): Promise<LeaderboardEntry[]> {
  const response = await apiClient.get<LeaderboardEntry[]>(
    `/competitions/${id}/leaderboard`,
    { params: { page, limit } }
  );
  return response.data;
}

export async function sendOtp(mobile_no: string) {
  const response = await apiClient.post("/auth/send-otp", { mobile_no });
  return response.data;
}

export async function verifyOtp(
  mobile_no: string,
  otp: string
): Promise<{ user: User; accessToken: string }> {
  const response = await apiClient.post("/auth/verify-otp", {
    mobile_no,
    otp,
  });
  return response.data;
}

export async function submitPerformanceResult(payload: {
  paperId: string;
  paperType: "REAL_EXAM" | "LATEST_PAPER" | "CUSTOM_PAPER";
  score: number;
  totalMarks: number;
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  timeTaken: number;
  subjectStats: { subject: string; correct: number; total: number }[];
}) {
  const response = await apiClient.post("/performance-analytics/submit", payload);
  return response.data;
}

export async function getMyPaperSubmissions(): Promise<PaperSubmissionItem[]> {
  const response = await apiClient.get<any>("/performance-analytics/submissions");
  const list = Array.isArray(response.data)
    ? response.data
    : response.data?.submissions;
  return Array.isArray(list) ? (list as PaperSubmissionItem[]) : [];
}

export async function getMyCompetitionSubmissions(): Promise<
  CompetitionSubmissionItem[]
> {
  const response = await apiClient.get<any>("/competitions/my-submissions");
  const list = Array.isArray(response.data)
    ? response.data
    : response.data?.submissions;
  return Array.isArray(list) ? (list as CompetitionSubmissionItem[]) : [];
}

export type AcademyState = {
  enrolled: boolean;
  academy?: any;
  reason?: string;
};

export async function getMyAcademy(): Promise<AcademyState> {
  const res = await apiClient.get("/user/my-academy");
  return res.data;
}

export async function getMyAcademyNotifications() {
  const res = await apiClient.get("/user/my-academy/notifications");
  return res.data;
}

export async function getMyAcademyUpcomingTests() {
  const res = await apiClient.get("/user/my-academy/upcoming-tests");
  return res.data;
}

export async function getMyAcademyQuestionPapers(
  page = 1,
  limit = 20,
  search?: string
) {
  const res = await apiClient.get("/user/my-academy/question-papers", {
    params: { page, limit, search },
  });
  return res.data;
}

export async function getMyAcademyQuestionPaperById(paperId: string) {
  const res = await apiClient.get(`/user/my-academy/question-papers/${paperId}`);
  return res.data;
}

export async function getActiveAcademies() {
  const res = await apiClient.get("/academies");
  return res.data;
}

export type NotificationItem = {
  _id: string;
  title: string;
  subtitle?: string;
  message?: string;
  date?: string;
  createdAt?: string;
  thumbnail?: string;
};

export async function getNotifications(page = 1, limit = 10) {
  const response = await apiClient.get("/notifications", {
    params: { page, limit },
  });
  return response.data;
}

export async function getNotificationDetail(id: string) {
  const response = await apiClient.get(`/notifications/${id}`);
  return response.data;
}

export type SubscriptionPlan = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  durationInDays: number;
  scope: "GLOBAL" | "CATEGORY";
  categoryId?: string;
  features?: {
    customPaperPerDay?: number | null;
    examsPerDay?: number | null;
    maxCustomPapersStorage?: number | null;
    noAds?: boolean;
    multiLanguageAccess?: boolean;
  };
};

export async function getPlans(categoryId?: string): Promise<SubscriptionPlan[]> {
  const response = await apiClient.get("/subscriptions", {
    params: { categoryId },
  });
  return response.data ?? [];
}

export async function getRazorpayKey(): Promise<{ key: string }> {
  const response = await apiClient.get("/subscriptions/razorpay-key");
  return response.data;
}

export async function subscribe(planId: string, paymentId: string) {
  const response = await apiClient.post("/subscriptions/subscribe", {
    planId,
    paymentId,
  });
  return response.data;
}

export async function getMySubscription() {
  const response = await apiClient.get("/subscriptions/me");
  return response.data;
}

export async function validateUsage(feature: "customPaper" | "exams") {
  const response = await apiClient.post("/subscriptions/validate", { feature });
  return response.data;
}

export async function getMyProfile() {
  const response = await apiClient.get("/user/get-profile");
  return response.data;
}

export async function updateProfile(payload: {
  userId: string;
  name?: string;
  email?: string;
  gender?: string;
  address?: string;
  profile_pic?: string;
  language?: string;
}) {
  const response = await apiClient.put("/user/profile", payload);
  return response.data;
}

export async function getPerformanceAnalytics() {
  const response = await apiClient.get("/performance-analytics");
  return response.data;
}

export async function createCustomPaper(payload: {
  title: string;
  subject: string;
  questionCount: number;
  duration: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}) {
  const response = await apiClient.post("/custom-papers", payload);
  return response.data;
}
