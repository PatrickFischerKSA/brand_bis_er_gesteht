const jsonHeaders = {
  "Content-Type": "application/json"
};

async function parseResponse(response) {
  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({ error: "Unbekannter Fehler" }));
    throw new Error(errorPayload.error || "Anfrage fehlgeschlagen.");
  }

  return response.json();
}

export async function fetchBootstrap(viewerId, projectId) {
  const params = new URLSearchParams({
    viewerId
  });

  if (projectId) {
    params.set("projectId", projectId);
  }

  const response = await fetch(`/api/bootstrap?${params.toString()}`);
  return parseResponse(response);
}

export async function createProject(payload) {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });
  return parseResponse(response);
}

export async function createAnnotation(workspaceId, payload) {
  const response = await fetch(`/api/workspaces/${workspaceId}/annotations`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });
  return parseResponse(response);
}

export async function updateAnnotation(annotationId, payload) {
  const response = await fetch(`/api/annotations/${annotationId}`, {
    method: "PATCH",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });
  return parseResponse(response);
}

export async function createComment(annotationId, payload) {
  const response = await fetch(`/api/annotations/${annotationId}/comments`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });
  return parseResponse(response);
}

export async function requestFeedback(annotationId, viewerId) {
  const response = await fetch(`/api/annotations/${annotationId}/feedback`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ viewerId })
  });
  return parseResponse(response);
}

export async function saveWorkspaceVersion(workspaceId, payload) {
  const response = await fetch(`/api/workspaces/${workspaceId}/versions`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });
  return parseResponse(response);
}

export async function compareVersions(workspaceId, baseVersionId, headVersionId) {
  const response = await fetch(`/api/workspaces/${workspaceId}/versions/${baseVersionId}/compare/${headVersionId}`);
  return parseResponse(response);
}

export async function submitWorkspace(workspaceId, payload) {
  const response = await fetch(`/api/workspaces/${workspaceId}/submissions`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });
  return parseResponse(response);
}

export async function createSubmissionReview(submissionId, payload) {
  const response = await fetch(`/api/submissions/${submissionId}/reviews`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });
  return parseResponse(response);
}
