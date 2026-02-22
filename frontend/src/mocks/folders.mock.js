// folderId -> children 응답 매핑
export const foldersChildrenMockById = {
  1: {
    folderId: 1,
    titlePath: "/자바",
    depth: 1,
    sections: [
      {
        sectionId: "basic",
        title: "/기본",
        children: [
          { folderId: 101, name: "클래스와 데이터", solvedCount: 32, totalCount: 120, isLeaf: true },
          { folderId: 102, name: "기본형과 참조형", solvedCount: 10, totalCount: 80, isLeaf: true },
          { folderId: 103, name: "객체지향 프로그래밍", solvedCount: 0, totalCount: 42, isLeaf: true },
          { folderId: 104, name: "생성자", solvedCount: 5, totalCount: 150, isLeaf: true },
          { folderId: 105, name: "패키지", solvedCount: 5, totalCount: 150, isLeaf: true },
        ],
      },
      {
        sectionId: "intermediate1",
        title: "/중급1",
        children: [
          { folderId: 201, name: "제네릭1", solvedCount: 0, totalCount: 30, isLeaf: true },
          { folderId: 202, name: "ArrayList", solvedCount: 0, totalCount: 25, isLeaf: true },
          { folderId: 203, name: "HashSet", solvedCount: 0, totalCount: 20, isLeaf: true },
        ],
      },
    ],
  },

  2: {
    folderId: 2,
    titlePath: "/DB",
    depth: 1,
    sections: [
      {
        sectionId: "sql",
        title: "/SQL",
        children: [
          { folderId: 301, name: "JOIN", solvedCount: 2, totalCount: 40, isLeaf: true },
          { folderId: 302, name: "GROUP BY", solvedCount: 1, totalCount: 30, isLeaf: true },
        ],
      },
    ],
  },
};

// 편의 함수 (나중에 API 호출로 바꾸기 쉬움)
export function getFolderChildrenMock(folderId) {
  const data = foldersChildrenMockById[Number(folderId)];
  if (!data) {
    return {
      folderId: Number(folderId),
      titlePath: "/(없는 폴더)",
      depth: 1,
      sections: [],
    };
  }
  return data;
}