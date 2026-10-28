from typing import List, Literal, Any, Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from .engine import (
    ACTIVITY_CATALOG,
    UserProfile,
    recommend,
    explain_recommendation,
)

app = FastAPI(
    title="Recommendation System API",
    version="1.0.0",
    description="Rekomendasi aktivitas berdasarkan minat, skill, habit, dan waktu.",
)

# Menambahkan CORS agar aman jika diakses langsung
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

class RecommendationRequest(BaseModel):
    interests: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    habits: List[str] = Field(default_factory=list)
    available_minutes: int = Field(default=30, ge=1, le=1440)
    preferred_difficulty: Literal["beginner", "intermediate", "any"] = "any"
    top_n: int = Field(default=5, ge=1, le=10)

@app.get("/health")
def health():
    return {"status": "ok", "service": "recommendation"}

@app.post("/recommend")
def get_recommendations(payload: RecommendationRequest):
    try:
        profile = UserProfile(
            interests=set(payload.interests),
            skills=set(payload.skills),
            habits=set(payload.habits),
            available_minutes=payload.available_minutes,
            preferred_difficulty=payload.preferred_difficulty,
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Inisialisasi profil gagal: {exc}")

    try:
        results = recommend(profile, ACTIVITY_CATALOG, top_n=payload.top_n)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Perhitungan rekomendasi gagal: {exc}")

    items = []
    for rank, result in enumerate(results, start=1):
        activity = result["activity"]
        items.append({
            "rank": rank,
            "id": getattr(activity, "id", rank),
            "title": getattr(activity, "title", "Aktivitas"),
            "description": getattr(activity, "description", ""),
            "duration_minutes": getattr(activity, "duration_minutes", 0),
            "difficulty": getattr(activity, "difficulty", "beginner"),
            "tags": sorted(list(getattr(activity, "tags", []))),
            "score": result.get("score", 0),
            "components": result.get("components", {}),
            "reason": explain_recommendation(result),
        })

    return {
        "count": len(items),
        "score_type": "suitability_score_not_probability",
        "recommendations": items,
        "message": (
            "Katalog aktivitas berhasil dimuat."
            if len(ACTIVITY_CATALOG) > 0 else
            "Katalog aktivitas belum berisi data."
        ),
    }