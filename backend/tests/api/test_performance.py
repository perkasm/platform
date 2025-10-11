"""
Performance benchmarks for critical operations
"""

import pytest
import time
from unittest.mock import patch
from fastapi.testclient import TestClient


class TestPerformanceBenchmarks:
    """Performance benchmarks for critical operations"""

    def test_user_creation_performance(self, test_client, authenticated_user):
        """Benchmark user creation performance"""
        headers = authenticated_user["headers"]

        start_time = time.time()
        card_data = {
            "name": f"Performance Test Card {time.time()}",
            "card_type": "credit",
            "issuer": "Test Bank",
            "credit_limit": 5000.0,
            "annual_fee": 95.0,
            "has_welcome_bonus": False,
            "welcome_bonus_required": 0.0
        }
        response = test_client.post("/api/v1/cards/", json=card_data, headers=headers)
        end_time = time.time()

        execution_time = end_time - start_time
        print(f"Card creation time: {execution_time:.3f} seconds")

        assert response.status_code == 201
        # Should complete in under 1 second
        assert execution_time < 1.0

    def test_database_query_performance(self, db_session):
        """Benchmark database query performance"""
        from app.models.user import User
        from app.models.card import CreditCard

        # Create test data
        user = User(email=f"perf_test_{time.time()}@example.com", full_name="Performance Test User")
        db_session.add(user)
        db_session.commit()

        for i in range(10):
            card = CreditCard(
                user_id=user.id,
                name=f"Card {i}",
                card_type="credit",
                issuer="Test Bank",
                credit_limit=5000.0,
                available_credit=5000.0,
                current_balance=0.0,
                current_points=0
            )
            db_session.add(card)
        db_session.commit()

        start_time = time.time()
        result = db_session.query(CreditCard).filter(CreditCard.user_id == user.id).all()
        end_time = time.time()

        execution_time = end_time - start_time
        print(f"Database query time: {execution_time:.3f} seconds")

        assert len(result) == 10
        # Should complete in under 0.1 second
        assert execution_time < 0.1

    def test_jwt_token_creation_performance(self):
        """Benchmark JWT token creation performance"""
        from app.auth.service import create_access_token
        from datetime import timedelta

        data = {"sub": "performance_test@example.com"}

        start_time = time.time()
        result = create_access_token(data, expires_delta=timedelta(hours=1))
        end_time = time.time()

        execution_time = end_time - start_time
        print(f"JWT token creation time: {execution_time:.3f} seconds")

        assert isinstance(result, str)
        assert len(result) > 0
        # Should complete in under 0.01 second
        assert execution_time < 0.01

    @pytest.mark.asyncio
    async def test_chat_service_response_performance(self):
        """Benchmark AI chat service response generation"""
        from app.services.chat import ChatService
        from app.schemas.chat import ChatRequest

        request = ChatRequest(message="What are the best credit cards for travel?")

        start_time = time.time()
        result = await ChatService.generate_response(user_id=1, request=request)
        end_time = time.time()

        execution_time = end_time - start_time
        print(f"Chat service response time: {execution_time:.3f} seconds")

        assert result.content is not None
        assert len(result.content) > 0
        # Should complete in under 1 second
        assert execution_time < 1.0

    def test_api_endpoint_response_time(self, test_client, authenticated_user):
        """Benchmark API endpoint response time"""
        headers = authenticated_user["headers"]

        start_time = time.time()
        response = test_client.get("/api/v1/dashboard/", headers=headers)
        end_time = time.time()

        execution_time = end_time - start_time
        print(f"API endpoint response time: {execution_time:.3f} seconds")

        assert response.status_code == 200
        # Should complete in under 0.5 second
        assert execution_time < 0.5

    def test_concurrent_load_simulation(self, test_client, authenticated_user):
        """Simulate concurrent load on API endpoints"""
        import threading
        import concurrent.futures

        headers = authenticated_user["headers"]
        results = []

        def make_request(thread_id):
            start_time = time.time()
            response = test_client.get("/api/v1/dashboard/", headers=headers)
            end_time = time.time()
            results.append({
                'thread_id': thread_id,
                'status_code': response.status_code,
                'response_time': end_time - start_time
            })

        # Run 10 concurrent requests
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(make_request, i) for i in range(10)]
            concurrent.futures.wait(futures)

        # Verify all requests succeeded
        assert len(results) == 10
        assert all(r['status_code'] == 200 for r in results)

        # Check response times are reasonable (< 1 second each)
        assert all(r['response_time'] < 1.0 for r in results)

        # Calculate average response time
        avg_response_time = sum(r['response_time'] for r in results) / len(results)
        print(f"Average response time: {avg_response_time:.3f} seconds")

        # Should be well under 500ms for local testing
        assert avg_response_time < 0.5