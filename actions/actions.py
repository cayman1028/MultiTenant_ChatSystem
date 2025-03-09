from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher

class ActionRespondWithLanguage(Action):
    def name(self) -> Text:
        return "action_respond_with_language"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # メタデータから言語情報を取得
        metadata = tracker.get_slot("metadata") or {}
        language = metadata.get("language", "ja")  # デフォルトは日本語
        
        # 最後の意図を取得
        intent = tracker.latest_message.get("intent", {}).get("name")
        
        # 言語に応じた応答キーを生成
        response_key = f"utter_{intent}_{language}"
        
        # 該当する応答キーがない場合はデフォルトを使用
        if response_key not in domain["responses"]:
            response_key = f"utter_{intent}"
        
        dispatcher.utter_message(response=response_key)
        return []