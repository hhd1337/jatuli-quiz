package com.hhd1337.jatuli_quiz.domain.defense.service;

import com.hhd1337.jatuli_quiz.common.exception.GeneralException;
import com.hhd1337.jatuli_quiz.common.exception.code.status.ErrorStatus;
import com.hhd1337.jatuli_quiz.domain.defense.converter.DefenseQueueConverter;
import com.hhd1337.jatuli_quiz.domain.defense.dto.DefenseQueueRequest;
import com.hhd1337.jatuli_quiz.domain.defense.dto.DefenseQueueResponse;
import com.hhd1337.jatuli_quiz.domain.defense.entity.DefenseQueueEntry;
import com.hhd1337.jatuli_quiz.domain.defense.repository.DefenseQueueEntryRepository;
import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import com.hhd1337.jatuli_quiz.domain.folder.repository.FolderRepository;
import com.hhd1337.jatuli_quiz.domain.problem.repository.ProblemRepository;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class DefenseQueueServiceImpl implements DefenseQueueService {

    private final DefenseQueueEntryRepository defenseQueueEntryRepository;
    private final FolderRepository folderRepository;
    private final ProblemRepository problemRepository;

    @Override
    @Transactional(readOnly = true)
    public DefenseQueueResponse.GetDefenseQueueResponse getQueue() {
        List<DefenseQueueEntry> entries = defenseQueueEntryRepository.findAllOrderByQueueOrderAsc();
        return DefenseQueueConverter.toGetDefenseQueueResponse(toItems(entries));
    }

    @Override
    public DefenseQueueResponse.GetDefenseQueueResponse addToQueue(
            DefenseQueueRequest.AddDefenseQueueEntryRequest request
    ) {
        Folder folder = folderRepository.findById(request.folderId())
                .orElseThrow(() -> new GeneralException(ErrorStatus.FOLDER_NOT_FOUND));

        validateLeafFolder(folder);
        validateNotAlreadyRegistered(folder);

        int nextQueueOrder = defenseQueueEntryRepository.findMaxQueueOrder() + 1;

        defenseQueueEntryRepository.save(DefenseQueueEntry.create(folder, nextQueueOrder));

        return getQueue();
    }

    @Override
    public DefenseQueueResponse.GetDefenseQueueResponse removeFromQueue(Long folderId) {
        DefenseQueueEntry entry = defenseQueueEntryRepository.findByFolder_FolderId(folderId)
                .orElseThrow(() -> new GeneralException(ErrorStatus.DEFENSE_QUEUE_ENTRY_NOT_FOUND));

        defenseQueueEntryRepository.delete(entry);

        return getQueue();
    }

    @Override
    public DefenseQueueResponse.GetDefenseQueueResponse reorderQueue(
            DefenseQueueRequest.ReorderDefenseQueueRequest request
    ) {
        List<DefenseQueueEntry> entries = defenseQueueEntryRepository.findAllOrderByQueueOrderAsc();

        validateReorderRequest(entries, request.orderedFolderIds());

        Map<Long, DefenseQueueEntry> entryByFolderId = entries.stream()
                .collect(Collectors.toMap(
                        entry -> entry.getFolder().getFolderId(),
                        entry -> entry
                ));

        List<Long> orderedFolderIds = request.orderedFolderIds();

        for (int i = 0; i < orderedFolderIds.size(); i++) {
            DefenseQueueEntry entry = entryByFolderId.get(orderedFolderIds.get(i));
            entry.changeQueueOrder(i + 1);
        }

        return getQueue();
    }

    private List<DefenseQueueResponse.DefenseQueueEntryItem> toItems(List<DefenseQueueEntry> entries) {
        List<DefenseQueueResponse.DefenseQueueEntryItem> items = new ArrayList<>(entries.size());

        for (DefenseQueueEntry entry : entries) {
            int totalProblemCount = problemRepository.countByFolder(entry.getFolder());
            items.add(DefenseQueueConverter.toDefenseQueueEntryItem(entry, totalProblemCount));
        }

        return items;
    }

    private void validateLeafFolder(Folder folder) {
        boolean hasChildFolder = folderRepository.existsByParentFolder_FolderId(folder.getFolderId());

        if (hasChildFolder) {
            throw new GeneralException(ErrorStatus.DEFENSE_QUEUE_FOLDER_NOT_LEAF);
        }

        boolean hasProblems = problemRepository.countByFolder(folder) > 0;

        if (!hasProblems) {
            throw new GeneralException(ErrorStatus.DEFENSE_QUEUE_FOLDER_EMPTY);
        }
    }

    private void validateNotAlreadyRegistered(Folder folder) {
        if (defenseQueueEntryRepository.existsByFolder(folder)) {
            throw new GeneralException(ErrorStatus.DEFENSE_QUEUE_ALREADY_REGISTERED);
        }
    }

    private void validateReorderRequest(
            List<DefenseQueueEntry> entries,
            List<Long> orderedFolderIds
    ) {
        Set<Long> existingFolderIds = entries.stream()
                .map(entry -> entry.getFolder().getFolderId())
                .collect(Collectors.toSet());

        Set<Long> requestedFolderIds = new HashSet<>(orderedFolderIds);

        if (entries.size() != orderedFolderIds.size()
                || orderedFolderIds.size() != requestedFolderIds.size()
                || !existingFolderIds.equals(requestedFolderIds)) {
            throw new GeneralException(ErrorStatus.DEFENSE_QUEUE_INVALID_ORDER);
        }
    }
}
