package com.hhd1337.jatuli_quiz.common.exception.handler;

import com.hhd1337.jatuli_quiz.common.exception.GeneralException;
import com.hhd1337.jatuli_quiz.common.exception.code.ErrorReasonDTO;
import com.hhd1337.jatuli_quiz.common.exception.code.status.ErrorStatus;
import com.hhd1337.jatuli_quiz.common.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * 전역 예외 처리를 담당하는 클래스. 모든 컨트롤러에서 발생하는 예외를 가로채어 공통된 방식으로 응답을 반환한다.
 */
@Slf4j
@RestControllerAdvice(annotations = {RestController.class})  // @RestController가 붙은 컨트롤러에서 발생하는 예외 처리
public class ExceptionAdvice extends ResponseEntityExceptionHandler {

    /**
     * ConstraintViolationException 예외 처리 (DTO 유효성 검사 실패 시 발생).
     *
     * @param e       발생한 예외
     * @param request 웹 요청 정보
     * @return 에러 응답
     */
    @ExceptionHandler
    public ResponseEntity<Object> validation(ConstraintViolationException e, WebRequest request) {
        // 예외에서 첫 번째 에러 메시지를 추출
        String errorMessage = e.getConstraintViolations().stream()
                .map(constraintViolation -> constraintViolation.getMessage())
                .findFirst()
                .orElseThrow(() -> new RuntimeException("ConstraintViolationException 추출 도중 에러 발생"));

        // ErrorStatus에서 에러 메시지에 해당하는 상태를 찾아 응답 반환
        return handleExceptionInternalConstraint(e, ErrorStatus.valueOf(errorMessage), HttpHeaders.EMPTY, request);
    }

