package com.hhd1337.jatuli_quiz.domain.defense.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.List;

public class DefenseQueueRequest {

    private DefenseQueueRequest() {
    }

    public record AddDefenseQueueEntryRequest(
            @NotNull(message = "폴더 ID는 필수입니다.")
            @Positive(message = "폴더 ID는 양수여야 합니다.")
            Long folderId
    ) {
    }

    public record ReorderDefenseQueueRequest(
            @NotEmpty(message = "순서를 변경할 폴더 ID 목록이 필요합니다.")
            List<
                    @NotNull(message = "폴더 ID는 null일 수 없습니다.")
                    @Positive(message = "폴더 ID는 양수여야 합니다.")
                            Long
                    > orderedFolderIds
    ) {
        public ReorderDefenseQueueRequest {
            if (orderedFolderIds != null) {
                orderedFolderIds = List.copyOf(orderedFolderIds);
            }
        }
    }
}
