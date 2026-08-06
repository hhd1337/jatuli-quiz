package com.hhd1337.jatuli_quiz.domain.defense.controller;

import com.hhd1337.jatuli_quiz.common.response.ApiResponse;
import com.hhd1337.jatuli_quiz.domain.defense.dto.DefenseQueueRequest;
import com.hhd1337.jatuli_quiz.domain.defense.dto.DefenseQueueResponse;
import com.hhd1337.jatuli_quiz.domain.defense.service.DefenseQueueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/defense-queue")
@RequiredArgsConstructor
@Tag(name = "문제 디펜스", description = "디펜스 대기 큐 조회 및 관리 API")
public class DefenseQueueController {

    private final DefenseQueueService defenseQueueService;

    @Operation(
            summary = "디펜스 대기 큐 조회",
            description = "등록 순서(queueOrder)대로 디펜스 대기 큐 전체를 조회합니다. 첫 번째 항목이 다음 방어 대상입니다."
    )
    @GetMapping
    public ApiResponse<DefenseQueueResponse.GetDefenseQueueResponse> getQueue() {
        return ApiResponse.onSuccess(defenseQueueService.getQueue());
    }

    @Operation(
            summary = "디펜스 대기 큐에 폴더 추가",
            description = """
                    리프 폴더를 디펜스 대기 큐의 마지막 순서에 추가합니다.
                    리프 폴더가 아니거나 문제가 하나도 없으면 등록을 거부합니다.
                    이미 등록된 폴더면 등록을 거부합니다.
                    """
    )
    @PostMapping
    public ApiResponse<DefenseQueueResponse.GetDefenseQueueResponse> addToQueue(
            @Valid @RequestBody DefenseQueueRequest.AddDefenseQueueEntryRequest request
    ) {
        return ApiResponse.onSuccess(defenseQueueService.addToQueue(request));
    }

    @Operation(
            summary = "디펜스 대기 큐에서 폴더 삭제",
            description = "지정한 폴더를 디펜스 대기 큐에서 제거합니다."
    )
    @DeleteMapping("/{folderId}")
    public ApiResponse<DefenseQueueResponse.GetDefenseQueueResponse> removeFromQueue(
            @PathVariable Long folderId
    ) {
        return ApiResponse.onSuccess(defenseQueueService.removeFromQueue(folderId));
    }

    @Operation(
            summary = "디펜스 대기 큐 순서 변경",
            description = """
                    디펜스 대기 큐 전체 순서를 일괄 변경합니다.
                    orderedFolderIds에는 현재 큐에 등록된 폴더 ID 전체를 원하는 순서대로 전달해야 합니다.
                    누락되거나 중복되거나 큐에 없는 폴더 ID가 포함되면 요청을 거부합니다.
                    """
    )
    @PatchMapping("/order")
    public ApiResponse<DefenseQueueResponse.GetDefenseQueueResponse> reorderQueue(
            @Valid @RequestBody DefenseQueueRequest.ReorderDefenseQueueRequest request
    ) {
        return ApiResponse.onSuccess(defenseQueueService.reorderQueue(request));
    }
}
