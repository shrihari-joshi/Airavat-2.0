import yaml
import json
import re  # Import regex
from pathlib import Path
from typing import Dict, Type, Optional, List, Any

from crewai.tools import BaseTool
from pydantic import BaseModel, Field, PrivateAttr

# --- Input Schemas ---

class ComplexityAnalyzerInput(BaseModel):
    """Input schema for ComplexityAnalyzerTool."""
    content: str = Field(..., description="The content to analyze")
    complexity_level: str = Field(default="medium", description="Complexity level: low, medium, or high")
    age_group: str = Field(default="teens", description="Target age group: children, teens, adults")


class StyleAdapterGuidanceInput(BaseModel):
    """Input schema for StyleAdapterGuidanceTool."""
    script_text: str = Field(..., description="The structured text comic script to analyze for style guidance.")
    comic_style: str = Field(..., description="The target comic style (e.g., manga, western, educational).")
    # No longer takes style_characteristics directly, loads from config


class StructuredTextToJsonInput(BaseModel):
    """Input schema for StructuredTextToJsonTool."""
    structured_text: str = Field(..., description="The structured text script to convert to JSON.")


# --- Tool Definitions ---

class ComplexityAnalyzerTool(BaseTool):
    name: str = "complexity_analyzer"
    description: str = "Analyze content and provide complexity guidelines based on level and target audience."
    args_schema: Type[BaseModel] = ComplexityAnalyzerInput

    def _run(self, content: str, complexity_level: str = "medium", age_group: str = "teens") -> str:
        """Analyze and provide complexity guidelines based on input parameters."""
        # --- (Keep the existing _run logic from your original file) ---
        complexity_levels = {
            "low": {
                "max_sentence_length": 10,
                "vocabulary_level": "basic",
                "concepts_per_panel": 1,
                "recommended_visuals": "highly visual with minimal text"
            },
            "medium": {
                "max_sentence_length": 15,
                "vocabulary_level": "intermediate",
                "concepts_per_panel": 2,
                "recommended_visuals": "balanced text and visuals"
            },
            "high": {
                "max_sentence_length": 25,
                "vocabulary_level": "advanced",
                "concepts_per_panel": 3,
                "recommended_visuals": "text-rich with supporting visuals"
            }
        }

        selected_level = complexity_levels.get(complexity_level.lower(), complexity_levels["medium"])

        age_group_guidelines = {
            "children": "Use concrete examples, bright colors, simple vocabulary, and relatable characters.",
            "teens": "Incorporate relevant cultural references, use engaging scenarios, and balance education with entertainment.",
            "adults": "Provide deeper context, include nuanced concepts, and connect to real-world applications."
        }

        age_guidance = age_group_guidelines.get(age_group.lower(), age_group_guidelines["teens"])

        return (f"# Content Complexity Analysis\n\n"
                f"## Guidelines for '{complexity_level}' level and '{age_group}' age group:\n\n"
                f"- Maximum sentence length: {selected_level['max_sentence_length']} words\n"
                f"- Vocabulary level: {selected_level['vocabulary_level']}\n"
                f"- Concepts per panel: {selected_level['concepts_per_panel']}\n"
                f"- Visual approach: {selected_level['recommended_visuals']}\n\n"
                f"## Age-specific recommendations:\n{age_guidance}")


