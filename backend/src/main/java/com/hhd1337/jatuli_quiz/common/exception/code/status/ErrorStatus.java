package com.hhd1337.jatuli_quiz.common.exception.code.status;

import com.hhd1337.jatuli_quiz.common.exception.code.BaseErrorCode;
import com.hhd1337.jatuli_quiz.common.exception.code.ErrorReasonDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorStatus implements BaseErrorCode {

    // 일반적인 응답
    _INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "COMMON500", "서버 에러, 관리자에게 문의 바랍니다."),
    _BAD_REQUEST(HttpStatus.BAD_REQUEST, "COMMON400", "잘못된 요청입니다."),
    _UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "COMMON401", "인증이 필요합니다."),
    _FORBIDDEN(HttpStatus.FORBIDDEN, "COMMON403", "금지된 요청입니다."),

    // 폴더 관련 에러
    FOLDER_NOT_FOUND(HttpStatus.NOT_FOUND, "FOLDER4041", "존재하지 않는 폴더입니다."),
    FOLDER_NOT_LEAF(HttpStatus.BAD_REQUEST, "FOLDER4001", "연습 문제 조회는 leaf 폴더에서만 가능합니다."),

    // 문제 관련 에러
    PROBLEM_NOT_FOUND(HttpStatus.NOT_FOUND, "PROBLEM4041", "존재하지 않는 문제입니다.");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;

    @Override
    public ErrorReasonDTO getReason() {
        return ErrorReasonDTO.builder()
                .message(message)
                .code(code)
                .isSuccess(false)
                .build();
    }

    @Override
    public ErrorReasonDTO getReasonHttpStatus() {
        return ErrorReasonDTO.builder()
                .message(message)
                .code(code)
                .isSuccess(false)
                .httpStatus(httpStatus)
                .build();
    }
}