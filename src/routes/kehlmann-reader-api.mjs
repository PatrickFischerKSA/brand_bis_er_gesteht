import { Router } from "express";
import { evaluateReaderSebFeedback } from "../services/kehlmann-reader-feedback.mjs";
import {
  buildReaderBootstrap,
  buildTeacherOverview,
  createClassroom,
  readReaderStore,
  regenerateClassroomCode,
  savePeerReview,
  saveReaderProgress,
  updateClassroomSettings,
  updateReaderStore
} from "../services/kehlmann-reader-store.mjs";
import { parseCookies } from "../services/access.mjs";

export const kehlmannReaderApiRouter = Router();

const STUDENT_COOKIE = "kehlmann_reader_student";
function getStudentId(request) {
  return parseCookies(request.headers.cookie || "")[STUDENT_COOKIE] || null;
}

function hasTeacherAccess(request) {
  return true;
}

function badRequest(response, message, status = 400) {
  response.status(status).json({ error: message });
}

kehlmannReaderApiRouter.get("/bootstrap", async (request, response) => {
  const store = await readReaderStore();
  const studentId = getStudentId(request);
  if (!studentId) {
    return badRequest(response, "Reader-Sitzung fehlt.", 401);
  }

  const bootstrap = buildReaderBootstrap(store, studentId);
  if (!bootstrap) {
    return badRequest(response, "Reader-Sitzung nicht gefunden.", 401);
  }

  response.json(bootstrap);
});

kehlmannReaderApiRouter.post("/progress", async (request, response) => {
  const studentId = getStudentId(request);
  if (!studentId) {
    return badRequest(response, "Reader-Sitzung fehlt.", 401);
  }

  try {
    const result = await updateReaderStore(async (store) => {
      saveReaderProgress(store, studentId, request.body);
      return buildReaderBootstrap(store, studentId);
    });

    response.json(result);
  } catch (error) {
    badRequest(response, error.message);
  }
});

kehlmannReaderApiRouter.post("/reviews/:reviewId", async (request, response) => {
  const studentId = getStudentId(request);
  if (!studentId) {
    return badRequest(response, "Reader-Sitzung fehlt.", 401);
  }

  try {
    const result = await updateReaderStore(async (store) => {
      savePeerReview(store, studentId, request.params.reviewId, request.body);
      return buildReaderBootstrap(store, studentId);
    });

    response.json(result);
  } catch (error) {
    badRequest(response, error.message);
  }
});

kehlmannReaderApiRouter.post("/seb-feedback", async (request, response) => {
  const studentId = getStudentId(request);
  if (!studentId) {
    return badRequest(response, "Reader-Sitzung fehlt.", 401);
  }

  try {
    const { lessonId, moduleId, entryId, theoryId, note = {} } = request.body;
    if (!lessonId || !moduleId || !entryId || !theoryId) {
      return badRequest(response, "lessonId, moduleId, entryId und theoryId sind erforderlich.");
    }

    response.json(evaluateReaderSebFeedback({
      lessonId,
      moduleId,
      entryId,
      theoryId,
      note
    }));
  } catch (error) {
    badRequest(response, error.message);
  }
});

kehlmannReaderApiRouter.get("/teacher/bootstrap", async (request, response) => {
  if (!hasTeacherAccess(request)) {
    return badRequest(response, "Lehrer*innen-Zugang erforderlich.", 401);
  }

  const store = await readReaderStore();
  response.json(buildTeacherOverview(store));
});

kehlmannReaderApiRouter.post("/teacher/classes", async (request, response) => {
  if (!hasTeacherAccess(request)) {
    return badRequest(response, "Lehrer*innen-Zugang erforderlich.", 401);
  }

  try {
    const result = await updateReaderStore(async (store) => {
      createClassroom(store, request.body);
      return buildTeacherOverview(store);
    });
    response.status(201).json(result);
  } catch (error) {
    badRequest(response, error.message);
  }
});

kehlmannReaderApiRouter.patch("/teacher/classes/:classId", async (request, response) => {
  if (!hasTeacherAccess(request)) {
    return badRequest(response, "Lehrer*innen-Zugang erforderlich.", 401);
  }

  try {
    const result = await updateReaderStore(async (store) => {
      updateClassroomSettings(store, request.params.classId, request.body);
      return buildTeacherOverview(store);
    });
    response.json(result);
  } catch (error) {
    badRequest(response, error.message);
  }
});

kehlmannReaderApiRouter.post("/teacher/classes/:classId/regenerate", async (request, response) => {
  if (!hasTeacherAccess(request)) {
    return badRequest(response, "Lehrer*innen-Zugang erforderlich.", 401);
  }

  try {
    const result = await updateReaderStore(async (store) => {
      regenerateClassroomCode(store, request.params.classId);
      return buildTeacherOverview(store);
    });
    response.json(result);
  } catch (error) {
    badRequest(response, error.message);
  }
});
