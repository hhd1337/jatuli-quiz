package com.hhd1337.jatuli_quiz.domain.folder.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class FolderRequest {

    @Getter
    @NoArgsConstructor
    public static class CreateFolderRequest {

        @NotNull(message = "부모 폴더 ID는 필수입니다.")
        private Long parentFolderId;

        @NotBlank(message = "폴더 이름은 필수입니다.")
        @Size(max = 100, message = "폴더 이름은 100자를 초과할 수 없습니다.")
        private String name;
    }
}
