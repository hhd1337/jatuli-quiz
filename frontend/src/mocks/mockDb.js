import { practiceMockByFolderId } from "./practice.mock";

const LS_KEY = "jatuli_mockdb_v1";

/**
 * DB 스키마
 * {
 *   problems: Problem[],
 *   folderIndex: { [folderId:number]: number[] } // folderId -> problemIds
 *   nextProblemId: number
 * }
 */

function buildInitialDb() {
  const problems = [];
  const folderIndex = {};
  let maxId = 0;

  for (const folderId of Object.keys(practiceMockByFolderId)) {
    const folder = practiceMockByFolderId[folderId];
    folderIndex[folderId] = [];
    for (const p of folder.problems) {
      problems.push(p);
      folderIndex[folderId].push(p.problemId);
      maxId = Math.max(maxId, p.problemId);
    }
  }

  return {
    problems,
    folderIndex,
    nextProblemId: maxId + 1,
  };
}

function loadDb() {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) {
    const init = buildInitialDb();
    localStorage.setItem(LS_KEY, JSON.stringify(init));
    return init;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    const init = buildInitialDb();
    localStorage.setItem(LS_KEY, JSON.stringify(init));
    return init;
  }
}

function saveDb(db) {
  localStorage.setItem(LS_KEY, JSON.stringify(db));
}

export function resetMockDb() {
  const init = buildInitialDb();
  saveDb(init);
  return init;
}

export function getProblemsByFolderId(folderId) {
  const db = loadDb();
  const ids = db.folderIndex[String(folderId)] ?? [];
  return ids
    .map((id) => db.problems.find((p) => p.problemId === id))
    .filter(Boolean);
}

export function getProblemById(problemId) {
  const db = loadDb();
  const id = Number(problemId);
  return db.problems.find((p) => p.problemId === id) ?? null;
}

export function createProblem({ folderId, titlePath, questionText, answerText, explanationText }) {
  const db = loadDb();

  const newId = db.nextProblemId;
  db.nextProblemId += 1;

  const explanationBlocks = explanationText
    ? explanationText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((t) => ({ type: "TEXT", text: t }))
    : [];

  const newProblem = {
    problemId: newId,
    titlePath,
    questionNo: 0, // 폴더 내부에서 번호를 새로 매길 수도 있는데 MVP는 0으로 두고 표시만 별도로 처리 가능
    questionText,
    questionImages: [],
    answerText,
    explanationBlocks,
    meta: { attemptCount: 0, isBookmarked: false },
    folderId: Number(folderId), // 편의 필드(서버에서는 scope로 갈 수 있음)
  };

  db.problems.push(newProblem);

  const key = String(folderId);
  if (!db.folderIndex[key]) db.folderIndex[key] = [];
  db.folderIndex[key].push(newId);

  saveDb(db);
  return newProblem;
}

export function updateProblem(problemId, patch) {
  const db = loadDb();
  const id = Number(problemId);

  const idx = db.problems.findIndex((p) => p.problemId === id);
  if (idx === -1) return null;

  const prev = db.problems[idx];

  // explanationText -> blocks 변환 허용
  let nextExplanationBlocks = prev.explanationBlocks;
  if (typeof patch.explanationText === "string") {
    nextExplanationBlocks = patch.explanationText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((t) => ({ type: "TEXT", text: t }));
  }

  const next = {
    ...prev,
    questionText: patch.questionText ?? prev.questionText,
    answerText: patch.answerText ?? prev.answerText,
    explanationBlocks: nextExplanationBlocks,
  };

  db.problems[idx] = next;
  saveDb(db);
  return next;
}

export function deleteProblem(problemId) {
  const db = loadDb();
  const id = Number(problemId);

  const target = db.problems.find((p) => p.problemId === id);
  if (!target) return false;

  // problems에서 제거
  db.problems = db.problems.filter((p) => p.problemId !== id);

  // folderIndex에서도 제거
  for (const key of Object.keys(db.folderIndex)) {
    db.folderIndex[key] = db.folderIndex[key].filter((pid) => pid !== id);
  }

  saveDb(db);
  return true;
}