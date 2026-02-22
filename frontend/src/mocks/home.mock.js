export const homeMock = {
  summary: {
    savedTimeMinutes: 192, // 3시간 12분 = 192분
    level: 4,
    solvedCountTotal: 128,
    streakDays: 4,
    todayGoal: {
      goalCount: 10,
      solvedCount: 6,
    },
  },

  rootFolders: [
    { folderId: 1, name: "자바", solvedCount: 32, totalCount: 120 },
    { folderId: 2, name: "DB", solvedCount: 10, totalCount: 80 },
    { folderId: 3, name: "스프링", solvedCount: 0, totalCount: 42 },
    { folderId: 4, name: "SpringBoot + JPA", solvedCount: 5, totalCount: 150 },
    { folderId: 5, name: "TDD", solvedCount: 5, totalCount: 150 },
    { folderId: 6, name: "면접 CS", solvedCount: 5, totalCount: 150 },
  ],

  quickActions: [
    { key: "RANDOM", label: "랜덤 문제 풀기" },
    { key: "BOOKMARK", label: "북마크 문제 풀기" },
  ],
};