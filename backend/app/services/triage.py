from typing import Tuple, List

def calculate_triage_priority(
    age: int,
    heart_rate: int,
    blood_pressure: str,
    spo2: int,
    temperature: float,
    pain_level: int,
    consciousness_status: str,
    respiratory_difficulty: bool
) -> Tuple[str, float, str]:
    """
    Computes emergency triage priority level, risk score (0-100), and clinical reasoning.
    Triage levels: Critical, High, Medium, Low.
    """
    score = 0.0
    reasons: List[str] = []
    
    # 1. SpO2 (Hypoxia indicator)
    if spo2 < 85:
        score += 35
        reasons.append(f"Severe hypoxia (SpO2: {spo2}%)")
    elif spo2 <= 91:
        score += 25
        reasons.append(f"Moderate hypoxia (SpO2: {spo2}%)")
    elif spo2 <= 94:
        score += 12
        reasons.append(f"Mild hypoxia (SpO2: {spo2}%)")

    # 2. Consciousness status
    c_status = consciousness_status.lower()
    if "unresponsive" in c_status:
        score += 35
        reasons.append("Patient is unresponsive/comatose")
    elif "confused" in c_status or "lethargic" in c_status or "somnolent" in c_status:
        score += 20
        reasons.append(f"Altered mental status: {consciousness_status}")

    # 3. Heart Rate (Tachycardia / Bradycardia)
    if heart_rate < 40 or heart_rate > 140:
        score += 20
        reasons.append(f"Extreme heart rate dysregulation ({heart_rate} bpm)")
    elif heart_rate < 50 or heart_rate > 115:
        score += 10
        reasons.append(f"Moderate heart rate deviation ({heart_rate} bpm)")

    # 4. Respiratory difficulty flag
    if respiratory_difficulty:
        score += 20
        reasons.append("Active respiratory distress/dyspnea")

    # 5. Pain Level (0 to 10 scale)
    if pain_level >= 9:
        score += 15
        reasons.append(f"Severe acute pain scale (Pain: {pain_level}/10)")
    elif pain_level >= 6:
        score += 8
        reasons.append(f"Moderate acute pain scale (Pain: {pain_level}/10)")

    # 6. Temperature (Hypothermia / Hyperpyrexia)
    if temperature >= 39.5 or temperature < 35.0:
        score += 15
        reasons.append(f"Critical core temperature ({temperature}°C)")
    elif temperature >= 38.3 or temperature < 36.0:
        score += 5
        reasons.append(f"Mild fever/hypothermia ({temperature}°C)")

    # 7. Blood pressure parsing (Systolic / Diastolic crisis check)
    try:
        systolic_str, diastolic_str = blood_pressure.split('/')
        systolic = int(systolic_str.strip())
        diastolic = int(diastolic_str.strip())
        
        if systolic > 180 or diastolic > 120:
            score += 20
            reasons.append(f"Hypertensive crisis levels ({blood_pressure} mmHg)")
        elif systolic > 140 or diastolic > 90:
            score += 8
            reasons.append(f"Stage 1/2 Hypertension ({blood_pressure} mmHg)")
        elif systolic < 90 or diastolic < 60:
            score += 12
            reasons.append(f"Hypotensive emergency levels ({blood_pressure} mmHg)")
    except Exception:
        # Gracefully handle poorly formatted blood pressures
        pass

    # Normalize final score between 0 and 100
    risk_score = min(max(score, 0.0), 100.0)

    # Classify Priority based on cumulative score
    if risk_score >= 70.0 or any("hypoxia" in r or "unresponsive" in r for r in reasons):
        priority = "Critical"
    elif risk_score >= 45.0:
        priority = "High"
    elif risk_score >= 20.0:
        priority = "Medium"
    else:
        priority = "Low"

    # Assemble reasoning summary text
    if not reasons:
        reasoning_text = "All physiological vitals and pain indices fall within acceptable baseline limits."
    else:
        reasoning_text = "Triage triggers: " + "; ".join(reasons) + "."

    return priority, risk_score, reasoning_text
