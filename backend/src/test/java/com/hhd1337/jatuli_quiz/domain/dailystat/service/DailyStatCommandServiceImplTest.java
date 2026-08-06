package com.hhd1337.jatuli_quiz.domain.dailystat.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import com.hhd1337.jatuli_quiz.domain.dailystat.entity.DailyStat;
import com.hhd1337.jatuli_quiz.domain.dailystat.repository.DailyStatRepository;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class DailyStatCommandServiceImplTest {

    private static final ZoneId SERVICE_ZONE = ZoneId.of("Asia/Seoul");

    @Mock
    private DailyStatRepository dailyStatRepository;

    @InjectMocks
    private DailyStatCommandServiceImpl dailyStatCommandService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @DisplayName("당일 레코드가 없고 이전 레코드도 없으면 solvedCount 1로 새로 생성한다")
    void updateDailyStat_createsFirstRecord_whenNoRecordExists() {
        // given
        given(dailyStatRepository.findByStatDate(any(LocalDate.class)))
                .willReturn(Optional.empty());
        given(dailyStatRepository.findTopByStatDateLessThanOrderByStatDateDesc(any(LocalDate.class)))
                .willReturn(Optional.empty());
        given(dailyStatRepository.save(any(DailyStat.class)))
                .willAnswer(invocation -> invocation.getArgument(0));

        // when
        DailyStat result = dailyStatCommandService.updateDailyStat(120);

        // then
        assertThat(result.getSolvedCount()).isEqualTo(1);
        assertThat(result.getFocusSeconds()).isEqualTo(120);
        assertThat(result.getAccumulatedFocusSeconds()).isEqualTo(120L);
        assertThat(result.getDaysInARow()).isEqualTo(1);
    }

    @Test
    @DisplayName("당일 레코드가 있으면 기존 값에 누적하고 save를 호출하지 않는다")
    void updateDailyStat_accumulatesExistingTodayRecord() {
        // given
        DailyStat existingTodayStat = new DailyStat(
                LocalDate.now(SERVICE_ZONE),
                3,
                500,
                1000L,
                4
        );

        given(dailyStatRepository.findByStatDate(any(LocalDate.class)))
                .willReturn(Optional.of(existingTodayStat));

        // when
        DailyStat result = dailyStatCommandService.updateDailyStat(60);

        // then
        assertThat(result.getSolvedCount()).isEqualTo(4);
        assertThat(result.getFocusSeconds()).isEqualTo(560);
        assertThat(result.getAccumulatedFocusSeconds()).isEqualTo(1060L);
        assertThat(result.getDaysInARow()).isEqualTo(4);
        verify(dailyStatRepository, never()).save(any());
    }

    @Test
    @DisplayName("어제 레코드가 있으면 daysInARow를 이어서 증가시킨다")
    void updateDailyStat_incrementsDaysInARow_whenYesterdayRecordExists() {
        // given
        LocalDate today = LocalDate.now(SERVICE_ZONE);

        DailyStat yesterdayStat = new DailyStat(
                today.minusDays(1),
                5,
                600,
                2000L,
                5
        );

        given(dailyStatRepository.findByStatDate(any(LocalDate.class)))
                .willReturn(Optional.empty());
        given(dailyStatRepository.findTopByStatDateLessThanOrderByStatDateDesc(any(LocalDate.class)))
                .willReturn(Optional.of(yesterdayStat));
        given(dailyStatRepository.save(any(DailyStat.class)))
                .willAnswer(invocation -> invocation.getArgument(0));

        // when
        DailyStat result = dailyStatCommandService.updateDailyStat(30);

        // then
        assertThat(result.getDaysInARow()).isEqualTo(6);
        assertThat(result.getAccumulatedFocusSeconds()).isEqualTo(2030L);
        assertThat(result.getSolvedCount()).isEqualTo(1);
    }

    @Test
    @DisplayName("마지막 레코드가 어제가 아니면 daysInARow를 1로 초기화한다")
    void updateDailyStat_resetsDaysInARow_whenLastRecordIsNotYesterday() {
        // given
        LocalDate today = LocalDate.now(SERVICE_ZONE);

        DailyStat oldStat = new DailyStat(
                today.minusDays(3),
                2,
                200,
                500L,
                10
        );

        given(dailyStatRepository.findByStatDate(any(LocalDate.class)))
                .willReturn(Optional.empty());
        given(dailyStatRepository.findTopByStatDateLessThanOrderByStatDateDesc(any(LocalDate.class)))
                .willReturn(Optional.of(oldStat));
        given(dailyStatRepository.save(any(DailyStat.class)))
                .willAnswer(invocation -> invocation.getArgument(0));

        // when
        DailyStat result = dailyStatCommandService.updateDailyStat(10);

        // then
        assertThat(result.getDaysInARow()).isEqualTo(1);
        assertThat(result.getAccumulatedFocusSeconds()).isEqualTo(510L);
    }
}