    /**
     * MethodArgumentNotValidException 예외 처리 (@Valid 실패 시 발생).
     *
     * @param e       발생한 예외
     * @param headers HTTP 헤더
     * @param status  HTTP 상태 코드
     * @param request 웹 요청 정보
     * @return 에러 응답
     */
    @Override
    public ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException e,
                                                               HttpHeaders headers,
                                                               HttpStatusCode status,
                                                               WebRequest request) {
        // 모든 필드 에러를 저장할 Map 초기화
        Map<String, String> errors = new LinkedHashMap<>();

        // 각 필드 에러 메시지를 Map에 추가 (중복 에러는 ','로 병합)
        e.getBindingResult().getFieldErrors().forEach(fieldError -> {
            String fieldName = fieldError.getField();
            String errorMessage = Optional.ofNullable(fieldError.getDefaultMessage()).orElse("");
            errors.merge(fieldName, errorMessage, (existingErrorMessage, newErrorMessage) ->
                    existingErrorMessage + ", " + newErrorMessage);
        });

        // BAD_REQUEST 상태로 응답 반환
        return handleExceptionInternalArgs(e, HttpHeaders.EMPTY, ErrorStatus.valueOf("_BAD_REQUEST"), request, errors);
    }

    /**
     * Exception (기본 예외) 처리. 예상하지 못한 예외가 발생했을 때 호출된다.
     *
     * @param e       발생한 예외
     * @param request 웹 요청 정보
     * @return 에러 응답
     */
    @ExceptionHandler
    public ResponseEntity<Object> exception(Exception e, WebRequest request) {
        // 예외 스택 트레이스 출력 (디버깅 목적)
        e.printStackTrace();

        // INTERNAL_SERVER_ERROR 상태로 응답 반환
        return handleExceptionInternalFalse(e, ErrorStatus._INTERNAL_SERVER_ERROR,
                HttpHeaders.EMPTY,
                ErrorStatus._INTERNAL_SERVER_ERROR.getHttpStatus(),
                request, e.getMessage());
    }

    /**
     * GeneralException 커스텀 예외 처리.
     *
     * @param generalException 커스텀 예외
     * @param request          웹 요청 정보
     * @return 에러 응답
     */
    @ExceptionHandler(value = GeneralException.class)
    public ResponseEntity onThrowException(GeneralException generalException, HttpServletRequest request) {
        // GeneralException에서 에러 상태 정보 추출
        ErrorReasonDTO errorReasonHttpStatus = generalException.getErrorReasonHttpStatus();

        // 에러 상태로 응답 반환
        return handleExceptionInternal(generalException, errorReasonHttpStatus, null, request);
    }

    /**
     * 공통 예외 처리 메서드 - HttpServletRequest를 기반으로 응답 반환.
     *
     * @param e       발생한 예외
     * @param reason  에러 상태 정보 (ErrorReasonDTO)
     * @param headers HTTP 헤더
     * @param request HTTP 서블릿 요청 객체
     * @return 에러 응답
     */
    private ResponseEntity<Object> handleExceptionInternal(Exception e, ErrorReasonDTO reason,
                                                           HttpHeaders headers, HttpServletRequest request) {
        // ApiResponse 객체를 생성하여 실패 응답 생성
        ApiResponse<Object> body = ApiResponse.onFailure(reason.getCode(), reason.getMessage(), null);

        WebRequest webRequest = new ServletWebRequest(request);

        // ResponseEntityExceptionHandler의 기본 예외 처리 메서드 호출
        return super.handleExceptionInternal(
                e,
                body,
                headers,
                reason.getHttpStatus(),
                webRequest
        );
    }

    /**
     * 공통 예외 처리 메서드 - 특정 에러 메시지를 포함하여 응답 반환.
     *
     * @param e                 발생한 예외
     * @param errorCommonStatus 에러 상태 (ErrorStatus)
     * @param headers           HTTP 헤더
     * @param status            HTTP 상태 코드
     * @param request           웹 요청 정보
     * @param errorPoint        에러 발생 지점 메시지
     * @return 에러 응답
     */
    private ResponseEntity<Object> handleExceptionInternalFalse(Exception e, ErrorStatus errorCommonStatus,
                                                                HttpHeaders headers, HttpStatus status,
                                                                WebRequest request, String errorPoint) {
        // 실패 응답에 에러 발생 지점 메시지 포함
        ApiResponse<Object> body = ApiResponse.onFailure(errorCommonStatus.getCode(), errorCommonStatus.getMessage(),
                errorPoint);

        return super.handleExceptionInternal(
                e,
                body,
                headers,
                status,
                request
        );
    }

    /**
     * 공통 예외 처리 메서드 - 유효성 검사 실패 필드 정보 포함.
     *
     * @param e                 발생한 예외
     * @param headers           HTTP 헤더
     * @param errorCommonStatus 에러 상태 (ErrorStatus)
     * @param request           웹 요청 정보
     * @param errorArgs         필드별 에러 정보 (Map)
     * @return 에러 응답
     */
    private ResponseEntity<Object> handleExceptionInternalArgs(Exception e, HttpHeaders headers,
                                                               ErrorStatus errorCommonStatus,
                                                               WebRequest request,
                                                               Map<String, String> errorArgs) {
        // 실패 응답에 필드별 에러 메시지 포함
        ApiResponse<Object> body = ApiResponse.onFailure(errorCommonStatus.getCode(), errorCommonStatus.getMessage(),
                errorArgs);

        return super.handleExceptionInternal(
                e,
                body,
                headers,
                errorCommonStatus.getHttpStatus(),
                request
        );
    }

    /**
     * 공통 예외 처리 메서드 - 제약 조건 위반 예외 처리.
     *
     * @param e                 발생한 예외
     * @param errorCommonStatus 에러 상태 (ErrorStatus)
     * @param headers           HTTP 헤더
     * @param request           웹 요청 정보
     * @return 에러 응답
     */
    private ResponseEntity<Object> handleExceptionInternalConstraint(Exception e, ErrorStatus errorCommonStatus,
                                                                     HttpHeaders headers, WebRequest request) {
        ApiResponse<Object> body = ApiResponse.onFailure(errorCommonStatus.getCode(), errorCommonStatus.getMessage(),
                null);

        return super.handleExceptionInternal(
                e,
                body,
                headers,
                errorCommonStatus.getHttpStatus(),
                request
        );
    }
}
