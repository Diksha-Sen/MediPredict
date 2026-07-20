/**
 * SYMPTOM_MAP — maps display label (shown to user) to exact ML model column name.
 * Column names come from feature_columns.joblib in ml_engine/models/
 * Only symptoms that exist as model columns are included.
 */
export const SYMPTOM_MAP = {
  // A
  "Abdominal Pain":          "abdominal_pain",
  "Abdominal Rigidity":      "abdominal_rigidity",
  "Acid Reflux":             "acid_reflux",
  "Anxiety":                 "anxiety_symptoms",
  // B
  "Back Pain":               "back_pain",
  "Bad Breath":              "bad_breath",
  "Balance Problems":        "balance_problems",
  "Belching":                "belching",
  "Black Stool":             "black_stool",
  "Blisters":                "blisters",
  "Bloating":                "bloating",
  "Blood in Sputum":         "blood_in_sputum",
  "Blood in Urine":          "blood_in_urine",
  "Bloody Stool":            "bloody_stool",
  "Blurred Vision":          "blurred_vision",
  "Body Aches":              "body_aches",
  "Bone Pain":               "bone_pain",
  "Brittle Nails":           "brittle_nails",
  "Burning Sensation":       "burning_sensation",
  // C
  "Chest Pain":              "chest_pain",
  "Chest Pressure":          "chest_pressure",
  "Chest Tightness":         "chest_tightness",
  "Chills":                  "chills",
  "Cloudy Urine":            "cloudy_urine",
  "Cold Intolerance":        "cold_intolerance",
  "Confusion":               "confusion",
  "Constipation":            "constipation",
  "Cough":                   "cough",
  "Cyanosis (Blue Skin)":    "cyanosis",
  // D
  "Dark Urine":              "dark_urine",
  "Dehydration":             "dehydration",
  "Depression":              "depression_symptoms",
  "Diarrhea":                "diarrhea",
  "Difficulty Speaking":     "difficulty_speaking",
  "Difficulty Swallowing":   "difficulty_swallowing",
  "Dizziness":               "dizziness",
  "Drooling":                "drooling",
  "Dry Cough":               "dry_cough",
  "Dry Eyes":                "dry_eyes",
  "Dry Skin":                "dry_skin",
  // E
  "Ear Discharge":           "ear_discharge",
  "Ear Fullness":            "ear_fullness",
  "Ear Pain":                "ear_pain",
  "Excessive Daytime Sleepiness": "excessive_daytime_sleepiness",
  "Excessive Hunger":        "excessive_hunger",
  "Excessive Thirst":        "excessive_thirst",
  "Eye Discharge":           "eye_discharge",
  "Eye Pain":                "eye_pain",
  // F
  "Facial Numbness":         "facial_numbness",
  "Facial Pain":             "facial_pain",
  "Facial Pressure":         "facial_pressure",
  "Fainting":                "fainting",
  "Fatigue":                 "fatigue",
  "Fever":                   "fever",
  "Flank Pain":              "flank_pain",
  "Foamy Urine":             "foamy_urine",
  "Frequent Cough":          "frequent_cough",
  // P
  "Palpitations":            "palpitations",
  "Postnasal Drip":          "postnasal_drip",
  "Productive Cough":        "productive_cough",
  // R
  "Radiating Arm Pain":      "radiating_arm_pain",
  "Rapid Breathing":         "rapid_breathing",
  "Rapid Heart Rate":        "rapid_heart_rate",
  "Rash":                    "rash",
  "Rebound Tenderness":      "rebound_tenderness",
  "Red Eyes":                "red_eyes",
  "Right Upper Quadrant Pain": "right_upper_quadrant_pain",
  "Runny Nose":              "runny_nose",
  // S
  "Scaling Skin":            "scaling_skin",
  "Seizures":                "seizures",
  "Severe Headache":         "severe_headache",
  "Shortness of Breath":     "shortness_of_breath",
  "Skin Lesions":            "skin_lesions",
  "Skin Pain":               "skin_pain",
  "Skin Redness":            "skin_redness",
  "Skin Swelling":           "skin_swelling",
  "Sleep Disturbance":       "sleep_disturbance",
  "Slow Healing Wounds":     "slow_healing",
  "Sneezing":                "sneezing",
  "Snoring":                 "snoring",
  "Sore Throat":             "sore_throat",
  "Sound Sensitivity":       "sound_sensitivity",
  "Stiff Neck":              "stiff_neck",
  "Stiffness":               "stiffness",
  "Stridor":                 "stridor",
  "Sweating":                "sweating",
  "Swollen Ankles":          "swollen_ankles",
  "Swollen Eyelids":         "swollen_eyelids",
  "Swollen Joints":          "swollen_joints",
  "Swollen Lymph Nodes":     "swollen_lymph_nodes",
  "Swollen Neck":            "swollen_neck",
  // T
  "Throat Clearing":         "throat_clearing",
  "Throat Pain":             "throat_pain",
  "Throat Swelling":         "throat_swelling",
  "Tingling":                "tingling",
  "Tinnitus (Ringing Ears)": "tinnitus",
  "Tremors":                 "tremors",
  "Trismus (Jaw Lock)":      "trismus",
  // U
  "Upper Abdominal Pain":    "upper_abdominal_pain",
  "Urgent Urination":        "urgency_urination",
  // V
  "Vertigo":                 "vertigo",
  "Vision Changes":          "vision_changes",
  "Vomiting":                "vomiting",
  // W
  "Watery Eyes":             "watery_eyes",
  "Weakness":                "weakness",
  "Weight Gain":             "weight_gain",
  "Weight Loss":             "weight_loss",
  "Wheezing":                "wheezing",
}

