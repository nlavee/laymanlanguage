import asyncio
import json
from typing import AsyncGenerator, Dict, Any
from datetime import datetime

class StreamLogger:
    def __init__(self):
        # We will use an asyncio Queue to manage concurrent event streaming
        self.queues: Dict[str, asyncio.Queue] = {}

    def create_queue(self, session_id: str):
        if session_id not in self.queues:
            self.queues[session_id] = asyncio.Queue()

    def remove_queue(self, session_id: str):
        if session_id in self.queues:
            del self.queues[session_id]

    async def log_event(self, session_id: str, event_type: str, payload: Any):
        """Log an event and push it to the queue for SSE streaming."""
        if session_id in self.queues:
            event_data = {
                "timestamp": datetime.utcnow().isoformat(),
                "type": event_type,
                "payload": payload
            }
            await self.queues[session_id].put(event_data)
            
    async def finish_stream(self, session_id: str):
        if session_id in self.queues:
             await self.queues[session_id].put({"type": "DONE"})

    async def stream_events(self, session_id: str) -> AsyncGenerator[str, None]:
        if session_id not in self.queues:
            self.create_queue(session_id)
            
        try:
            while True:
                event = await self.queues[session_id].get()
                if event.get("type") == "DONE":
                    yield f"data: {json.dumps(event)}\n\n"
                    break
                yield f"data: {json.dumps(event)}\n\n"
        finally:
            pass # Keep queue alive if multiple listeners? Typically one listener per session.

stream_logger = StreamLogger()
