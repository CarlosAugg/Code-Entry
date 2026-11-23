import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { PlatformProvider } from "./context/PlatformContext";
import { AppLayout } from "./components/layout/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { TracksPage } from "./pages/TracksPage";
import { TrackDetailPage } from "./pages/TrackDetailPage";
import { LessonPage } from "./pages/LessonPage";
import { ChallengesPage } from "./pages/ChallengesPage";
import { ChallengeDetailPage } from "./pages/ChallengeDetailPage";
import { LabsPage } from "./pages/LabsPage";
import { AchievementsPage } from "./pages/AchievementsPage";
import { HistoryPage } from "./pages/HistoryPage";
import { RoadmapsPage } from "./pages/RoadmapsPage";
import { RoadmapDetailPage } from "./pages/RoadmapDetailPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { CoursesPage } from "./pages/CoursesPage";

export const App: React.FC = () => {
  return (
    <PlatformProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/trilhas" element={<TracksPage />} />
            <Route path="/trilhas/:trackId" element={<TrackDetailPage />} />
            <Route path="/trilhas/:trackId/aula/:lessonId" element={<LessonPage />} />
            <Route path="/roadmaps" element={<RoadmapsPage />} />
            <Route path="/roadmaps/:roadmapId" element={<RoadmapDetailPage />} />
            <Route path="/projetos" element={<ProjectsPage />} />
            <Route path="/plano-de-estudos" element={<CoursesPage />} />
            <Route path="/desafios" element={<ChallengesPage />} />
            <Route path="/desafios/:challengeId" element={<ChallengeDetailPage />} />
            <Route path="/laboratorios" element={<LabsPage />} />
            <Route path="/conquistas" element={<AchievementsPage />} />
            <Route path="/historico" element={<HistoryPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PlatformProvider>
  );
};

export default App;
