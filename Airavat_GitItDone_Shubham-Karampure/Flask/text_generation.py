# comic_generation.py
import os
import yaml
import json
from pathlib import Path
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process, LLM
from pydantic import BaseModel
import re
import traceback

# Import custom tools
from tools.comic_tools import (
    complexity_analyzer,
    style_adapter_guidance,
    structured_text_to_json
)
from tools.wiki_tools import wiki_search, wiki_summary # Removed unused wiki tools

# --- Configuration Loading (Modified for two Projects/Credentials) ---
# (Configuration loading code remains the same as provided)
def load_configuration():
    """Loads configuration from files and environment variables for potentially two projects."""
    load_dotenv()
    current_dir = Path.cwd()
    config_dir = current_dir / "config"
    agents_config_path = config_dir / "agents.yaml"
    tasks_config_path = config_dir / "tasks.yaml"
    styles_config_path = config_dir / "styles.yaml"

    # API Keys (one per project/group)
    gemini_api_key_group1 = os.getenv("GEMINI_API_KEY_GROUP1") # Key for Project 1 / Group 1
    gemini_api_key_group2 = os.getenv("GEMINI_API_KEY_GROUP2") # Key for Project 2 / Group 2

    # ---> MODIFICATION START: Separate Vertex AI Credential Paths
    vertex_credentials_path_group1 = Path(os.getenv("VERTEX_AI_CREDENTIALS_PATH_GROUP1", current_dir / "vertex-ai-group1.json"))
    vertex_credentials_path_group2 = Path(os.getenv("VERTEX_AI_CREDENTIALS_PATH_GROUP2", current_dir / "vertex-ai-group2.json"))
    # ---> MODIFICATION END

    if not gemini_api_key_group1:
        print("Warning: GEMINI_API_KEY_GROUP1 environment variable not set.")
    if not gemini_api_key_group2:
        print("Warning: GEMINI_API_KEY_GROUP2 environment variable not set.")

    # ---> MODIFICATION START: Load Vertex AI credentials separately
    vertex_credentials_json_group1 = None
    if vertex_credentials_path_group1.is_file():
        try:
            with open(vertex_credentials_path_group1, 'r') as file:
                vertex_credentials = json.load(file)
            vertex_credentials_json_group1 = json.dumps(vertex_credentials)
            print(f"Loaded Vertex AI credentials for Group 1 from {vertex_credentials_path_group1}")
        except Exception as e:
            print(f"Warning: Could not load or parse Vertex AI credentials for Group 1 from {vertex_credentials_path_group1}: {e}")
    else:
        print(f"Info: Vertex AI credentials file for Group 1 not found at {vertex_credentials_path_group1}. Will rely on API Key or default ADC.")

    vertex_credentials_json_group2 = None
    if vertex_credentials_path_group2.is_file():
        try:
            with open(vertex_credentials_path_group2, 'r') as file:
                vertex_credentials = json.load(file)
            vertex_credentials_json_group2 = json.dumps(vertex_credentials)
            print(f"Loaded Vertex AI credentials for Group 2 from {vertex_credentials_path_group2}")
        except Exception as e:
            print(f"Warning: Could not load or parse Vertex AI credentials for Group 2 from {vertex_credentials_path_group2}: {e}")
    else:
        print(f"Info: Vertex AI credentials file for Group 2 not found at {vertex_credentials_path_group2}. Will rely on API Key or default ADC.")
    # ---> MODIFICATION END

    # Load YAML configuration files
    try:
        with open(agents_config_path, "r") as file:
            agents_config = yaml.safe_load(file)
        with open(tasks_config_path, "r") as file:
            tasks_config = yaml.safe_load(file)
        if styles_config_path.is_file():
            with open(styles_config_path, "r") as file:
                styles_config = yaml.safe_load(file)
        else:
            print(f"Warning: Styles config file not found at {styles_config_path}. Style features may be limited.")
            styles_config = {}
    except FileNotFoundError as e:
        print(f"FATAL: Error loading configuration file: {e}. Make sure config files exist.")
        raise
    except yaml.YAMLError as e:
        print(f"FATAL: Error parsing YAML file: {e}")
        raise

    return {
        "gemini_api_key_group1": gemini_api_key_group1,
        "gemini_api_key_group2": gemini_api_key_group2,
        # ---> MODIFICATION START: Return separate credentials
        "vertex_credentials_json_group1": vertex_credentials_json_group1,
        "vertex_credentials_json_group2": vertex_credentials_json_group2,
        # ---> MODIFICATION END
        "agents_config": agents_config,
        "tasks_config": tasks_config,
        "styles_config": styles_config
    }