class StyleAdapterGuidanceTool(BaseTool):
    name: str = "style_adapter_guidance"
    description: str = ("Generates textual guidance on adapting a structured text comic script "
                        "to a specific style's conventions (e.g., manga, western). "
                        "Does NOT modify the script itself.")
    args_schema: Type[BaseModel] = StyleAdapterGuidanceInput

    # Use PrivateAttr for internal state like styles config
    _styles: Dict = PrivateAttr(default_factory=dict)

    def __init__(self, **data: Any):
        super().__init__(**data)
        # Load styles configuration during initialization
        self._load_styles()

    def _load_styles(self):
        """Load styles from configuration file or use defaults."""
        # --- (Keep the existing _load_styles logic from your original StyleAdapterTool) ---
        try:
            possible_paths = [
                Path("config") / "styles.yaml",
                Path(__file__).parent.parent / "config" / "styles.yaml",
                Path(__file__).parent / "config" / "styles.yaml",
                Path.cwd() / "config" / "styles.yaml"
            ]
            for styles_path in possible_paths:
                if styles_path.is_file():
                    with open(styles_path, 'r') as file:
                        self._styles = yaml.safe_load(file)
                        print(f"Successfully loaded styles from {styles_path}")
                        return
            raise FileNotFoundError("No styles.yaml file found in expected locations")
        except Exception as e:
            print(f"Warning: Could not load styles configuration: {e}. Using default styles.")
            self._styles = {
                "manga": {"name": "Manga Style", "characteristics": "Reading right-to-left, expressive eyes, speed lines...", "panel_format": "Varied", "text_placement": "Integrated SFX"},
                "western": {"name": "Western Style", "characteristics": "Bold outlines, dynamic action, left-to-right...", "panel_format": "Grid", "text_placement": "Captions/Bubbles"},
                "educational": {"name": "Educational Style", "characteristics": "Clear diagrams, annotations, simplified visuals...", "panel_format": "Sequential", "text_placement": "Explanatory"},
                "cartoon": {"name": "Cartoon Style", "characteristics": "Exaggerated features, simplified lines, bright colors...", "panel_format": "Dynamic", "text_placement": "Expressive"}
            } # Simplified defaults

    def _run(self, script_text: str, comic_style: str) -> str:
        """Generate textual style adaptation guidance based on the script and style."""
        style_lower = comic_style.lower()
        style_info = self._styles.get(style_lower)

        if not style_info:
            return f"# STYLE ADAPTATION REPORT: {comic_style}\n\n**Error:** Style '{comic_style}' not found in configuration. Cannot provide specific guidance."

        # Extract characteristics from loaded style_info
        style_characteristics = style_info.get('characteristics', 'N/A')
        panel_format = style_info.get('panel_format', 'N/A')
        text_placement = style_info.get('text_placement', 'N/A')

        # --- Generate Guidance Text (This part is new) ---
        report = [f"# STYLE ADAPTATION REPORT: {style_info.get('name', comic_style)}", ""]
        report.append(f"**Overall Style Notes:**")
        report.append(f"- Apply '{style_info.get('name', comic_style)}' characteristics: {style_characteristics}")
        report.append(f"- Consider panel format conventions: {panel_format}")
        report.append(f"- Adapt text placement according to style: {text_placement}")
        report.append("")

        report.append("**Chapter-Specific Guidance (Examples - Apply logic to actual script structure):**")

        # Basic check for chapters - more robust parsing could be added
        chapters = re.findall(r'--- CHAPTER (\d+) ---', script_text)
        if not chapters:
            report.append("- *No standard chapter structure found in script text for detailed guidance.*")
        else:
            # Example guidance for first couple of chapters if found
            for i in range(min(2, len(chapters))):
                chapter_num = chapters[i]
                report.append(f"- **Chapter {chapter_num}:**")
                report.append(f"  - **Image Context:** Ensure the description guides visuals consistent with '{style_lower}' style (e.g., add notes on dynamic angles for western, or expressive faces for manga).")
                report.append(f"  - **Chat Bubbles:** Present dialogue using appropriate bubble shapes and text styles for '{style_lower}'. Consider {text_placement}.")
                report.append(f"  - **Pacing:** Adjust panel density/flow within the chapter based on '{style_lower}' conventions ({panel_format}).")

        report.append("")
        report.append("**Visual Metaphor Suggestions:**")
        report.append(f"- Consider using metaphors common in '{style_lower}' style (e.g., visual shorthand for emotions in manga, action lines in western).")
        report.append("- Tailor metaphors to explain concepts clearly within the chosen style.")

        return "\n".join(report)

