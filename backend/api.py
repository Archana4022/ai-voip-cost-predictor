from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from dotenv import load_dotenv
import mysql.connector
import pandas as pd
import pickle
import os

# Load environment variables
load_dotenv()

# Database connection
try:
    db = mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "test12"),
        database=os.getenv("DB_DATABASE", "voip_optimizer"),
    )
    cursor = db.cursor()
except mysql.connector.Error as e:
    raise RuntimeError(f"❌ Failed to connect to the database: {str(e)}")

# Load trained model
try:
    with open("optimized_voip_cost_model.pkl", "rb") as f:
        model = pickle.load(f)
except Exception as e:
    raise RuntimeError(f"❌ Failed to load model: {str(e)}")

# Initialize FastAPI app
app = FastAPI(
    title="CallFusion AI VOIP Cost Optimizer API",
    description="Predicts the cost of a VOIP call and suggests optimizations 📞💰",
    version="1.0.0"
)

# Allow requests from your React dev server
origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

valid_carriers = ["Carrier A", "Carrier B", "Carrier C", "Carrier D"]
valid_times = ["Morning", "Afternoon", "Evening", "Night"]

@app.get("/")
def home():
    return JSONResponse(content={"message": "Welcome to CallFusion AI 🎯. Use /docs to explore the API."})

@app.get("/health")
def health_check():
    return {"status": "OK", "message": "Backend is running 🚀"}

class CallData(BaseModel):
    caller_id: Optional[str] = Field("Anonymous")
    receiver_id: Optional[str] = Field("Unknown")
    duration: float = Field(..., gt=0)
    latency: float = Field(..., ge=0)
    carrier: str
    time_of_day: str

