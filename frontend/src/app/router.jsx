import { createBrowserRouter } from "react-router-dom";
import AppShell from "./AppShell";

import HomePage from "../pages/home/HomePage";
import FolderBrowserPage from "../pages/folders/FolderBrowserPage";
import QuizPlayPage from "../pages/quiz/QuizPlayPage";
import QuizEditPage from "../pages/quiz/QuizEditPage";
import NotFoundPage from "../pages/error/NotFoundPage";
import HealthCheckPage from "../pages/test/HealthCheckPage";

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/folders/:folderId", element: <FolderBrowserPage /> },
      { path: "/quiz/play", element: <QuizPlayPage /> },
      { path: "/quiz/:quizId/edit", element: <QuizEditPage /> },
      { path: "/test/health", element: <HealthCheckPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);