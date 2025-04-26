import wikipedia
from typing import List, Dict, Any, Type, Optional
from crewai.tools import BaseTool
from pydantic import BaseModel, Field

# Input schemas for each tool
class WikiSearchInput(BaseModel):
    """Input schema for WikiSearchTool."""
    query: str = Field(..., description="The term to search for on Wikipedia")

class WikiSummaryInput(BaseModel):
    """Input schema for WikiSummaryTool."""
    title: str = Field(..., description="The title of the Wikipedia page to summarize")
    max_sentences: int = Field(default=3, description="Maximum number of sentences to return")

class WikiPageInput(BaseModel):
    """Input schema for WikiPageTool."""
    title: str = Field(..., description="The title of the Wikipedia page to retrieve")
    max_length: int = Field(default=2000, description="Maximum character length of content to return")
    max_sections: int = Field(default=2, description="Maximum number of sections to return")

class WikiRandomInput(BaseModel):
    """Input schema for WikiRandomTool."""
    my_field: str = Field(default="", description="No input required")

class WikiLanguageInput(BaseModel):
    """Input schema for WikiLanguageTool."""
    language_code: str = Field(..., description="The language code to set (e.g., 'en', 'es', 'fr')")

class WikiSearchTool(BaseTool):
    name: str = "wiki_search"
    description: str = "Search Wikipedia for a specific term or phrase"
    args_schema: Type[BaseModel] = WikiSearchInput
    
    def _run(self, query: str) -> List[str]:
        try:
            results = wikipedia.search(query)
            return results[:2]  # Limit to top 2 results
        except Exception as e:
            return f"Error searching Wikipedia: {str(e)}"

class WikiSummaryTool(BaseTool):
    name: str = "wiki_summary"
    description: str = "Get a concise summary of a Wikipedia page (limited to a few sentences)"
    args_schema: Type[BaseModel] = WikiSummaryInput
    
    def _run(self, title: str, max_sentences: int = 3) -> str:
        try:
            # Get the full summary
            summary = wikipedia.summary(title)
            
            # Split by sentences (simple split by period)
            sentences = summary.split('. ')
            
            # Return only the specified number of sentences
            concise_summary = '. '.join(sentences[:max_sentences])
            if not concise_summary.endswith('.'):
                concise_summary += '.'
                
            return concise_summary
        except Exception as e:
            return f"Error getting summary: {str(e)}"

class WikiPageTool(BaseTool):
    name: str = "wiki_page"
    description: str = "Get a brief version of a Wikipedia page with limited content"
    args_schema: Type[BaseModel] = WikiPageInput
    
    def _run(self, title: str, max_length: int = 2000, max_sections: int = 2) -> Dict[str, Any]:
        try:
            page = wikipedia.page(title)
            
            # Get first paragraph for essential overview
            paragraphs = page.content.split('\n\n')
            intro_content = paragraphs[0] if paragraphs else ""
            
            # Strictly enforce content length limits
            if len(intro_content) > max_length:
                intro_content = intro_content[:max_length] + "..."
            
            # Get limited sections
            sections = self._get_sections(page, max_sections)
            
            # Limit metadata to reduce response size
            categories = page.categories[:3] if page.categories else []
            links = page.links[:5] if page.links else []
            
            return {
                "title": page.title,
                "content": intro_content,
                "url": page.url,
                "categories": categories,
                "links": links,
                "sections": sections
            }
        except Exception as e:
            return f"Error getting page: {str(e)}"
    
    def _get_sections(self, page, max_sections: int = 2):
        sections = {}
        try:
            section_count = 0
            for section in page.sections:
                if section_count >= max_sections:
                    break
                    
                section_content = page.section(section)
                # Only include non-empty sections
                if section_content.strip():
                    # Strictly limit section content length
                    if len(section_content) > 200:
                        section_content = section_content[:200] + "..."
                    
                    sections[section] = section_content
                    section_count += 1
                    
            return sections
        except:
            return {}

class WikiPageConciseTool(BaseTool):
    name: str = "wiki_page_concise"
    description: str = "Get only the most essential information from a Wikipedia page"
    args_schema: Type[BaseModel] = WikiPageInput
    
    def _run(self, title: str, max_length: int = 1000, max_sections: int = 0) -> Dict[str, Any]:
        try:
            page = wikipedia.page(title)
            
            # Get just the first paragraph for a quick overview
            first_para = page.content.split('\n\n')[0]
            trimmed_content = first_para[:max_length] + "..." if len(first_para) > max_length else first_para
            
            return {
                "title": page.title,
                "content": trimmed_content,
                "url": page.url
            }
        except Exception as e:
            return f"Error getting page: {str(e)}"

class WikiRandomTool(BaseTool):
    name: str = "wiki_random"
    description: str = "Get a random Wikipedia article"
    args_schema: Type[BaseModel] = WikiRandomInput
    
    def _run(self, _: str = "") -> str:
        try:
            return wikipedia.random(1)[0]
        except Exception as e:
            return f"Error getting random article: {str(e)}"

class WikiLanguageTool(BaseTool):
    name: str = "wiki_language"
    description: str = "Change the language of Wikipedia searches"
    args_schema: Type[BaseModel] = WikiLanguageInput
    
    def _run(self, language_code: str) -> str:
        try:
            wikipedia.set_lang(language_code)
            return f"Wikipedia language set to {language_code}"
        except Exception as e:
            return f"Error setting language: {str(e)}"

# Export all tools
wiki_search = WikiSearchTool()
wiki_summary = WikiSummaryTool()
wiki_page = WikiPageTool()
wiki_page_concise = WikiPageConciseTool()  # Added new concise tool
wiki_random = WikiRandomTool()
wiki_language = WikiLanguageTool()