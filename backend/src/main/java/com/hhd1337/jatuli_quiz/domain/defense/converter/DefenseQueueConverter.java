package com.hhd1337.jatuli_quiz.domain.defense.converter;

import com.hhd1337.jatuli_quiz.domain.defense.dto.DefenseQueueResponse;
import com.hhd1337.jatuli_quiz.domain.defense.entity.DefenseQueueEntry;
import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import java.util.List;

public class DefenseQueueConverter {

    private DefenseQueueConverter() {
    }

    public static DefenseQueueResponse.DefenseQueueEntryItem toDefenseQueueEntryItem(
            DefenseQueueEntry entry,
            int totalProblemCount
    ) {
        Folder folder = entry.getFolder();

        return DefenseQueueResponse.DefenseQueueEntryItem.builder()
                .folderId(folder.getFolderId())
                .folderName(folder.getName())
                .folderFullPath(folder.getFullPath())
                .totalProblemCount(totalProblemCount)
                .queueOrder(entry.getQueueOrder())
                .build();
    }

    public static DefenseQueueResponse.GetDefenseQueueResponse toGetDefenseQueueResponse(
            List<DefenseQueueResponse.DefenseQueueEntryItem> items
    ) {
        return DefenseQueueResponse.GetDefenseQueueResponse.builder()
                .totalCount(items.size())
                .entries(items)
                .build();
    }
}
