import joblib
import pandas as pd
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io

#loading the model
model = joblib.load("fraud_detector.pkl")

#process the raw input into names and format the model expects
feature_names = [
    'cat__category_Beauty', 'cat__category_Electronics', 'cat__category_Fashion',
    'cat__category_Groceries', 'cat__category_Home Appliances', 'remainder__acc_days',
    'remainder__failed_logins', 'remainder__is_vpn_or_proxy', 'remainder__transaction_amount',
    'remainder__is_card_blacklisted', 'remainder__is_multiple_cards_used', 'remainder__items_quantity',
    'remainder__pages_viewed', 'remainder__device_change_during_session', 'remainder__purchase_frequency_user'
]

#helper function to the prediction function
def prepare_features(raw_input, feature_names):
    sample = {f: 0 for f in feature_names if f.startswith("cat__category_")}
    category_col = "cat__category_" + raw_input["category"]
    if category_col not in feature_names:
        raise ValueError(f"Unknown category '{raw_input['category']}'")
    sample[category_col] = 1
    for f in feature_names:
        if f.startswith("remainder__"):
            key = f.replace("remainder__", "")
            sample[f] = raw_input.get(key, 0)
    return sample

#prediction function (with confidence %)
def predict_fraud_with_confidence(raw_input):
    sample = prepare_features(raw_input, feature_names)
    df = pd.DataFrame([sample])
    pred = model.predict(df)[0]
    prob = model.predict_proba(df)[0][1]
    return {
        "fraudulent": bool(pred),
        "confidence": float(round(prob, 5))
    }



#api creation

app = FastAPI()

origins = [
    "http://localhost:3000",  # React dev server origin
    # add more if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FraudInput(BaseModel):
    category: str
    acc_days: int
    failed_logins: int
    is_vpn_or_proxy: bool
    transaction_amount: float
    is_card_blacklisted: bool
    is_multiple_cards_used: bool
    items_quantity: int
    pages_viewed: int
    device_change_during_session: bool
    purchase_frequency_user: float

@app.post("/predict")
def predict(data: FraudInput):
    raw_input = data.model_dump()
    try:
        result = predict_fraud_with_confidence(raw_input)
        return result
    except Exception as e:
        return {"error": str(e)}
    

@app.post("/predict-batch")
async def predict_batch(file: UploadFile = File(...)):
    content = await file.read()
    df = pd.read_csv(io.StringIO(content.decode("utf-8")))

    results = []

    for index, row in df.iterrows():
        raw_input = row.to_dict()
        
        # Extract only model-required fields
        model_input = {k: raw_input.get(k) for k in FraudInput.model_fields.keys()}

        try:
            result = predict_fraud_with_confidence(model_input)

            if result["fraudulent"]:
                # Merge optional extra fields like email/contact
                extra_fields = {
                    k: raw_input[k] for k in raw_input.keys()
                    if k not in FraudInput.model_fields.keys()
                }

                results.append({
                    "index": index,
                    **result,
                    **model_input,
                    **extra_fields
                })

        except Exception as e:
            results.append({
                "index": index,
                "error": str(e)
            })

    return results