class StructuredTextToJsonTool(BaseTool):
    name: str = "structured_text_to_json"
    description: str = ("Converts a structured text comic script (with specific delimiters like "
                        "'--- CHAPTER X ---', 'NARRATION_BOX:', 'IMAGE_CONTEXT:', etc.) "
                        "into a valid JSON string format.")
    args_schema: Type[BaseModel] = StructuredTextToJsonInput

    def _parse_chat_bubbles(self, bubble_text: str) -> List[Dict[str, str]]:
        """Parses the multi-line chat bubble text into a list of dicts."""
        bubbles = []
        pattern = re.compile(
            r"-\s*CHARACTER:\s*(.*?)\s*\n\s*DIALOGUE:\s*((?:.|\n)*?)"
            r"(?=\n\s*-\s*CHARACTER:|\Z)", 
            re.MULTILINE
        )
        matches = pattern.findall(bubble_text)
        for match in matches:
            character = match[0].strip()
            dialogue = match[1].strip()
            # Clean up dialogue by removing extra newlines and whitespace
            dialogue = re.sub(r'\s+', ' ', dialogue).strip('"')
            if character and dialogue:
                bubbles.append({"character": character, "dialogue": dialogue})
        return bubbles

    def _run(self, structured_text: str) -> str:
        """Convert the structured text script to a JSON string."""
        try:
            comic_data: Dict[str, Any] = {"chapters": []}

            # Extract global info
            topic_match = re.search(r"COMIC_TOPIC:\s*(.*?)(?:\n|$)", structured_text, re.MULTILINE)
            total_match = re.search(r"TOTAL_CHAPTERS:\s*(\d+)", structured_text, re.MULTILINE)
            
            comic_data["comic_topic"] = topic_match.group(1).strip() if topic_match else "Unknown Topic"
            comic_data["total_chapters"] = int(total_match.group(1)) if total_match else 0

            # Find all chapter blocks with a simpler pattern
            chapter_blocks = re.split(r"---\s*CHAPTER\s+\d+\s*---", structured_text)
            if len(chapter_blocks) <= 1:
                return json.dumps({"error": "No chapter blocks found.", "details": "Check if chapters are marked with '--- CHAPTER X ---' format."})
            
            # First block is before the first chapter (contains topic and total chapters)
            chapter_blocks = chapter_blocks[1:]  # Skip the header block
            
            for i, block in enumerate(chapter_blocks):
                if not block.strip():
                    continue
                    
                # Extract chapter info with individual regex patterns
                chapter_num_match = re.search(r"CHAPTER_NUMBER:\s*(\d+)", block)
                title_match = re.search(r"CHAPTER_TITLE:\s*(.*?)(?:\n|$)", block)
                narration_match = re.search(r"NARRATION_BOX:\s*(.*?)(?:\n|$)", block)
                
                # Extract chat bubbles block
                bubbles_match = re.search(r"CHAT_BUBBLES:(.*?)(?:CONCLUSION:|$)", block, re.DOTALL)
                
                conclusion_match = re.search(r"CONCLUSION:\s*(.*?)(?:\n|$)", block)
                image_match = re.search(r"IMAGE_CONTEXT:\s*(.*?)(?:\n|$)", block, re.DOTALL)
                
                # Build chapter data
                chapter_num = int(chapter_num_match.group(1)) if chapter_num_match else i + 1
                title = title_match.group(1).strip() if title_match else f"Chapter {chapter_num}"
                narration = narration_match.group(1).strip() if narration_match else ""
                bubbles_text = bubbles_match.group(1).strip() if bubbles_match else ""
                conclusion = conclusion_match.group(1).strip() if conclusion_match else ""
                image_context = image_match.group(1).strip() if image_match else ""
                
                # Create chapter object
                current_chapter = {
                    "chapter_number": chapter_num,
                    "chapter_title": title,
                    "narration_box": narration,
                    "chat_bubbles": self._parse_chat_bubbles(bubbles_text),
                    "conclusion": conclusion, 
                    "image_context": image_context
                }
                
                comic_data["chapters"].append(current_chapter)
            
            # Update total chapters count if needed
            if comic_data["total_chapters"] != len(comic_data["chapters"]):
                comic_data["total_chapters"] = len(comic_data["chapters"])
                
            if not comic_data["chapters"]:
                return json.dumps({"error": "Failed to parse chapters from structured text.", 
                                   "details": "Could not parse any chapters using the expected pattern."})
                
            # Return the final JSON string
            return json.dumps(comic_data, indent=2)
            
        except Exception as e:
            import traceback
            print(f"Error during text-to-JSON conversion: {e}")
            print(traceback.format_exc())
            
            return json.dumps({
                "error": "Failed to convert structured text to JSON.",
                "details": str(e)
            })

# --- Export Instances ---
complexity_analyzer = ComplexityAnalyzerTool()
style_adapter_guidance = StyleAdapterGuidanceTool()
structured_text_to_json = StructuredTextToJsonTool()