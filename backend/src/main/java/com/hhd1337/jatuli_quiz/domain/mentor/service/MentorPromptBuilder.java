package com.hhd1337.jatuli_quiz.domain.mentor.service;

import com.hhd1337.jatuli_quiz.domain.mentor.dto.MentorDto;
import com.hhd1337.jatuli_quiz.domain.mentor.entity.DailyReflection;
import org.springframework.stereotype.Component;

@Component
public class MentorPromptBuilder {

    public String build(
            String careerPlanContent,
            String monthlyPlanContent,
            String weeklyPlanContent,
            MentorDto.DailyRoutineSummary routineSummary,
            DailyReflection reflection
    ) {
        return """
                너는 사용자의 1대1 취업 준비 AI 멘토다.
                사용자는 백엔드 신입 개발자 취업을 준비하고 있다.
                
                피드백은 다음 형식을 반드시 지켜라.
                
                [오늘의 AI 멘토 피드백]
                
                1. 오늘 잘한 점
                - ...
                
                2. 아쉬운 점
                - ...
                
                3. 현실적인 쓴소리
                - ...
                
                4. 내일의 핵심 지시
                - ...
                
                5. 한 줄 응원
                - ...
                
                [취업 전반 계획]
                %s
                
                [이번달 계획]
                %s
                
                [이번주 계획]
                %s
                
                [오늘 루틴 요약]
                날짜: %s
                전체 구간 수: %d
                완료 구간 수: %d
                대기 구간 수: %d
                건너뜀 구간 수: %d
                미완료 구간 수: %d
                완료율: %d%%
                계획 등록 시각: %s
                마지막 수정 시각: %s
                첫 완료 시각: %s
                마지막 완료 시각: %s
                
                [완료한 일 목록]
                %s
                
                [미완료한 일 목록]
                %s
                
                [오늘 소감]
                컨디션/감정: %s
                잘한 점: %s
                아쉬운 점: %s
                자유 소감: %s
                소감 작성 시각: %s
                
                주의:
                - 사용자를 무작정 위로하지 마라.
                - 잘한 점은 구체적으로 칭찬하라.
                - 아쉬운 점은 실행 행동 기준으로 지적하라.
                - 현실적인 쓴소리는 비난이 아니라 행동 교정 중심으로 작성하라.
                - 내일 행동 지시는 1~3개로 제한하라.
                - 매일 읽을 수 있도록 너무 길게 쓰지 마라.
                """.formatted(
                careerPlanContent,
                monthlyPlanContent,
                weeklyPlanContent,
                routineSummary.date(),
                routineSummary.totalCount(),
                routineSummary.completedCount(),
                routineSummary.pendingCount(),
                routineSummary.skippedCount(),
                routineSummary.pendingCount() + routineSummary.skippedCount(),
                routineSummary.completionRate(),
                routineSummary.plannedAt(),
                routineSummary.lastRoutineModifiedAt(),
                routineSummary.firstCompletedAt(),
                routineSummary.lastCompletedAt(),
                formatTasks(routineSummary.completedTasks()),
                formatTasks(routineSummary.uncompletedTasks()),
                reflection.getMood(),
                reflection.getGood(),
                reflection.getRegret(),
                reflection.getFreeText(),
                reflection.getWrittenAt()
        );
    }

    private String formatTasks(java.util.List<MentorDto.RoutineTaskSummary> tasks) {
        if (tasks == null || tasks.isEmpty()) {
            return "- 없음";
        }

        return tasks.stream()
                .map(task -> "- [%s ~ %s] %s: %s 상태=%s 완료시각=%s".formatted(
                        task.startTime(),
                        task.endTime(),
                        task.label(),
                        task.taskContent(),
                        task.status(),
                        task.completedAt()
                ))
                .toList()
                .stream()
                .reduce((a, b) -> a + "\n" + b)
                .orElse("- 없음");
    }
}