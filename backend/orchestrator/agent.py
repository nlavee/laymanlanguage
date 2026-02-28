import asyncio
from tenacity import retry, stop_after_attempt, wait_exponential
from backend.core.logger import stream_logger
from backend.storage.workspace_manager import workspace_manager
from backend.storage.knowledgebase import knowledge_base
from backend.llm.gemini import GeminiProvider

class Orchestrator:
    def __init__(self):
        self.llm = GeminiProvider()

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def _execute_search_tool(self, session_id: str, domain_id: str, query: str):
        await stream_logger.log_event(session_id, "tool_call", {"tool": "FTS_Search_And_Scrape", "query": query})
        
        # Simulating external tool search and inserting into FTS5 layer
        await asyncio.sleep(1.5) # Simulating latency
        mock_content = f"Simulated high quality knowledge regarding {query}. This data discusses the precise tradeoffs in this technical domain."
        
        knowledge_base.insert_document(
            workspace_id=session_id,
            domain_id=domain_id,
            title=f"Research: {query}",
            content=mock_content,
            source_url="https://simulated-source.com"
        )
        
        await stream_logger.log_event(session_id, "tool_result", {"tool": "FTS_Search_And_Scrape", "status": "Success, inserted into FTS5"})

    async def run_planner(self, workspace_id: str):
        # 1. Start streaming session
        stream_logger.create_queue(workspace_id)
        
        try:
            ws = workspace_manager.get_workspace(workspace_id)
            if not ws:
                await stream_logger.log_event(workspace_id, "error", {"message": "Workspace not found"})
                return

            await stream_logger.log_event(workspace_id, "status", {"message": "Planner Agent initialized. Loading Domains..."})
            await asyncio.sleep(1)
            
            domains = ws.get("domains", [])
            for domain in domains:
                await stream_logger.log_event(workspace_id, "thought", {"message": f"Analyzing domain {domain['name']}..."})
                
                queries = domain.get("search_queries", [])
                for q in queries:
                    await stream_logger.log_event(workspace_id, "thought", {"message": f"Dispatching worker for rationale: {q['rationale']}"})
                    await self._execute_search_tool(workspace_id, domain["domain_id"], q["query"])
            
            await stream_logger.log_event(workspace_id, "status", {"message": "All subtask search agents completed. FTS5 Index hydrated."})
            await stream_logger.log_event(workspace_id, "thought", {"message": "Transitioning to Synthesis Phase (Phase 5)."})
            
        except Exception as e:
            await stream_logger.log_event(workspace_id, "error", {"message": str(e)})
        finally:
            await stream_logger.finish_stream(workspace_id)

orchestrator = Orchestrator()
