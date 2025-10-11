import pytest
from fastapi.testclient import TestClient


class TestDashboardAPI:
    """Test cases for dashboard API endpoints"""

    def test_get_dashboard(self, test_client, authenticated_user, db_session):
        """Test getting complete dashboard data"""
        headers = authenticated_user["headers"]

        response = test_client.get("/api/v1/dashboard/", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert "metrics" in data
        assert "alerts" in data
        assert "upcoming_actions" in data

        # Check metrics structure
        metrics = data["metrics"]
        assert "total_points" in metrics
        assert "total_available_credit" in metrics
        assert "average_utilization" in metrics
        assert "cards_count" in metrics
        assert "monthly_spending" in metrics
        assert "monthly_points_earned" in metrics
        assert "estimated_annual_value" in metrics

        # Check alerts structure
        assert isinstance(data["alerts"], list)
        if data["alerts"]:
            alert = data["alerts"][0]
            assert "id" in alert
            assert "type" in alert
            assert "title" in alert
            assert "message" in alert
            assert "created_at" in alert

        # Check upcoming actions structure
        assert isinstance(data["upcoming_actions"], list)

    def test_get_dashboard_unauthorized(self, test_client):
        """Test getting dashboard without authentication"""
        response = test_client.get("/api/v1/dashboard/")

        assert response.status_code == 401

    def test_get_metrics(self, test_client, authenticated_user):
        """Test getting dashboard metrics only"""
        headers = authenticated_user["headers"]

        response = test_client.get("/api/v1/dashboard/metrics", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert "total_points" in data
        assert "total_available_credit" in data
        assert "average_utilization" in data
        assert "cards_count" in data
        assert "monthly_spending" in data
        assert "monthly_points_earned" in data
        assert "estimated_annual_value" in data

        # Ensure all values are non-negative
        assert data["total_points"] >= 0
        assert data["total_available_credit"] >= 0
        assert 0 <= data["average_utilization"] <= 100
        assert data["cards_count"] >= 0
        assert data["monthly_spending"] >= 0
        assert data["monthly_points_earned"] >= 0
        assert data["estimated_annual_value"] >= 0

    def test_get_metrics_unauthorized(self, test_client):
        """Test getting metrics without authentication"""
        response = test_client.get("/api/v1/dashboard/metrics")

        assert response.status_code == 401

    def test_get_alerts(self, test_client, authenticated_user):
        """Test getting alerts"""
        headers = authenticated_user["headers"]

        response = test_client.get("/api/v1/dashboard/alerts", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

        if data:
            alert = data[0]
            assert "id" in alert
            assert "type" in alert
            assert "title" in alert
            assert "message" in alert
            assert "created_at" in alert
            assert alert["type"] in ["info", "warning", "error", "success"]

    def test_get_alerts_unauthorized(self, test_client):
        """Test getting alerts without authentication"""
        response = test_client.get("/api/v1/dashboard/alerts")

        assert response.status_code == 401