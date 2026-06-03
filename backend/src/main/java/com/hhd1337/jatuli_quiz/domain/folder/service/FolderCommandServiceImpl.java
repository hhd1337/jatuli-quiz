package com.hhd1337.jatuli_quiz.domain.folder.service;

import com.hhd1337.jatuli_quiz.common.exception.GeneralException;
import com.hhd1337.jatuli_quiz.common.exception.code.status.ErrorStatus;
import com.hhd1337.jatuli_quiz.domain.folder.converter.FolderConverter;
import com.hhd1337.jatuli_quiz.domain.folder.dto.FolderRequest;
import com.hhd1337.jatuli_quiz.domain.folder.dto.FolderResponse;
import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import com.hhd1337.jatuli_quiz.domain.folder.repository.FolderRepository;
import com.hhd1337.jatuli_quiz.domain.problem.repository.ProblemRepository;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class FolderCommandServiceImpl implements FolderCommandService {

    private final FolderRepository folderRepository;
    private final ProblemRepository problemRepository;

    @Override
    public FolderResponse.CreateFolderResponse createFolder(
            FolderRequest.CreateFolderRequest request
    ) {
        Folder parentFolder = folderRepository.findByFolderId(request.getParentFolderId())
                .orElseThrow(() -> new GeneralException(ErrorStatus.FOLDER_NOT_FOUND));

        String trimmedName = request.getName().trim();

        validateDuplicateFolderName(parentFolder.getFolderId(), trimmedName);

        Integer nextSortOrder = folderRepository.findMaxSortOrderByParentFolderId(
                parentFolder.getFolderId()
        ) + 1;

        Folder folder = Folder.createChildFolder(
                trimmedName,
                parentFolder,
                nextSortOrder
        );

        Folder savedFolder = folderRepository.save(folder);

        return FolderConverter.toCreateFolderResponse(savedFolder);
    }

    @Override
    public FolderResponse.RenameFolderResponse renameFolder(
            Long folderId,
            FolderRequest.RenameFolderRequest request
    ) {
        Folder folder = folderRepository.findByFolderId(folderId)
                .orElseThrow(() -> new GeneralException(ErrorStatus.FOLDER_NOT_FOUND));

        validateNotRootFolder(folder);

        String trimmedName = request.getName().trim();

        if (folder.getName().equals(trimmedName)) {
            return FolderConverter.toRenameFolderResponse(folder);
        }

        Long parentFolderId = folder.getParentFolder().getFolderId();

        validateDuplicateFolderNameExceptSelf(
                parentFolderId,
                trimmedName,
                folder.getFolderId()
        );

        folder.rename(trimmedName);

        refreshDescendantFullPaths(folder);

        return FolderConverter.toRenameFolderResponse(folder);
    }

    @Override
    public FolderResponse.DeleteFolderResponse deleteFolder(Long folderId) {
        Folder folder = folderRepository.findByFolderId(folderId)
                .orElseThrow(() -> new GeneralException(ErrorStatus.FOLDER_NOT_FOUND));

        validateNotRootFolder(folder);
        validateDeletableFolder(folder);

        folderRepository.delete(folder);

        return FolderConverter.toDeleteFolderResponse(folderId);
    }

    @Override
    public FolderResponse.ReorderFoldersResponse reorderChildFolders(
            Long parentFolderId,
            FolderRequest.ReorderFoldersRequest request
    ) {
        Folder parentFolder = folderRepository.findByFolderId(parentFolderId)
                .orElseThrow(() -> new GeneralException(ErrorStatus.FOLDER_NOT_FOUND));

        List<Folder> childFolders =
                folderRepository.findAllByParentFolder_FolderIdOrderBySortOrderAscFolderIdAsc(
                        parentFolder.getFolderId()
                );

        validateReorderRequest(childFolders, request.getOrderedFolderIds());

        Map<Long, Folder> folderMap = childFolders.stream()
                .collect(Collectors.toMap(Folder::getFolderId, folder -> folder));

        List<Folder> reorderedFolders = new ArrayList<>();

        for (int i = 0; i < request.getOrderedFolderIds().size(); i++) {
            Long childFolderId = request.getOrderedFolderIds().get(i);
            Folder childFolder = folderMap.get(childFolderId);

            childFolder.changeSortOrder(i + 1);
            reorderedFolders.add(childFolder);
        }

        return FolderConverter.toReorderFoldersResponse(
                parentFolderId,
                reorderedFolders
        );
    }

    private void validateDuplicateFolderName(Long parentFolderId, String folderName) {
        boolean existsSameNameFolder = folderRepository.existsByParentFolder_FolderIdAndName(
                parentFolderId,
                folderName
        );

        if (existsSameNameFolder) {
            throw new GeneralException(ErrorStatus.DUPLICATE_FOLDER_NAME);
        }
    }

    private void validateDuplicateFolderNameExceptSelf(
            Long parentFolderId,
            String folderName,
            Long folderId
    ) {
        boolean existsSameNameFolder =
                folderRepository.existsByParentFolder_FolderIdAndNameAndFolderIdNot(
                        parentFolderId,
                        folderName,
                        folderId
                );

        if (existsSameNameFolder) {
            throw new GeneralException(ErrorStatus.DUPLICATE_FOLDER_NAME);
        }
    }

    private void validateNotRootFolder(Folder folder) {
        if (folder.isRoot()) {
            throw new GeneralException(ErrorStatus.ROOT_FOLDER_CANNOT_BE_MODIFIED);
        }
    }

    private void validateDeletableFolder(Folder folder) {
        boolean hasChildFolder = folderRepository.existsByParentFolder(folder);
        if (hasChildFolder) {
            throw new GeneralException(ErrorStatus.FOLDER_HAS_CHILDREN);
        }

        boolean hasProblem = problemRepository.existsByFolder(folder);
        if (hasProblem) {
            throw new GeneralException(ErrorStatus.FOLDER_HAS_PROBLEMS);
        }
    }

    private void refreshDescendantFullPaths(Folder folder) {
        List<Folder> children =
                folderRepository.findAllByParentFolder_FolderIdOrderBySortOrderAscFolderIdAsc(
                        folder.getFolderId()
                );

        for (Folder child : children) {
            child.refreshFullPath();
            refreshDescendantFullPaths(child);
        }
    }

    private void validateReorderRequest(
            List<Folder> childFolders,
            List<Long> orderedFolderIds
    ) {
        Set<Long> existingChildFolderIds = childFolders.stream()
                .map(Folder::getFolderId)
                .collect(Collectors.toSet());

        Set<Long> requestedFolderIds = new HashSet<>(orderedFolderIds);

        if (childFolders.size() != orderedFolderIds.size()) {
            throw new GeneralException(ErrorStatus.INVALID_FOLDER_ORDER);
        }

        if (orderedFolderIds.size() != requestedFolderIds.size()) {
            throw new GeneralException(ErrorStatus.INVALID_FOLDER_ORDER);
        }

        if (!existingChildFolderIds.equals(requestedFolderIds)) {
            throw new GeneralException(ErrorStatus.INVALID_FOLDER_ORDER);
        }
    }
}
