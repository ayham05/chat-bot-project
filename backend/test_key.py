import os
from dotenv import load_dotenv
import google.generativeai as genai
import time

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

print("--------------------------------------------------")
if api_key:
    print(f"✅ API Key found: {api_key[:5]}... (Hidden)")
    try:
        genai.configure(api_key=api_key)
        
        # استخدمنا هذا الاسم لأنه موجود بقائمتك ومستقر
        model_name = "gemini-flash-latest" 
        model = genai.GenerativeModel(model_name)
        
        print(f"🔄 Testing connection with {model_name}...")
        
        # بنستنى شوي عشان اذا كان في ليميت يروح
        time.sleep(2) 
        
        response = model.generate_content("Say Hello")
        print("✅ Connection Successful!")
        print(f"🤖 Response: {response.text}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
else:
    print("❌ API Key Missing")
print("--------------------------------------------------")