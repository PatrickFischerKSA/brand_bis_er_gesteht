const defaultDraft = () => ({
  annotationId: null,
  segmentId: null,
  taskId: "",
  type: "deutungshypothese",
  tags: "",
  quote: "",
  body: ""
});

const defaultProjectDraft = () => ({
  title: "",
  author: "",
  genre: "Erzählung",
  gradeLevel: "",
  timeframe: "",
  workMode: "Individuelle Arbeitskopien mit Peer-Review",
  assessmentMode: "Rubrik + Entwicklungsfeedback",
  studentVisibility: "course-on-submission",
  reviewAssignmentsPerStudent: "2",
  feedbackFocus: "Textnähe, Belegarbeit, Interpretationsplausibilität",
  annotationPrompt: "",
  interpretationPrompt: "",
  segmentsRaw: ""
});

export const state = {
  bootstrap: null,
  viewerId: "user-teacher-mara",
  selectedProjectId: null,
  selectedWorkspaceId: null,
  selectedSegmentId: null,
  selectedAnnotationId: null,
  compareResult: null,
  commentDraft: "",
  reviewDraft: "",
  filters: {
    type: "all"
  },
  annotationDraft: defaultDraft(),
  projectDraft: defaultProjectDraft()
};

export function resetDraft(overrides = {}) {
  state.annotationDraft = {
    ...defaultDraft(),
    ...overrides
  };
}

export function resetProjectDraft(overrides = {}) {
  state.projectDraft = {
    ...defaultProjectDraft(),
    ...overrides
  };
}

export function applyBootstrap(bootstrap) {
  state.bootstrap = bootstrap;
  state.viewerId = bootstrap.viewer.id;
  state.selectedProjectId = bootstrap.currentProjectId;

  const workspaceExists = bootstrap.workspaces.some((workspace) => workspace.id === state.selectedWorkspaceId);
  if (!workspaceExists) {
    state.selectedWorkspaceId = bootstrap.primaryWorkspaceId;
  }

  const currentWorkspace = bootstrap.workspaces.find((workspace) => workspace.id === state.selectedWorkspaceId);
  const selectedSegmentStillVisible = bootstrap.segments.some((segment) => segment.id === state.selectedSegmentId);
  if (!selectedSegmentStillVisible) {
    state.selectedSegmentId = bootstrap.segments[0]?.id || null;
  }

  const currentAnnotationExists = currentWorkspace?.annotations.some((annotation) => annotation.id === state.selectedAnnotationId);
  if (!currentAnnotationExists) {
    state.selectedAnnotationId = currentWorkspace?.annotations[0]?.id || null;
  }

  state.annotationDraft.segmentId = state.selectedSegmentId;
}

export function getSelectedWorkspace() {
  return state.bootstrap?.workspaces.find((workspace) => workspace.id === state.selectedWorkspaceId) || null;
}

export function getSelectedAnnotation() {
  const workspace = getSelectedWorkspace();
  return workspace?.annotations.find((annotation) => annotation.id === state.selectedAnnotationId) || null;
}