// SYMPTOMS_LIST — display names shown in the UI (keys of SYMPTOM_MAP)
export const SYMPTOMS_LIST = Object.keys(SYMPTOM_MAP).sort()

// Quick-pick symptoms shown as one-click buttons
export const QUICK_SYMPTOMS = [
  "Fever", "Cough", "Fatigue", "Vomiting", "Diarrhea", "Chills",
  "Severe Headache", "Dizziness", "Chest Pain", "Shortness of Breath",
  "Rash", "Sore Throat", "Body Aches", "Abdominal Pain", "Sweating",
  "Runny Nose", "Sneezing", "Back Pain", "Bloating", "Palpitations",
]

// ── Health profile option lists ────────────────────────────────────────────
export const BLOOD_GROUPS     = ["A+","A-","B+","B-","O+","O-","AB+","AB-","Unknown"]
export const YES_NO           = ["No","Yes"]
export const EXERCISE_OPTIONS = [
  "Sedentary (little/no exercise)","Light (1–2 days/week)",
  "Moderate (3–4 days/week)","Active (5–6 days/week)","Very active (daily)",
]
export const SLEEP_OPTIONS    = ["Less than 5 hours","5–6 hours","6–7 hours","7–8 hours","More than 8 hours"]
export const STRESS_OPTIONS   = ["Low","Moderate","High","Very high"]
export const DIET_OPTIONS     = ["Vegetarian","Vegan","Non-vegetarian","Eggetarian","Other"]

export const COMMON_ALLERGIES = [
  "Dust","Pollen","Pet dander","Mould","Penicillin","Aspirin","Ibuprofen",
  "Sulpha drugs","Latex","Peanuts","Tree nuts","Shellfish","Fish","Milk",
  "Eggs","Wheat/Gluten","Soy","Sesame","Bee stings","Nickel","Sunscreen",
]

export const COMMON_PAST_DISEASES = [
  "Diabetes","Hypertension","Asthma","Heart disease","Thyroid disorder",
  "Kidney disease","Liver disease","Tuberculosis","Cancer","Epilepsy",
  "Arthritis","PCOS","Endometriosis","Anaemia","Depression","Anxiety",
  "COVID-19","Dengue","Malaria","Typhoid","Hepatitis B","Hepatitis C",
  "Chickenpox","Eczema","Psoriasis","Migraine","Stroke",
]