# --- Global Configuration and LLM Setup (Using separate credentials) ---
# (LLM setup code remains the same as provided)
try:
    config = load_configuration()
    llm_group1 = None
    llm_group2 = None

    # Initialize LLM for Group 1 (Project 1)
    if config["gemini_api_key_group1"]:
        try:
            llm_group1 = LLM(
                model="gemini/gemini-2.0-flash-exp", # Or configure model per group
                temperature=0.7,
                # ---> MODIFICATION: Use Group 1 credentials
                vertex_credentials=config["vertex_credentials_json_group1"],
                api_key=config["gemini_api_key_group1"]
            )
            print("LLM for Group 1 (Project 1) initialized successfully.")
        except Exception as e:
            print(f"Error initializing LLM for Group 1: {e}")
    else:
         print("Skipping LLM initialization for Group 1 (API key missing).")

    # Initialize LLM for Group 2 (Project 2)
    if config["gemini_api_key_group2"]:
        try:
            llm_group2 = LLM(
                model="gemini/gemini-1.5-flash", # Or configure model per group
                temperature=0.7,
                 # ---> MODIFICATION: Use Group 2 credentials
                vertex_credentials=config["vertex_credentials_json_group2"],
                api_key=config["gemini_api_key_group2"]
            )
            print("LLM for Group 2 (Project 2) initialized successfully.")
        except Exception as e:
            print(f"Error initializing LLM for Group 2: {e}")
    else:
         print("Skipping LLM initialization for Group 2 (API key missing).")

except Exception as e:
    print(f"FATAL: Failed during configuration or LLM setup. Error: {e}")
    llm_group1 = None
    llm_group2 = None

