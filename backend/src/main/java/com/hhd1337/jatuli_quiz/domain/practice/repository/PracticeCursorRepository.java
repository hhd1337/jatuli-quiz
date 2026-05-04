package com.hhd1337.jatuli_quiz.domain.practice.repository;

import com.hhd1337.jatuli_quiz.domain.practice.entity.PracticeCursor;
import com.hhd1337.jatuli_quiz.domain.practice.entity.PracticeCursorType;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PracticeCursorRepository extends JpaRepository<PracticeCursor, Long> {

    Optional<PracticeCursor> findByCursorType(PracticeCursorType cursorType);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select pc
            from PracticeCursor pc
            where pc.cursorType = :cursorType
            """)
    Optional<PracticeCursor> findByCursorTypeWithLock(
            @Param("cursorType") PracticeCursorType cursorType
    );
}
