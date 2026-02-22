export const practiceMockByFolderId = {
  101: {
    folderId: 101,
    titlePath: "/자바/기본/클래스와 데이터",
    problems: [
      {
        problemId: 9001,
        questionNo: 1,
        questionText: "변수만으로 학생 정보 관리 시 문제점은?",
        questionImages: [],

        answerText: "확장성과 유지보수성이 떨어진다.",
        explanationBlocks: [
          { type: "TEXT", text: "학생 수가 늘어날수록 변수를 계속 추가해야 하고, 코드 중복과 유지보수 비용이 커진다." },
          {
            type: "IMAGE",
            image: {
              imageId: "img_e_1",
              url: "https://cdn.example.com/p/9001/e1.png",
              alt: "중복 코드 예시",
            },
          },
          { type: "TEXT", text: "따라서 확장성과 유지보수성이 떨어진다." },
        ],

        meta: { attemptCount: 0, isBookmarked: true },
      },
      {
        problemId: 9002,
        questionNo: 2,
        questionText: "클래스를 도입하면 얻는 이점 1가지는?",
        questionImages: [],
        answerText: "데이터와 기능을 캡슐화해 재사용성과 유지보수성을 높인다.",
        explanationBlocks: [{ type: "TEXT", text: "클래스는 관련 데이터를 묶고, 메서드로 행동을 정의해 중복을 줄인다." }],
        meta: { attemptCount: 1, isBookmarked: false },
      },
    ],
  },
};

export function getPracticeMock(folderId) {
  const data = practiceMockByFolderId[Number(folderId)];
  if (!data) {
    return {
      folderId: Number(folderId),
      titlePath: "/(문제 없음)",
      problems: [],
    };
  }
  return data;
}