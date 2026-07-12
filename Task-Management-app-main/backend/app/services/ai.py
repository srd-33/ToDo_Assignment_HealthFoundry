import httpx

from app.config import get_settings
from app.schemas import AIActionType


class AIServiceError(Exception):
    pass


def _build_prompt(action: AIActionType, title: str, description: str, status: str, due_date: str | None) -> tuple[str, str]:
    task_context = (
        f"Title: {title}\n"
        f"Description: {description or '(no description provided)'}\n"
        f"Status: {status}\n"
        f"Due date: {due_date or 'not set'}"
    )

    if action == AIActionType.explain:
        system = (
            "You are a helpful project assistant. Explain the given task clearly for a teammate "
            "who is seeing it for the first time. Cover the goal, key context, and what done looks like. "
            "Keep the response concise and well structured."
        )
        user = f"Explain this task:\n\n{task_context}"
    else:
        system = (
            "You are a senior engineer helping break work into an actionable plan. "
            "Produce a step-by-step implementation plan for the given task. "
            "Use numbered steps, note assumptions, and call out risks or dependencies when relevant."
        )
        user = f"Generate an implementation plan for this task:\n\n{task_context}"

    return system, user


def _demo_insight(
    action: AIActionType,
    title: str,
    description: str,
    status: str,
    due_date: str | None,
) -> str:
    """Offline fallback so the app can be demoed without an API key."""
    body = description.strip() or "No description was provided."
    if action == AIActionType.explain:
        return (
            f"(Demo AI - set OPENAI_API_KEY for live LLM responses)\n\n"
            f"## Explanation: {title}\n\n"
            f"This task is currently **{status.replace('_', ' ')}**"
            f"{f' and is due on {due_date}' if due_date else ' with no due date set'}.\n\n"
            f"**Goal**\n{body}\n\n"
            f"**What done looks like**\n"
            f"- The described outcome is completed and reviewed\n"
            f"- Related notes or edge cases from the description are addressed\n"
            f"- Status is updated to done"
        )
    return (
        f"(Demo AI - set OPENAI_API_KEY for live LLM responses)\n\n"
        f"## Implementation plan: {title}\n\n"
        f"1. Clarify scope from the description:\n   {body}\n"
        f"2. Break the work into small deliverables and note dependencies.\n"
        f"3. Implement the core change and write/update tests.\n"
        f"4. Validate against acceptance criteria and edge cases.\n"
        f"5. Update status to done"
        f"{f' before {due_date}' if due_date else ''} and share results."
    )


async def generate_task_insight(
    *,
    action: AIActionType,
    title: str,
    description: str,
    status: str,
    due_date: str | None,
) -> str:
    settings = get_settings()
    if not settings.openai_api_key or settings.openai_api_key == "your_openai_api_key_here":
        return _demo_insight(action, title, description, status, due_date)

    system, user = _build_prompt(action, title, description, status, due_date)
    url = f"{settings.openai_base_url.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.openai_api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.openai_model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "temperature": 0.4,
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, headers=headers, json=payload)
    except httpx.HTTPError as exc:
        raise AIServiceError(f"Failed to reach the LLM API: {exc}") from exc

    if response.status_code >= 400:
        detail = response.text[:500]
        raise AIServiceError(f"LLM API error ({response.status_code}): {detail}")

    data = response.json()
    try:
        content = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as exc:
        raise AIServiceError("Unexpected response format from the LLM API.") from exc

    if not content or not str(content).strip():
        raise AIServiceError("The LLM returned an empty response.")

    return str(content).strip()
