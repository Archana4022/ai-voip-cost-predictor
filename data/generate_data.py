import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

# Define carriers and their cost per second
carriers = {
    "Carrier A": 0.05,
    "Carrier B": 0.04,
    "Carrier C": 0.03,
    "Carrier D": 0.06,
}

# Generate synthetic call data
num_samples = 220000  # Increased dataset size
data = []

# Generate a base timestamp
base_time = datetime.now()

for _ in range(num_samples):
    caller_id = f"+1{random.randint(1000000000, 9999999999)}"
    receiver_id = f"+1{random.randint(1000000000, 9999999999)}"
    duration = random.randint(30, 600)  # Call duration in seconds
    carrier = random.choice(list(carriers.keys()))
    latency = round(random.uniform(5, 300), 2)  # Wider range for realistic latency
    time_of_day = random.choice(["Morning", "Afternoon", "Evening", "Night"])

    # Calculate cost
    cost = round(duration * carriers[carrier], 2)

    # Generate a random timestamp within the last 30 days
    call_time = base_time - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23), minutes=random.randint(0, 59))

    data.append([caller_id, receiver_id, duration, carrier, cost, latency, time_of_day, call_time])

# Convert to DataFrame and save as CSV
df = pd.DataFrame(data, columns=["Caller ID", "Receiver ID", "Duration (s)", "Carrier", "Cost ($)", "Latency (ms)", "Time of Day", "Timestamp"])
df.to_csv("calls_data.csv", index=False)

print(f"✅ Synthetic dataset generated with {num_samples} samples and saved to calls_data.csv!")
