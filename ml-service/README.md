# FixNearby AI/ML Intelligence Service (Future Phase Architecture)

This directory houses the future Python-based Machine Learning and NLP microservice for **FixNearby**.

## Architecture Overview

```
                   +----------------------------+
                   |  FixNearby React Client    |
                   +--------------+-------------+
                                  |
                                  v
                   +----------------------------+
                   |  Node.js / Express Backend |
                   +--------------+-------------+
                                  |
                                  v
                   +----------------------------+
                   |  Python FastAPI ML Service |
                   +--------------+-------------+
                                  |
              +-------------------+-------------------+
              |                   |                   |
              v                   v                   v
     Category Classifier   Cost Estimator     Provider Matcher
```

## Planned Modules

### Phase 1: Request Categorization (`request_classifier.py`)
Classifies customer free-form problem descriptions into standardized trade categories (`Electrician`, `Plumber`, `AC Technician`, `Appliance Repair`, `Carpenter`, `Painter`) using NLP tf-idf / transformer embeddings.

### Phase 2: Repair Cost Range Estimation (`cost_estimator.py`)
Computes indicative repair cost ranges based on historical completed job prices, location factor, urgency, and category.

### Phase 3: Smart Provider Matching (`provider_matcher.py`)
Ranks available local service providers using transparent scoring criteria:
- Service Area matching
- Availability status
- Verified badge priority
- Historical customer rating & review count

## Running the ML Service Prototype

```bash
cd ml-service
python cost_estimator.py
```
