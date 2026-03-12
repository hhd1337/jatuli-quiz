package com.hhd1337.jatuli_quiz.domain.home.service;

import com.hhd1337.jatuli_quiz.domain.dailystat.entity.DailyStat;
import com.hhd1337.jatuli_quiz.domain.dailystat.repository.DailyStatRepository;
import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import com.hhd1337.jatuli_quiz.domain.folder.repository.FolderRepository;
import com.hhd1337.jatuli_quiz.domain.home.converter.HomeConverter;
import com.hhd1337.jatuli_quiz.domain.home.dto.HomeResponse;
import com.hhd1337.jatuli_quiz.domain.problem.repository.ProblemRepository;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HomeQueryServiceImpl implements HomeQueryService {

    private static final Long ROOT_FOLDER_ID = 1L;
    private static final int TODAY_GOAL_COUNT = 10;

    private final DailyStatRepository dailyStatRepository;
    private final FolderRepository folderRepository;
    private final ProblemRepository problemRepository;

    @Override
    public HomeResponse.GetHomeResponse getHome() {
        LocalDate today = LocalDate.now();

        DailyStat todayStat = dailyStatRepository.findByStatDate(today).orElse(null);

        int todayFocusSeconds = todayStat == null || todayStat.getFocusSeconds() == null
                ? 0
                : todayStat.getFocusSeconds();

        long accumulatedFocusSeconds = todayStat == null || todayStat.getAccumulatedFocusSeconds() == null
                ? 0L
                : todayStat.getAccumulatedFocusSeconds();

        int todaySolvedCount = todayStat == null || todayStat.getSolvedCount() == null
                ? 0
                : todayStat.getSolvedCount();

        int daysInARow = todayStat == null || todayStat.getDaysInARow() == null
                ? 0
                : todayStat.getDaysInARow();

        Integer totalSolvedCount = problemRepository.sumSolvedCount();
        if (totalSolvedCount == null) {
            totalSolvedCount = 0;
        }

        int level = calculateLevel(totalSolvedCount);

        HomeResponse.AchievementCard achievementCard = HomeConverter.toAchievementCard(
                todayFocusSeconds,
                accumulatedFocusSeconds,
                todaySolvedCount,
                totalSolvedCount,
                daysInARow,
                level,
                TODAY_GOAL_COUNT,
                todaySolvedCount
        );

        List<Folder> rootFolders = folderRepository.findAllByParentFolder_FolderIdOrderByFolderIdAsc(ROOT_FOLDER_ID);

        List<HomeResponse.RootFolderItem> rootFolderItems = rootFolders.stream()
                .map(folder -> {
                    Integer solvedProblemCount = problemRepository.countSolvedProblemsByFolderId(folder.getFolderId());
                    if (solvedProblemCount == null) {
                        solvedProblemCount = 0;
                    }
                    return HomeConverter.toRootFolderItem(folder, solvedProblemCount);
                })
                .toList();

        return HomeConverter.toGetHomeResponse(achievementCard, rootFolderItems);
    }

    private int calculateLevel(int totalSolvedCount) {
        if (totalSolvedCount >= 200) {
            return 5;
        }
        if (totalSolvedCount >= 120) {
            return 4;
        }
        if (totalSolvedCount >= 60) {
            return 3;
        }
        if (totalSolvedCount >= 20) {
            return 2;
        }
        return 1;
    }
}