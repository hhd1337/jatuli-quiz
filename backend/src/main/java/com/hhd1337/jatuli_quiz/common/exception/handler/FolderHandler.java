package com.hhd1337.jatuli_quiz.common.exception.handler;

import com.hhd1337.jatuli_quiz.common.exception.GeneralException;
import com.hhd1337.jatuli_quiz.common.exception.code.status.ErrorStatus;

public class FolderHandler extends GeneralException {
    public FolderHandler(ErrorStatus errorStatus) {
        super(errorStatus);
    }
}