@app.post("/predict_cost/")
async def predict_cost(data: CallData):
    if data.carrier not in valid_carriers:
        raise HTTPException(status_code=400, detail={"error": "Invalid carrier", "valid_options": valid_carriers})
    if data.time_of_day not in valid_times:
        raise HTTPException(status_code=400, detail={"error": "Invalid time of day", "valid_options": valid_times})

    input_data = pd.DataFrame([{
        "Duration (s)": data.duration,
        "Latency (ms)": data.latency,
        "Carrier_Carrier B": 1 if data.carrier == "Carrier B" else 0,
        "Carrier_Carrier C": 1 if data.carrier == "Carrier C" else 0,
        "Carrier_Carrier D": 1 if data.carrier == "Carrier D" else 0,
        "Time of Day_Evening": 1 if data.time_of_day == "Evening" else 0,
        "Time of Day_Morning": 1 if data.time_of_day == "Morning" else 0,
        "Time of Day_Night": 1 if data.time_of_day == "Night" else 0,
    }])

    try:
        predicted_cost = round(model.predict(input_data)[0], 2)
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": "Prediction failed", "message": str(e)})

    try:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute("""
            INSERT INTO call_logs (
                caller_id, receiver_id, duration, carrier, latency,
                time_of_day, predicted_cost, timestamp
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data.caller_id, data.receiver_id, data.duration, data.carrier,
            data.latency, data.time_of_day, predicted_cost, timestamp
        ))
        db.commit()
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Database insert error: {str(e)}")

    return {
        "success": True,
        "predicted_cost": predicted_cost,
        "timestamp": timestamp,
        "message": "Prediction successful.",
    }
@app.post("/suggest-optimizations/")
async def suggest_optimizations(call: CallData):
    try:
        suggestions = []

        for carrier in valid_carriers:
            if carrier != call.carrier:
                df = pd.DataFrame([{
                    "Duration (s)": call.duration,
                    "Latency (ms)": call.latency,
                    "Carrier_Carrier B": 1 if carrier == "Carrier B" else 0,
                    "Carrier_Carrier C": 1 if carrier == "Carrier C" else 0,
                    "Carrier_Carrier D": 1 if carrier == "Carrier D" else 0,
                    "Time of Day_Evening": 1 if call.time_of_day == "Evening" else 0,
                    "Time of Day_Morning": 1 if call.time_of_day == "Morning" else 0,
                    "Time of Day_Night": 1 if call.time_of_day == "Night" else 0,
                }])
                cost = model.predict(df)[0]
                suggestions.append({
                    "suggestion": f"Try using {carrier}",
                    "estimated_cost": round(cost, 2)
                })

        for tod in valid_times:
            if tod != call.time_of_day:
                df = pd.DataFrame([{
                    "Duration (s)": call.duration,
                    "Latency (ms)": call.latency,
                    "Carrier_Carrier B": 1 if call.carrier == "Carrier B" else 0,
                    "Carrier_Carrier C": 1 if call.carrier == "Carrier C" else 0,
                    "Carrier_Carrier D": 1 if call.carrier == "Carrier D" else 0,
                    "Time of Day_Evening": 1 if tod == "Evening" else 0,
                    "Time of Day_Morning": 1 if tod == "Morning" else 0,
                    "Time of Day_Night": 1 if tod == "Night" else 0,
                }])
                cost = model.predict(df)[0]
                suggestions.append({
                    "suggestion": f"Try calling in the {tod}",
                    "estimated_cost": round(cost, 2)
                })

        sorted_suggestions = sorted(suggestions, key=lambda x: x["estimated_cost"])[:3]

        return {"optimizations": sorted_suggestions}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


from fastapi.responses import StreamingResponse
from io import StringIO
import csv

@app.get("/call-history")
def get_call_history(
    search: str = Query("", description="Search by Caller ID or Carrier"),
    sort_by: str = Query("id", description="Sort by field (duration, cost, etc.)"),
    order: str = Query("desc"),
    limit: int = Query(1000, ge=1),
    offset: int = Query(0, ge=0),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    format: str = Query("json", description="json or csv")
):
    sort_map = {
        "duration": "duration",
        "predicted_cost": "predicted_cost",
        "id": "id",
        "timestamp": "timestamp"
    }
    sort_field = sort_map.get(sort_by.lower(), "timestamp")
    order = "ASC" if order.lower() == "asc" else "DESC"

    query = """
        SELECT caller_id, receiver_id, duration, carrier, latency,
               time_of_day, predicted_cost, timestamp
        FROM call_logs
        WHERE (caller_id LIKE %s OR carrier LIKE %s)
    """

    filters = []
    params = [f"%{search}%", f"%{search}%"]

    if start_date:
        filters.append("DATE(timestamp) >= %s")
        params.append(start_date)
    if end_date:
        filters.append("DATE(timestamp) <= %s")
        params.append(end_date)
    if filters:
        query += " AND " + " AND ".join(filters)

    query += f" ORDER BY {sort_field} {order} LIMIT %s OFFSET %s"
    params.extend([limit, offset])

    try:
        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Database query error: {str(e)}")

    columns = ["caller_id", "receiver_id", "duration", "carrier", "latency", "time_of_day", "predicted_cost", "timestamp"]
    results = [dict(zip(columns, row)) for row in rows]

    # Format timestamp for both JSON and CSV
    for row in results:
        if isinstance(row["timestamp"], datetime):
            row["timestamp"] = row["timestamp"].strftime("%Y-%m-%d %H:%M:%S")

    if format == "csv":
        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=columns)
        writer.writeheader()
        writer.writerows(results)
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=call_history.csv"}
        )

    return results  # default JSON format


# Analytics endpoint remains the same
@app.get("/analytics")
def get_analytics():
    try:
        cursor = db.cursor()

        # Cost trend
        cursor.execute("""
            SELECT DATE(timestamp), SUM(predicted_cost)
            FROM call_logs
            GROUP BY DATE(timestamp)
            ORDER BY DATE(timestamp)
        """)
        cost_trend = [
            {"date": row[0].isoformat() if isinstance(row[0], datetime) else str(row[0]), "total_cost": float(row[1])}
            for row in cursor.fetchall() if row[1] is not None
        ]

        # Latency heatmap
        cursor.execute("""
            SELECT time_of_day, AVG(latency)
            FROM call_logs
            GROUP BY time_of_day
        """)
        latency_heatmap = [
            {"time_of_day": row[0], "avg_latency": float(row[1])}
            for row in cursor.fetchall() if row[1] is not None
        ]

        # Scatter data
        cursor.execute("SELECT duration, predicted_cost FROM call_logs")
        scatter_data = [
            {"duration": float(row[0]), "cost": float(row[1])}
            for row in cursor.fetchall() if row[1] is not None
        ]

        cursor.close()

        return {
            "cost_trend": cost_trend or [],
            "latency_heatmap": latency_heatmap or [],
            "scatter_data": scatter_data or []
        }

    except mysql.connector.Error as e:
        raise HTTPException(status_code=500, detail=f"Analytics DB error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics server error: {str(e)}")
