package com.hhd1337.jatuli_quiz.domain.folder.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

public class FolderResponse {

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FolderChildrenResponse {
        private List<BreadcrumbDTO> breadcrumb;
        private List<FolderDTO> folders;

        @Getter
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class BreadcrumbDTO {
            private Long folderId;
            private String name;
        }

        @Getter
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class FolderDTO {
            private Long folderId;
            private String name;
            private Integer solved;
            private Integer total;
            private Boolean hasChildren;
        }
    }
}