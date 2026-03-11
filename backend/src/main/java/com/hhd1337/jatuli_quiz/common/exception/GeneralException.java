package com.hhd1337.jatuli_quiz.common.exception;

import com.hhd1337.jatuli_quiz.common.exception.code.BaseErrorCode;
import com.hhd1337.jatuli_quiz.common.exception.code.ErrorReasonDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class GeneralException extends RuntimeException {

    private BaseErrorCode code;

    public ErrorReasonDTO getErrorReason() {
        return this.code.getReason();
    }

    public ErrorReasonDTO getErrorReasonHttpStatus() {
        return this.code.getReasonHttpStatus();
    }
}
