package com.hhd1337.jatuli_quiz.domain.dailystat.service;

import com.hhd1337.jatuli_quiz.domain.dailystat.entity.DailyStat;

public interface DailyStatCommandService {

    /**
     * 오늘 날짜의 DailyStat에 문제 풀이 1건을 반영한다.
     * 오늘 레코드가 없으면 새로 생성하고, 있으면 기존 값에 누적한다.
     */
    DailyStat updateDailyStat(int elapsedSeconds);
}
