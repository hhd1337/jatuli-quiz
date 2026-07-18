import { Link } from "react-router-dom";

export default function ExamEntryCard() {
    return (
        <Link
            to="/exam/setup"
            className="exam-entry-card"
        >
            <div className="exam-entry-card__icon">
                📝
            </div>

            <div className="exam-entry-card__content">
                <strong className="exam-entry-card__title">
                    시험보기
                </strong>

                <p className="exam-entry-card__description">
                    여러 문제를 선택하고 제한 시간 안에
                    한 번에 풀어보세요.
                </p>
            </div>

            <span
                className="exam-entry-card__arrow"
                aria-hidden="true"
            >
                ›
            </span>
        </Link>
    );
}