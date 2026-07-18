import { createBrowserRouter } from "react-router-dom";

import AppShell from "./AppShell.jsx";

import LoginPage from "../pages/auth/LoginPage.jsx";
import HomePage from "../pages/home/HomePage.jsx";
import QuizPlayPage from "../pages/quiz/QuizPlayPage.jsx";
import RoutinePage from "../pages/routine/RoutinePage.jsx";
import NotFoundPage from "../pages/error/NotFoundPage.jsx";
import HealthCheckPage from "../pages/test/HealthCheckPage.jsx";
import MentorPlanPage from "../pages/mentor/MentorPlanPage.jsx";
import DailyReviewPage from "../pages/mentor/DailyReviewPage.jsx";

export const router = createBrowserRouter([
    {
        element: <AppShell />,
        children: [
            {
                path: "/",
                element: <HomePage />,
            },
            {
                path: "/quiz/play",
                element: <QuizPlayPage />,
            },
            {
                path: "/routine",
                element: <RoutinePage />,
            },
            {
                path: "/mentor/plans",
                element: <MentorPlanPage />,
            },
            {
                path: "/mentor/daily-review",
                element: <DailyReviewPage />,
            },
            {
                path: "/test/health",
                element: <HealthCheckPage />,
            },
            {
                path: "/login",
                element: <LoginPage />,
            },
            {
                path: "*",
                element: <NotFoundPage />,
            },
        ],
    },
]);