# --- WikiComicGenerator Class ---
class WikiComicGenerator:
    def __init__(self):
        """Initializes the agents and loads necessary configurations, assigning specific LLMs."""
        # Check if LLMs are available (essential for agents)
        llms_missing = []
        if llm_group1 is None: llms_missing.append("Group 1 (using GEMINI_API_KEY_GROUP1)")
        if llm_group2 is None: llms_missing.append("Group 2 (using GEMINI_API_KEY_GROUP2)")
        # Allow initialization even if one LLM is missing, but YouTube Shorts agent might fail later
        if llms_missing:
             print(f"Warning: LLM(s) not initialized: {', '.join(llms_missing)}. Some agents may not function.")
             # Decide if you want to raise an error if BOTH are missing, or allow limited functionality
             # if llm_group1 is None and llm_group2 is None:
             #    raise RuntimeError("Both LLMs failed to initialize. Cannot create WikiComicGenerator.")


        agents_config = config["agents_config"]

        # Initialize agents using loaded config and assigning specific LLMs
        try:
            # Group 1 Agents (if LLM available)
           
                print("Assigning LLM Group 1 to wiki_researcher, content_simplifier, comic_scriptwriter")
                self.wiki_researcher = Agent(
                    config=agents_config["wiki_researcher"],
                    tools=[wiki_search, wiki_summary], verbose=True, llm=llm_group1
                )
                self.content_simplifier = Agent(
                    config=agents_config["content_simplifier"],
                    tools=[complexity_analyzer], verbose=True, llm=llm_group2
                )
                self.comic_scriptwriter = Agent(
                    config=agents_config["comic_scriptwriter"],
                    tools=[style_adapter_guidance], verbose=True, llm=llm_group1
                )
           

                print("Assigning LLM Group 2 to quality_reviewer, javascript_coder, youtube_shorts_scriptwriter")
                self.quality_reviewer = Agent(
                    config=agents_config["quality_reviewer"], verbose=True, llm=llm_group2
                )
                self.javascript_coder = Agent(
                    config=agents_config["javascript_coder"],
                    tools=[structured_text_to_json], verbose=True, llm=llm_group2
                )
                # <<< NEW AGENT >>>
                self.youtube_shorts_scriptwriter = Agent(
                    config=agents_config["youtube_shorts_scriptwriter"],
                    verbose=True, llm=llm_group1
                )

        except KeyError as e:
            print(f"Error: Agent key '{e}' not found in agents.yaml configuration.")
            raise
        except Exception as e:
            print(f"Error initializing agents: {e}")
            raise

    # --- generate_comic method remains the same ---
    def generate_comic(self, topic, domain="general", complexity_level="medium", age_group="teens",
                       education_level="middle_school", comic_style="manga"):
        # Check if necessary agents are initialized
        required_comic_agents = [self.wiki_researcher, self.content_simplifier, self.comic_scriptwriter, self.quality_reviewer, self.javascript_coder]
        if any(agent is None for agent in required_comic_agents):
             return {"error": "Cannot generate comic: One or more required agents failed to initialize due to missing LLM configuration."}

        print(f"\n--- Starting Comic Generation for Topic: {topic} ---")
        print(f"Settings: Domain={domain}, Complexity={complexity_level}, Age={age_group}, Education={education_level}, Style={comic_style}")

        tasks_config = config["tasks_config"]
        styles_config = config["styles_config"]
        style_info = styles_config.get(comic_style.lower(), {})
        style_characteristics = style_info.get("characteristics", f"Default characteristics for {comic_style}")

        inputs = {
            'topic': topic, 'domain': domain, 'complexity_level': complexity_level,
            'age_group': age_group, 'education_level': education_level,
            'comic_style': comic_style, 'style_characteristics': style_characteristics
        }

        try:
            research_task_def = Task(config=tasks_config['research_task'], agent=self.wiki_researcher)
            simplify_task_def = Task(config=tasks_config['simplify_task'], agent=self.content_simplifier, context=[research_task_def])
            script_and_style_task_def = Task(config=tasks_config['script_and_style_task'], agent=self.comic_scriptwriter, context=[simplify_task_def])
            review_task_def = Task(config=tasks_config['review_task'], agent=self.quality_reviewer, context=[script_and_style_task_def])
            json_conversion_task_def = Task(config=tasks_config['json_conversion_task'], agent=self.javascript_coder, context=[review_task_def])
        except KeyError as e:
            print(f"Error: Task key '{e}' not found in tasks.yaml configuration.")
            return {"error": f"Task configuration key '{e}' not found."}
        except Exception as e:
            print(f"Error defining tasks: {e}")
            return {"error": "Failed to define tasks."}

        comic_crew = Crew(
            agents=[self.wiki_researcher, self.content_simplifier, self.comic_scriptwriter, self.quality_reviewer, self.javascript_coder],
            tasks=[research_task_def, simplify_task_def, script_and_style_task_def, review_task_def, json_conversion_task_def],
            process=Process.sequential, verbose=True,
        )

        print("\n--- Kicking off the Comic Generation Crew ---")
        try:
            crew_result = comic_crew.kickoff(inputs=inputs)
            # (Result processing logic remains the same)
            print("\n--- Crew Execution Finished ---")

            if hasattr(crew_result, 'raw'):
                final_result = crew_result.raw
            elif isinstance(crew_result, str):
                final_result = crew_result
            else:
                # Try extracting from the last task's output
                last_task_output = comic_crew.tasks[-1].output
                if last_task_output and hasattr(last_task_output, 'raw'):
                     final_result = last_task_output.raw
                elif last_task_output and isinstance(last_task_output.exported_output, str):
                     final_result = last_task_output.exported_output
                # Fallback for older crewai versions or different structures
                elif hasattr(crew_result, 'tasks_output') and crew_result.tasks_output:
                    last_task = crew_result.tasks_output[-1]
                    if hasattr(last_task, 'raw'): final_result = last_task.raw
                    else: return {"error": "Failed to extract output from crew result's last task."}
                else:
                    # Attempt to get the result from the final task directly if available
                    final_task_result = json_conversion_task_def.output
                    if final_task_result and hasattr(final_task_result, 'raw'):
                        final_result = final_task_result.raw
                    elif final_task_result and isinstance(final_task_result, str):
                        final_result = final_task_result
                    else:
                         return {"error": "Unexpected crew result format and could not get output from final task."}


            print(f"Final Output (Raw from last task - JSON conversion):\n{final_result}")

            # --- Cleanup and Parsing Logic (Same as before) ---
            if isinstance(final_result, str):
                # Remove potential markdown code fences
                if final_result.startswith("```json"):
                    final_result = final_result.split("```json", 1)[1]
                if final_result.endswith("```"):
                    final_result = final_result.rsplit("```", 1)[0]
                final_result = final_result.strip()
            else:
                 print(f"Warning: Expected string output from final task, got {type(final_result)}. Attempting conversion.")
                 final_result = str(final_result) # Convert non-string result to string

            # Attempt to parse the cleaned string as JSON
            try:
                parsed_json = json.loads(final_result)
                # Basic validation: check if it's a dictionary
                if isinstance(parsed_json, dict):
                    if "error" in parsed_json:
                        print(f"Warning: JSON conversion task reported an error: {parsed_json['error']}")
                        # Return the error reported by the agent
                        return parsed_json
                    else:
                        print("Successfully parsed final JSON output.")
                        return parsed_json # Return the parsed JSON object
                else:
                    # Handle cases where parsing succeeded but it's not a dictionary (e.g., a list or string)
                    return {"error": "JSON conversion successful, but root output format is not a dictionary.", "raw_output": final_result}

            except json.JSONDecodeError as e:
                print(f"Error: Final output from the crew was not valid JSON after initial cleanup: {e}")
                # Attempt more robust regex extraction as a fallback
                try:
                    # Regex to find a JSON object starting with '{' and ending with '}'
                    json_pattern = r'\{\s*"comic_topic"\s*:.*?\}\s*\]?\s*\}' # Adjusted pattern
                    match = re.search(json_pattern, final_result, re.DOTALL | re.IGNORECASE)
                    if match:
                        cleaned_json_str = match.group(0)
                        parsed_json = json.loads(cleaned_json_str)
                        print("Successfully extracted and parsed JSON after regex cleanup.")
                        return parsed_json # Return the parsed JSON object
                    else:
                        raise ValueError("No valid JSON object found via regex.")
                except Exception as clean_e:
                    print(f"JSON regex cleanup failed: {clean_e}")
                    # Return error with the raw, unparseable output
                    return {"error": "Crew finished, but final output parsing failed even after cleanup.", "raw_output": final_result}
            except Exception as e:
                print(f"Error processing final output: {e}")
                return {"error": "Failed to process final output.", "raw_output": final_result}

        except Exception as e:
            print(f"Error during comic crew execution: {e}")
            print(traceback.format_exc())
            return {"error": f"Comic crew execution failed: {str(e)}"}

    def generate_short_narration(self, comic_script: str) -> str:
        """
        Generates narration text for a YouTube Short based on a comic script,
        using a dedicated agent and task configuration.

        Args:
            comic_script (str): The comic script content (JSON string in this case)
                                that provides the context for the narration.

        Returns:
            str: The generated narration script as a string, or an error message.
        """
        # 1. Check if the required agent is available
        if self.youtube_shorts_scriptwriter is None:
            print("Error: YouTube Shorts scriptwriter agent failed to initialize (likely missing LLM config).")
            return "Error: YouTube Shorts scriptwriter agent is not available. Cannot generate narration."

        print("\n--- Starting YouTube Shorts Narration Generation ---")
        tasks_config = config["tasks_config"]
        # Define the key used in your tasks.yaml for the narration task
        narration_task_key = 'youtube_shorts_scriptwriter_task' # <-- MAKE SURE THIS MATCHES YOUR YAML KEY

        try:
            # 2. Verify Task Configuration Exists
            if narration_task_key not in tasks_config:
                print(f"Error: Task definition key '{narration_task_key}' not found in tasks_config (loaded from tasks.yaml).")
                return f"Error: Task definition for '{narration_task_key}' not found in tasks configuration."

            # 3. Initialize the Task - *REMOVED the incorrect context argument*
            # The task description should reference the input variable (e.g., {{comic_script}})
            print(f"Initializing narration task using config from key: '{narration_task_key}'")
            narration_task = Task(
                config=tasks_config[narration_task_key], # Pass the config dictionary
                agent=self.youtube_shorts_scriptwriter
                # Context removed - input is passed via kickoff
            )

            # 4. Create and Run the Crew
            narration_crew = Crew(
                agents=[self.youtube_shorts_scriptwriter],
                tasks=[narration_task],
                process=Process.sequential,
                verbose=True # Set to False for less detailed console output
            )

            # Prepare inputs for the crew. The key here ('comic_script')
            # MUST match the placeholder in the task description in tasks.yaml.
            crew_inputs = {
                'comic_script': comic_script
            }

            print(f"\n--- Kicking off the Narration Generation Crew with input keys: {list(crew_inputs.keys())} ---")
            # *PASS the inputs dictionary to kickoff*
            narration_result = narration_crew.kickoff(inputs=crew_inputs)
            print("\n--- Narration Crew Execution Finished ---")

            # 5. Process the Result (Keep your existing result processing logic)
            narration_text = None
            if isinstance(narration_result, str):
                narration_text = narration_result
            # Check for AgentOutput or other structured output if needed (CrewAI >= 0.28.8)
            elif hasattr(narration_result, 'raw') and isinstance(narration_result.raw, str):
                 narration_text = narration_result.raw
            elif hasattr(narration_task, 'output'):
                 task_output = narration_task.output
                 # Handle potential nested output objects based on CrewAI version
                 if task_output:
                     if hasattr(task_output, 'raw'):
                         narration_text = task_output.raw
                     elif hasattr(task_output, 'exported_output') and isinstance(task_output.exported_output, str):
                         narration_text = task_output.exported_output
                     elif isinstance(task_output, str):
                         narration_text = task_output

            # Cleanup the extracted text (if found)
            if narration_text:
                narration_text = narration_text.strip()
                # Remove potential preamble if the LLM adds it
                if narration_text.startswith("NARRATION_SCRIPT:"):
                    narration_text = narration_text.split("NARRATION_SCRIPT:", 1)[-1].strip()
                # Remove potential markdown list markers if agent adds them
                narration_text = narration_text.replace("- ", "", 1) if narration_text.startswith("- ") else narration_text
                # Split into lines if it returns a multi-line string with hyphens/bullets
                lines = [line.strip() for line in narration_text.strip().split('\n') if line.strip()]
                cleaned_lines = [line[2:] if line.startswith('- ') else line for line in lines] # More robust cleaning
                narration_text = "\n".join(cleaned_lines)

                print(f"Successfully Generated Narration:\n{narration_text}")
                return narration_text
            else:
                print(f"Warning: Could not extract narration string from crew result. Result type: {type(narration_result)}")
                print(f"Full Result: {narration_result}")
                return "Error: Could not extract narration text from the crew result."

        # 6. Handle Potential Errors during setup or execution
        except KeyError as e:
            print(f"Error: Key missing during narration task setup or execution: {e}")
            print(traceback.format_exc())
            return f"Error: Missing key '{e}' in task configuration or during processing."
        except Exception as e:
            print(f"Error during narration generation: {e}")
            print(traceback.format_exc())
            return f"Error generating narration: {str(e)}"


