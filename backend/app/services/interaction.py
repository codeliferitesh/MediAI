from typing import List, Dict

# Hardcoded clinical interaction dataset for common medications
INTERACTION_DATABASE: Dict[frozenset, Dict[str, str]] = {
    frozenset(["Aspirin", "Warfarin"]): {
        "severity": "Severe",
        "warning": "Concomitant use increases bleeding risk. Monitor Prothrombin Time (INR) closely and adjust anticoagulant dosing as necessary."
    },
    frozenset(["Ibuprofen", "Methotrexate"]): {
        "severity": "Moderate",
        "warning": "NSAIDs may decrease renal clearance of Methotrexate, leading to elevated systemic toxicity. Monitor blood counts and liver function."
    },
    frozenset(["Lisinopril", "Aspirin"]): {
        "severity": "Mild",
        "warning": "Aspirin may decrease the antihypertensive effect of Lisinopril. Monitor blood pressure periodically."
    },
    frozenset(["Warfarin", "Ibuprofen"]): {
        "severity": "Severe",
        "warning": "NSAIDs enhance the antiplatelet effect of anticoagulants, dramatically raising internal gastrointestinal bleeding risk."
    }
}

def check_medication_interactions(med_names: List[str]) -> List[dict]:
    """
    Compares a list of medication names to identify any adverse drug interactions.
    """
    found_interactions = []
    
    # Check all pairs
    n = len(med_names)
    for i in range(n):
        for j in range(i + 1, n):
            pair = frozenset([med_names[i], med_names[j]])
            if pair in INTERACTION_DATABASE:
                details = INTERACTION_DATABASE[pair]
                found_interactions.append({
                    "medication_a": med_names[i],
                    "medication_b": med_names[j],
                    "severity": details["severity"],
                    "warning_message": details["warning"]
                })
                
    return found_interactions
