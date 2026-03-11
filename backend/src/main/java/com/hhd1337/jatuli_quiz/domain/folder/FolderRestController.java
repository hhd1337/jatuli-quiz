package com.hhd1337.jatuli_quiz.domain.folder;

import com.hhd1337.jatuli_quiz.common.response.ApiResponse;
import com.hhd1337.jatuli_quiz.domain.folder.dto.FolderResponse.FolderChildrenResponse;
import com.hhd1337.jatuli_quiz.domain.folder.service.FolderQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/folders")
@RequiredArgsConstructor
public class FolderRestController {
    private final FolderQueryService folderQueryService;

    @GetMapping("/{folderId}/children")
    public ApiResponse<FolderChildrenResponse> getChildren(@PathVariable Long folderId) {
        return ApiResponse.onSuccess(folderQueryService.getChildren(folderId));
    }
}
