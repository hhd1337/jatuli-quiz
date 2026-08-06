package com.hhd1337.jatuli_quiz.domain.defense.service;

import com.hhd1337.jatuli_quiz.domain.defense.dto.DefenseQueueRequest;
import com.hhd1337.jatuli_quiz.domain.defense.dto.DefenseQueueResponse;

public interface DefenseQueueService {

    DefenseQueueResponse.GetDefenseQueueResponse getQueue();

    DefenseQueueResponse.GetDefenseQueueResponse addToQueue(
            DefenseQueueRequest.AddDefenseQueueEntryRequest request
    );

    DefenseQueueResponse.GetDefenseQueueResponse removeFromQueue(Long folderId);

    DefenseQueueResponse.GetDefenseQueueResponse reorderQueue(
            DefenseQueueRequest.ReorderDefenseQueueRequest request
    );
}
