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
                    시험
                </strong>

                <p className="exam-entry-card__description">
                    선택한 범위의 문제 일괄 시험보기
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