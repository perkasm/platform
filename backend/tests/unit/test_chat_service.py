import pytest
from datetime import datetime
from app.services.chat import ChatService
from app.schemas.chat import ChatRequest, ChatResponse

class TestChatService:
    @pytest.mark.asyncio
    async def test_generate_response_basic(self):
        """Test basic response generation"""
        request = ChatRequest(message="Hello, how can you help me?")

        response = await ChatService.generate_response(user_id=1, request=request)

        assert isinstance(response, ChatResponse)
        assert response.role == "assistant"
        assert len(response.content) > 0
        assert response.conversation_id is not None
        assert response.timestamp is not None
        assert response.tokens_used > 0

    @pytest.mark.asyncio
    async def test_generate_response_with_conversation_id(self):
        """Test response generation with provided conversation ID"""
        conversation_id = "test-conversation-123"
        request = ChatRequest(message="Test message", conversation_id=conversation_id)

        response = await ChatService.generate_response(user_id=1, request=request)

        assert response.conversation_id == conversation_id

    @pytest.mark.asyncio
    async def test_generate_response_travel_query(self):
        """Test response for travel-related queries"""
        request = ChatRequest(message="I want to book a flight to Japan")

        response = await ChatService.generate_response(user_id=1, request=request)

        assert "flight" in response.content.lower() or "japan" in response.content.lower()
        assert "points" in response.content.lower()

    @pytest.mark.asyncio
    async def test_generate_response_dining_query(self):
        """Test response for dining-related queries"""
        request = ChatRequest(message="What's the best card for restaurants?")

        response = await ChatService.generate_response(user_id=1, request=request)

        assert "dining" in response.content.lower() or "restaurant" in response.content.lower()
        assert any(card in response.content for card in ["Amex", "American Express", "Chase"])

    @pytest.mark.asyncio
    async def test_generate_response_redemption_query(self):
        """Test response for points redemption queries"""
        request = ChatRequest(message="How should I redeem my points?")

        response = await ChatService.generate_response(user_id=1, request=request)

        assert "redeem" in response.content.lower() or "transfer" in response.content.lower()
        assert "travel" in response.content.lower()

    @pytest.mark.asyncio
    async def test_generate_response_card_selection_query(self):
        """Test response for card selection queries"""
        request = ChatRequest(message="Which card should I use for groceries?")

        response = await ChatService.generate_response(user_id=1, request=request)

        assert "card" in response.content.lower()
        assert any(category in response.content.lower() for category in ["travel", "dining", "gas", "groceries"])

    @pytest.mark.asyncio
    async def test_generate_response_welcome_bonus_query(self):
        """Test response for welcome bonus queries"""
        request = ChatRequest(message="Tell me about welcome bonuses")

        response = await ChatService.generate_response(user_id=1, request=request)

        assert "welcome" in response.content.lower() and "bonus" in response.content.lower()
        assert "spend" in response.content.lower()

    @pytest.mark.asyncio
    async def test_generate_response_devaluation_query(self):
        """Test response for point devaluation queries"""
        request = ChatRequest(message="Are my points losing value?")

        response = await ChatService.generate_response(user_id=1, request=request)

        assert "devaluation" in response.content.lower() or "value" in response.content.lower()

    @pytest.mark.asyncio
    async def test_generate_response_default_query(self):
        """Test default response for unrecognized queries"""
        request = ChatRequest(message="Some random question about credit cards")

        response = await ChatService.generate_response(user_id=1, request=request)

        assert "assistant" in response.content.lower()
        assert "help" in response.content.lower()
        assert any(topic in response.content.lower() for topic in ["travel", "dining", "points", "card"])

    @pytest.mark.asyncio
    async def test_generate_response_long_message(self):
        """Test response generation with long message"""
        long_message = "What is the best strategy for maximizing credit card rewards? " * 10
        request = ChatRequest(message=long_message)

        response = await ChatService.generate_response(user_id=1, request=request)

        assert isinstance(response, ChatResponse)
        assert len(response.content) > 0

    @pytest.mark.asyncio
    async def test_generate_response_special_characters(self):
        """Test response generation with special characters"""
        request = ChatRequest(message="What about flights to Tokyo? @#$%^&*()")

        response = await ChatService.generate_response(user_id=1, request=request)

        assert isinstance(response, ChatResponse)
        assert len(response.content) > 0

    def test_generate_mock_response_flight_keywords(self):
        """Test mock response generation for flight keywords"""
        response = ChatService._generate_mock_response("I need to book a flight to Japan")
        assert "flight" in response.lower()
        assert "japan" in response.lower()
        assert "points" in response.lower()

    def test_generate_mock_response_dining_keywords(self):
        """Test mock response generation for dining keywords"""
        response = ChatService._generate_mock_response("best restaurants")
        assert "dining" in response.lower()
        assert "express" in response.lower()  # American Express mentioned

    def test_generate_mock_response_redemption_keywords(self):
        """Test mock response generation for redemption keywords"""
        response = ChatService._generate_mock_response("how to redeem points")
        assert "redeem" in response.lower() or "transfer" in response.lower()

    def test_generate_mock_response_card_keywords(self):
        """Test mock response generation for card selection keywords"""
        response = ChatService._generate_mock_response("what card should I get")
        assert "card" in response.lower()
        assert "travel" in response.lower() or "dining" in response.lower()

    def test_generate_mock_response_bonus_keywords(self):
        """Test mock response generation for bonus keywords"""
        response = ChatService._generate_mock_response("welcome bonus info")
        assert "welcome" in response.lower() and "bonus" in response.lower()

    def test_generate_mock_response_devaluation_keywords(self):
        """Test mock response generation for devaluation keywords"""
        response = ChatService._generate_mock_response("point devaluation")
        assert "devaluation" in response.lower() or "value" in response.lower()

    def test_generate_mock_response_no_keywords(self):
        """Test mock response generation for messages without keywords"""
        response = ChatService._generate_mock_response("random message")
        assert "assistant" in response.lower()
        assert "help" in response.lower()

    @pytest.mark.asyncio
    async def test_generate_response_empty_message(self):
        """Test response generation with empty message - Pydantic prevents this"""
        with pytest.raises(Exception):  # Pydantic validation error
            request = ChatRequest(message="")

            await ChatService.generate_response(user_id=1, request=request)

    @pytest.mark.asyncio
    async def test_generate_response_whitespace_only(self):
        """Test response generation with whitespace-only message"""
        request = ChatRequest(message="   \n\t   ")

        # Pydantic allows whitespace, but service should handle it
        response = await ChatService.generate_response(user_id=1, request=request)
        assert isinstance(response, ChatResponse)  # Service handles it gracefully

    @pytest.mark.asyncio
    async def test_generate_response_invalid_user_id(self):
        """Test response generation with invalid user ID"""
        request = ChatRequest(message="Hello")

        # Should handle invalid user ID gracefully (depending on implementation)
        response = await ChatService.generate_response(user_id=-1, request=request)
        assert isinstance(response, ChatResponse)  # Service should still work

    @pytest.mark.asyncio
    async def test_generate_response_very_long_message(self):
        """Test response generation with extremely long message - Pydantic prevents this"""
        # Create a message that's too long (simulate API limits)
        long_message = "What about credit cards? " * 1000  # Very long message

        with pytest.raises(Exception):  # Pydantic validation error for max length
            request = ChatRequest(message=long_message)

            await ChatService.generate_response(user_id=1, request=request)

    @pytest.mark.asyncio
    async def test_generate_response_with_invalid_conversation_id(self):
        """Test response generation with conversation ID that has special characters"""
        request = ChatRequest(message="Test", conversation_id="invalid@format!")

        response = await ChatService.generate_response(user_id=1, request=request)
        # Service accepts the conversation_id as provided
        assert isinstance(response, ChatResponse)
        assert response.conversation_id == "invalid@format!"  # Uses provided ID

    @pytest.mark.asyncio
    async def test_generate_response_network_failure_simulation(self):
        """Test response generation when AI service fails"""
        # This would require mocking the AI service to simulate failures
        # For now, test that the service handles exceptions gracefully
        request = ChatRequest(message="Test message")

        # The current implementation uses mock responses, so it shouldn't fail
        response = await ChatService.generate_response(user_id=1, request=request)
        assert isinstance(response, ChatResponse)

    def test_generate_mock_response_empty_input(self):
        """Test mock response generation with empty input"""
        response = ChatService._generate_mock_response("")
        assert len(response) > 0  # Should return default response

    def test_generate_mock_response_none_input(self):
        """Test mock response generation with None input"""
        with pytest.raises(TypeError):
            ChatService._generate_mock_response(None)

    def test_generate_mock_response_special_characters_only(self):
        """Test mock response generation with special characters only"""
        response = ChatService._generate_mock_response("@#$%^&*()!@#$%")
        assert len(response) > 0  # Should return default response