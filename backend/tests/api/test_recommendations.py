import pytest
from fastapi.testclient import TestClient


class TestRecommendationsAPI:
    """Test cases for recommendations API endpoints"""

    def test_get_recommendations(self, test_client, authenticated_user):
        """Test getting card recommendations"""
        headers = authenticated_user["headers"]

        response = test_client.get("/api/v1/recommendations/", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert "recommendations" in data
        assert "total" in data
        assert "generated_at" in data
        assert isinstance(data["recommendations"], list)
        assert data["total"] >= 0

        if data["recommendations"]:
            rec = data["recommendations"][0]
            assert "id" in rec
            assert "name" in rec
            assert "issuer" in rec
            assert "category" in rec
            assert "welcome_bonus" in rec
            assert "annual_fee" in rec
            assert "estimated_value" in rec
            assert "key_benefits" in rec
            assert "match_reason" in rec
            assert "match_score" in rec
            assert "affiliate_disclosure" in rec

            # Validate score range
            assert 0 <= rec["match_score"] <= 100
            assert isinstance(rec["key_benefits"], list)

    def test_get_recommendations_unauthorized(self, test_client):
        """Test getting recommendations without authentication"""
        response = test_client.get("/api/v1/recommendations/")

        assert response.status_code == 401

    def test_get_recommendations_with_limit(self, test_client, authenticated_user):
        """Test getting recommendations with custom limit"""
        headers = authenticated_user["headers"]

        # Test with limit=1
        response = test_client.get("/api/v1/recommendations/?limit=1", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert len(data["recommendations"]) <= 1
        assert data["total"] <= 1

    def test_get_recommendations_limit_bounds(self, test_client, authenticated_user):
        """Test recommendations limit parameter bounds"""
        headers = authenticated_user["headers"]

        # Test minimum limit (1)
        response = test_client.get("/api/v1/recommendations/?limit=1", headers=headers)
        assert response.status_code == 200

        # Test maximum limit (10)
        response = test_client.get("/api/v1/recommendations/?limit=10", headers=headers)
        assert response.status_code == 200

        # Test invalid limit (0) - should fail validation
        response = test_client.get("/api/v1/recommendations/?limit=0", headers=headers)
        assert response.status_code == 422

        # Test invalid limit (11) - should fail validation
        response = test_client.get("/api/v1/recommendations/?limit=11", headers=headers)
        assert response.status_code == 422

    def test_recommendations_structure(self, test_client, authenticated_user):
        """Test that recommendations have proper structure and data types"""
        headers = authenticated_user["headers"]

        response = test_client.get("/api/v1/recommendations/", headers=headers)

        assert response.status_code == 200
        data = response.json()

        for rec in data["recommendations"]:
            # Check required string fields
            assert isinstance(rec["id"], str)
            assert isinstance(rec["name"], str)
            assert isinstance(rec["issuer"], str)
            assert isinstance(rec["category"], str)
            assert isinstance(rec["welcome_bonus"], str)
            assert isinstance(rec["match_reason"], str)

            # Check numeric fields
            assert isinstance(rec["annual_fee"], (int, float))
            assert isinstance(rec["estimated_value"], (int, float))
            assert isinstance(rec["match_score"], (int, float))

            # Check boolean field
            assert isinstance(rec["affiliate_disclosure"], bool)

            # Check list field
            assert isinstance(rec["key_benefits"], list)
            for benefit in rec["key_benefits"]:
                assert isinstance(benefit, str)