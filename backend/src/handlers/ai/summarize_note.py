# backend/src/handlers/ai/summarize_note.py

import json
import boto3
import os

# Initialize the Bedrock runtime client
# It's good practice to initialize outside the handler for potential reuse
# if the Lambda container is warm.
bedrock_runtime = boto3.client(
    service_name='bedrock-runtime',
    region_name=os.environ.get('AWS_REGION', 'us-east-1') # Ensure region is correctly set
)

# Define the model ID for summarization
MODEL_ID = 'anthropic.claude-instant-v1'
# MODEL_ID = 'amazon.titan-text-express-v1' # Alternative

def lambda_handler(event, context):
    print(f"Received event: {json.dumps(event)}")

    try:
        # 1. Parse input from the event body
        # The event body from API Gateway is a JSON string
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event.get('body', {})

        doctor_notes = body.get('doctorNotes')

        if not doctor_notes or not isinstance(doctor_notes, str) or not doctor_notes.strip():
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*', # Adjust for specific origins if needed
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization'
                },
                'body': json.dumps({'error': 'Missing or invalid doctorNotes in request body. It must be a non-empty string.'})
            }

        # 2. Construct the prompt
        # For Anthropic Claude models, the prompt should start with "Human:" and end with "Assistant:"
        prompt = f"\n\nHuman: Please summarize the following medical note concisely. Focus on the key medical information, diagnoses, treatments, and follow-up actions mentioned. Avoid pleasantries or introductory phrases in your summary. Here is the note:\n\n{doctor_notes}\n\nAssistant:"

        # 3. Prepare the payload for the Bedrock model
        # Anthropic Claude model payload
        payload = {
            "prompt": prompt,
            "max_tokens_to_sample": 500,  # Adjust as needed
            "temperature": 0.1,         # Lower temperature for more factual summaries
            "top_p": 0.9,
            # "stop_sequences": ["\n\nHuman:"] # Optional stop sequences
        }

        # Amazon Titan Text model payload (example if switching)
        # payload_titan = {
        #     "inputText": prompt, # Titan uses a different prompt structure if not using Claude's Human/Assistant
        #     "textGenerationConfig": {
        #         "maxTokenCount": 500,
        #         "temperature": 0.1,
        #         "topP": 0.9,
        #         # "stopSequences": []
        #     }
        # }

        # 4. Invoke the Bedrock model
        response = bedrock_runtime.invoke_model(
            body=json.dumps(payload),
            modelId=MODEL_ID,
            accept='application/json',
            contentType='application/json'
        )

        # 5. Process the response
        response_body_str = response.get('body').read().decode('utf-8')
        response_body_json = json.loads(response_body_str)

        # For Anthropic Claude
        summary = response_body_json.get('completion', '').strip()

        # For Amazon Titan Text (example if switching)
        # summary_titan = response_body_json.get('results')[0].get('outputText').strip()

        if not summary:
             raise Exception("Bedrock returned an empty summary.")

        # 6. Return the successful response
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', # Adjust for specific origins
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization'
            },
            'body': json.dumps({'summary': summary})
        }

    except json.JSONDecodeError as e:
        print(f"JSONDecodeError: {e}")
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization'
            },
            'body': json.dumps({'error': f"Invalid JSON in request body: {str(e)}"})
        }
    except Exception as e:
        print(f"Error during Bedrock summarization: {e}")
        # Consider logging the full stack trace for debugging
        # import traceback
        # print(traceback.format_exc())
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization'
            },
            'body': json.dumps({'error': f"An unexpected error occurred: {str(e)}"})
        }

# For local testing (optional)
if __name__ == '__main__':
    # Mock event and context
    mock_event_body_valid = {
        "doctorNotes": "Patient presents with symptoms of acute pharyngitis, including sore throat, fever of 101.5 F, and difficulty swallowing for the past 3 days. Rapid strep test was positive. Prescribed Amoxicillin 500mg TID for 10 days. Advised rest, fluids, and to return if symptoms worsen or do not improve in 48-72 hours. Follow-up scheduled in 2 weeks if needed."
    }
    mock_event_body_missing = {}
    mock_event_body_empty_notes = {"doctorNotes": "   "}


    mock_event = {
        'body': json.dumps(mock_event_body_valid)
        # 'body': json.dumps(mock_event_body_missing)
        # 'body': json.dumps(mock_event_body_empty_notes)
    }
    mock_context = {}

    # Set AWS_REGION for local testing if not already set in your environment
    os.environ['AWS_REGION'] = 'us-east-1' # Or your preferred Bedrock region

    print("--- Testing with valid notes ---")
    response = lambda_handler(mock_event, mock_context)
    print(f"Response: {json.dumps(response, indent=2)}")

    # Example of how to test error cases:
    # print("\n--- Testing with missing notes field ---")
    # mock_event_missing_field = {'body': json.dumps({})}
    # response_missing = lambda_handler(mock_event_missing_field, mock_context)
    # print(f"Response: {json.dumps(response_missing, indent=2)}")

    # print("\n--- Testing with empty notes string ---")
    # mock_event_empty_string = {'body': json.dumps({"doctorNotes": "  "})}
    # response_empty = lambda_handler(mock_event_empty_string, mock_context)
    # print(f"Response: {json.dumps(response_empty, indent=2)}")

    # print("\n--- Testing with invalid JSON body ---")
    # mock_event_invalid_json = {'body': "this is not json"}
    # response_invalid_json = lambda_handler(mock_event_invalid_json, mock_context)
    # print(f"Response: {json.dumps(response_invalid_json, indent=2)}")
