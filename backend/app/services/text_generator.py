from app.schemas import GenerateTextRequest, GenerateTextResponse


def generate_text(req: GenerateTextRequest) -> GenerateTextResponse:
    return GenerateTextResponse(
        title="仮タイトル",
        text=f"{req.topic}|{req.length}|{req.style}|{req.level} についてのサンプル文章です。"
    )