# --- Optional: Direct Test Execution Block ---
if __name__ == "__main__":
    print("Running direct test for WikiComicGenerator...")
    try:
        # Check if LLMs are available for testing
        llms_available = llm_group1 is not None and llm_group2 is not None
        if not llms_available:
             missing = []
             if llm_group1 is None: missing.append("Group 1 (GEMINI_API_KEY_GROUP1)")
             if llm_group2 is None: missing.append("Group 2 (GEMINI_API_KEY_GROUP2)")
             print(f"Cannot run full tests: Required LLM(s) initialization failed. Missing keys for: {', '.join(missing)}")
        else:
            generator = WikiComicGenerator()

            # --- Test Comic Generation ---
            test_topic = "Photosynthesis"
            print(f"\n--- Generating test comic for topic: {test_topic} ---")
            comic_result = generator.generate_comic(
                topic=test_topic,
                comic_style="educational",
                complexity_level="easy",
                age_group="children"
            )
            print("\n--- Comic Generation Test Result ---")
            # Pretty print if it's a dict, otherwise print as is
            if isinstance(comic_result, dict):
                print(json.dumps(comic_result, indent=2))
                # Use the successful comic result (if JSON) for narration test
                if "error" not in comic_result:
                     comic_script_for_narration = json.dumps(comic_result) # Pass JSON string
                     print(f"\n--- Generating narration for topic: {test_topic} ---")
                     narration_result = generator.generate_short_narration(comic_script_for_narration)
                     print("\n--- Narration Generation Test Result ---")
                     print(narration_result)
                else:
                    print("\n--- Skipping Narration Test due to Comic Generation Error ---")
            else:
                 print(comic_result) # Print raw output if not a dict
                 print("\n--- Skipping Narration Test as Comic Generation did not return expected JSON ---")


    except RuntimeError as e:
        print(f"Test setup failed: {e}")
    except Exception as e:
        print(f"An error occurred during the direct test: {e}")
        print(traceback.format_exc())