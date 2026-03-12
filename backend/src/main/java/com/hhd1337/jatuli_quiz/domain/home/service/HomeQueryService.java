package com.hhd1337.jatuli_quiz.domain.home.service;

import com.hhd1337.jatuli_quiz.domain.home.dto.HomeResponse;

public interface HomeQueryService {
    HomeResponse.GetHomeResponse getHome();
}