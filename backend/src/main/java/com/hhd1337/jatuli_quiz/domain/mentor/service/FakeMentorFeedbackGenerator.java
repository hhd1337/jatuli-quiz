package com.hhd1337.jatuli_quiz.domain.mentor.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
        name = "mentor.feedback.provider",
        havingValue = "fake"
)
public class FakeMentorFeedbackGenerator implements MentorFeedbackGenerator {

    @Override
    public String generate(String prompt) {
        return """
                [오늘의 AI 멘토 피드백]
                
                1. 오늘 잘한 점
                - 오늘 루틴을 기록하고 회고까지 남긴 점이 좋습니다.
                
                2. 아쉬운 점
                - 완료하지 못한 항목이 있다면 내일은 오전 시간대부터 우선순위를 좁혀야 합니다.
                
                3. 현실적인 쓴소리
                - 계획은 적는 것보다 실행률로 증명됩니다. 내일은 적게 잡고 반드시 끝내세요.
                
                4. 내일의 핵심 지시
                - 첫 번째 공부 구간 하나만큼은 무조건 완료 처리하세요.
                
                5. 한 줄 응원
                - 오늘의 기록은 내일의 방향이 됩니다.
                """;
    }
}
