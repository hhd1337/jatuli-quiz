package com.hhd1337.jatuli_quiz.domain.home.service;

import com.hhd1337.jatuli_quiz.domain.dailystat.entity.DailyStat;
import com.hhd1337.jatuli_quiz.domain.dailystat.repository.DailyStatRepository;
import com.hhd1337.jatuli_quiz.domain.folder.entity.Folder;
import com.hhd1337.jatuli_quiz.domain.folder.repository.FolderRepository;
import com.hhd1337.jatuli_quiz.domain.home.converter.HomeConverter;
import com.hhd1337.jatuli_quiz.domain.home.dto.HomeResponse;
import com.hhd1337.jatuli_quiz.domain.problem.repository.ProblemRepository;
import com.hhd1337.jatuli_quiz.domain.progress.entity.LearningProgress;
import com.hhd1337.jatuli_quiz.domain.progress.repository.LearningProgressRepository;
import java.time.LocalDate;
import java.time.ZoneId;
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
    private static final ZoneId SERVICE_ZONE = ZoneId.of("Asia/Seoul");

    private final DailyStatRepository dailyStatRepository;
    private final FolderRepository folderRepository;
    private final ProblemRepository problemRepository;
    private final LearningProgressRepository learningProgressRepository;

    @Override
    public HomeResponse.GetHomeResponse getHome() {
        LocalDate today = LocalDate.now(SERVICE_ZONE);

        DailyStat todayStat = dailyStatRepository.findByStatDate(today).orElse(null);
        LearningProgress learningProgress = getLearningProgressOrNull();

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

        int level = getCurrentLevel(learningProgress);

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

        HomeResponse.BookmarkCycleProgress bookmarkCycleProgress =
                getBookmarkCycleProgress(learningProgress);

        List<Folder> rootFolders = folderRepository.findAllByParentFolder_FolderIdOrderByFolderIdAsc(ROOT_FOLDER_ID);

        List<HomeResponse.RootFolderItem> rootFolderItems = rootFolders.stream()
                .map(this::toRootFolderItem)
                .toList();

        return HomeConverter.toGetHomeResponse(
                achievementCard,
                bookmarkCycleProgress,
                rootFolderItems
        );
    }

    private LearningProgress getLearningProgressOrNull() {
        return learningProgressRepository
                .findById(LearningProgress.SINGLE_USER_PROGRESS_KEY)
                .orElse(null);
    }

    private int getCurrentLevel(LearningProgress learningProgress) {
        if (learningProgress == null) {
            return 1;
        }

        return learningProgress.getLevel();
    }

    private int getCurrentBookmarkedRoundNo(LearningProgress learningProgress) {
        if (learningProgress == null || learningProgress.getCurrentBookmarkedRoundNo() == null) {
            return 1;
        }

        return learningProgress.getCurrentBookmarkedRoundNo();
    }

    private HomeResponse.BookmarkCycleProgress getBookmarkCycleProgress(
            LearningProgress learningProgress
    ) {
        int currentBookmarkedRoundNo = getCurrentBookmarkedRoundNo(learningProgress);

        int totalBookmarkedProblemCount = problemRepository.countByIsBookmarkedTrue();

        int currentCycleSolvedProblemCount =
                problemRepository.countByIsBookmarkedTrueAndLastPracticedBookmarkedRoundNoGreaterThanEqual(
                        currentBookmarkedRoundNo
                );

        return HomeConverter.toBookmarkCycleProgress(
                currentBookmarkedRoundNo,
                totalBookmarkedProblemCount,
                currentCycleSolvedProblemCount
        );
    }

    private HomeResponse.RootFolderItem toRootFolderItem(Folder folder) {
        FolderStats stats = calculateFolderStats(folder);

        return HomeConverter.toRootFolderItem(
                folder,
                stats.solved(),
                stats.total()
        );
    }

    private FolderStats calculateFolderStats(Folder folder) {
        int total = problemRepository.countByFolder(folder);
        int solved = problemRepository.countByFolderAndSolvedCountGreaterThan(folder, 0);

        List<Folder> children = folderRepository.findAllByParentFolder_FolderIdOrderByFolderIdAsc(folder.getFolderId());

        for (Folder child : children) {
            FolderStats childStats = calculateFolderStats(child);
            total += childStats.total();
            solved += childStats.solved();
        }

        return new FolderStats(total, solved);
    }

    private record FolderStats(int total, int solved) {
    }
}