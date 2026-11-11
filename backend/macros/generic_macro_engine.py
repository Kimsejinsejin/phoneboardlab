import uiautomator2 as u2
import time
import random
import json

class MacroEngine:
    def __init__(self, device_serial: str):
        print(f"Connecting to device: {device_serial}")
        # In a real scenario, this connects via ADB
        # self.d = u2.connect(device_serial)
        self.device_serial = device_serial

    def execute_sequence(self, sequence_json: str):
        """
        Executes a generic sequence of actions passed as a JSON string.
        Example JSON:
        [
            {"action": "launch_app", "package": "com.example.app"},
            {"action": "delay", "min": 1, "max": 3},
            {"action": "click_by_text", "text": "Next"},
            {"action": "input_text", "text": "Hello World"}
        ]
        """
        try:
            steps = json.loads(sequence_json)
            for step in steps:
                action = step.get("action")
                print(f"[{self.device_serial}] Executing action: {action}")
                
                if action == "launch_app":
                    package = step.get("package")
                    print(f"  -> Launching package {package}")
                    # self.d.app_start(package)
                    
                elif action == "click_by_text":
                    text = step.get("text")
                    print(f"  -> Clicking element with text '{text}'")
                    # self.d(text=text).click()
                    
                elif action == "input_text":
                    text = step.get("text")
                    print(f"  -> Inputting text '{text}'")
                    # self.d.send_keys(text)
                    
                elif action == "delay":
                    min_t = step.get("min", 1.0)
                    max_t = step.get("max", 2.0)
                    sleep_time = random.uniform(min_t, max_t)
                    print(f"  -> Waiting for {sleep_time:.2f} seconds...")
                    time.sleep(sleep_time)
                else:
                    print(f"  -> Unknown action: {action}")
                    
            print(f"[{self.device_serial}] Sequence completed successfully.")
            return True
        except Exception as e:
            print(f"[{self.device_serial}] Error executing sequence: {e}")
            return False

if __name__ == "__main__":
    # Example usage
    engine = MacroEngine("192.168.0.101:5555")
    sample_macro = '''
    [
        {"action": "launch_app", "package": "com.example.social"},
        {"action": "delay", "min": 2, "max": 4},
        {"action": "click_by_text", "text": "Upload"},
        {"action": "delay", "min": 1, "max": 2},
        {"action": "input_text", "text": "My awesome video"}
    ]
    '''
    engine.execute_sequence(sample_macro)
