package com.hhd1337.jatuli_quiz.domain.home;

import com.hhd1337.jatuli_quiz.common.response.ApiResponse;
import com.hhd1337.jatuli_quiz.domain.home.dto.HomeResponse;
import com.hhd1337.jatuli_quiz.domain.home.service.HomeQueryService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/home")
@RequiredArgsConstructor
public class HomeRestController {

    private final HomeQueryService homeQueryService;

    @Operation(
            summary = "홈 화면 정보 조회",
            description = """
                    홈 화면의 성취 카드 정보와 루트 폴더 목록을 조회합니다.
                    성취 카드에는 오늘 자투리 시간, 누적 자투리 시간, 오늘 푼 문제 수,
                    누적 푼 문제 수, 연속 학습 일수, 레벨, 오늘 목표 진행도가 포함됩니다.
                    루트 폴더 목록에는 ROOT 폴더의 직계 하위 폴더들과 각 폴더의 solved/total 문제가 포함됩니다.
                    """
    )
    @GetMapping
    public ApiResponse<HomeResponse.GetHomeResponse> getHome() {
        return ApiResponse.onSuccess(homeQueryService.getHome());
    }
}