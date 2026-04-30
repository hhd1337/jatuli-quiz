package com.hhd1337.jatuli_quiz.domain.folder.service;

import com.hhd1337.jatuli_quiz.common.exception.GeneralException;
import com.hhd1337.jatuli_quiz.common.exception.code.status.ErrorStatus;
import com.hhd1337.jatuli_quiz.domain.folder.converter.FolderConverter;
import com.hhd1337.jatuli_quiz.domain.folder.dto.FolderRequest;
import com.hhd1337.jatuli_quiz.domain.folder.dto.FolderResponse;
import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import com.hhd1337.jatuli_quiz.domain.folder.repository.FolderRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class FolderCommandServiceImpl implements FolderCommandService {

    private final FolderRepository folderRepository;

    @Override
    public FolderResponse.CreateFolderResponse createFolder(
            FolderRequest.CreateFolderRequest request
    ) {
        Folder parentFolder = folderRepository.findByFolderId(request.getParentFolderId())
                .orElseThrow(() -> new GeneralException(ErrorStatus.FOLDER_NOT_FOUND));

        validateDuplicateFolderName(parentFolder.getFolderId(), request.getName());

        Folder folder = Folder.createChildFolder(
                request.getName(),
                parentFolder
        );

        Folder savedFolder = folderRepository.save(folder);

        return FolderConverter.toCreateFolderResponse(savedFolder);
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
}
