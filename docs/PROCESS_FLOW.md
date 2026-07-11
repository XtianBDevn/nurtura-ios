# Nurtura Full Process Flow

```mermaid
flowchart TD
  A["Launch app"] --> B{"Auth loading?"}
  B -->|"Yes"| C["Show Nurtura splash"]
  B -->|"No"| D{"Signed in?"}
  D -->|"No"| E["Marketing landing"]
  E --> F["Sign up or sign in"]
  F --> G["Convex Auth"]
  D -->|"Yes"| H{"Profile exists and onboarding complete?"}
  G --> H
  H -->|"No"| I["Onboarding"]
  H -->|"Yes"| Z["Main app tabs"]

  I --> I1["Choose caregiver role"]
  I1 --> I2["Caregiver profile"]
  I2 --> I3["Accessibility preferences"]
  I3 --> I4["Care recipient basics"]
  I4 --> I5["Clinical intake"]
  I5 --> I6["Conditions, allergies, medications"]
  I6 --> I7["Mobility, falls, cognition"]
  I7 --> I8["ADL/IADL independence"]
  I8 --> I9["Quality of life"]
  I9 --> J["Generate care plan"]
  J --> K["Save profile, recipient, health profile"]
  K --> L["Complete onboarding"]
  L --> Z

  Z --> M["Home dashboard"]
  Z --> N["Care recipients"]
  Z --> O["Log activity"]
  Z --> P["Schedule"]
  Z --> Q["More"]

  M --> M1["Stats"]
  M --> M2["Personalized care plan"]
  M --> M3["Recent activity"]

  N --> N1["Create recipient"]
  N1 --> K

  O --> O1["Select recipient"]
  O1 --> O2["Choose log type"]
  O2 --> O3["Save care log"]
  O3 --> M3

  P --> P1["Pick date"]
  P1 --> P2["Create appointment, shift, medication event, or task"]
  P2 --> M1

  Q --> Q1["Medications"]
  Q --> Q2["Messages"]
  Q --> Q3["Time tracking"]
  Q --> Q4["Subscription"]
  Q --> Q5["Security and privacy"]

  Q1 --> R1["Create medication"]
  Q2 --> R2["Read care-team messages"]
  Q3 --> R3["Clock in/out"]
  R3 --> R4["Store startedAt and endedAt"]
```

## Data Flow Summary

1. The client authenticates with Convex Auth.
2. Convex derives the current user server-side.
3. Care-recipient data is accessed through care-team membership.
4. Onboarding writes profile, recipient, and health profile data.
5. The care-plan engine turns structured intake into a deterministic plan.
6. Main tabs read and write care data through Convex queries and mutations.
