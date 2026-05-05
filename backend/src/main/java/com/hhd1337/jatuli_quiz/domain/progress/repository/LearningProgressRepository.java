package com.hhd1337.jatuli_quiz.domain.progress.repository;

import com.hhd1337.jatuli_quiz.domain.progress.entity.LearningProgress;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LearningProgressRepository extends JpaRepository<LearningProgress, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select lp
            from LearningProgress lp
            where lp.progressKey = :progressKey
            """)
    Optional<LearningProgress> findByIdWithLock(@Param("progressKey") String progressKey);
}
